from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from controllers import ChatbotController
from fastapi.responses import StreamingResponse
from controllers import generar_pdf_resumen


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
async def start_chat(file: UploadFile = File(...), isDefault: bool = Form(...)):
    image = file.file
    respuesta = controller.start_chat(image, isDefault)
    return respuesta  # {"mensaje": "...", "finished": false}

@app.post("/continue_chat")
async def continue_chat(data: ChatRequest):
    respuesta = controller.continue_chat(data.historial)
    print("CONTINUE_CHAT - finished:", respuesta.get("finished"))
    return respuesta  # {"mensaje": "...", "finished": true|false}

@app.post("/summary_chat")
async def summary_chat(data: ChatRequest):
    """
    Genera un resumen de la conversación y del comportamiento del usuario.
    """
    historial = data.historial
    resumen = controller.generate_summary(historial)
    return {"resumen": resumen}

@app.post("/summary_pdf")
async def summary_pdf(data: ChatRequest):
    historial = data.historial
    resumen = controller.generate_summary(historial)
    pdf_buffer = generar_pdf_resumen(resumen)

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={
            "Content-Disposition": "attachment; filename=resumen_conversacion.pdf"
        }
    )
