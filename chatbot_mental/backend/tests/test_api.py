"""Pruebas de la API con un modelo de Gemini simulado (sin red ni API Key)."""
import io
import json
import os
import sys

import pytest
from PIL import Image

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
os.environ["GOOGLE_API_KEY"] = "fake-key"

import google.generativeai as genai  # noqa: E402

RESPONSES = {}  # palabra clave del prompt -> texto devuelto por el modelo simulado


class FakeResponse:
    def __init__(self, text):
        self.text = text


class FakeModel:
    calls = []

    def __init__(self, name):
        self.name = name

    def generate_content(self, content):
        FakeModel.calls.append(content)
        prompt = content[0] if isinstance(content, list) else content
        for key, text in RESPONSES.items():
            if key in prompt:
                return FakeResponse(text)
        return FakeResponse('{"message": "default", "finished": false}')


genai.GenerativeModel = FakeModel
genai.configure = lambda **kw: None

from fastapi.testclient import TestClient  # noqa: E402
import main  # noqa: E402

client = TestClient(main.app)


def png_bytes(size=(1024, 768)):
    buf = io.BytesIO()
    Image.new("RGB", size, (120, 40, 40)).save(buf, "PNG")
    buf.seek(0)
    return buf


def start_chat(is_default="true"):
    return client.post("/start_chat", files={"file": ("a.png", png_bytes(), "image/png")},
                       data={"is_default": is_default})


def continue_chat(history, **kwargs):
    return client.post("/continue_chat", data={"history": json.dumps(history)}, **kwargs)


@pytest.fixture(autouse=True)
def reset():
    RESPONSES.clear()
    FakeModel.calls.clear()


# ------------------------------- Inicio -------------------------------

def test_health():
    r = client.get("/health")
    assert r.status_code == 200 and r.json() == {"status": "ok"}


@pytest.mark.parametrize("is_default,keyword", [("true", "predeterminada"), ("false", "ha creado una imagen")])
def test_start_chat(is_default, keyword):
    RESPONSES["pregunta inicial"] = '{"message": "¿Qué te transmite?", "finished": false}'
    r = start_chat(is_default)
    assert r.status_code == 200, r.text
    assert r.json() == {"message": "¿Qué te transmite?", "finished": False, "focus": None}
    prompt, image = FakeModel.calls[0]
    assert keyword in prompt
    assert max(image.size) <= 512


def test_start_chat_json_wrapped_in_markdown():
    RESPONSES["pregunta inicial"] = '```json\n{"message": "Hola", "finished": false}\n```'
    assert start_chat().json() == {"message": "Hola", "finished": False, "focus": None}


def test_start_chat_plain_text_fallback():
    RESPONSES["pregunta inicial"] = "Solo texto sin JSON"
    assert start_chat().json() == {"message": "Solo texto sin JSON", "finished": False, "focus": None}


def test_invalid_image_returns_json_error_with_cors():
    r = client.post("/start_chat", files={"file": ("a.png", io.BytesIO(b"no es una imagen"), "image/png")},
                    data={"is_default": "true"}, headers={"Origin": "http://localhost:3000"})
    assert r.status_code == 400
    assert r.json() == {"error": "El archivo no es una imagen válida"}
    assert r.headers.get("access-control-allow-origin") == "*"


def test_prompts_ask_for_angle_quotes():
    RESPONSES["pregunta inicial"] = '{"message": "ok", "punto": null, "finished": false}'
    start_chat()
    assert "« »" in FakeModel.calls[0][0]


# ----------------------------- Conversación -----------------------------

def test_continue_and_finish():
    history = [{"sender": "bot", "text": "¿Qué ves?"}, {"sender": "user", "text": "Calma"}]
    RESPONSES["historial"] = '{"message": "Cuéntame más", "finished": false}'
    r = continue_chat(history)
    assert r.json() == {"message": "Cuéntame más", "finished": False, "focus": None}
    assert "Usuaria: Calma" in FakeModel.calls[0]

    RESPONSES["historial"] = '{"message": "Gracias, hasta pronto", "finished": true}'
    assert continue_chat(history + [{"sender": "user", "text": "adiós"}]).json()["finished"] is True


def test_continue_rejects_invalid_history():
    r = client.post("/continue_chat", data={"history": "no es json"})
    assert r.status_code == 400 and "error" in r.json()
    assert client.post("/continue_chat", data={"history": '{"a": 1}'}).status_code == 400


def test_continue_with_image_and_user_point():
    history = [{"sender": "bot", "text": "¿Qué ves?"},
               {"sender": "user", "text": "Esta casa me agobia", "focus": {"x": 0.42, "y": 0.18}}]
    RESPONSES["historial"] = '{"message": "Cuéntame de la casa", "punto": [180, 420], "finished": false}'
    r = continue_chat(history, files={"file": ("a.png", png_bytes(), "image/png")})
    assert r.json() == {"message": "Cuéntame de la casa", "finished": False, "focus": {"x": 0.42, "y": 0.18}}
    prompt, image = FakeModel.calls[0]
    assert "Usuaria (señala la zona [180, 420] de la imagen): Esta casa me agobia" in prompt
    assert "va adjunta" in prompt
    assert max(image.size) <= 512


