from models import GeminiModel
from io import BytesIO
from xml.sax.saxutils import escape
import re
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListFlowable, ListItem
from reportlab.lib.enums import TA_LEFT

class ChatbotController:
    def __init__(self):
        self.model = GeminiModel()  # Inicializa el modelo de Google Gemini

    def start_chat(self, image_file, is_default):
        # Inicia el chat con una imagen
        return self.model.start_chat(image_file, is_default)

    def continue_chat(self, history, image_file=None):
        # Continúa el chat con el historial de mensajes (y la imagen, si se envía)
        return self.model.continue_chat(history, image_file)

    def generate_summary(self, history):
        # Genera un resumen de la conversación
        return self.model.generate_summary(history)

def _markdown_to_markup(text):
    # Escapa el texto y convierte la negrita/cursiva de Markdown al marcado de ReportLab
    text = escape(text)
    text = re.sub(r"^[-*]\s+", "", text)  # Viñetas propias de Markdown
    text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", text)
    text = re.sub(r"\*(.+?)\*", r"<i>\1</i>", text)
    return text

def generate_pdf_summary(history_text):
    # Genera un archivo PDF con el resumen de la conversación
    buffer = BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            rightMargin=40, leftMargin=40,
                            topMargin=60, bottomMargin=40)

    styles = getSampleStyleSheet()
    story = []

    # Título del PDF
    title = Paragraph("Resumen de la Conversación", styles['Title'])
    story.append(title)
    story.append(Spacer(1, 20))

    # Introducción
    intro = Paragraph(
        "A continuación se presenta un resumen de los temas principales discutidos durante la conversación:",
        styles['Normal']
    )
    story.append(intro)
    story.append(Spacer(1, 12))

    # Convierte cada línea del historial en una lista con viñetas
    lines = history_text.strip().split("\n")
    bullets = []
    for line in lines:
        if not line.strip():
            continue
        p = Paragraph(_markdown_to_markup(line.strip()), styles['Normal'])
        bullets.append(ListItem(p))

    story.append(ListFlowable(bullets, bulletType='bullet', start='•', leftIndent=20))

    # Construye el PDF
    doc.build(story)
    buffer.seek(0)
    return buffer
