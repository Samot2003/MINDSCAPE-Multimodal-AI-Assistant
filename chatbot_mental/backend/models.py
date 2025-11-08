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

    def start_chat(self, image_file):
        image = Image.open(image_file)
        image.thumbnail((512, 512))

        prompt = f"""
            Ponte en situacion eres una IA diseñada para ayudar a la gente a expresar
            sus sentimientos para poder procesarlos y reflexionar sobre ellos.

            Desde este prisma el usuario te adjunta una imagen {image} sobre la que quiere hacer una
            reflexión. Genera una pregunta para iniciar la conversación de forma natural
            que invite al usuario a expresar sus sentimientos.
        """
        response = self.model.generate_content([prompt, image])
        return response.text

    def continue_chat(self, historial):

        prompt = f"""
        Te muestro el historial de la conversacion para que tengas contexto:
        {historial}

        Sin mostrar el historial por pantalla, continúa la 
        conversación como si fueras el terapeuta empático,
        ofreciendo una reflexión o pregunta que invite al
        usuario a profundizar en lo que siente, sin sonar
        robótico, ser invasivo o dar consejos.
        """
        response = self.model.generate_content(prompt)
        return response.text
