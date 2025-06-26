"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Calculator, FileDown, FileText, Home, Loader2, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { formatCurrency } from "@/lib/utils"
import type {
  FinancingOption,
  PaymentTerm,
  DownPaymentTerm,
  LoanCalculationResult,
  PropertyType,
} from "@/types/loan-calculator"
import { calculateCompleteLoanDetails, generateLoanAmortizationSchedule } from "@/lib/loan-calculations"
// Add the import for the PDF export utility
import { exportToPDF } from "@/components/pdf-export-utils"

// Add useRouter and usePathname imports at the top of the file
import { useRouter, usePathname } from "next/navigation"

// Add this after the imports
import { motion } from "framer-motion"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"

// Helper function to format number with commas
const formatNumberWithCommas = (value: number | undefined): string => {
  if (value === undefined || isNaN(value)) return "0"
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

const formSchema = z.object({
  basePrice: z.number().min(1),
  propertyType: z.enum(["model-house", "lot-only"]),
  downPayment: z.number().min(1),
  downPaymentTerm: z.number().int().min(1).max(36),
  financingOption: z.enum(["in-house", "in-house-bridge", "pag-ibig", "bank"]),
  paymentTerm: z.number().int().min(5).max(30),
})

interface LoanCalculatorFormProps {
  initialPrice?: number
  returnUrl?: string
  modelName?: string
  propertyType?: PropertyType
}

export function LoanCalculatorForm({
  initialPrice,
  returnUrl = "/model-houses",
  modelName,
  propertyType = "model-house",
}: LoanCalculatorFormProps) {
  const [result, setResult] = useState<LoanCalculationResult | null>(null)
  const [scheduleView, setScheduleView] = useState<"monthly" | "yearly">(() => {
    // Check if we're in the browser environment
    if (typeof window !== "undefined") {
      // Try to get the saved preference from localStorage
      const savedView = localStorage.getItem("amortizationScheduleView")
      // Return saved preference if valid, otherwise default to monthly
      return savedView === "yearly" || savedView === "monthly" ? savedView : "monthly"
    }
    // Default to monthly on server-side rendering
    return "monthly"
  })
  const [downPaymentPercentage, setDownPaymentPercentage] = useState<number>(20)
  const [isExporting, setIsExporting] = useState(false)
  // Replace with:
  const { settings: calculatorSettings, loading: settingsLoading } = useLoanCalculatorSettings()

  const loanSummaryRef = useRef<HTMLDivElement>(null)

  // Load calculator settings on component mount
  // Remove the existing useEffect for loading settings
  // useEffect(() => {
  //   const loadSettings = async () => {
  //     const savedSettings = await loadLoanCalculatorSettings()
  //     if (savedSettings) {
  //       setCalculatorSettings({ ...getDefaultLoanCalculatorSettings(), ...savedSettings })
  //     }
  //   }
  //   loadSettings()
  // }, [])

  // Function to scroll to loan summary on mobile
  const scrollToLoanSummary = () => {
    if (window.innerWidth < 768 && loanSummaryRef.current) {
      loanSummaryRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Default property price (changed from decimal to integer)
  const defaultPrice = 4707475

  // Use the initial price from the model house if available
  const basePrice = initialPrice || defaultPrice

  // Calculate default down payment (20%)
  const defaultDownPayment = basePrice * 0.2

  // Helper function to format number to two decimal places
  const formatToTwoDecimals = (value: number): number => {
    return Math.round(value * 100) / 100
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basePrice: basePrice,
      propertyType: propertyType,
      downPayment: Math.round(basePrice * (downPaymentPercentage / 100)),
      downPaymentTerm: 12,
      financingOption: "in-house",
      paymentTerm: 5,
    },
  })

  // Update down payment when property price or percentage changes
  useEffect(() => {
    const currentPrice = form.getValues("basePrice")
    if (currentPrice && !isNaN(currentPrice)) {
      const newDownPayment = Math.round(currentPrice * (downPaymentPercentage / 100))
      form.setValue("downPayment", newDownPayment)

      // Add a small delay to trigger animation after value change
      setTimeout(() => {
        const downPaymentInput = document.getElementById("downPayment")
        if (downPaymentInput) {
          downPaymentInput.classList.add("animate-highlight")
          setTimeout(() => {
            downPaymentInput.classList.remove("animate-highlight")
          }, 1000)
        }
      }, 10)
    }
  }, [form, downPaymentPercentage])

  const router = useRouter()
  const pathname = usePathname()

  // Reset form values when navigating directly from navbar
  useEffect(() => {
    // Check if we're on the loan calculator page directly (not via model house)
    if (pathname === "/loan-calculator" && !initialPrice) {
      // Reset to default values with integer values
      form.reset({
        basePrice: defaultPrice,
        propertyType: "model-house",
        downPayment: Math.round(defaultPrice * 0.2),
        downPaymentTerm: 12,
        financingOption: "in-house",
        paymentTerm: 5,
      })
      // Clear any previous calculation results
      setResult(null)
    }
  }, [pathname, initialPrice, defaultPrice, form])

  useEffect(() => {
    // Save the current view preference to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("amortizationScheduleView", scheduleView)
    }
  }, [scheduleView])

  function onSubmit(values: z.infer<typeof formSchema>) {
    const calculation = calculateCompleteLoanDetails(
      values.basePrice,
      values.propertyType,
      values.downPayment,
      values.downPaymentTerm as DownPaymentTerm,
      values.financingOption as FinancingOption,
      values.paymentTerm as PaymentTerm,
      calculatorSettings.reservationFees,
      calculatorSettings.governmentFeesConfig,
    )

    setResult(calculation)
    setTimeout(() => scrollToLoanSummary(), 100)
  }

  // Generate amortization schedule
  const generateAmortizationSchedule = () => {
    if (!result) return []

    return generateLoanAmortizationSchedule(
      result.loanAmortization.loanAmount,
      result.loanAmortization.interestRate,
      form.getValues("paymentTerm"),
      result.loanAmortization.monthlyPayment,
    )
  }

  // Generate yearly amortization schedule
  const generateYearlyAmortizationSchedule = () => {
    if (!result) return []

    const monthlySchedule = generateAmortizationSchedule()
    return generateYearlyAmortizationSchedule(monthlySchedule, form.getValues("paymentTerm"))
  }

  // Update the handleExport function to include modelName in both CSV and PDF exports
  const handleExport = async (format: "csv" | "pdf") => {
    if (!result) return

    try {
      setIsExporting(true)
      const scheduleData =
        scheduleView === "monthly" ? generateAmortizationSchedule() : generateYearlyAmortizationSchedule()

      if (format === "csv") {
        // Create CSV content
        let csvContent = "data:text/csv;charset=utf-8,"

        // Add property name if available
        if (modelName) {
          csvContent += `Property: ${modelName}\n\n`
        }

        // Add headers
        csvContent += `${scheduleView === "monthly" ? "Month" : "Year"},Principal,Interest,Payment,Balance\n`

        // Add data rows
        scheduleData.forEach((row) => {
          const rowData = [
            scheduleView === "monthly" ? row.month : row.year,
            row.principal.toFixed(2),
            row.interest.toFixed(2),
            row.payment.toFixed(2),
            row.balance.toFixed(2),
          ]
          csvContent += rowData.join(",") + "\n"
        })

        // Create download link
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute(
          "download",
          modelName
            ? `amortization_schedule_${modelName.replace(/\s+/g, "_")}_${scheduleView}.csv`
            : `amortization_schedule_${scheduleView}.csv`,
        )
        document.body.appendChild(link)

        // Trigger download
        link.click()

        // Clean up
        document.body.removeChild(link)
      } else if (format === "pdf") {
        // Direct download PDF
        exportToPDF(
          scheduleData,
          scheduleView,
          {
            propertyPrice: result.propertyBreakdown.totalAllInPrice,
            downPayment: form.getValues("downPayment"),
            loanAmount: result.loanAmortization.loanAmount,
            interestRate: result.loanAmortization.interestRate,
            monthlyPayment: result.loanAmortization.monthlyPayment,
            totalPayment: result.loanAmortization.totalPayment,
            term: form.getValues("paymentTerm"),
          },
          modelName,
        )
      }
    } catch (error) {
      console.error("Error exporting:", error)
    } finally {
      setIsExporting(false)
    }
  }

  // Add this function after the handleExport function to create a mobile-friendly view
  const renderMobileTable = () => {
    if (!result) return null

    return (
      <div className="md:hidden space-y-2">
        {schedule.map((row) => (
          <div key={scheduleView === "monthly" ? row.month : row.year} className="border rounded-md p-3 text-sm">
            <div className="flex justify-between border-b pb-2 mb-2">
              <span className="font-medium">
                {scheduleView === "monthly" ? `Month ${row.month}` : `Year ${row.year}`}
              </span>
              <span className="font-medium">Balance: {formatCurrency(row.balance)}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Principal</div>
                <div>{formatCurrency(row.principal)}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Payment</div>
                <div>{formatCurrency(row.payment)}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  const schedule = result
    ? scheduleView === "monthly"
      ? generateAmortizationSchedule()
      : generateYearlyAmortizationSchedule()
    : []

  // Add loading state to the form if needed
  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading calculator settings...</span>
      </div>
    )
  }

  return (
    <>
      {/* Breadcrumb and Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div className="flex items-center text-sm">
          <Link href="/" className="text-muted-foreground hover:text-primary">
            <Home className="h-4 w-4 inline mr-1" />
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <Link href={returnUrl} className="text-muted-foreground hover:text-primary">
            {propertyType === "model-house" ? "Model Houses" : "Lot Only"}
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium">Loan Calculator</span>
        </div>

        <Link href={returnUrl}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {propertyType === "model-house" ? "Model Houses" : "Lot Only"}
          </Button>
        </Link>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold flex items-center mb-2">
          <Calculator className="mr-3 h-8 w-8 text-primary" />
          {modelName ? `Loan Calculator - ${modelName}` : "Loan Calculator"}
        </h1>
        <p className="text-muted-foreground">
          {modelName
            ? `Calculate monthly payments and loan details for ${modelName}.`
            : "Calculate your monthly amortization based on different financing options."}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Tabs defaultValue="calculator" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mobile-tabs">
              <TabsTrigger value="calculator" className="text-xs md:text-sm">
                Calculator
              </TabsTrigger>
              <TabsTrigger value="breakdown" className="text-xs md:text-sm">
                Breakdown
              </TabsTrigger>
              <TabsTrigger value="down-payment" className="text-xs md:text-sm">
                Down Payment
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs md:text-sm">
                Loan Schedule
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calculator" className="space-y-6 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Loan Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Base Property Price</Label>
                        <Input
                          id="basePrice"
                          type="text"
                          disabled={!!initialPrice}
                          value={formatNumberWithCommas(form.getValues("basePrice") || 0)}
                          onChange={(e) => {
                            // Remove commas and convert to number
                            const rawValue = e.target.value.replace(/,/g, "")
                            const value = rawValue ? Number(rawValue) : 0

                            if (!isNaN(value)) {
                              form.setValue("basePrice", value)
                              // Update down payment based on percentage
                              const newDownPayment = Math.round(value * (downPaymentPercentage / 100))
                              form.setValue("downPayment", newDownPayment)
                            }
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select
                          onValueChange={(value) => form.setValue("propertyType", value as PropertyType)}
                          defaultValue={form.getValues("propertyType")}
                          disabled={!!propertyType}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select property type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="model-house">Model House</SelectItem>
                            <SelectItem value="lot-only">Lot Only</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label htmlFor="downPayment">Down Payment</Label>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor="downPaymentPercentage" className="text-xs text-muted-foreground">
                              Percentage:
                            </Label>
                            <Select
                              value={downPaymentPercentage.toString()}
                              onValueChange={(value) => {
                                setDownPaymentPercentage(Number(value))
                                // Immediately update the down payment value
                                const currentPrice = form.getValues("basePrice")
                                if (currentPrice && !isNaN(currentPrice)) {
                                  const newDownPayment = Math.round(currentPrice * (Number(value) / 100))
                                  form.setValue("downPayment", newDownPayment)
                                }
                              }}
                            >
                              <SelectTrigger className="h-7 w-[80px]">
                                <SelectValue placeholder="%" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="5">5%</SelectItem>
                                <SelectItem value="10">10%</SelectItem>
                                <SelectItem value="15">15%</SelectItem>
                                <SelectItem value="20">20%</SelectItem>
                                <SelectItem value="25">25%</SelectItem>
                                <SelectItem value="30">30%</SelectItem>
                                <SelectItem value="35">35%</SelectItem>
                                <SelectItem value="40">40%</SelectItem>
                                <SelectItem value="45">45%</SelectItem>
                                <SelectItem value="50">50%</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <motion.div
                          initial={{ backgroundColor: "transparent" }}
                          animate={{ backgroundColor: ["transparent", "rgba(101, 147, 45, 0.1)", "transparent"] }}
                          transition={{ duration: 1, ease: "easeInOut" }}
                          key={downPaymentPercentage} // This will trigger animation when percentage changes
                        >
                          <Input
                            id="downPayment"
                            type="text"
                            disabled={!!initialPrice}
                            value={formatNumberWithCommas(form.getValues("downPayment") || 0)}
                            onChange={(e) => {
                              // Remove commas and convert to number
                              const rawValue = e.target.value.replace(/,/g, "")
                              const value = rawValue ? Number(rawValue) : 0

                              if (!isNaN(value)) {
                                form.setValue("downPayment", value)

                                // Update percentage if property price is not zero
                                const propertyPrice = form.getValues("basePrice")
                                if (propertyPrice > 0) {
                                  const calculatedPercentage = Math.round((value / propertyPrice) * 100)
                                  // Only update if it's a valid percentage
                                  if (calculatedPercentage >= 0 && calculatedPercentage <= 100) {
                                    setDownPaymentPercentage(calculatedPercentage)
                                  }
                                }
                              }
                            }}
                            className="transition-all duration-300"
                          />
                        </motion.div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="downPaymentTerm">Down Payment Terms</Label>
                        <Select
                          onValueChange={(value) => form.setValue("downPaymentTerm", Number.parseInt(value))}
                          defaultValue={form.getValues("downPaymentTerm").toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select down payment term" />
                          </SelectTrigger>
                          <SelectContent>
                            {calculatorSettings.downPaymentTerms
                              .filter((term) => term.isActive)
                              .map((term) => {
                                const is20PercentRule =
                                  Math.abs(downPaymentPercentage - 20) < 0.1 &&
                                  calculatorSettings.specialDownPaymentRules?.twentyPercentRule.isActive &&
                                  calculatorSettings.specialDownPaymentRules.twentyPercentRule.applicableTerms.includes(
                                    term.value,
                                  )

                                return (
                                  <SelectItem key={term.id} value={term.value.toString()}>
                                    <div className="flex flex-col">
                                      <span>{term.name}</span>
                                      {is20PercentRule ? (
                                        <span className="text-xs text-green-600">Year 1: 0% • Year 2+: 8.5%</span>
                                      ) : term.interestRate > 0 ? (
                                        <span className="text-xs text-muted-foreground">
                                          {term.interestRate}% interest
                                        </span>
                                      ) : (
                                        <span className="text-xs text-muted-foreground">No interest</span>
                                      )}
                                    </div>
                                  </SelectItem>
                                )
                              })}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="financingOption">Financing Option</Label>
                        <Select
                          onValueChange={(value) => form.setValue("financingOption", value as FinancingOption)}
                          defaultValue={form.getValues("financingOption")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select financing option" />
                          </SelectTrigger>
                          <SelectContent>
                            {calculatorSettings.financingOptions
                              .filter((option) => option.isActive)
                              .map((option) => (
                                <SelectItem key={option.id} value={option.value}>
                                  {option.name}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="paymentTerm">Payment Term (Years)</Label>
                        <Select
                          onValueChange={(value) => form.setValue("paymentTerm", Number.parseInt(value))}
                          defaultValue={form.getValues("paymentTerm").toString()}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment term" />
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
                    </div>

                    <Button type="submit" className="w-full">
                      Calculate
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    Property Price Breakdown
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Please calculate your loan first to view the price breakdown.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid gap-4">
                        <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                          <span className="font-medium">Base Property Price</span>
                          <span className="font-semibold">{formatCurrency(result.propertyBreakdown.basePrice)}</span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Reservation Fee</span>
                            <Badge variant="outline" className="text-xs">
                              {result.propertyBreakdown.propertyType === "model-house" ? "Model House" : "Lot Only"}
                            </Badge>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(result.propertyBreakdown.reservationFee)}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">Government Fees & Taxes</span>
                            <Badge variant="outline" className="text-xs">
                              {result.propertyBreakdown.basePrice >= 1000000 ? "Fixed ₱205K" : "20.5%"}
                            </Badge>
                          </div>
                          <span className="font-semibold">
                            {formatCurrency(result.propertyBreakdown.governmentFeesAndTaxes)}
                          </span>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center p-4 bg-primary/10 rounded-lg">
                            <span className="text-lg font-bold">Total All-In Price</span>
                            <span className="text-lg font-bold text-primary">
                              {formatCurrency(result.propertyBreakdown.totalAllInPrice)}
                            </span>
                          </div>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                          <h4 className="font-medium mb-2">Fee Breakdown Details:</h4>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>
                              • <strong>Reservation Fee:</strong>{" "}
                              {result.propertyBreakdown.propertyType === "model-house" ? "₱25,000" : "₱10,000"} for{" "}
                              {result.propertyBreakdown.propertyType === "model-house"
                                ? "model houses"
                                : "lot only properties"}
                            </p>
                            <p>
                              • <strong>Government Fees:</strong>{" "}
                              {result.propertyBreakdown.basePrice >= 1000000
                                ? "Fixed ₱205,000 for properties ≥ ₱1M"
                                : "20.5% of base price for properties < ₱1M"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="down-payment" className="space-y-4 py-4">
              <Card>
                <CardHeader>
                  <CardTitle>Down Payment Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Please calculate your loan first to view the down payment schedule.
                    </div>
                  ) : (
                    <>
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Total Down Payment:</span>
                            <div className="font-semibold">{formatCurrency(result.totalDownPayment)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <div className="font-semibold">{formatCurrency(result.downPaymentMonthlyAmount)}</div>
                          </div>
                        </div>
                      </div>

                      {result.specialRuleApplied && (
                        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default" className="bg-green-600">
                              20% Special Rate
                            </Badge>
                            <span className="text-sm font-medium text-green-800">Applied</span>
                          </div>
                          <div className="text-sm text-green-700">
                            <p>• First 12 months: 0% interest</p>
                            <p>• Months 13+: 8.5% interest per annum</p>
                          </div>
                        </div>
                      )}

                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto">
                        <div className="rounded-md border min-w-full">
                          <div className="grid grid-cols-5 bg-muted p-3 text-sm font-medium">
                            <div>Month</div>
                            <div>Payment</div>
                            <div>Interest Rate</div>
                            <div>Cumulative Paid</div>
                            <div>Balance</div>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto">
                            {result.downPaymentSchedule.map((row) => (
                              <div key={row.month} className="grid grid-cols-5 border-t p-3 text-sm">
                                <div>{row.month}</div>
                                <div>{formatCurrency(row.payment)}</div>
                                <div
                                  className={
                                    row.isFirstYear && result.specialRuleApplied ? "text-green-600 font-medium" : ""
                                  }
                                >
                                  {row.interestRate}%
                                </div>
                                <div>{formatCurrency(row.cumulativePaid)}</div>
                                <div>{formatCurrency(row.balance)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mobile view */}
                      <div className="md:hidden space-y-2">
                        {result.downPaymentSchedule.map((row) => (
                          <div key={row.month} className="border rounded-md p-3 text-sm">
                            <div className="flex justify-between border-b pb-2 mb-2">
                              <span className="font-medium">Month {row.month}</span>
                              <span className="font-medium">Balance: {formatCurrency(row.balance)}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <div className="text-xs text-muted-foreground">Payment</div>
                                <div>{formatCurrency(row.payment)}</div>
                              </div>
                              <div>
                                <div className="text-xs text-muted-foreground">Cumulative</div>
                                <div>{formatCurrency(row.cumulativePaid)}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4 py-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle>Amortization Schedule</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Select
                      value={scheduleView}
                      onValueChange={(value) => setScheduleView(value as "monthly" | "yearly")}
                    >
                      <SelectTrigger className="h-8 w-[110px]">
                        <SelectValue placeholder="View" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yearly">Yearly View</SelectItem>
                        <SelectItem value="monthly">Monthly View</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardHeader>
                <CardContent>
                  {!result ? (
                    <div className="text-center py-8 text-muted-foreground">
                      Please calculate your loan first to view the amortization schedule.
                    </div>
                  ) : (
                    <>
                      {/* Export buttons - Responsive design */}
                      <div className="flex flex-wrap justify-end gap-2 mb-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!result || isExporting}
                          onClick={() => handleExport("csv")}
                          className="flex-1 sm:flex-none"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          <span>Export CSV</span>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!result || isExporting}
                          onClick={() => handleExport("pdf")}
                          className="flex-1 sm:flex-none"
                        >
                          {isExporting ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              <span>Saving...</span>
                            </>
                          ) : (
                            <>
                              <FileDown className="h-4 w-4 mr-2" />
                              <span>Save PDF</span>
                            </>
                          )}
                        </Button>
                      </div>

                      {/* Desktop view */}
                      <div className="hidden md:block overflow-x-auto">
                        <div className="rounded-md border min-w-full">
                          <div className="grid grid-cols-4 bg-muted p-3 text-sm font-medium">
                            <div>{scheduleView === "monthly" ? "Month" : "Year"}</div>
                            <div>Principal</div>
                            <div>Payment</div>
                            <div>Balance</div>
                          </div>
                          <div className="max-h-[400px] overflow-y-auto">
                            {schedule.map((row) => (
                              <div
                                key={scheduleView === "monthly" ? row.month : row.year}
                                className="grid grid-cols-4 border-t p-3 text-sm"
                              >
                                <div>{scheduleView === "monthly" ? row.month : row.year}</div>
                                <div>{formatCurrency(row.principal)}</div>
                                <div>{formatCurrency(row.payment)}</div>
                                <div>{formatCurrency(row.balance)}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Mobile view */}
                      {renderMobileTable()}
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="md:col-span-1">
          <Card ref={loanSummaryRef}>
            <CardHeader className="pb-2">
              <CardTitle>Loan Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {!result ? (
                <div className="text-center py-8 text-muted-foreground">
                  Please calculate your loan to view the summary.
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Total All-In Price</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.propertyBreakdown.totalAllInPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment Amount</p>
                    <p className="text-xl font-semibold">{formatCurrency(form.getValues("downPayment"))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment Monthly</p>
                    <p className="text-xl font-semibold text-blue-600">
                      {formatCurrency(result.downPaymentMonthlyAmount)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Net Loan Amount</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.netLoanAmount)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Loan Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary">
                      {formatCurrency(result.loanAmortization.monthlyPayment)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Project Cost</p>
                    <p className="text-xl font-semibold text-red-600">{formatCurrency(result.totalProjectCost)}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  )
}
