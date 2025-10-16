#!/bin/bash

# Script para iniciar el servidor backend

echo "🚀 Iniciando servidor backend..."
echo "Asegúrate de tener configurada tu GOOGLE_API_KEY en el archivo .env"
echo ""

# Navegar al directorio del backend
cd "$(dirname "$0")"

# Verificar si existe el archivo .env
if [ ! -f ".env" ]; then
    echo "⚠️  No se encontró el archivo .env"
    echo "Por favor crea un archivo .env con tu GOOGLE_API_KEY"
    echo "Ejemplo:"
    echo "GOOGLE_API_KEY=tu_api_key_aqui"
    exit 1
fi

# Activar el entorno virtual si existe
if [ -d "venv" ]; then
    echo "🐍 Activando entorno virtual..."
    source venv/bin/activate
else
    echo "⚠️  No se encontró el entorno virtual 'venv'."
    echo "Creándolo..."
    python3 -m venv venv
    source venv/bin/activate
fi

# Verificar si las dependencias están instaladas
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "📦 Instalando dependencias..."
    pip install -r requirements.txt
fi

# Iniciar el servidor
echo "✅ Iniciando servidor en http://localhost:8000"
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
