# backend/main.py
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from controllers import ChatbotController

app = FastAPI()
controller = None

# Permitir CORS para que React pueda conectarse
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar controlador Gemini con seguridad
try:
    controller = ChatbotController()
except Exception as e:
    print(f"⚠️ No se pudo inicializar Gemini: {e}")

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "Servidor funcionando correctamente"}

@app.post("/analyze")
async def analyze_image(file: UploadFile = File(...)):
    if not controller:
        return {"error": "Controlador no disponible"}
    image = file.file
    descripcion, reflexion = controller.procesar_imagen(image)
    return {"descripcion": descripcion, "reflexion": reflexion}
