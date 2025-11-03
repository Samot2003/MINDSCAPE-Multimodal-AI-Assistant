import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const startChatWithImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    const response = await api.post("/start_chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (err) {
    console.error("Error en startChatWithImage:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};

export const continueChat = async (userMessage, chatMessages) => {
  try {
    const response = await api.post("/continue_chat", {
      historial: chatMessages,
    });

    return response.data;
  } catch (err) {
    console.error("Error en continueChat:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};

export const checkServerHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch {
    throw new Error("No se puede conectar con el servidor");
  }
};

export default api;
