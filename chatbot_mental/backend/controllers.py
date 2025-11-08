from models import GeminiModel

class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()

    def start_chat(self, image_file):
        pregunta = self.model.start_chat(image_file)
        return pregunta

    def continue_chat(self, historial):
        siguiente_mensaje = self.model.continue_chat(historial)
        return siguiente_mensaje
