from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from controllers import ChatbotController

app = FastAPI()
controller = ChatbotController()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok"}

@app.post("/start_chat")
async def start_chat(file: UploadFile = File(...)):
    image = file.file
    pregunta = controller.generar_pregunta_desde_imagen(image)
    return {"pregunta": pregunta}

@app.post("/continue_chat")
async def continue_chat(pregunta_actual: str, respuesta_usuario: str):
    siguiente_pregunta = controller.manejar_conversacion(pregunta_actual, respuesta_usuario)
    return {"siguiente_pregunta": siguiente_pregunta}
