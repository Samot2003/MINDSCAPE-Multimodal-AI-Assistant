import axios from "axios";

// URL base para las solicitudes al backend
const API_BASE_URL = "http://localhost:8000";

// Configuración de la instancia de Axios
const api = axios.create({
  baseURL: API_BASE_URL,
});

/**
 * Inicia un chat con una imagen proporcionada.
 * @param {File} imageFile - Archivo de imagen seleccionado por el usuario.
 * @param {boolean} is_default - Indica si se utiliza una imagen predeterminada.
 * @returns {Object} Respuesta del backend con el mensaje inicial y el estado.
 */
export const startChatWithImage = async (imageFile, is_default = false) => {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("is_default", is_default);
    const response = await api.post("/start_chat", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data; // { message, finished }
  } catch (err) {
    console.error("Error en startChatWithImage:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};

/**
 * Continúa el chat enviando el historial de mensajes.
 * @param {Array} chatMessages - Historial de mensajes del chat.
 * @returns {Object} Respuesta del backend con el siguiente mensaje y el estado.
 */
export const continueChat = async (chatMessages) => {
  try {
    const response = await api.post("/continue_chat", {
      history: chatMessages,
    });
    return response.data; // { message, finished }
  } catch (err) {
    console.error("Error en continueChat:", err);
    throw new Error(err.response?.data?.error || err.message);
  }
};

/**
 * Verifica el estado del servidor.
 * @returns {Object} Respuesta del backend con el estado del servidor.
 */
export const checkServerHealth = async () => {
  try {
    const response = await api.get("/health");
    return response.data;
  } catch {
    throw new Error("No se puede conectar con el servidor");
  }
};

/**
 * Obtiene un resumen de la conversación.
 * @param {Array} history - Historial de mensajes del chat.
 * @returns {Object} Respuesta del backend con el resumen generado.
 */
export const getSummary = async (history) => {
  try {
    const response = await api.post("/summary_chat", { history });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
};

/**
 * Descarga un resumen de la conversación en formato PDF.
 * @param {Array} history - Historial de mensajes del chat.
 * @returns {Blob} Archivo PDF generado por el backend.
 */
export const downloadSummaryPdf = async (history) => {
  try {
    const response = await api.post("/summary_pdf", { history }, {
      responseType: "blob",
    });
    return response.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message);
  }
};

// Exporta la instancia de Axios configurada
export default api;
