# Manual Técnico - Chatbot Mental

## Índice
1. [Requisitos del Sistema](#requisitos-del-sistema)
2. [Arquitectura del Proyecto](#arquitectura-del-proyecto)
3. [Instalación](#instalación)
4. [Configuración](#configuración)
5. [Ejecución](#ejecución)
6. [Solución de Problemas](#solución-de-problemas)

---

## 1. Requisitos del Sistema

### Software Necesario
- **Python**: 3.8 o superior
- **Node.js**: 14.0 o superior
- **npm**: 6.0 o superior
- **Git Bash** (para Windows) o terminal Unix (Linux/Mac)

### Dependencias del Backend
- fastapi==0.104.1
- uvicorn==0.24.0
- python-multipart==0.0.6
- google-generativeai==0.3.2
- python-dotenv==1.0.0
- Pillow==10.0.1
- reportlab

### Dependencias del Frontend
- React 19.2.0
- Chakra UI 2.10.9
- Axios 1.12.2
- Framer Motion 12.23.24
- React Icons 5.5.0

---

## 2. Arquitectura del Proyecto

```
chatbot_mental/
├── backend/              # Servidor API (FastAPI)
│   ├── main.py          # Punto de entrada del servidor
│   ├── controllers.py   # Lógica de negocio
│   ├── models.py        # Modelos de datos
│   ├── requirements.txt # Dependencias Python
│   ├── .env            # Variables de entorno
│   └── start_server.sh # Script de inicio del backend
│
└── frontend/            # Aplicación cliente (React)
    ├── src/            # Código fuente
    │   ├── App.jsx     # Componente principal
    │   ├── components/ # Componentes React
    │   └── services/   # Servicios API
    ├── public/         # Archivos públicos
    ├── package.json    # Dependencias Node.js
    └── start_frontend.sh # Script de inicio del frontend
```

---

## 3. Instalación

### 3.1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd chatbot_mental
```

### 3.2. Configuración del Backend

#### Opción A: Instalación Automática (Recomendada)

1. **Crear y activar entorno virtual**:
   ```bash
   cd chatbot_mental/backend
   python -m venv .venv
   ```

2. **Activar el entorno virtual**:
   - **Windows (Git Bash)**:
     ```bash
     source .venv/Scripts/activate
     ```
   - **Linux/Mac**:
     ```bash
     source .venv/bin/activate
     ```

3. **Instalar dependencias**:
   ```bash
   pip install -r requirements.txt
   ```

#### Opción B: Instalación Manual

1. **Crear y activar entorno virtual** (igual que Opción A)

2. **Instalar paquetes individualmente**:
   ```bash
   pip install fastapi==0.104.1
   pip install uvicorn==0.24.0
   pip install python-multipart==0.0.6
   pip install google-generativeai==0.3.2
   pip install python-dotenv==1.0.0
   pip install Pillow==10.0.1
   pip install reportlab
   ```

### 3.3. Configuración del Frontend

1. **Navegar al directorio del frontend**:
   ```bash
   cd ../frontend
   ```

2. **Instalar dependencias de Node.js**:
   ```bash
   npm install
   ```

---

## 4. Configuración

### 4.1. Configuración del Backend (.env)

Crear un archivo `.env` en el directorio `backend/` con las siguientes variables:

```env
# API Key de Google Generative AI
GOOGLE_API_KEY=tu_api_key_aquí

# Configuración del servidor (opcional)
PORT=8000
HOST=0.0.0.0
```

**Nota**: Obtén tu API key desde [Google AI Studio](https://makersuite.google.com/app/apikey)

### 4.2. Configuración del Frontend

El frontend está configurado por defecto para conectarse al backend en `http://localhost:8000`. Si necesitas cambiar la URL del backend, edita el archivo `frontend/src/services/api.js`.

---

## 5. Ejecución

### 5.1. Método 1: Usando Scripts de Inicio (Recomendado)

**Requisito**: Tener 2 terminales bash abiertas

#### Terminal 1 - Backend

```bash
cd chatbot_mental/backend
source .venv/Scripts/activate   # Windows Git Bash
# source .venv/bin/activate     # Linux/Mac
./start_server.sh
```

El servidor backend estará disponible en: `http://localhost:8000`

#### Terminal 2 - Frontend

```bash
cd chatbot_mental/frontend
./start_frontend.sh
```

La aplicación frontend estará disponible en: `http://localhost:3000`

### 5.2. Método 2: Ejecución Manual

#### Terminal 1 - Backend

```bash
cd chatbot_mental/backend
source .venv/Scripts/activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

#### Terminal 2 - Frontend

```bash
cd chatbot_mental/frontend
npm start
```

---

## 6. Solución de Problemas

### Problema: Error "No se encontró el archivo .env"

**Solución**: Asegúrate de haber creado el archivo `.env` en el directorio `backend/` con la configuración requerida.

### Problema: Error al activar el entorno virtual en Windows

**Solución**: 
- Usa Git Bash en lugar de PowerShell/CMD
- Si usas PowerShell, ejecuta:
  ```powershell
  .venv\Scripts\Activate.ps1
  ```

### Problema: Puerto 8000 o 3000 ya en uso

**Solución**: 
- Detén el proceso que está usando el puerto
- O modifica el puerto en los archivos de configuración

### Problema: Dependencias no encontradas

**Solución**:
- Verifica que el entorno virtual esté activado
- Reinstala las dependencias: `pip install -r requirements.txt`

### Problema: Error de permisos en scripts .sh

**Solución**:
```bash
chmod +x start_server.sh
chmod +x start_frontend.sh
```

---

## Verificación de la Instalación

### Backend
Visita `http://localhost:8000/docs` para ver la documentación automática de la API (Swagger UI).

### Frontend
Visita `http://localhost:3000` para acceder a la interfaz de usuario del chatbot.

---

## Notas Adicionales

- El servidor backend se ejecuta en modo `--reload`, lo que significa que se reiniciará automáticamente cuando detecte cambios en el código.
- El frontend también se recarga automáticamente cuando se modifican los archivos.
- Para producción, se recomienda construir el frontend con `npm run build` y servir los archivos estáticos.

---

## Contacto y Soporte

Para reportar problemas o solicitar ayuda, consulta la documentación del proyecto o contacta con el equipo de desarrollo.

---

**Versión del Manual**: 1.0  
**Fecha**: Enero 2026
