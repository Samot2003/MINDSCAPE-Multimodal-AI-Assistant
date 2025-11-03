from models import GeminiModel

class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()

    def generar_pregunta_desde_imagen(self, image_file):
        descripcion = self.model.analizar_imagen(image_file)
        pregunta = self.model.generar_pregunta_desde_emocion(descripcion)
        return pregunta

    def manejar_conversacion(self, historial):
        siguiente_mensaje = self.model.generar_respuesta_conversacional(historial)
        return siguiente_mensaje
