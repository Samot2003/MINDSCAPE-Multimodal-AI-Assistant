import google.generativeai as genai
from PIL import Image
import os
import json
from dotenv import load_dotenv

# Instrucciones comunes para que el modelo señale zonas de la imagen.
# Gemini expresa los puntos como [y, x] normalizados de 0 a 1000.
INSTRUCCIONES_PUNTO = """
Siguiendo el enfoque de la arteterapia, la imagen es un tercer elemento de la
conversación: puedes invitar a fijarse en una parte concreta de ella. Si tu
mensaje se refiere a una zona concreta de la imagen, indica dónde está con
"punto": [y, x], coordenadas normalizadas de 0 a 1000. Si no, usa "punto": null.
"""

class GeminiModel:
    def __init__(self):
        # Cargar variables de entorno
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Falta GOOGLE_API_KEY en .env")

        # Configurar el modelo de Google Gemini
        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        print(f"Usando modelo: {self.model}")

    # ------------------- UTILIDAD PARA PARSEAR RESPUESTAS -------------------
    def _parse_response(self, response):
 
        raw = response.text.strip()

        # 1. Si Gemini devolvió directamente un JSON válido
        try:
            output = json.loads(raw)
            return output.get("message", ""), output.get("finished", False), self._parse_point(output.get("punto"))
        except:
            pass

        # 2. Si Gemini devolvió JSON incrustado dentro de texto
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            possible_json = raw[start:end]
            output = json.loads(possible_json)
            return output.get("message", ""), output.get("finished", False), self._parse_point(output.get("punto"))
        except:
            pass

        # 3. Última opción: devolver texto plano
        return raw, False, None

    @staticmethod
    def _parse_point(point):
        # Convierte el punto [y, x] (0-1000) de Gemini en {"x", "y"} normalizados de 0 a 1
        try:
            y, x = (float(v) for v in point)
        except (TypeError, ValueError):
            return None
        if not (0 <= x <= 1000 and 0 <= y <= 1000):
            return None
        return {"x": round(x / 1000, 4), "y": round(y / 1000, 4)}

    @staticmethod
    def _format_message(message):
        # Formatea un mensaje del historial, incluyendo la zona señalada por la usuaria
        speaker = "IA" if message.get("sender") == "bot" else "Usuaria"
        focus = message.get("focus")
        if speaker == "Usuaria" and isinstance(focus, dict):
            try:
                point = [round(float(focus["y"]) * 1000), round(float(focus["x"]) * 1000)]
                return f"{speaker} (señala la zona {point} de la imagen): {message.get('text', '')}"
            except (KeyError, TypeError, ValueError):
                pass
        return f"{speaker}: {message.get('text', '')}"

    @staticmethod
    def _load_image(image_file):
        # Procesar la imagen antes de enviarla al modelo
        image = Image.open(image_file)
        image.thumbnail((512, 512))
        return image

    def start_chat(self, image_file, is_default):
        image = self._load_image(image_file)

        if is_default:
            prompt = """
            Eres una IA que ayuda a reflexionar sobre emociones del usuario que 
            ha escogido una imagen predeterminada para transmitir sus emociones.
            De forma reflexiva y empática genera una pregunta inicial para fomentar
            la autoexploración del usuario sobre sus sentimientos basandote en la imagen.
            """ + INSTRUCCIONES_PUNTO + """
            Devuelve EXCLUSIVAMENTE un JSON así:
            {
                "message": "...",
                "punto": [y, x] o null,
                "finished": false
            }
            """
        else:
            prompt = """
            Eres una IA que ayuda a reflexionar sobre emociones del usuario que 
            ha creado una imagen para transmitir sus emociones.
            De forma reflexiva y empática genera una pregunta inicial para fomentar
            la autoexploración del usuario sobre sus sentimientos basandote en la imagen.
            """ + INSTRUCCIONES_PUNTO + """
            Devuelve EXCLUSIVAMENTE un JSON así:
            {
                "message": "...",
                "punto": [y, x] o null,
                "finished": false
            }
            """

        # Generar contenido basado en el prompt y la imagen
        response = self.model.generate_content([prompt, image])
        message, finished, focus = self._parse_response(response)
        return {"message": message, "finished": finished, "focus": focus}

    def continue_chat(self, history, image_file=None):
        # Continuar la conversación basándose en el historial (y en la imagen, si se envía)
        history_text = "\n".join(self._format_message(m) for m in history)
        image_context = """
        La imagen de la conversación va adjunta. Cuando la usuaria señala una zona
        de la imagen, su mensaje lo indica con coordenadas [y, x] de 0 a 1000:
        mira esa zona de la imagen y tenla en cuenta en tu respuesta.
        """ + INSTRUCCIONES_PUNTO if image_file else ""

        prompt = f"""
        Aquí está el historial de la conversación:
        {history_text}

        Eres una IA que ayuda a reflexionar sobre emociones del usuario que 
        ha elegido o creado una imagen para transmitir sus emociones. Continua con la 
        conversacion de forma empatica, cercana y sin juzgar ayudando al usuario a
        fomentar la autoexploracion si el usuario propone una linea de dialogo siguela
        no te centres unicamente en la imagen. Si el usuario parece querer dar la 
        conversacion por finalizada, haz una breve reflexion con un disclaimer de
        que eres una IA y no un profesional, despidete y marca finished como true.
        {image_context}
        Devuelve EXCLUSIVAMENTE un JSON así:
        {{
            "message": "respuesta natural",
            "punto": [y, x] o null,
            "finished": true|false
        }}
        """
        content = [prompt, self._load_image(image_file)] if image_file else prompt
        response = self.model.generate_content(content)
        message, finished, focus = self._parse_response(response)
        return {"message": message, "finished": finished, "focus": focus}

    def generate_summary(self, history):
        # Generar un resumen basado en el historial de la conversación
        history_text = "\n".join([f"{m['sender']}: {m['text']}" for m in history])

        prompt = f"""
        Has mantenido la siguiente conversación con un usuario:
        {history_text}

        Haz un resumen breve de la conversación, 
        destacando los temas principales y como el 
        usuario ha indagado en sus propios sentimientos,
        teniendo en cuenta los puntos mas claves de la conversacion.
        Añade un disclaimer al final indicando que eres una IA y no 
        un profesional.
        Devuélvelo como texto plano.
        """
        response = self.model.generate_content(prompt)
        try:
            return response.text.strip()
        except:
            return "No se pudo generar resumen."