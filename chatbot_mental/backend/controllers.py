# backend/controllers.py
from models import GeminiModel

class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()

    def generar_pregunta_desde_imagen(self, image_file):
        """
        Genera una pregunta empática basada únicamente en la imagen.
        No devuelve descripción ni reflexión inicial.
        """
        # Analizamos la imagen solo para obtener contexto emocional
        _ = self.model.analizar_imagen(image_file)
        # Generamos pregunta abierta para el usuario usando el método existente
        pregunta = self.model.generar_pregunta_desde_emocion()
        return pregunta

    def manejar_conversacion(self, pregunta_actual, respuesta_usuario):
        """
        Recibe la pregunta anterior y la respuesta del usuario,
        y genera la siguiente pregunta empática.
        """
        prompt = f"""
        El usuario respondió a esta pregunta: "{pregunta_actual}" 
        con: "{respuesta_usuario}".
        Formula una nueva pregunta empática que invite al usuario
        a reflexionar más sobre sus emociones.
        """
        # Generamos la nueva pregunta usando el método existente
        siguiente_pregunta = self.model.generar_pregunta_desde_texto(prompt)
        return siguiente_pregunta
