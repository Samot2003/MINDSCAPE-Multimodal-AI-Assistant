// Servicio para comunicarse con el backend
import axios from 'axios';

// Configuración base del API
const API_BASE_URL = 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

// Función para analizar una imagen
export const analyzeImage = async (imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await api.post('/analyze', formData);
    return response.data;
  } catch (error) {
    console.error('Error al analizar imagen:', error);
    throw new Error('Error al procesar la imagen. Inténtalo de nuevo.');
  }
};

// Función para verificar el estado del servidor
export const checkServerHealth = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    return response.data;
  } catch (error) {
    console.error('Error al verificar el servidor:', error);
    throw new Error('No se puede conectar con el servidor');
  }
};

export default api;
