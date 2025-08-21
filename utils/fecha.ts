// utils/fecha.ts
export function obtenerFechaGuatemalaISO(): string {
  const fecha = new Date();
  const fechaGuatemala = new Date(
    fecha.toLocaleString("en-US", { timeZone: "America/Guatemala" })
  );

  const year = fechaGuatemala.getFullYear();
  const month = String(fechaGuatemala.getMonth() + 1).padStart(2, "0");
  const day = String(fechaGuatemala.getDate()).padStart(2, "0");
  const hours = String(fechaGuatemala.getHours()).padStart(2, "0");
  const minutes = String(fechaGuatemala.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

// Función para formatear fecha a formato YYYY-MM-DD
export function formatearFechaParaAPI(fecha: string): string {
  if (!fecha) return "";
  
  // Si ya está en formato YYYY-MM-DD, retornarlo tal como está
  if (/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
    return fecha;
  }
  
  // Si está en formato datetime-local (YYYY-MM-DDTHH:MM), extraer solo la fecha
  if (fecha.includes('T')) {
    return fecha.split('T')[0];
  }
  
  // Si es una fecha válida, convertirla
  try {
    const date = new Date(fecha);
    if (!isNaN(date.getTime())) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    }
  } catch (error) {
    console.error("Error al formatear fecha:", error);
  }
  
  return "";
}
