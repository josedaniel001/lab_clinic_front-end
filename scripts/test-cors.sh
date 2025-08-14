#!/bin/bash

# Script para probar la configuración de CORS
# Uso: ./scripts/test-cors.sh

set -e

print_message() {
    echo "🔍 $1"
}

print_error() {
    echo "❌ $1"
}

print_success() {
    echo "✅ $1"
}

print_message "Probando configuración de CORS..."

# URLs a probar
FRONTEND_URL="https://bioanalisis.com"
BACKEND_URL="https://bioanalisisadmin.com/api"

# Función para probar CORS
test_cors() {
    local url=$1
    local description=$2
    
    print_message "Probando $description..."
    
    # Probar preflight OPTIONS
    echo "  - Probando preflight OPTIONS..."
    if curl -s -o /dev/null -w "%{http_code}" -X OPTIONS \
        -H "Origin: $FRONTEND_URL" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type, Authorization" \
        "$url" | grep -q "200\|204"; then
        print_success "  ✅ Preflight OPTIONS exitoso"
    else
        print_error "  ❌ Preflight OPTIONS falló"
    fi
    
    # Probar GET request
    echo "  - Probando GET request..."
    if curl -s -o /dev/null -w "%{http_code}" \
        -H "Origin: $FRONTEND_URL" \
        "$url" | grep -q "200\|401\|403"; then
        print_success "  ✅ GET request exitoso"
    else
        print_error "  ❌ GET request falló"
    fi
    
    # Probar POST request
    echo "  - Probando POST request..."
    if curl -s -o /dev/null -w "%{http_code}" -X POST \
        -H "Origin: $FRONTEND_URL" \
        -H "Content-Type: application/json" \
        -d '{"test": "cors"}' \
        "$url" | grep -q "200\|201\|400\|401\|403"; then
        print_success "  ✅ POST request exitoso"
    else
        print_error "  ❌ POST request falló"
    fi
}

# Probar frontend
test_cors "$FRONTEND_URL" "Frontend (Next.js)"

# Probar backend
test_cors "$BACKEND_URL" "Backend (Django)"

print_message "📋 Resumen de la prueba de CORS:"
echo ""
print_message "Para verificar manualmente en el navegador:"
echo "1. Abrir DevTools (F12)"
echo "2. Ir a la pestaña Network"
echo "3. Hacer una petición a la API"
echo "4. Verificar que no haya errores de CORS"
echo ""
print_message "Si sigues teniendo problemas:"
echo "1. Verificar que el backend tenga CORS configurado"
echo "2. Verificar que los certificados SSL estén instalados"
echo "3. Verificar que el archivo hosts esté configurado"
echo "4. Limpiar caché del navegador"