# ------------------------------- Puntos -------------------------------

def test_points_from_model_are_normalized():
    RESPONSES["pregunta inicial"] = '{"message": "¿Y esa casa?", "punto": [250, 600], "finished": false}'
    assert start_chat().json()["focus"] == {"x": 0.6, "y": 0.25}


@pytest.mark.parametrize("punto", ["[1200, 10]", "null", '"arriba"', "[1]", "[-5, 40]"])
def test_invalid_points_are_ignored(punto):
    RESPONSES["historial"] = '{"message": "ok", "punto": %s, "finished": false}' % punto
    assert continue_chat([]).json()["focus"] is None


# ------------------- JSON inválido devuelto por el modelo -------------------

def test_unescaped_quotes_in_message_real_case():
    # Respuesta real de Gemini (01-10-2026): comillas dobles sin escapar dentro de "message"
    RESPONSES["historial"] = '''```json
{
"message": "Entiendo lo que describes. ¿Podrías contarme un poco más sobre cómo es para ti experimentar que las cosas pasen "muy lejos"? ¿Hay algo en esa distancia que te parezca protector?",
"punto": [
618,
384
],
"finished": false
}
```'''
    body = continue_chat([]).json()
    assert body["message"].startswith("Entiendo lo que describes.")
    assert 'pasen "muy lejos"?' in body["message"]
    assert "```" not in body["message"] and '"punto"' not in body["message"]
    assert body["focus"] == {"x": 0.384, "y": 0.618}
    assert body["finished"] is False


def test_unescaped_quotes_without_point_and_finished():
    RESPONSES["historial"] = '{"message": "Gracias por "abrirte" hoy. Recuerda que soy una IA.", "punto": null, "finished": true}'
    assert continue_chat([]).json() == {
        "message": 'Gracias por "abrirte" hoy. Recuerda que soy una IA.', "finished": True, "focus": None}


# ------------------------- Errores del modelo -------------------------

def test_gemini_errors_are_reported_with_cors(monkeypatch):
    from google.api_core import exceptions as gexc

    def quota(self, content):
        raise gexc.ResourceExhausted("quota")

    monkeypatch.setattr(FakeModel, "generate_content", quota)
    r = client.post("/continue_chat", data={"history": "[]"}, headers={"Origin": "http://localhost:3000"})
    assert r.status_code == 429
    assert "límite" in r.json()["error"]
    assert r.headers.get("access-control-allow-origin") == "*"

    def bad_key(self, content):
        raise gexc.PermissionDenied("bad key")

    monkeypatch.setattr(FakeModel, "generate_content", bad_key)
    assert client.post("/summary_chat", json={"history": []}).status_code == 502


# ------------------------------ Resumen ------------------------------

def test_summary_and_pdf():
    history = [{"sender": "bot", "text": "¿Qué ves?"}, {"sender": "user", "text": "Calma & paz <3"}]
    RESPONSES["resumen breve"] = "Tema: calma\nEl usuario habló de paz & <tranquilidad>\nSoy una IA"
    assert client.post("/summary_chat", json={"history": history}).json()["summary"].startswith("Tema: calma")

    r = client.post("/summary_pdf", json={"history": history})
    assert r.status_code == 200
    assert r.content.startswith(b"%PDF")


def test_summary_pdf_with_markdown_and_blank_lines():
    RESPONSES["resumen breve"] = "Primera línea\n\n**Negrita markdown**\n"
    assert client.post("/summary_pdf", json={"history": [{"sender": "user", "text": "hola"}]}).status_code == 200


def test_markdown_to_markup():
    from controllers import _markdown_to_markup
    assert _markdown_to_markup("Tema **calma** & <paz>") == "Tema <b>calma</b> &amp; &lt;paz&gt;"
    assert _markdown_to_markup("*Disclaimer: soy una IA*") == "<i>Disclaimer: soy una IA</i>"
    assert _markdown_to_markup("* punto de lista") == "punto de lista"


# --------------------- Coordenadas escritas en el texto ---------------------

def test_coordinates_leaked_into_message_are_removed_real_case():
    # Respuesta real de Gemini (01-10-2026): repitió el punto dentro del mensaje
    RESPONSES["pregunta inicial"] = (
        '{"message": "Esta imagen nos invita a un viaje interior. Si te fijas en la «casa» (punto: [150, 500]) '
        'que parece flotar, ¿qué emociones te surgen?", "punto": [150, 500], "finished": false}'
    )
    body = start_chat().json()
    assert body["message"] == ("Esta imagen nos invita a un viaje interior. Si te fijas en la «casa» "
                               "que parece flotar, ¿qué emociones te surgen?")
    assert body["focus"] == {"x": 0.5, "y": 0.15}


def test_message_without_coordinates_is_untouched():
    text = "Tienes 3 [ideas] y 2026 motivos para seguir; ¿qué ves aquí?"
    RESPONSES["historial"] = json.dumps({"message": text, "punto": None, "finished": False})
    assert continue_chat([]).json()["message"] == text


def test_prompts_forbid_coordinates_in_message():
    RESPONSES["pregunta inicial"] = '{"message": "ok", "punto": null, "finished": false}'
    start_chat()
    assert "no las menciones nunca" in FakeModel.calls[0][0]
