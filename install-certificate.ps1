# Script para instalar el certificado SSL en Windows
# Ejecutar como Administrador

Write-Host "🔐 Instalando certificado SSL para bioanalisis.com..." -ForegroundColor Green

# Ruta del certificado
$certPath = Join-Path $PSScriptRoot "bioanalisis.crt"

# Verificar que el certificado existe
if (-not (Test-Path $certPath)) {
    Write-Host "❌ Error: No se encontró el certificado en $certPath" -ForegroundColor Red
    Write-Host "Asegúrate de que el archivo bioanalisis.crt esté en el directorio actual" -ForegroundColor Yellow
    exit 1
}

try {
    # Importar el certificado al almacén de certificados raíz
    $cert = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2
    $cert.Import($certPath)
    
    $store = New-Object System.Security.Cryptography.X509Certificates.X509Store("Root", "LocalMachine")
    $store.Open("ReadWrite")
    $store.Add($cert)
    $store.Close()
    
    Write-Host "✅ Certificado instalado exitosamente en el almacén de certificados raíz" -ForegroundColor Green
    
    # Limpiar caché DNS
    Write-Host "🔄 Limpiando caché DNS..." -ForegroundColor Yellow
    ipconfig /flushdns | Out-Null
    
    Write-Host "✅ Caché DNS limpiado" -ForegroundColor Green
    
} catch {
    Write-Host "❌ Error al instalar el certificado: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Asegúrate de ejecutar este script como Administrador" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 ¡Certificado instalado exitosamente!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Próximos pasos:" -ForegroundColor Cyan
Write-Host "1. Reinicia tu navegador"
Write-Host "2. Ve a https://bioanalisis.com"
Write-Host "3. El certificado debería ser confiable ahora"
Write-Host ""
Write-Host "💡 Si sigues viendo advertencias de certificado:"
Write-Host "   - Haz clic en 'Avanzado'"
Write-Host "   - Haz clic en 'Continuar a bioanalisis.com (no seguro)'"
Write-Host "   - El certificado se instalará automáticamente"
