#!/bin/bash
echo " Iniciando servidor backend..."

cd "$(dirname "$0")"

if [ ! -f ".env" ]; then
    echo "No se encontró el archivo .env"
fi

# Iniciar el servidor
echo "Iniciando servidor"
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
