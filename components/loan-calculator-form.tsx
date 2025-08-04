"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Check,
  ChevronsUpDown,
  Calculator,
  Download,
  Search,
  Loader2,
  AlertCircle,
  RefreshCw,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
  calculateLoan,
  formatCurrency,
  generateLoanAmortizationSchedule,
  DEFAULT_SPECIAL_RULES,
} from "@/lib/loan-calculations"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"
import { usePropertyData } from "@/lib/hooks/usePropertyData"
import { LoanCalculatorNote } from "./loan-calculator-note"
import { exportToPDF as exportToPDFUtil } from "@/components/pdf-export-utils"

interface Property {
  id: string
  name: string
  location: string
  price: number
  type: "model-house" | "lot-only"
  lotPrice?: number
  houseConstructionPrice?: number
  developer?: string
  project?: string
}

interface LoanCalculatorFormProps {
  initialPropertyId?: string
  initialPropertyType?: "model-house" | "lot-only"
}

export function LoanCalculatorForm({ initialPropertyId, initialPropertyType }: LoanCalculatorFormProps) {
  const searchParams = useSearchParams()

  // Form state with safe defaults
  const [propertyPrice, setPropertyPrice] = useState("")
  const [downPaymentPercentage, setDownPaymentPercentage] = useState("20")
  const [loanTermYears, setLoanTermYears] = useState("15")
  const [interestRate, setInterestRate] = useState("8.5")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [propertySearchOpen, setPropertySearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [downPaymentTerm, setDownPaymentTerm] = useState("24")
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    address: "",
    contactNo: "",
    email: "",
  })

  // Data hooks
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = usePropertyData()
  const { settings, loading: settingsLoading } = useLoanCalculatorSettings()

  // Initialize from URL parameters
  useEffect(() => {
    const propertyId = searchParams?.get("propertyId") || initialPropertyId
    const propertyType = searchParams?.get("propertyType") || initialPropertyType
    const propertyName = searchParams?.get("propertyName")
    const price = searchParams?.get("propertyPrice")
    const lotPrice = searchParams?.get("lotPrice")
    const houseConstructionCost = searchParams?.get("houseConstructionCost")

    if (propertyId && propertyName && price) {
      // Create a property object from URL parameters
      const urlProperty: Property = {
        id: propertyId,
        name: propertyName,
        location: "From Selection",
        price: Number.parseFloat(price) || 0,
        type: (propertyType as "model-house" | "lot-only") || "model-house",
        lotPrice: lotPrice ? Number.parseFloat(lotPrice) || 0 : undefined,
        houseConstructionPrice: houseConstructionCost ? Number.parseFloat(houseConstructionCost) || 0 : undefined,
        developer: "Aman Engineering",
        project: "Parkview Naga Urban Residences",
      }

      setSelectedProperty(urlProperty)
      setPropertyPrice(price)
    } else if (propertyId && properties && !selectedProperty) {
      const property = properties.find((p) => p.id === propertyId)
      if (property) {
        handlePropertySelect(property)
      }
    }
  }, [searchParams, initialPropertyId, initialPropertyType, properties, selectedProperty])

  // Memoized calculations with safe defaults
  const calculation = useMemo(() => {
    const price = Number.parseFloat(propertyPrice) || 0
    const downPayment = Number.parseFloat(downPaymentPercentage) || 20
    const term = Number.parseInt(loanTermYears) || 15
    const rate = Number.parseFloat(interestRate) || 8.5
    const dpTermMonths = Number.parseInt(downPaymentTerm) || 24

    if (price <= 0 || downPayment < 0 || term <= 0 || rate < 0) {
      return null
    }

    const defaultSettings = {
      baseInterestRate: 8.5,
      specialRuleInterestRate: 8.5,
      processingFeePercentage: 1,
      appraisalFee: 5000,
      notarialFeePercentage: 1,
      insuranceFeePercentage: 0.5,
      constructionFeePercentage: 8.5,
      specialRuleEnabled: true,
      financingOptions: [],
      reservationFees: { modelHouse: 25000, lotOnly: 10000, isActive: true },
      governmentFeesConfig: {
        fixedAmountThreshold: 1000000,
        fixedAmount: 205000,
        percentageRate: 20.5,
        isActive: true,
      },
      constructionFeesConfig: { houseConstructionFeeRate: 8.5, lotFeeRate: 8.5, isActive: true },
      specialDownPaymentRules: DEFAULT_SPECIAL_RULES,
      defaultSettings: {
        defaultFinancingOption: "in-house",
        defaultPaymentTerm: 5,
        fixedDownPaymentPercentage: 20,
        fixedDownPaymentTermMonths: 24,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    return calculateLoan({
      propertyPrice: price,
      downPaymentPercentage: downPayment,
      loanTermYears: term,
      interestRate: rate,
      propertyType: selectedProperty?.type || "lot-only",
      lotPrice: selectedProperty?.lotPrice || 0,
      constructionCost: selectedProperty?.houseConstructionPrice || 0,
      downPaymentTermMonths: dpTermMonths,
      settings: settings || defaultSettings,
    })
  }, [propertyPrice, downPaymentPercentage, loanTermYears, interestRate, selectedProperty, settings, downPaymentTerm])

  // Filter properties based on search
  const filteredProperties = useMemo(() => {
    if (!properties) return []
    if (!searchQuery.trim()) return properties

    const query = searchQuery.toLowerCase()
    return properties.filter(
      (property) =>
        property.name.toLowerCase().includes(query) ||
        property.location.toLowerCase().includes(query) ||
        property.type.toLowerCase().includes(query),
    )
  }, [properties, searchQuery])

  // Handle property selection
  const handlePropertySelect = useCallback((property: Property) => {
    setSelectedProperty(property)
    setPropertyPrice(property.price.toString())
    setPropertySearchOpen(false)
    setSearchQuery("")
  }, [])

  // Export to PDF using the utility function
  const handleExportToPDF = useCallback(() => {
    if (!calculation) return

    const monthlyLoanSchedule = generateLoanAmortizationSchedule(
      calculation.loanAmount || 0,
      calculation.interestRate || 8.5,
      calculation.loanTermYears || 15,
      calculation.monthlyPayment || 0,
    )

    const loanDetailsForPdf = {
      propertyPrice: calculation.propertyPrice || 0,
      downPayment: calculation.downPayment || 0,
      loanAmount: calculation.loanAmount || 0,
      interestRate: calculation.interestRate || 8.5,
      monthlyPayment: calculation.monthlyPayment || 0,
      totalPayment: calculation.totalAmount || 0,
      term: calculation.loanTermYears || 15,
    }

    exportToPDFUtil(monthlyLoanSchedule, "monthly", loanDetailsForPdf, selectedProperty?.name)
  }, [calculation, selectedProperty])

  // Export Quotation PDF
  const handleExportQuotationPDF = useCallback(() => {
    if (!calculation || !selectedProperty) return

    const today = new Date()
    const formattedDate = today.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })

    // Determine project details
    const projectName = selectedProperty.project || "Parkview Naga Urban Residences"
    const developer = selectedProperty.developer || "Aman Engineering"

    // Get DHSUD number based on project
    const dhsudNumber = projectName.toLowerCase().includes("palm village") ? "036" : "048"

    // Get logo based on project
    const logoPath = projectName.toLowerCase().includes("palm village")
      ? "/images/projects/parkview-village-logo.png"
      : "/images/projects/parkview-nur-logo.png"

    // Calculate lot area (assuming 120 sqm if not provided)
    const lotArea = 120
    const unitPricePerSqm = (selectedProperty.lotPrice || 0) / lotArea

    const quotationHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>DHSUD LTS NO. ${dhsudNumber} - Quotation for Purchase</title>
      <style>
        @page { 
          size: 8.5in 13in; 
          margin: 0.4in; 
        }
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 0; 
          color: #000; 
          font-size: 8px; 
          line-height: 1.1;
        }
        .header { 
          text-align: center; 
          margin-bottom: 8px; 
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .header-content {
          flex: 1;
        }
        .logo {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }
        .header h1 { 
          font-size: 10px; 
          margin: 1px 0; 
          font-weight: bold;
        }
        .header h2 { 
          font-size: 9px; 
          margin: 1px 0; 
          font-weight: bold;
        }
        .client-info { 
          margin-bottom: 8px; 
        }
        .client-info table {
          width: 100%;
          border-collapse: collapse;
        }
        .client-info td {
          border: 1px solid #000;
          padding: 2px;
          font-size: 7px;
        }
        .section { 
          margin-bottom: 6px; 
        }
        .section-title { 
          font-weight: bold; 
          background-color: #f0f0f0; 
          padding: 2px; 
          margin-bottom: 3px; 
          border: 1px solid #000;
          font-size: 8px;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin-bottom: 4px; 
        }
        th, td { 
          border: 1px solid #000; 
          padding: 1px; 
          text-align: left; 
          font-size: 7px;
        }
        th { 
          background-color: #f0f0f0; 
          font-weight: bold; 
          text-align: center;
        }
        .amount { 
          text-align: right; 
          font-weight: bold;
        }
        .total-row { 
          font-weight: bold; 
          background-color: #f0f0f0; 
        }
        .terms-section { 
          margin-top: 8px; 
        }
        .signature-section { 
          margin-top: 12px; 
        }
        .signature-table { 
          border: none; 
          margin-top: 8px;
        }
        .signature-table td { 
          border: none; 
          text-align: center; 
          padding: 8px 5px; 
          vertical-align: top;
          font-size: 6px;
        }
        .signature-line {
          border-bottom: 1px solid #000;
          height: 15px;
          margin-bottom: 2px;
        }
        .notes { 
          margin-top: 8px; 
          font-size: 6px; 
        }
        .notes ol { 
          padding-left: 10px; 
          margin: 2px 0;
        }
        .notes li {
          margin-bottom: 1px;
        }
        .no-print { 
          display: none; 
        }
        @media print { 
          .no-print { 
            display: none; 
          } 
        }
        .brokerage-info {
          margin-top: 8px;
          font-size: 6px;
        }
        .brokerage-info table {
          border: none;
        }
        .brokerage-info td {
          border: none;
          padding: 1px;
        }
      </style>
    </head>
    <body>
      <div class="no-print" style="margin-bottom: 20px; position: fixed; top: 10px; right: 10px; z-index: 1000;">
        <button onclick="window.print()" style="padding: 8px 16px; background-color: #65932D; color: white; border: none; border-radius: 4px; cursor: pointer; margin-right: 8px; font-size: 12px;">Print/Save as PDF</button>
        <button onclick="window.close()" style="padding: 8px 16px; background-color: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer; font-size: 12px;">Close</button>
      </div>

      <div class="header">
        <img src="${logoPath}" alt="Logo" class="logo" />
        <div class="header-content">
          <h1>DHSUD LTS NO. ${dhsudNumber}</h1>
          <h2>QUOTATION FOR PURCHASE OF LOT</h2>
          <p style="margin: 1px 0; font-size: 7px;">(Effective Jan. 23, 2024)</p>
        </div>
      </div>

      <div class="client-info">
        <table>
          <tr>
            <td style="width: 60%;"><strong>For:</strong> ${customerInfo.name || "________________________________"}</td>
            <td style="width: 40%;"><strong>Date:</strong> ${formattedDate}</td>
          </tr>
          <tr>
            <td colspan="2">
              <strong>Address:</strong> ${customerInfo.address || "________________________________"}<br>
              <strong>Contact No.:</strong> ${customerInfo.contactNo || "_________________"} <strong>Email:</strong> ${customerInfo.email || "_________________"}
            </td>
          </tr>
        </table>
      </div>

      <div class="section">
        <div class="section-title">Lot Information</div>
        <table>
          <tr>
            <th style="width: 25%;">DESCRIPTION</th>
            <th style="width: 12%;">LOT AREA (sq.m.)</th>
            <th style="width: 15%;">Unit Price / sq.m.</th>
            <th style="width: 15%;">LOT Price</th>
            <th style="width: 12%;">Lot Type/Desc</th>
            <th style="width: 8%;">V.A.T.</th>
            <th style="width: 13%;">Transfer Fee</th>
          </tr>
          <tr>
            <td>${selectedProperty.name}</td>
            <td class="amount">${lotArea.toFixed(2)}</td>
            <td class="amount">₱${unitPricePerSqm.toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            <td class="amount">₱${(selectedProperty.lotPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            <td class="amount">Regular Lot</td>
            <td class="amount">9.91%</td>
            <td class="amount">7.02%</td>
          </tr>
          <tr>
            <td colspan="3"><strong>Add: Government Fees and Taxes</strong></td>
            <td class="amount">₱${(calculation.governmentFees || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            <td class="amount">₱${Math.round((selectedProperty.lotPrice || 0) * 0.0991).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            <td class="amount">₱${Math.round((selectedProperty.lotPrice || 0) * 0.0702).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            <td></td>
          </tr>
          <tr class="total-row">
            <td colspan="3"><strong>Total Selling Price - Lot</strong></td>
            <td class="amount">₱${((selectedProperty.lotPrice || 0) + (calculation.governmentFees || 0)).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            <td colspan="3"></td>
          </tr>
        </table>
      </div>

      ${
        selectedProperty.type === "model-house" && selectedProperty.houseConstructionPrice
          ? `
      <div class="section">
        <div class="section-title">House Information</div>
        <table>
          <tr>
            <th style="width: 50%;">DESCRIPTION</th>
            <th style="width: 50%;">HOUSE</th>
          </tr>
          <tr>
            <td>BUILDING Price</td>
            <td class="amount">₱${(selectedProperty.houseConstructionPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>Add: Government Fees and Taxes</td>
            <td class="amount">₱0.00</td>
          </tr>
          <tr class="total-row">
            <td><strong>Total Selling Price - House Construction</strong></td>
            <td class="amount">₱${(selectedProperty.houseConstructionPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>
      `
          : ""
      }

      <div class="section">
        <table>
          <tr class="total-row">
            <td style="width: 70%;"><strong>TOTAL SELLING PRICE</strong></td>
            <td class="amount">₱${(calculation.propertyPrice || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>Less: Discount</td>
            <td class="amount">₱0.00</td>
          </tr>
          <tr>
            <td>Add: Government Fees and Taxes</td>
            <td class="amount">₱${(calculation.governmentFees || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="total-row">
            <td><strong>FINAL CONTRACT PRICE (ALL-IN)</strong></td>
            <td class="amount">₱${((calculation.propertyPrice || 0) + (calculation.governmentFees || 0)).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <div class="terms-section">
        <div class="section-title">TERMS OF PAYMENT:</div>
        <table>
          <tr>
            <td style="width: 70%;"><strong>Spot DOWN PAYMENT (SDP) / RESERVATION FEE</strong></td>
            <td class="amount">₱${(calculation.reservationFee || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td><strong>DOWNPAYMENT (DP) ${calculation.downPaymentPercentage || 20}%</strong></td>
            <td class="amount">₱${(calculation.downPayment || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td><strong>BALANCE DOWNPAYMENT (BDP)</strong></td>
            <td class="amount">₱${((calculation.downPayment || 0) - (calculation.reservationFee || 0)).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>

        <div style="margin: 4px 0;">
          <strong>DP Payable in 2 years - 24 months</strong>
          <table style="margin-top: 2px;">
            <tr>
              <th>Period</th>
              <th>START DATE</th>
              <th>END DATE</th>
              <th>Annual</th>
              <th>Monthly</th>
            </tr>
            <tr>
              <td>Year 1 (No Interest)</td>
              <td>${formattedDate}</td>
              <td>${new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
              <td class="amount">₱${((calculation.downPaymentSchedule?.[0]?.payment || 0) * 12).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
              <td class="amount">₱${(calculation.downPaymentSchedule?.[0]?.payment || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            </tr>
            <tr>
              <td>Year 2 (with 8.5% p.a.)</td>
              <td>${new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
              <td>${new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
              <td class="amount">₱${((calculation.downPaymentSchedule?.[12]?.payment || 0) * 12).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
              <td class="amount">₱${(calculation.downPaymentSchedule?.[12]?.payment || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>

        <div style="margin: 4px 0;">
          <strong>AMORTIZATION (Terms and Interest Rate) - ${100 - (calculation.downPaymentPercentage || 20)}%</strong>
          <div>₱${(calculation.loanAmount || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</div>
          <table style="margin-top: 2px;">
            <tr>
              <th>START DATE</th>
              <th>END DATE</th>
              <th>Terms</th>
              <th>Rate</th>
              <th>Annual</th>
              <th>Monthly</th>
            </tr>
            <tr>
              <td>${new Date(today.getFullYear() + 2, today.getMonth(), today.getDate()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
              <td>${new Date(today.getFullYear() + 2 + (calculation.loanTermYears || 15), today.getMonth(), today.getDate()).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td>
              <td>${calculation.loanTermYears || 15} years</td>
              <td>${(calculation.interestRate || 8.5).toFixed(2)}% p.a.</td>
              <td class="amount">₱${((calculation.monthlyPayment || 0) * 12).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
              <td class="amount">₱${(calculation.monthlyPayment || 0).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
            </tr>
          </table>
        </div>

        <table>
          <tr class="total-row">
            <td style="width: 70%;"><strong>TOTAL DOWNPAYMENT and AMORTIZATION</strong></td>
            <td class="amount">₱${((calculation.propertyPrice || 0) + (calculation.governmentFees || 0)).toLocaleString("en-PH", { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>
      </div>

      <div class="brokerage-info">
        <table>
          <tr>
            <td style="width: 50%;"><strong>Brokerage:</strong> SWEETVILLE REALTY</td>
            <td style="width: 50%;"><strong>Contact No.:</strong> 09192110508</td>
          </tr>
          <tr>
            <td><strong>C.R.B</strong></td>
            <td><strong>Email:</strong> info@amangroup.com</td>
          </tr>
          <tr>
            <td><strong>Licensed Real Estate Broker</strong></td>
            <td></td>
          </tr>
          <tr>
            <td><strong>Sales Manager:</strong> ________________</td>
            <td></td>
          </tr>
          <tr>
            <td><strong>Business Development Assistant for Marketing</strong></td>
            <td></td>
          </tr>
          <tr>
            <td><strong>Sales Officer:</strong> ________________</td>
            <td></td>
          </tr>
        </table>
      </div>

      <div class="signature-section">
        <table class="signature-table">
          <tr>
            <td style="width: 25%;"><strong>SWEETVILLE REALTY</strong></td>
            <td style="width: 25%;"><strong>CUSTOMER</strong></td>
            <td style="width: 25%;"><strong>Prepared by:</strong></td>
            <td style="width: 25%;"><strong>Checked by:</strong></td>
          </tr>
          <tr>
            <td>
              <div class="signature-line"></div>
              <div>________________</div>
              <div>Licensed Real Estate Broker</div>
            </td>
            <td>
              <div class="signature-line"></div>
              <div>________________</div>
              <div>Customer Name</div>
            </td>
            <td>
              <div class="signature-line"></div>
              <div>________________</div>
            </td>
            <td>
              <div class="signature-line"></div>
              <div>Accounting Department</div>
            </td>
          </tr>
        </table>

        <table class="signature-table" style="margin-top: 4px;">
          <tr>
            <td style="width: 50%;"><strong>Noted and Approved by:</strong></td>
            <td style="width: 50%;"></td>
          </tr>
          <tr>
            <td>
              <div class="signature-line"></div>
              <div>Chief Executive Officer</div>
            </td>
            <td></td>
          </tr>
        </table>
      </div>

      <div class="notes">
        <strong>NOTES:</strong>
        <ol>
          <li>RESERVATION FEE is part of the Downpayment, NON-REFUNDABLE and NON-TRANSFERABLE.</li>
          <li>Above Pricing is INCLUSIVE of (O.C.) applicable government transfer fees, taxes & 12% EVAT</li>
          <li>Above LOT PRICING is inclusive of advantage cost in case of SPECIAL LOTS (ie. corner, east, etc.)</li>
          <li>Lot purchase shall be covered with Contract to Sell with AMAN ENGINEERING ENTERPRISES (AEE).</li>
          <li>Building contract quotation shall be covered by Construction Agreement with accredited In-house contractor</li>
          <li>Prices, discounts & interest rates are subject to change without prior notice.</li>
          <li>Any excess payment in government fee and taxes will be refunded.</li>
        </ol>
      </div>
    </body>
    </html>
    `

    const blob = new Blob([quotationHtml], { type: "text/html;charset=UTF-8" })
    const blobUrl = URL.createObjectURL(blob)
    const printWindow = window.open(blobUrl, "_blank")

    if (!printWindow) {
      alert("Please allow popups for this website to export PDF")
      return
    }

    printWindow.addEventListener("load", () => {
      printWindow.focus()
    })

    setTimeout(() => {
      URL.revokeObjectURL(blobUrl)
    }, 100)
  }, [calculation, selectedProperty, customerInfo])

  if (settingsLoading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mr-2" />
          <span>Loading calculator settings...</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-6 w-6" />
          Loan Calculator
        </CardTitle>
        <CardDescription>
          Calculate your monthly payments and total loan costs. Select a property or enter custom values.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Customer Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Customer Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customer-name">Full Name</Label>
              <Input
                id="customer-name"
                placeholder="Enter full name"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-contact">Contact Number</Label>
              <Input
                id="customer-contact"
                placeholder="Enter contact number"
                value={customerInfo.contactNo}
                onChange={(e) => setCustomerInfo({ ...customerInfo, contactNo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-email">Email Address</Label>
              <Input
                id="customer-email"
                type="email"
                placeholder="Enter email address"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customer-address">Complete Address</Label>
              <Input
                id="customer-address"
                placeholder="Enter complete address"
                value={customerInfo.address}
                onChange={(e) => setCustomerInfo({ ...customerInfo, address: e.target.value })}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Property Selection */}
        <div className="space-y-2">
          <Label htmlFor="property-search">Select Property (Optional)</Label>
          <Popover open={propertySearchOpen} onOpenChange={setPropertySearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={propertySearchOpen}
                className="w-full justify-between bg-transparent"
                disabled={propertiesLoading}
              >
                {propertiesLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading properties...
                  </span>
                ) : selectedProperty ? (
                  <span className="flex items-center gap-2">
                    <span className="font-medium">{selectedProperty.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {selectedProperty.type.replace("-", " ")}
                    </Badge>
                    <span className="text-muted-foreground">- {formatCurrency(selectedProperty.price || 0)}</span>
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Search properties...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search properties..." value={searchQuery} onValueChange={setSearchQuery} />
                <CommandList>
                  {propertiesLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm text-muted-foreground">Loading properties...</span>
                    </div>
                  ) : propertiesError ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-2">
                      <AlertCircle className="h-4 w-4 text-destructive" />
                      <span className="text-sm text-muted-foreground">Failed to load properties</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refetchProperties}
                        className="flex items-center gap-1 bg-transparent"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Retry
                      </Button>
                    </div>
                  ) : filteredProperties.length === 0 ? (
                    <CommandEmpty>
                      {searchQuery ? "No properties found matching your search." : "No properties available."}
                    </CommandEmpty>
                  ) : (
                    <CommandGroup>
                      {filteredProperties.map((property) => (
                        <CommandItem
                          key={property.id}
                          value={property.id}
                          onSelect={() => handlePropertySelect(property)}
                          className="cursor-pointer"
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedProperty?.id === property.id ? "opacity-100" : "opacity-0",
                            )}
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{property.name}</span>
                              <Badge variant="outline" className="text-xs">
                                {property.type.replace("-", " ")}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {property.location} • {formatCurrency(property.price || 0)}
                            </div>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          {selectedProperty && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedProperty(null)
                setPropertyPrice("")
              }}
              className="text-muted-foreground hover:text-foreground"
            >
              Clear selection
            </Button>
          )}
        </div>

        <Separator />

        {/* Input Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="property-price">Property Price (₱)</Label>
            <Input
              id="property-price"
              type="number"
              placeholder="Enter property price"
              value={propertyPrice}
              onChange={(e) => setPropertyPrice(e.target.value)}
              min="0"
              step="1000"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="down-payment">Down Payment (%)</Label>
            <Select value={downPaymentPercentage} onValueChange={setDownPaymentPercentage}>
              <SelectTrigger>
                <SelectValue placeholder="Select down payment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
                <SelectItem value="20">20%</SelectItem>
                <SelectItem value="25">25%</SelectItem>
                <SelectItem value="30">30%</SelectItem>
                <SelectItem value="35">35%</SelectItem>
                <SelectItem value="40">40%</SelectItem>
                <SelectItem value="50">50%</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="loan-term">Loan Term (Years)</Label>
            <Select value={loanTermYears} onValueChange={setLoanTermYears}>
              <SelectTrigger>
                <SelectValue placeholder="Select loan term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 years</SelectItem>
                <SelectItem value="10">10 years</SelectItem>
                <SelectItem value="15">15 years</SelectItem>
                <SelectItem value="20">20 years</SelectItem>
                <SelectItem value="25">25 years</SelectItem>
                <SelectItem value="30">30 years</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="interest-rate">Interest Rate (% per annum)</Label>
            <Input
              id="interest-rate"
              type="number"
              placeholder="Enter interest rate"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              min="0"
              max="30"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="down-payment-term">Down Payment Term</Label>
            <Select value={downPaymentTerm} onValueChange={setDownPaymentTerm}>
              <SelectTrigger>
                <SelectValue placeholder="Select down payment term" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">1 Year (12 Months)</SelectItem>
                <SelectItem value="24">2 Years (24 Months)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Results */}
        {calculation && (
          <div className="space-y-6">
            <Separator />

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="down-payment-schedule">Down Payment Schedule</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(calculation.monthlyPayment || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Loan Payment</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculation.downPaymentSchedule?.[0]?.payment || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Downpayment (1st Year)</p>
                    </CardContent>
                  </Card>
                  {selectedProperty?.houseConstructionPrice && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">
                          {formatCurrency(selectedProperty.houseConstructionPrice || 0)}
                        </div>
                        <p className="text-sm text-muted-foreground">House Construction Cost</p>
                      </CardContent>
                    </Card>
                  )}
                  {selectedProperty?.lotPrice && (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="text-2xl font-bold">{formatCurrency(selectedProperty.lotPrice || 0)}</div>
                        <p className="text-sm text-muted-foreground">Lot Cost</p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Property Price:</span>
                      <span className="font-medium">{formatCurrency(calculation.propertyPrice || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment ({calculation.downPaymentPercentage || 20}%):</span>
                      <span className="font-medium">{formatCurrency(calculation.downPayment || 0)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.loanAmount || 0)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Interest Rate (Loan):</span>
                      <span className="font-medium">{calculation.interestRate || 8.5}% per annum</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Term:</span>
                      <span className="font-medium">{calculation.loanTermYears || 15} years</span>
                    </div>
                    {selectedProperty?.houseConstructionPrice && (
                      <div className="flex justify-between">
                        <span>House Construction Cost:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedProperty.houseConstructionPrice || 0)}
                        </span>
                      </div>
                    )}
                    {selectedProperty?.lotPrice && (
                      <div className="flex justify-between">
                        <span>Lot Cost:</span>
                        <span className="font-medium">{formatCurrency(selectedProperty.lotPrice || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Monthly Downpayment (1st Year):</span>
                      <span className="font-medium">
                        {formatCurrency(calculation.downPaymentSchedule?.[0]?.payment || 0)}
                      </span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="down-payment-schedule" className="space-y-4">
                <h4 className="font-semibold">Down Payment Installment Schedule</h4>
                {calculation.downPaymentSchedule && calculation.downPaymentSchedule.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                      <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                        <tr>
                          <th scope="col" className="px-6 py-3">
                            Month
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Payment
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Interest Rate
                          </th>
                          <th scope="col" className="px-6 py-3">
                            Balance
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {calculation.downPaymentSchedule.map((item, index) => (
                          <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700">
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                              {item.month || index + 1}
                            </td>
                            <td className="px-6 py-4">{formatCurrency(item.payment || 0)}</td>
                            <td className="px-6 py-4">{item.interestRate || 0}%</td>
                            <td className="px-6 py-4">{formatCurrency(item.balance || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-4">
                    Down payment schedule not available or not applicable.
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-2">
                  Note: The first 12 months of the down payment schedule are calculated at 0% interest, as per the
                  special rule.
                </p>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button onClick={handleExportToPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export Amortization PDF
              </Button>
              <Button
                onClick={handleExportQuotationPDF}
                className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white"
              >
                <FileText className="h-4 w-4" />
                Export Final Quotation
              </Button>
            </div>
          </div>
        )}

        <LoanCalculatorNote />
      </CardContent>
    </Card>
  )
}
