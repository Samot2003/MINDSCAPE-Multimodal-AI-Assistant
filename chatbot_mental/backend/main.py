from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from controllers import ChatbotController
from fastapi.responses import StreamingResponse
from controllers import generate_pdf_summary  # Generar resumen en PDF

app = FastAPI()
controller = ChatbotController()

# Middleware para permitir solicitudes desde cualquier origen (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Modelo para manejar el historial de mensajes
class ChatRequest(BaseModel):
    history: list  # Lista de mensajes del chat

# Endpoint para verificar el estado del servidor
@app.get("/health")
async def health_check():
    return {"status": "ok"}

# Endpoint para iniciar el chat con una imagen
@app.post("/start_chat")
async def start_chat(file: UploadFile = File(...), is_default: bool = Form(...)):
    image = file.file
    response = controller.start_chat(image, is_default)
    return response  # {"message": "...", "finished": false}

# Endpoint para continuar el chat con el historial
@app.post("/continue_chat")
async def continue_chat(data: ChatRequest):
    response = controller.continue_chat(data.history)
    print("CONTINUE_CHAT - finished:", response.get("finished"))
    return response  # {"message": "...", "finished": true|false}

# Endpoint para generar un resumen de la conversación
@app.post("/summary_chat")
async def summary_chat(data: ChatRequest):
    """
    Genera un resumen de la conversación y del comportamiento del usuario.
    """
    history = data.history
    summary = controller.generate_summary(history)
    return {"summary": summary}

# Endpoint para generar un resumen en formato PDF
@app.post("/summary_pdf")
async def summary_pdf(data: ChatRequest):
    history = data.history
    summary = controller.generate_summary(history)
    pdf_buffer = generate_pdf_summary(summary)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=conversation_summary.pdf"
        }
    )
