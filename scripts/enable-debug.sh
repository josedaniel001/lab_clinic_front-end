#!/bin/bash

# Script para habilitar el panel de debug
# Uso: ./scripts/enable-debug.sh

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para imprimir mensajes
print_message() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado"
    exit 1
fi

print_message "Habilitando panel de debug..."

# Habilitar debug en env.development
print_message "Configurando variables de entorno..."
sed -i 's/NEXT_PUBLIC_ENABLE_DEBUG_PANEL=false/NEXT_PUBLIC_ENABLE_DEBUG_PANEL=true/' env.development

# Verificar si el contenedor está corriendo
if docker-compose ps | grep -q "lab-clinic-frontend"; then
    print_info "Contenedor de producción detectado"
    
    # Parar contenedor
    print_message "Deteniendo contenedor..."
    docker-compose down
    
    # Aplicar configuración de desarrollo con debug
    print_message "Aplicando configuración con debug..."
    ./scripts/env-manager.sh dev
    
    # Reconstruir y ejecutar
    print_message "Reconstruyendo contenedor..."
    docker-compose up --build -d
    
elif docker-compose -f docker-compose.dev.yml ps | grep -q "lab-clinic-frontend-dev"; then
    print_info "Contenedor de desarrollo detectado"
    
    # Parar contenedor
    print_message "Deteniendo contenedor de desarrollo..."
    docker-compose -f docker-compose.dev.yml down
    
    # Aplicar configuración de desarrollo con debug
    print_message "Aplicando configuración con debug..."
    ./scripts/env-manager.sh dev
    
    # Reconstruir y ejecutar
    print_message "Reconstruyendo contenedor de desarrollo..."
    docker-compose -f docker-compose.dev.yml up --build -d
else
    print_warning "No se detectó ningún contenedor corriendo"
    print_message "Aplicando configuración con debug..."
    ./scripts/env-manager.sh dev
fi

print_message "✅ Panel de debug habilitado"
print_info "La aplicación estará disponible en http://localhost:3000"
print_info "El panel de debug aparecerá en la esquina inferior derecha"
print_info "Para ver logs: docker-compose logs -f"
print_info "Para deshabilitar debug: ./scripts/disable-debug.sh" 