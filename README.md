# Chatbot Mental - Análisis de Imágenes con IA 🧠

Una aplicación web que combina React y FastAPI para analizar imágenes usando Google Gemini AI y proporcionar reflexiones terapéuticas sobre las emociones que pueden provocar.

## 🚀 Características

- **Análisis de Imágenes**: Sube imágenes y obtén análisis emocionales detallados
- **IA Avanzada**: Utiliza Google Gemini AI para generar análisis precisos
- **Interfaz Moderna**: Frontend desarrollado con React y Chakra UI
- **API Robusta**: Backend desarrollado con FastAPI
- **Reflexiones Terapéuticas**: Genera reflexiones desde la perspectiva de un arte terapeuta

## 📋 Requisitos

- **Python 3.12+**
- **Node.js 16+**
- **npm**
- **Clave API de Google Gemini**

## 🛠️ Instalación y Ejecución

### 1. Configurar el Backend

1. Navega al directorio del backend:
   ```bash
   cd chatbot_mental/backend
   ```

# Instalar dependencias
python -m pip install -r requirements.txt

# Crear archivo .env
cp .env.example .env

# Editar .env y agregar tu GOOGLE_API_KEY
nano .env
```

**Contenido del archivo .env:**
```env
GOOGLE_API_KEY=tu_api_key_de_google_gemini_aqui
PORT=8000
HOST=localhost
```

### 2. Configurar el Frontend

```bash
# Navegar al directorio del frontend
cd ../frontend

# Instalar dependencias
npm install
```

## 🚀 Uso

### Método 1: Scripts Automáticos

**Iniciar Backend:**
```bash
cd chatbot_mental/backend
./start_server.sh
```

**Iniciar Frontend (en otra terminal):**
```bash
cd chatbot_mental/frontend
./start_frontend.sh
```

### Método 2: Manual

**Backend:**
```bash
cd chatbot_mental/backend
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend:**
```bash
cd chatbot_mental/frontend
npm start
```

## 🌐 Acceso

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentación API**: http://localhost:8000/docs

## 📖 Cómo Usar la Aplicación

1. **Verificar Conexión**: La aplicación verificará automáticamente si el backend está funcionando
2. **Subir Imagen**: Haz clic en "Analizar Imagen" y selecciona una imagen
3. **Analizar**: La IA analizará la imagen y generará:
   - Una descripción emocional de la imagen
   - Una reflexión terapéutica sobre los sentimientos que puede provocar
4. **Visualizar Resultados**: Los resultados se mostrarán en tarjetas organizadas

## 🔧 Estructura del Proyecto

```
chatbot_mental/
├── backend/
│   ├── main.py              # Aplicación FastAPI principal
│   ├── models.py            # Modelo de Google Gemini
│   ├── controllers.py       # Controladores de la aplicación
│   ├── requirements.txt     # Dependencias de Python
│   ├── .env                 # Variables de entorno
│   └── start_server.sh      # Script para iniciar el backend
├── frontend/
│   ├── src/
│   │   ├── App.js           # Componente principal
│   │   ├── components/      # Componentes React
│   │   └── services/        # Servicios API
│   ├── package.json         # Dependencias de Node.js
│   └── start_frontend.sh    # Script para iniciar el frontend
└── README.md
```

## 🛠️ Tecnologías Utilizadas

### Backend
- **FastAPI**: Framework web moderno y rápido
- **Google Gemini AI**: IA para análisis de imágenes
- **Python-multipart**: Manejo de archivos
- **Pillow**: Procesamiento de imágenes
- **python-dotenv**: Gestión de variables de entorno

### Frontend
- **React**: Biblioteca de JavaScript para interfaces
- **Chakra UI**: Biblioteca de componentes UI
- **Axios**: Cliente HTTP para APIs
- **React Icons**: Iconos para la interfaz

## 🔒 Seguridad

- Las claves API se almacenan en variables de entorno
- CORS configurado para desarrollo local
- Validación de tipos de archivo en la subida de imágenes

## 🐛 Solución de Problemas

### Error: "Servidor desconectado"
- Verifica que el backend esté ejecutándose en el puerto 8000
- Ejecuta: `python -m uvicorn main:app --reload`

### Error: "GOOGLE_API_KEY no encontrada"
- Asegúrate de tener un archivo `.env` en el directorio backend
- Verifica que contenga tu clave API válida de Google Gemini

### Error: "No se pudo inicializar Gemini"
- Verifica que tu clave API sea válida
- Comprueba tu conexión a internet
- Asegúrate de tener créditos en tu cuenta de Google Cloud

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu característica (`git checkout -b feature/nueva-caracteristica`)
3. Commit tus cambios (`git commit -m 'Agregar nueva característica'`)
4. Push a la rama (`git push origin feature/nueva-caracteristica`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Soporte

Si tienes problemas o preguntas, puedes:
- Abrir un issue en GitHub
- Contactar al desarrollador

---

**¡Disfruta analizando imágenes con IA! 🎨✨**