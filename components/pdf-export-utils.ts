import type { MonthlyScheduleItem, YearlyScheduleItem } from "@/types/loan-calculator"

// Simple PDF export function that works directly in the browser without external libraries
export const exportToPDF = (
  schedule: MonthlyScheduleItem[] | YearlyScheduleItem[],
  scheduleView: "monthly" | "yearly",
  loanDetails: {
    propertyPrice: number
    downPayment: number
    loanAmount: number
    interestRate: number
    monthlyPayment: number
    totalPayment: number
    term: number
  },
  modelName?: string, // Add modelName parameter
) => {
  // Fix the currency formatting to ensure proper encoding of the peso symbol
  const formatCurrencyForPDF = (amount: number): string => {
    return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  // Create the HTML content for the PDF with proper encoding
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <title>${modelName ? `Amortization Schedule - ${modelName}` : "Amortization Schedule"}</title>
    <style>
      /* Set A4 page size */
      @page {
        size: A4;
        margin: 1cm;
      }
      body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 20px;
        color: #333;
        width: 21cm; /* A4 width */
        min-height: 29.7cm; /* A4 height */
        box-sizing: border-box;
      }
      h1, h2, h3 {
        color: #444;
      }
      .summary {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 5px;
      }
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      .summary-item {
        margin-bottom: 8px;
      }
      .label {
        font-weight: bold;
        margin-right: 5px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 20px;
        page-break-inside: auto;
      }
      tr {
        page-break-inside: avoid;
        page-break-after: auto;
      }
      th, td {
        border: 1px solid #ddd;
        padding: 8px;
        text-align: left;
        font-size: 11px;
      }
      th {
        background-color: #f2f2f2;
        font-weight: bold;
      }
      tr:nth-child(even) {
        background-color: #f9f9f9;
      }
      .note-section {
        margin-top: 30px;
        padding: 15px;
        background-color: #f9f9f9;
        border-radius: 5px;
        border-left: 4px solid #ccc;
        page-break-inside: avoid;
      }
      .note-title {
        font-weight: bold;
        margin-bottom: 10px;
      }
      .note-list {
        margin: 0;
        padding-left: 20px;
      }
      .note-list li {
        margin-bottom: 5px;
        font-size: 11px;
      }
      .button-container {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
      }
      .button {
        padding: 8px 16px;
        background-color: #65932D;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 14px;
      }
      .button.secondary {
        background-color: #f0f0f0;
        color: #333;
      }
      @media print {
        .no-print {
          display: none;
        }
        body {
          font-size: 12px;
        }
        h1 {
          font-size: 18px;
        }
        h2 {
          font-size: 16px;
        }
        h3 {
          font-size: 14px;
        }
      }
    </style>
  </head>
  <body>
    <div class="no-print button-container">
      <button class="button" onclick="window.print()">Print/Save as PDF</button>
      <button class="button secondary" onclick="window.close()">Close</button>
    </div>
    
    <h1>${modelName ? `Loan Amortization Schedule - ${modelName}` : "Loan Amortization Schedule"}</h1>
    
    <div class="summary">
      <h2>Loan Summary</h2>
      <div class="summary-grid">
        ${
          modelName
            ? `
        <div class="summary-item">
          <span class="label">Property:</span>
          <span>${modelName}</span>
        </div>
        `
            : ""
        }
        <div class="summary-item">
          <span class="label">Property Price:</span>
          <span>${formatCurrencyForPDF(loanDetails.propertyPrice)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Down Payment:</span>
          <span>${formatCurrencyForPDF(loanDetails.downPayment)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Loan Amount:</span>
          <span>${formatCurrencyForPDF(loanDetails.loanAmount)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Interest Rate:</span>
          <span>${loanDetails.interestRate}%</span>
        </div>
        <div class="summary-item">
          <span class="label">Term:</span>
          <span>${loanDetails.term} years</span>
        </div>
        <div class="summary-item">
          <span class="label">Monthly Payment:</span>
          <span>${formatCurrencyForPDF(loanDetails.monthlyPayment)}</span>
        </div>
        <div class="summary-item">
          <span class="label">Total Payment:</span>
          <span>${formatCurrencyForPDF(loanDetails.totalPayment)}</span>
        </div>
      </div>
    </div>
    
    <h2>${scheduleView === "monthly" ? "Monthly" : "Yearly"} Amortization Schedule</h2>
    <table>
      <thead>
        <tr>
          <th>${scheduleView === "monthly" ? "Month" : "Year"}</th>
          <th>Principal</th>
          <th>Payment</th>
          <th>Balance</th>
        </tr>
      </thead>
      <tbody>
        ${schedule
          .map(
            (row) => `
          <tr>
            <td>${scheduleView === "monthly" ? row.month : row.year}</td>
            <td>${formatCurrencyForPDF(row.principal)}</td>
            <td>${formatCurrencyForPDF(row.payment)}</td>
            <td>${formatCurrencyForPDF(row.balance)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <!-- Loan Calculator Note Section -->
    <div class="note-section">
      <h3 class="note-title">Important Notes</h3>
      <ul class="note-list">
        <li>This calculator provides estimates only and actual loan terms may vary.</li>
        <li>Additional charges such as reservation fees, processing fees, and documentary stamp taxes are not included in these calculations.</li>
        <li>The standard reservation fee is ₱25,000.00 and is non-refundable but deductible from the total contract price.</li>
        <li>Interest rates are subject to change without prior notice.</li>
        <li>Please consult with our sales representatives for the most current rates and terms.</li>
      </ul>
    </div>
  </body>
  </html>
`

  // Create a direct download PDF option using jsPDF if available
  try {
    // Create a blob from the HTML content with proper encoding
    const blob = new Blob([html], { type: "text/html;charset=UTF-8" })
    const blobUrl = URL.createObjectURL(blob)

    // Create a filename for the PDF
    const filename = modelName
      ? `amortization_schedule_${modelName.replace(/\s+/g, "_")}_${scheduleView}.pdf`
      : `amortization_schedule_${scheduleView}.pdf`

    // Open the HTML in a new window for printing
    const printWindow = window.open(blobUrl, "_blank")
    if (!printWindow) {
      alert("Please allow popups for this website to export PDF")
      return false
    }

    // Add event listener to detect when the window is fully loaded
    printWindow.addEventListener("load", () => {
      // Focus the window to bring it to the front
      printWindow.focus()

      // On mobile devices, provide instructions
      if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        const instructionDiv = printWindow.document.createElement("div")
        instructionDiv.style.backgroundColor = "#ffffcc"
        instructionDiv.style.padding = "10px"
        instructionDiv.style.marginBottom = "15px"
        instructionDiv.style.borderRadius = "5px"
        instructionDiv.style.fontSize = "14px"
        instructionDiv.innerHTML =
          "<strong>Mobile Device Detected:</strong> To save as PDF, tap the Print/Save as PDF button, then use your browser's share or print option to save as PDF."

        const body = printWindow.document.body
        body.insertBefore(instructionDiv, body.firstChild)
      }
    })

    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 100)

    return true
  } catch (error) {
    console.error("Error generating PDF:", error)
    alert("There was an error generating the PDF. Please try again.")
    return false
  }
}
