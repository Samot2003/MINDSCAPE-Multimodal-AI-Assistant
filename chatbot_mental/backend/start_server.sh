#!/bin/bash
echo " Iniciando servidor backend..."

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
    echo "No se encontró el archivo .env"
fi

# Activate virtual environment and get Python path
if [ -f ".venv/Scripts/python.exe" ]; then
    # Windows (Git Bash / MINGW)
    PYTHON_CMD=".venv/Scripts/python.exe"
elif [ -f ".venv/bin/python" ]; then
    # Linux / Mac
    PYTHON_CMD=".venv/bin/python"
elif command -v python3 &> /dev/null; then
    PYTHON_CMD="python3"
else
    PYTHON_CMD="python"
fi

# Iniciar el servidor
echo "Iniciando servidor con: $PYTHON_CMD"
$PYTHON_CMD -m uvicorn main:app --reload --host 0.0.0.0 --port 8000