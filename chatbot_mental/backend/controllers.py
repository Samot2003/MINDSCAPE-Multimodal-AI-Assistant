# backend/controllers.py
from models import GeminiModel

class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()

    def procesar_imagen(self, image_file):
        descripcion = self.model.analizar_imagen(image_file)
        reflexion = self.model.generar_reflexion(descripcion)
        return descripcion, reflexion
