export interface UnidadSangre {
  id: number
  condiciones_almacenamiento: string
  tipo_unidad: "CRIO_PRECIPITADO" | "PLAQUETAS" | "PLAQUETAS_GLOBULARES" | "PLASMA"
  correlativo: string
  volumen_ml: number
  creado:Date
  fecha_extraccion: string
  fecha_caducidad: string
  fecha_donacion: string
  fecha_validacion:string
  dias_vigencia: number
  donante:object
  observaciones: string
  responsable: string
  estado: "DISPONIBLE" | "TRANSFORMADA" | "DESCARTADA" | "VENCIDO"
  lote: object
  donante_id?: string
  grupo_sanguineo?: string
  serologias?: JSON
  tipo_sangre: string
  localizacion: string
}
