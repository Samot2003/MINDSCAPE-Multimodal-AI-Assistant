# backend/models.py
import google.generativeai as genai
from PIL import Image
import os
from dotenv import load_dotenv

class GeminiModel:
    def __init__(self):
        load_dotenv()
        api_key = os.getenv("GOOGLE_API_KEY")
        if not api_key:
            raise ValueError("⚠️ Falta GOOGLE_API_KEY en .env")

        genai.configure(api_key=api_key)

        # Listar modelos disponibles
        modelos_disponibles = [m.name for m in genai.list_models()]
        # Elegir un modelo ligero primero
        for nombre in [
            "models/gemini-2.5-flash-lite",       # modelo ligero
            "models/gemini-2.5-flash-image",      # fallback
        ]:
            if nombre in modelos_disponibles:
                self.modelo_activo = nombre
                break
        else:
            raise ValueError(f"No se encontró modelo compatible. Modelos: {modelos_disponibles}")

        self.model = genai.GenerativeModel(self.modelo_activo)
        print(f"✅ Usando modelo: {self.modelo_activo}")

    def analizar_imagen(self, image_file):
        # Abrir y redimensionar imagen automáticamente
        image = Image.open(image_file)
        max_size = (512, 512)   # redimensionar para velocidad
        image.thumbnail(max_size)

        prompt = "Describe el tono emocional y visual de esta imagen de manera empática y comprensiva."
        response = self.model.generate_content([prompt, image])
        return response.text

    def generar_reflexion(self, descripcion):
        prompt = f"""
        A partir de esta breve descripción de la imagen: "{descripcion}"
        Desde el punto de vista de un arte terapeuta escribe una breve reflexión sobre los sentimientos que esta imagen podría provocar en una persona.
        Mantén el texto corto y empático intentando ponerte en la piel de la persona que observa la imagen.
        """
        response = self.model.generate_content(prompt)
        return response.text

    def generar_pregunta_desde_emocion(self):
        """
        Genera una pregunta empática basada en el análisis de la imagen.
        """
        prompt = "Basándote en la emoción que transmite esta imagen, formula una pregunta abierta y empática para que la persona exprese cómo se siente."
        response = self.model.generate_content(prompt)
        return response.text

    def generar_pregunta_desde_texto(self, prompt):
        """
        Genera una nueva pregunta empática basada en el texto dado
        (respuesta del usuario y pregunta anterior).
        """
        response = self.model.generate_content(prompt)
        return response.text