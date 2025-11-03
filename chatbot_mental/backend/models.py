import google.generativeai as genai
from PIL import Image
import os
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

    def analizar_imagen(self, image_file):
        image = Image.open(image_file)
        image.thumbnail((512, 512))

        prompt = (
            "Observa esta imagen y describe brevemente, de forma empática y humana, "
            "qué emociones o sensaciones podría evocar en alguien que la mire."
        )
        response = self.model.generate_content([prompt, image])
        return response.text

    def generar_pregunta_desde_emocion(self, reflexion):
        prompt = f"""
        Basándote en esta reflexión: "{reflexion}",
        formula una pregunta abierta, empática y cercana que invite al usuario
        a reflexionar sobre lo que siente al ver la imagen, sin ser invasivo.
        """
        response = self.model.generate_content(prompt)
        return response.text

    def generar_respuesta_conversacional(self, historial):
        """
        Toma todo el historial (lista de mensajes) y responde de forma empática.
        """
        historial_texto = "\n".join(
            [f"{m['sender'].capitalize()}: {m['text']}" for m in historial]
        )

        prompt = f"""
        Este es el historial de la conversación
        {historial_texto}

        Sin mostrar el historial por pantalla, continúa la 
        conversación como si fueras el terapeuta empático,
        ofreciendo una reflexión o pregunta que invite al
        usuario a profundizar en lo que siente, sin sonar
        robótico, ser invasivo o dar consejos.
        """
        response = self.model.generate_content(prompt)
        return response.text
