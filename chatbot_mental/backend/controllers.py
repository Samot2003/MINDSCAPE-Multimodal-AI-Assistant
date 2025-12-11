from models import GeminiModel
from io import BytesIO
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.enums import TA_LEFT
from io import BytesIO


class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()

    def start_chat(self, image_file, isDefault):
        return self.model.start_chat(image_file, isDefault)

    def continue_chat(self, historial):
        return self.model.continue_chat(historial)

    def generate_summary(self, historial):
        return self.model.generate_summary(historial)
    

def generar_pdf_resumen(historial_texto):
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=40, leftMargin=40,
                            topMargin=60, bottomMargin=40)

    styles = getSampleStyleSheet()
    story = []

    # Título
    titulo = Paragraph("Resumen de la conversación", styles['Title'])
    story.append(titulo)
    story.append(Spacer(1, 20))

    # Explicación
    intro = Paragraph(
        "A continuación se resumen los temas principales y el comportamiento del usuario:",
        styles['Normal']
    )
    story.append(intro)
    story.append(Spacer(1, 12))

    # Convertir cada línea del historial en bullet points
    lines = historial_texto.strip().split("\n")
    bullets = []
    for line in lines:
        p = Paragraph(line.strip(), styles['Normal'])
        bullets.append(ListItem(p))

    story.append(ListFlowable(bullets, bulletType='bullet', start='•', leftIndent=20))

    # Construir PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
