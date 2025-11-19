from models import GeminiModel

class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()

    def start_chat(self, image_file, isDefault):
        return self.model.start_chat(image_file, isDefault)

    def continue_chat(self, historial):
        return self.model.continue_chat(historial)
