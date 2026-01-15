import google.generativeai as genai
from PIL import Image
import os
import json
from dotenv import load_dotenv

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
            return output.get("message", ""), output.get("finished", False)
        except:
            pass

        # 2. Si Gemini devolvió JSON incrustado dentro de texto
        try:
            start = raw.index("{")
            end = raw.rindex("}") + 1
            possible_json = raw[start:end]
            output = json.loads(possible_json)
            return output.get("message", ""), output.get("finished", False)
        except:
            pass

        # 3. Última opción: devolver texto plano
        return raw, False

    def start_chat(self, image_file, is_default):
        # Procesar la imagen antes de enviarla al modelo
        image = Image.open(image_file)
        image.thumbnail((512, 512))

        if is_default:
            prompt = """
            Eres una IA que ayuda a reflexionar sobre emociones del usuario que 
            ha escogido una imagen predeterminada para transmitir sus emociones.
            De forma reflexiva y empática genera una pregunta inicial para fomentar
            la autoexploración del usuario sobre sus sentimientos basandote en la imagen.
            Devuelve EXCLUSIVAMENTE un JSON así:
            {
                "message": "...",
                "finished": false
            }
            """
        else:
            prompt = """
            Eres una IA que ayuda a reflexionar sobre emociones del usuario que 
            ha creado una imagen para transmitir sus emociones.
            De forma reflexiva y empática genera una pregunta inicial para fomentar
            la autoexploración del usuario sobre sus sentimientos basandote en la imagen.
            Devuelve EXCLUSIVAMENTE un JSON así:
            {
                "message": "...",
                "finished": false
            }
            """

        # Generar contenido basado en el prompt y la imagen
        response = self.model.generate_content([prompt, image])
        message, finished = self._parse_response(response)
        return {"message": message, "finished": finished}

    def continue_chat(self, history):
        # Continuar la conversación basándose en el historial
        prompt = f"""
        Aquí está el historial de la conversación:
        {history}

        Eres una IA que ayuda a reflexionar sobre emociones del usuario que 
        ha creado una imagen para transmitir sus emociones. Continua con la 
        conversacion de forma empatica, cercana y sin juzgar ayudando al usuario a
        fomentar la autoexploracion si el usuario propone una linea de dialogo siguela
        no te centres unicamente en la imagen. Si el usuario parece querer dar la 
        conversacion por finalizada, haz una breve reflexion con un disclaimer de
        que eres una IA y no un profesional, despidete y marca finished como true.
        Devuelve EXCLUSIVAMENTE un JSON así:
        {{
            "message": "respuesta natural",
            "finished": true|false
        }}
        """
        response = self.model.generate_content(prompt)
        message, finished = self._parse_response(response)
        return {"message": message, "finished": finished}

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