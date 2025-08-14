# 🐳 Docker Setup - Lab Clinic Frontend

Este documento explica cómo configurar y ejecutar la aplicación Lab Clinic Frontend usando Docker.

## 📋 Prerrequisitos

- Docker Desktop instalado
- Docker Compose instalado
- Git instalado

## 🚀 Configuración Rápida

### 1. Clonar el repositorio
```bash
git clone <tu-repositorio>
cd lab_clinic_front-end
```

### 2. Configurar variables de entorno
```bash
# Dar permisos de ejecución a los scripts
chmod +x scripts/env-manager.sh
chmod +x scripts/docker-build.sh

# Configurar para desarrollo
./scripts/env-manager.sh dev

# O configurar para producción
./scripts/env-manager.sh prod

# Ver estado de configuración
./scripts/env-manager.sh status
```

### 3. Ejecutar con Docker Compose

#### Modo Producción
```bash
# Construir y ejecutar
docker-compose up --build

# O usar el script automatizado
chmod +x scripts/docker-build.sh
./scripts/docker-build.sh prod
```

#### Modo Desarrollo (con hot reload)
```bash
# Usar docker-compose de desarrollo
docker-compose -f docker-compose.dev.yml up --build

# O usar el script
./scripts/docker-build.sh dev
```

## 📁 Estructura de Archivos Docker

```
├── Dockerfile              # Dockerfile para producción
├── Dockerfile.dev          # Dockerfile para desarrollo
├── docker-compose.yml      # Configuración para producción
├── docker-compose.dev.yml  # Configuración para desarrollo
├── .dockerignore           # Archivos a ignorar en Docker
├── env.example             # Variables de entorno de ejemplo
├── env.development         # Variables para desarrollo
├── env.production          # Variables para producción
├── scripts/
│   ├── docker-build.sh    # Script automatizado
│   └── env-manager.sh     # Gestor de entornos
├── DOCKER_README.md       # Este archivo
└── ENV_SETUP.md           # Documentación de entornos
```

## 🔧 Comandos Útiles

### Gestión de Contenedores

```bash
# Ver estado de contenedores
docker-compose ps

# Ver logs en tiempo real
docker-compose logs -f

# Parar contenedores
docker-compose down

# Parar y eliminar volúmenes
docker-compose down -v

# Reconstruir sin caché
docker-compose build --no-cache
```

### Scripts Automatizados

```bash
# Gestión de entornos
./scripts/env-manager.sh dev      # Configurar desarrollo
./scripts/env-manager.sh prod     # Configurar producción
./scripts/env-manager.sh status   # Ver estado
./scripts/env-manager.sh validate # Validar configuración

# Gestión de Docker
./scripts/docker-build.sh help    # Ver ayuda
./scripts/docker-build.sh prod    # Ejecutar en producción
./scripts/docker-build.sh dev     # Ejecutar en desarrollo
./scripts/docker-build.sh clean   # Limpiar contenedores
./scripts/docker-build.sh logs    # Ver logs
./scripts/docker-build.sh status  # Ver estado
```

## 🌍 Variables de Entorno

### Variables Principales

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `NEXT_PUBLIC_APP_URL` | URL de la aplicación | `http://bioanalisis.com` |
| `NEXT_PUBLIC_API_URL` | URL de la API | `http://bioanalisisadmin.com/api` |
| `API_BASE_URL` | URL base de la API | `http://bioanalisisadmin.com/api` |

### Variables de Autenticación

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `NEXTAUTH_URL` | URL para NextAuth | `http://bioanalisis.com` |
| `NEXTAUTH_SECRET` | Clave secreta para NextAuth | `tu-clave-secreta-aqui` |

### Variables de Base de Datos (si aplica)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL de conexión a BD | `postgresql://user:pass@localhost:5432/db` |

## 🔍 Troubleshooting

### Problema: Puerto 3000 ya está en uso
```bash
# Cambiar puerto en docker-compose.yml
ports:
  - "3001:3000"  # Cambiar 3000 por 3001
```

### Problema: Error de permisos en scripts
```bash
# Dar permisos de ejecución
chmod +x scripts/docker-build.sh
```

### Problema: Contenedor no inicia
```bash
# Ver logs detallados
docker-compose logs

# Reconstruir sin caché
docker-compose build --no-cache
docker-compose up
```

### Problema: Variables de entorno no se cargan
```bash
# Verificar que .env existe
ls -la .env

# Verificar contenido
cat .env

# Recrear desde ejemplo
cp env.example .env
```

## 🐛 Debugging

### Entrar al contenedor
```bash
# Modo producción
docker-compose exec lab-clinic-frontend sh

# Modo desarrollo
docker-compose -f docker-compose.dev.yml exec lab-clinic-frontend-dev sh
```

### Ver logs específicos
```bash
# Logs de la aplicación
docker-compose logs lab-clinic-frontend

# Logs con timestamps
docker-compose logs -t lab-clinic-frontend
```

## 🔒 Seguridad

### Buenas Prácticas

1. **Nunca committear archivos .env**
   ```bash
   # Asegurar que .env está en .gitignore
   echo ".env" >> .gitignore
   ```

2. **Usar secrets en producción**
   ```bash
   # En lugar de .env, usar Docker secrets
   docker secret create db_password ./secrets/db_password.txt
   ```

3. **Actualizar dependencias regularmente**
   ```bash
   # Reconstruir imagen con dependencias actualizadas
   docker-compose build --no-cache
   ```

## 📊 Monitoreo

### Health Check
El contenedor incluye un health check que verifica:
- Disponibilidad del puerto 3000
- Respuesta del endpoint `/api/health`

### Métricas
```bash
# Ver uso de recursos
docker stats

# Ver información del contenedor
docker inspect lab-clinic-frontend
```

## 🚀 Despliegue

### Producción
```bash
# Construir imagen optimizada
docker-compose -f docker-compose.yml build

# Ejecutar en modo detached
docker-compose -f docker-compose.yml up -d
```

### Desarrollo
```bash
# Ejecutar con hot reload
docker-compose -f docker-compose.dev.yml up
```

## 📝 Notas Adicionales

- La aplicación estará disponible en `http://bioanalisis.com`
- Los logs se pueden ver con `docker-compose logs -f`
- Para desarrollo, los cambios en el código se reflejan automáticamente
- El modo standalone de Next.js está habilitado para optimizar el tamaño de la imagen

## 🤝 Contribución

Si encuentras problemas o tienes sugerencias:

1. Verifica que Docker y Docker Compose estén actualizados
2. Revisa los logs con `docker-compose logs`
3. Asegúrate de que las variables de entorno estén configuradas correctamente
4. Si el problema persiste, crea un issue con los logs completos 