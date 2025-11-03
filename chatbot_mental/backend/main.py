from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from controllers import ChatbotController

app = FastAPI()
controller = ChatbotController()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    historial: list

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/start_chat")
async def start_chat(file: UploadFile = File(...)):
    image = file.file
    pregunta = controller.generar_pregunta_desde_imagen(image)
    return {"pregunta": pregunta}

@app.post("/continue_chat")
async def continue_chat(data: ChatRequest):
    siguiente_mensaje = controller.manejar_conversacion(data.historial)
    return {"siguiente_mensaje": siguiente_mensaje}
