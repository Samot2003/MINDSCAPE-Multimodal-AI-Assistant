import axios from "axios";

const API_BASE_URL = "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const startChatWithImage = async (imageFile, isDefault = false) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("isDefault", isDefault);
    const response = await api.post("/start_chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    // response.data ya contiene { mensaje, finished }
    return response.data;
  } catch (err) {
    console.error("Error en startChatWithImage:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};

export const continueChat = async (chatMessages) => {
  try {
    const response = await api.post("/continue_chat", {
      historial: chatMessages,
    });
    // response.data ya contiene { mensaje, finished }
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

export const getSummary = async (historial) => {
  try {
    const response = await api.post("/summary_chat", { historial });
    return response.data; // { resumen: "..." }
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
};

export const downloadSummaryPdf = async (historial) => {
  try {
    const response = await api.post("/summary_pdf", { historial }, {
      responseType: "blob", // muy importante
    });
    return response.data; // retorna el blob del PDF
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
};

export default api;
