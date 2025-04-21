"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Calculator, FileDown, FileText, Home, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatCurrency } from "@/lib/utils"
import { calculateMonthlyAmortization, getInterestRate } from "@/lib/loan-calculations"
import type { AmortizationResult, FinancingOption, PaymentTerm } from "@/types/loan-calculator"
// Add the import for the PDF export utility
import { exportToPDF } from "@/components/pdf-export-utils"

// Add useRouter and usePathname imports at the top of the file
import { useRouter, usePathname } from "next/navigation"

// Add this after the imports
import { motion } from "framer-motion"

// Helper function to format number with commas
const formatNumberWithCommas = (value: number | undefined): string => {
  if (value === undefined || isNaN(value)) return "0"
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

const formSchema = z.object({
  propertyPrice: z.number().min(1),
  downPayment: z.number().min(1),
  financingOption: z.enum(["in-house", "in-house-bridge", "pag-ibig", "bank"]),
  paymentTerm: z.number().int().min(5).max(30),
})

interface LoanCalculatorFormProps {
  initialPrice?: number
  returnUrl?: string
  modelName?: string
}

export function LoanCalculatorForm({ initialPrice, returnUrl = "/model-houses", modelName }: LoanCalculatorFormProps) {
  const [result, setResult] = useState<AmortizationResult | null>(null)
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

  const loanSummaryRef = useRef<HTMLDivElement>(null)

  // Function to scroll to loan summary on mobile
  const scrollToLoanSummary = () => {
    if (window.innerWidth < 768 && loanSummaryRef.current) {
      loanSummaryRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Default property price (changed from decimal to integer)
  const defaultPrice = 4707475

  // Use the initial price from the model house if available
  const propertyPrice = initialPrice || defaultPrice

  // Calculate default down payment (20%)
  const defaultDownPayment = propertyPrice * 0.2

  // Helper function to format number to two decimal places
  const formatToTwoDecimals = (value: number): number => {
    return Math.round(value * 100) / 100
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyPrice: propertyPrice,
      downPayment: Math.round(propertyPrice * (downPaymentPercentage / 100)),
      financingOption: "in-house",
      paymentTerm: 5,
    },
  })

  // Update down payment when property price or percentage changes
  useEffect(() => {
    const currentPrice = form.getValues("propertyPrice")
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

  // Add this code after the form initialization
  const router = useRouter()
  const pathname = usePathname()

  // Reset form values when navigating directly from navbar
  useEffect(() => {
    // Check if we're on the loan calculator page directly (not via model house)
    if (pathname === "/loan-calculator" && !initialPrice) {
      // Reset to default values with integer values
      form.reset({
        propertyPrice: defaultPrice,
        downPayment: Math.round(defaultPrice * 0.2),
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
    const loanAmount = values.propertyPrice - values.downPayment
    const interestRate = getInterestRate(values.financingOption as FinancingOption, values.paymentTerm as PaymentTerm)

    const calculation = calculateMonthlyAmortization(loanAmount, interestRate, values.paymentTerm)

    setResult(calculation)

    // Scroll to loan summary on mobile after calculation
    setTimeout(() => scrollToLoanSummary(), 100)
  }

  // Generate amortization schedule
  const generateAmortizationSchedule = () => {
    if (!result) return []

    const { loanAmount, interestRate } = result
    const monthlyInterestRate = interestRate / 100 / 12
    const numberOfPayments = form.getValues("paymentTerm") * 12

    let balance = loanAmount
    const schedule = []

    for (let month = 1; month <= numberOfPayments; month++) {
      const interestPayment = balance * monthlyInterestRate
      const principalPayment = result.monthlyPayment - interestPayment
      balance -= principalPayment

      schedule.push({
        month,
        date: new Date(Date.now() + month * 30 * 24 * 60 * 60 * 1000),
        principal: principalPayment,
        interest: interestPayment,
        payment: result.monthlyPayment,
        balance: Math.max(0, balance),
      })
    }

    return schedule
  }

  // Generate yearly amortization schedule
  const generateYearlyAmortizationSchedule = () => {
    if (!result) return []

    const monthlySchedule = generateAmortizationSchedule()
    const yearlySchedule = []

    for (let year = 1; year <= form.getValues("paymentTerm"); year++) {
      const yearStart = (year - 1) * 12
      const yearEnd = year * 12
      const yearMonths = monthlySchedule.slice(yearStart, yearEnd)

      // Skip if there are no months in this year
      if (yearMonths.length === 0) continue

      const totalPrincipal = yearMonths.reduce((sum, month) => sum + month.principal, 0)
      const totalInterest = yearMonths.reduce((sum, month) => sum + month.interest, 0)
      const totalPayment = yearMonths.reduce((sum, month) => sum + month.payment, 0)
      const balance = yearMonths[yearMonths.length - 1]?.balance || 0

      yearlySchedule.push({
        year,
        principal: totalPrincipal,
        interest: totalInterest,
        payment: totalPayment,
        balance,
      })
    }

    return yearlySchedule
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
            propertyPrice: form.getValues("propertyPrice"),
            downPayment: form.getValues("downPayment"),
            loanAmount: result.loanAmount,
            interestRate: result.interestRate,
            monthlyPayment: result.monthlyPayment,
            totalPayment: result.totalPayment,
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
            Model Houses
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="font-medium">Loan Calculator</span>
        </div>

        <Link href={returnUrl}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Model Houses
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
            <TabsList className="grid w-full grid-cols-2 mobile-tabs">
              <TabsTrigger value="calculator" className="text-xs md:text-sm">
                Calculator
              </TabsTrigger>
              <TabsTrigger value="schedule" className="text-xs md:text-sm">
                Amortization Schedule
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
                        <Label htmlFor="propertyPrice">Property Price</Label>
                        <Input
                          id="propertyPrice"
                          type="text"
                          disabled={!!initialPrice}
                          value={formatNumberWithCommas(form.getValues("propertyPrice"))}
                          onChange={(e) => {
                            // Remove commas and convert to number
                            const rawValue = e.target.value.replace(/,/g, "")
                            const value = rawValue ? Number(rawValue) : 0

                            if (!isNaN(value)) {
                              form.setValue("propertyPrice", value)
                              // Update down payment based on percentage
                              const newDownPayment = Math.round(value * (downPaymentPercentage / 100))
                              form.setValue("downPayment", newDownPayment)
                            }
                          }}
                        />
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
                                const currentPrice = form.getValues("propertyPrice")
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
                            value={formatNumberWithCommas(form.getValues("downPayment"))}
                            onChange={(e) => {
                              // Remove commas and convert to number
                              const rawValue = e.target.value.replace(/,/g, "")
                              const value = rawValue ? Number(rawValue) : 0

                              if (!isNaN(value)) {
                                form.setValue("downPayment", value)

                                // Update percentage if property price is not zero
                                const propertyPrice = form.getValues("propertyPrice")
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
                        <Label htmlFor="financingOption">Financing Option</Label>
                        <Select
                          onValueChange={(value) => form.setValue("financingOption", value as FinancingOption)}
                          defaultValue={form.getValues("financingOption")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select financing option" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-house">In-House Financing</SelectItem>
                            <SelectItem value="in-house-bridge">In-House Bridge Financing</SelectItem>
                            <SelectItem value="pag-ibig">Pag-IBIG Financing</SelectItem>
                            <SelectItem value="bank">Bank Financing</SelectItem>
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
                    <p className="text-sm text-muted-foreground">Property Price</p>
                    <p className="text-xl font-semibold">{formatCurrency(form.getValues("propertyPrice"))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment</p>
                    <p className="text-xl font-semibold">{formatCurrency(form.getValues("downPayment"))}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Loan Principal</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.loanAmount)}</p>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-sm text-muted-foreground">Monthly Payment</p>
                    <p className="text-2xl font-bold text-primary">{formatCurrency(result.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Payment</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.totalPayment)}</p>
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
