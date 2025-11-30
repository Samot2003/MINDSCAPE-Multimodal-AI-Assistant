import google.generativeai as genai
from PIL import Image
import os
import json
from dotenv import load_dotenv

class GeminiModel:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("Falta GOOGLE_API_KEY en .env")

        genai.configure(api_key=api_key)
        self.model = genai.GenerativeModel("gemini-2.5-flash")
        print(f"Usando modelo: {self.model}")

    # ------------------- UTILIDAD PARA PARSEAR RESPUESTAS -------------------
    def _parse_response(self, response):
        """
        Intenta extraer el JSON devuelto por Gemini.
        Garantiza que SIEMPRE se devuelva solo mensaje y finished.
        """

        raw = response.text.strip()

        # 1. Si Gemini devolvió directamente un JSON válido
        try:
            salida = json.loads(raw)
            return salida.get("mensaje", ""), salida.get("finished", False)
        except:
            pass

        # 2. Si Gemini devolvió JSON incrustado dentro de texto
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            posible_json = raw[start:end]
            salida = json.loads(posible_json)
            return salida.get("mensaje", ""), salida.get("finished", False)
        except:
            pass

        # 3. Última opción: devolver texto plano
        return raw, False
    
    def start_chat(self, image_file, isDefault):
        image = Image.open(image_file)
        image.thumbnail((512, 512))

        if isDefault:
            prompt = """
            Eres una IA que ayuda a reflexionar sobre emociones.
            El usuario ha escogido una imagen predeterminada.
            Genera una pregunta inicial.
            Devuelve EXCLUSIVAMENTE un JSON así:
            {
                "mensaje": "...",
                "finished": false
            }
            """
        else:
            prompt = """
            Eres una IA que ayuda a reflexionar sobre emociones.
            El usuario ha subido su propia creación.
            Genera una pregunta inicial.
            Devuelve EXCLUSIVAMENTE un JSON así:
            {
                "mensaje": "...",
                "finished": false
            }
            """

        # 🔹 Sin response_mime_type
        response = self.model.generate_content([prompt, image])
        mensaje, finished = self._parse_response(response)
        return {"mensaje": mensaje, "finished": finished}


    def continue_chat(self, historial):
        prompt = f"""
        Aquí está el historial de la conversación:
        {historial}

        Eres un terapeuta virtual empático.
        Continúa la conversación de forma natural.
        Devuelve EXCLUSIVAMENTE un JSON así:
        {{
            "mensaje": "respuesta natural",
            "finished": true|false
        }}
        """
        # 🔹 Sin response_mime_type
        response = self.model.generate_content(prompt)
        mensaje, finished = self._parse_response(response)
        return {"mensaje": mensaje, "finished": finished}

    def generate_summary(self, historial):

        historial_texto = "\n".join([f"{m['sender']}: {m['text']}" for m in historial])

        prompt = f"""
        Has mantenido la siguiente conversación con un usuario:
        {historial_texto}

        Haz un resumen breve de la conversación, 
        destacando los temas principales y el comportamiento 
        del usuario. 
        Devuélvelo como texto plano.
        """
        response = self.model.generate_content(prompt)
        try:
            return response.text.strip()
        except:
            return "No se pudo generar resumen."