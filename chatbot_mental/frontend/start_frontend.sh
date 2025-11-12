#!/bin/bash

# Script para iniciar el frontend React

echo "Iniciando frontend React..."
echo ""

# Navegar al directorio del frontend
cd "$(dirname "$0")"

# Verificar si node_modules existe
if [ ! -d "node_modules" ]; then
    echo "Instalando dependencias de npm..."
    npm install
fi

# Iniciar el servidor de desarrollo
echo "Iniciando aplicación React en http://localhost:3000"
npm start
