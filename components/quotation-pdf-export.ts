import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import { formatCurrency, formatPercentage } from "@/lib/utils/format-utils"
import type { LoanCalculatorFormData, Project } from "@/types/loan-calculator"

interface QuotationData {
  propertyDetails: {
    propertyName: string
    lotArea: number
    lotPrice: number
    houseConstructionCost: number
    totalSellingPrice: number
    developer?: string
    project?: string
  }
  loanDetails: {
    propertyPrice: number
    downPayment: number
    loanAmount: number
    interestRate: number
    monthlyPayment: number
    totalPayment: number
    term: number
    downPaymentPercentage: number
  }
  downPaymentSchedule: Array<{
    year: number
    amount: number
    monthly: number
    interestRate: number
  }>
  customerInfo: {
    name: string
    date: string
    address: string
    contactNo: string
    email: string
  }
}

interface ExportQuotationPdfProps {
  formData: LoanCalculatorFormData
  loanDetails: {
    totalContractPrice: number
    downPaymentAmount: number
    reservationFee: number
    netDownPayment: number
    monthlyDownPayment: number
    loanableAmount: number
    monthlyAmortization: number
    totalInterestPaid: number
    totalAmountPaid: number
  }
  project: Project | null
}

export const exportQuotationPdf = ({ formData, loanDetails, project }: ExportQuotationPdfProps) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "in",
    format: [8.5, 13], // Long bond paper size
  })

  const margin = 0.4 // 0.4 inch margin on all sides
  let y = margin

  // Set font size for the entire document
  doc.setFontSize(8)

  // Header
  if (project?.logo) {
    const img = new Image()
    img.src = project.logo
    const imgWidth = 0.7
    const imgHeight = 0.7
    doc.addImage(img, "PNG", margin, y, imgWidth, imgHeight)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(project.name, margin + imgWidth + 0.1, y + imgHeight / 2 + 0.05)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    y += imgHeight + 0.1
  } else {
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(project?.name || "Loan Quotation", margin, y + 0.1)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    y += 0.3
  }

  doc.setFontSize(7)
  doc.text(`DHSUD LTS NO. ${project?.dhsudLtsNo || "N/A"}`, margin, y)
  y += 0.2

  doc.setFontSize(8)
  doc.setFont("helvetica", "bold")
  doc.text("LOAN QUOTATION", doc.internal.pageSize.width / 2, y, { align: "center" })
  y += 0.2

  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")
  doc.text(`Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.width - margin, y, {
    align: "right",
  })
  y += 0.2

  // Customer Information
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text("CUSTOMER INFORMATION", margin, y)
  y += 0.15
  doc.setFont("helvetica", "normal")
  doc.text(`Name: ${formData.customerName || "____________________"}`, margin, y)
  doc.text(`Email: ${formData.customerEmail || "____________________"}`, margin + 3, y)
  y += 0.15
  doc.text(`Phone: ${formData.customerPhone || "____________________"}`, margin, y)
  doc.text(`Address: ${formData.customerAddress || "____________________"}`, margin + 3, y)
  y += 0.3

  // Property Details
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text("PROPERTY DETAILS", margin, y)
  y += 0.15
  doc.setFont("helvetica", "normal")
  doc.text(`Project: ${project?.name || "N/A"}`, margin, y)
  doc.text(`Unit Type: ${formData.unitType || "N/A"}`, margin + 3, y)
  y += 0.15
  doc.text(`Lot Area: ${formData.lotArea || "N/A"} sqm`, margin, y)
  doc.text(`Floor Area: ${formData.floorArea || "N/A"} sqm`, margin + 3, y)
  y += 0.15
  doc.text(`Total Contract Price: ${formatCurrency(loanDetails.totalContractPrice)}`, margin, y)
  y += 0.3

  // Loan Summary Table
  doc.setFontSize(7)
  doc.setFont("helvetica", "bold")
  doc.text("LOAN SUMMARY", margin, y)
  y += 0.15

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [["Description", "Amount", "Down Payment Term", "Loan Term", "Interest Rate", "Monthly Amortization"]],
    body: [
      [
        "Total Contract Price",
        formatCurrency(loanDetails.totalContractPrice),
        `${formData.downPaymentTermMonths} months`,
        `${formData.loanTermYears} years`,
        formatPercentage(formData.interestRate),
        formatCurrency(loanDetails.monthlyAmortization),
      ],
      ["Down Payment Amount", formatCurrency(loanDetails.downPaymentAmount), "", "", "", ""],
      ["Reservation Fee", formatCurrency(loanDetails.reservationFee), "", "", "", ""],
      ["Net Down Payment", formatCurrency(loanDetails.netDownPayment), "", "", "", ""],
      ["Monthly Down Payment", formatCurrency(loanDetails.monthlyDownPayment), "", "", "", ""],
      ["Loanable Amount", formatCurrency(loanDetails.loanableAmount), "", "", "", ""],
    ],
    theme: "grid",
    styles: {
      fontSize: 7,
      cellPadding: 0.05,
      valign: "middle",
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: [230, 230, 230],
      textColor: [0, 0, 0],
      fontStyle: "bold",
      halign: "center",
    },
    columnStyles: {
      0: { cellWidth: 1.5 },
      1: { cellWidth: 1.2, halign: "right" },
      2: { cellWidth: 1.2, halign: "center" },
      3: { cellWidth: 1.0, halign: "center" },
      4: { cellWidth: 1.0, halign: "center" },
      5: { cellWidth: 1.5, halign: "right" },
    },
    didDrawPage: (data) => {
      y = data.cursor?.y || y // Update y position after table
    },
  })

  y += 0.2 // Add some space after the table

  // Notes Section
  doc.setFontSize(6)
  doc.setFont("helvetica", "normal")
  doc.text(
    "NOTE: This computation is for illustration purposes only and is subject to change without prior notice. " +
      "Final computation will be provided upon reservation and approval of the developer. " +
      "Prices are subject to change without prior notice. " +
      "Interest rates are indicative and may vary based on prevailing market rates at the time of loan take-out. " +
      "Miscellaneous fees, transfer taxes, and other charges are not included in this computation.",
    margin,
    y,
    { maxWidth: doc.internal.pageSize.width - 2 * margin },
  )
  y += 0.5

  // Signatures
  doc.setFontSize(7)
  doc.setFont("helvetica", "normal")

  const signatureLineLength = 2.5
  const signatureSpacing = 0.5

  // Row 1
  doc.text("________________________________", margin, y)
  doc.text("________________________________", margin + signatureLineLength + signatureSpacing, y)
  y += 0.15
  doc.text("Customer Name / Signature", margin, y)
  doc.text("Licensed Real Estate Broker", margin + signatureLineLength + signatureSpacing, y)
  y += 0.3

  // Row 2
  doc.text("________________________________", margin, y)
  doc.text("________________________________", margin + signatureLineLength + signatureSpacing, y)
  y += 0.15
  doc.text("Accounting Department", margin, y)
  doc.text("Chief Executive Officer", margin + signatureLineLength + signatureSpacing, y)
  y += 0.3

  // Row 3 (if needed, adjust spacing)
  doc.text("________________________________", margin, y)
  doc.text("________________________________", margin + signatureLineLength + signatureSpacing, y)
  y += 0.15
  doc.text("Sales Manager", margin, y)
  doc.text("Marketing Head", margin + signatureLineLength + signatureSpacing, y)
  y += 0.3

  doc.save(
    `${project?.name.replace(/\s/g, "-") || "Quotation"}-${formData.customerName?.replace(/\s/g, "-") || "Customer"}.pdf`,
  )
}

const exportQuotationToPDF = (data: QuotationData) => {
  // This function is now redundant due to the new exportQuotationPdf function
  // It can be removed or used for legacy purposes
}
