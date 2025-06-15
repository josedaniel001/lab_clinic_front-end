# 🧪 Frontend – Sistema de Gestión para Laboratorio Clínico

Este proyecto es la **interfaz de usuario (frontend)** del sistema de laboratorio clínico. Fue desarrollado con **Next.js** y **Tailwind CSS**, estructurado con buenas prácticas en carpetas como `components`, `hooks`, `contexts` y `utils`, e implementado con **TypeScript** para mayor escalabilidad.

---

## 🚀 Características

- 🔐 Autenticación de usuarios con JWT
- 🎛️ Vistas separadas por módulos: Recepción, Laboratorio, Reportes y Administración
- 👤 Control de roles y permisos personalizados
- 📄 Visualización y edición de órdenes, resultados y pacientes
- 🎨 Estilo moderno con Tailwind y arquitectura modular (app-router)

---

## 🛠 Tecnologías principales

- **Next.js** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Axios** para consumo del backend
- **Context API** para manejo de sesión, roles y estados globales

---

## 📁 Estructura de carpetas

lab-system/
├── app/ # Rutas y páginas (Next.js App Router)
├── components/ # Componentes reutilizables
├── contexts/ # Contextos de autenticación y sesión
├── hooks/ # Custom hooks
├── lib/ # Funciones auxiliares / API config
├── styles/ # Archivos globales de estilo
├── theme/ # Paleta de colores y configuración UI
├── utils/ # Utilidades generales (formatos, validaciones)



---

## 🚀 Instalación

### 1. Clona el repositorio

```bash
git clone https://github.com/TU_USUARIO/lab-system.git
cd lab-system


npm install
# o si usas pnpm
pnpm install

3. Crea un archivo .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000/api/


4. Corre el servidor de desarrollo
npm run dev

El proyecto estará disponible en http://localhost:3000

✨ Recomendaciones de desarrollo

    Usa Ctrl + Space para autocompletado con TypeScript.

    Los permisos y vistas están controlados dinámicamente desde contexto (contexts/).

    Los módulos están definidos por rutas: /recepcion, /laboratorio, /reportes, /admin.


    🧠 Autor

Desarrollado por JOSE DANIEL GALINDO SOLIS
Repositorio backend: lab_clinic_back