#!/bin/bash

# Script para gestionar archivos de entorno
# Uso: ./scripts/env-manager.sh [dev|prod|setup]

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

# Función para configurar entorno de desarrollo
setup_dev() {
    print_message "Configurando entorno de desarrollo..."
    
    if [ -f env.development ]; then
        cp env.development .env
        print_message "Archivo .env creado desde env.development"
    else
        print_error "Archivo env.development no encontrado"
        exit 1
    fi
    
    print_message "Entorno de desarrollo configurado correctamente"
    print_info "Variables de entorno cargadas:"
    print_info "- NODE_ENV=development"
    print_info "- DEBUG_MODE=true"
    print_info "- API_URL=http://localhost:8000/api"
}

# Función para configurar entorno de producción
setup_prod() {
    print_message "Configurando entorno de producción..."
    
    if [ -f env.production ]; then
        cp env.production .env
        print_message "Archivo .env creado desde env.production"
    else
        print_error "Archivo env.production no encontrado"
        exit 1
    fi
    
    print_message "Entorno de producción configurado correctamente"
    print_info "Variables de entorno cargadas:"
    print_info "- NODE_ENV=production"
    print_info "- DEBUG_MODE=false"
    print_info "- API_URL=https://api.tu-dominio.com/api"
}

# Función para crear archivos de entorno iniciales
setup_initial() {
    print_message "Creando archivos de entorno iniciales..."
    
    # Crear .env desde env.example si existe
    if [ -f env.example ] && [ ! -f .env ]; then
        cp env.example .env
        print_message "Archivo .env creado desde env.example"
    fi
    
    # Verificar que existen los archivos de entorno
    if [ ! -f env.development ]; then
        print_warning "Archivo env.development no encontrado"
    else
        print_message "Archivo env.development encontrado"
    fi
    
    if [ ! -f env.production ]; then
        print_warning "Archivo env.production no encontrado"
    else
        print_message "Archivo env.production encontrado"
    fi
    
    print_message "Configuración inicial completada"
}

# Función para mostrar el estado actual
show_status() {
    print_info "Estado actual de archivos de entorno:"
    echo ""
    
    if [ -f .env ]; then
        print_message "✓ Archivo .env existe"
        print_info "Variables principales:"
        grep -E "^(NODE_ENV|NEXT_PUBLIC_APP_URL|NEXT_PUBLIC_API_URL)=" .env | head -3
    else
        print_warning "✗ Archivo .env no existe"
    fi
    
    echo ""
    
    if [ -f env.development ]; then
        print_message "✓ Archivo env.development existe"
    else
        print_warning "✗ Archivo env.development no existe"
    fi
    
    if [ -f env.production ]; then
        print_message "✓ Archivo env.production existe"
    else
        print_warning "✗ Archivo env.production no existe"
    fi
    
    if [ -f env.example ]; then
        print_message "✓ Archivo env.example existe"
    else
        print_warning "✗ Archivo env.example no existe"
    fi
}

# Función para validar archivo .env
validate_env() {
    if [ ! -f .env ]; then
        print_error "Archivo .env no encontrado"
        return 1
    fi
    
    print_message "Validando archivo .env..."
    
    # Verificar variables críticas
    local missing_vars=()
    
    if ! grep -q "NODE_ENV=" .env; then
        missing_vars+=("NODE_ENV")
    fi
    
    if ! grep -q "NEXT_PUBLIC_API_URL=" .env; then
        missing_vars+=("NEXT_PUBLIC_API_URL")
    fi
    
    if ! grep -q "NEXTAUTH_SECRET=" .env; then
        missing_vars+=("NEXTAUTH_SECRET")
    fi
    
    if [ ${#missing_vars[@]} -eq 0 ]; then
        print_message "✓ Archivo .env válido"
    else
        print_warning "⚠ Variables faltantes en .env:"
        for var in "${missing_vars[@]}"; do
            print_warning "  - $var"
        done
    fi
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  dev     - Configurar entorno de desarrollo"
    echo "  prod    - Configurar entorno de producción"
    echo "  setup   - Configuración inicial de archivos de entorno"
    echo "  status  - Mostrar estado de archivos de entorno"
    echo "  validate- Validar archivo .env actual"
    echo "  help    - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 dev     # Configurar para desarrollo"
    echo "  $0 prod    # Configurar para producción"
    echo "  $0 status  # Ver estado actual"
    echo ""
    echo "Nota: Los archivos env.development y env.production deben existir"
}

# Procesar argumentos
case "${1:-help}" in
    "dev")
        setup_dev
        ;;
    "prod")
        setup_prod
        ;;
    "setup")
        setup_initial
        ;;
    "status")
        show_status
        ;;
    "validate")
        validate_env
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac 