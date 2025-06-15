import { jsPDF } from "jspdf"
import autoTable from "jspdf-autotable"

interface ResultadoPDF {
  paciente: string
  medico: string
  fecha: string
  codigo: string
  resultados: {
    examen: string
    resultado: string
    unidad: string
    referencia: string
    estado: string
  }[]
}

export const generateResultadoPDF = (data: ResultadoPDF): Blob => {
  const doc = new jsPDF()

  // Configuración
  const logoUrl = "/logo-labofutura.png"
  const colorPrimario = "#1976d2"
  const fechaActual = new Date().toLocaleDateString()

  // Encabezado
  doc.setFillColor(colorPrimario)
  doc.rect(0, 0, 210, 30, "F")
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.text("LaboFutura", 15, 15)
  doc.setFontSize(12)
  doc.text("Resultados de Laboratorio", 15, 22)

  // Información del paciente
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(12)
  doc.text(`Paciente: ${data.paciente}`, 15, 40)
  doc.text(`Médico: ${data.medico}`, 15, 48)
  doc.text(`Fecha: ${data.fecha}`, 15, 56)
  doc.text(`Código: ${data.codigo}`, 15, 64)
  doc.text(`Fecha de impresión: ${fechaActual}`, 130, 40)

  // Tabla de resultados
  autoTable(doc, {
    startY: 75,
    head: [["Examen", "Resultado", "Unidad", "Valores de Referencia", "Estado"]],
    body: data.resultados.map((r) => [r.examen, r.resultado, r.unidad, r.referencia, r.estado]),
    headStyles: {
      fillColor: colorPrimario,
      textColor: 255,
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [240, 240, 240],
    },
    styles: {
      fontSize: 10,
    },
  })

  // Pie de página
  const pageCount = doc.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(
      "© LaboFutura - Todos los derechos reservados",
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: "center" },
    )
    doc.text(
      `Página ${i} de ${pageCount}`,
      doc.internal.pageSize.getWidth() - 20,
      doc.internal.pageSize.getHeight() - 10,
    )
  }

  // Firma digital
  doc.setFontSize(10)
  doc.text("Validado electrónicamente", 15, doc.internal.pageSize.getHeight() - 30)
  doc.text("No requiere firma manuscrita", 15, doc.internal.pageSize.getHeight() - 25)

  return doc.output("blob")
}

export const downloadPDF = (data: ResultadoPDF, filename = "resultados.pdf") => {
  const blob = generateResultadoPDF(data)
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
