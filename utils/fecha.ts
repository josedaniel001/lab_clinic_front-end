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
