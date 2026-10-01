import json
from typing import Optional
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import UnidentifiedImageError
from controllers import ChatbotController
from fastapi.responses import StreamingResponse, JSONResponse
from google.api_core import exceptions as google_exceptions
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

# Errores devueltos como JSON {"error": "..."} para que el frontend pueda mostrarlos
@app.exception_handler(UnidentifiedImageError)
async def invalid_image_handler(request, exc):
    return JSONResponse(status_code=400, content={"error": "El archivo no es una imagen válida"})

@app.exception_handler(google_exceptions.ResourceExhausted)
async def quota_exceeded_handler(request, exc):
    return JSONResponse(
        status_code=429,
        content={"error": "Se ha alcanzado el límite de uso de Gemini. Inténtalo de nuevo más tarde."},
    )

@app.exception_handler(google_exceptions.GoogleAPIError)
async def gemini_error_handler(request, exc):
    print("Error de Gemini:", exc)
    return JSONResponse(status_code=502, content={"error": "No se pudo contactar con el modelo de IA"})

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
    return response  # {"message": "...", "focus": {"x", "y"} | null, "finished": false}

# Endpoint para continuar el chat con el historial (JSON) y, opcionalmente, la imagen
@app.post("/continue_chat")
async def continue_chat(history: str = Form(...), file: Optional[UploadFile] = File(None)):
    try:
        messages = json.loads(history)
    except json.JSONDecodeError:
        messages = None
    if not isinstance(messages, list):
        return JSONResponse(status_code=400, content={"error": "El historial no es válido"})

    image = file.file if file else None
    response = controller.continue_chat(messages, image)
    print("CONTINUE_CHAT - finished:", response.get("finished"))
    return response  # {"message": "...", "focus": {"x", "y"} | null, "finished": true|false}

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
