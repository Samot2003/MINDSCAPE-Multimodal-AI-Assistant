import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

export const startChatWithImage = async (imageFile, lastBotMessage, userResponse) => {
  try {
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const response = await api.post("/start_chat", formData);
      return response.data; // { pregunta: "..." }
    } else {
      const response = await api.post("/continue_chat", {
        pregunta_actual: lastBotMessage,
        respuesta_usuario: userResponse,
      });
      return response.data; // { siguiente_pregunta: "..." }
    }
  } catch (err) {
    console.error("Error al iniciar/continuar chat:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    throw new Error("No se puede conectar con el servidor");
  }
};

export default api;
