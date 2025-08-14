#!/bin/bash

# Script para construir y ejecutar la aplicación con Docker
# Uso: ./scripts/docker-build.sh [dev|prod]

set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    print_error "Docker no está instalado. Por favor instala Docker primero."
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose no está instalado. Por favor instala Docker Compose primero."
    exit 1
fi

# Verificar si existe el archivo .env
if [ ! -f .env ]; then
    print_warning "Archivo .env no encontrado."
    print_message "Usando gestor de entornos para configurar..."
    
    # Ejecutar el gestor de entornos
    if [ -f scripts/env-manager.sh ]; then
        chmod +x scripts/env-manager.sh
        ./scripts/env-manager.sh setup
    else
        print_error "Script env-manager.sh no encontrado"
        exit 1
    fi
fi

# Función para construir y ejecutar en modo desarrollo
build_dev() {
    print_message "Construyendo imagen en modo desarrollo..."
    docker-compose -f docker-compose.dev.yml up --build
}

# Función para construir y ejecutar en modo producción
build_prod() {
    print_message "Construyendo imagen en modo producción..."
    
    # Parar contenedores existentes
    docker-compose down
    
    # Construir imagen
    docker-compose build --no-cache
    
    # Ejecutar en modo detached
    docker-compose up -d
    
    print_message "Aplicación iniciada en http://localhost:3000"
    print_message "Para ver logs: docker-compose logs -f"
    print_message "Para detener: docker-compose down"
}

# Función para limpiar
cleanup() {
    print_message "Limpiando contenedores e imágenes..."
    docker-compose down --volumes --remove-orphans
    docker system prune -f
    print_message "Limpieza completada"
}

# Función para mostrar logs
logs() {
    docker-compose logs -f
}

# Función para mostrar estado
status() {
    docker-compose ps
}

# Función para mostrar ayuda
show_help() {
    echo "Uso: $0 [comando]"
    echo ""
    echo "Comandos disponibles:"
    echo "  dev     - Construir y ejecutar en modo desarrollo"
    echo "  prod    - Construir y ejecutar en modo producción"
    echo "  clean   - Limpiar contenedores e imágenes"
    echo "  logs    - Mostrar logs de los contenedores"
    echo "  status  - Mostrar estado de los contenedores"
    echo "  help    - Mostrar esta ayuda"
    echo ""
    echo "Ejemplos:"
    echo "  $0 prod    # Construir y ejecutar en producción"
    echo "  $0 dev     # Construir y ejecutar en desarrollo"
    echo "  $0 logs    # Ver logs"
}

# Procesar argumentos
case "${1:-prod}" in
    "dev")
        build_dev
        ;;
    "prod")
        build_prod
        ;;
    "clean")
        cleanup
        ;;
    "logs")
        logs
        ;;
    "status")
        status
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