"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { ArrowLeft, Calculator, FileDown, FileText, Home, Loader2, Info, Search, Building, MapPin } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { formatCurrency } from "@/lib/utils"
import type { FinancingOption, PaymentTerm, LoanCalculationResult, PropertyType } from "@/types/loan-calculator"
import { calculateCompleteLoanDetails, generateLoanAmortizationSchedule } from "@/lib/loan-calculations"
import { exportToPDF } from "@/components/pdf-export-utils"
import { useRouter, usePathname } from "next/navigation"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"
import { usePropertyData, type PropertyOption } from "@/lib/hooks/usePropertyData"

// Helper function to format number with commas
const formatNumberWithCommas = (value: number | undefined): string => {
  if (value === undefined || isNaN(value)) return "0"
  return value.toLocaleString("en-US", { maximumFractionDigits: 0 })
}

const formSchema = z.object({
  selectedPropertyId: z.string().optional(),
  basePrice: z.number().min(1),
  propertyType: z.enum(["model-house", "lot-only"]),
  lotPrice: z.number().optional(),
  houseConstructionCost: z.number().optional(),
  financingOption: z.enum(["in-house", "in-house-bridge", "pag-ibig", "bank"]),
  paymentTerm: z.number().int().min(5).max(30),
})

interface LoanCalculatorFormProps {
  initialPrice?: number
  returnUrl?: string
  modelName?: string
  propertyType?: PropertyType
  lotPrice?: number
  houseConstructionCost?: number
}

export function LoanCalculatorForm({
  initialPrice,
  returnUrl = "/model-houses",
  modelName,
  propertyType = "model-house",
  lotPrice,
  houseConstructionCost,
}: LoanCalculatorFormProps) {
  const searchParams = useSearchParams()
  const [result, setResult] = useState<LoanCalculationResult | null>(null)
  const [scheduleView, setScheduleView] = useState<"monthly" | "yearly">(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem("amortizationScheduleView")
      return savedView === "yearly" || savedView === "monthly" ? savedView : "monthly"
    }
    return "monthly"
  })
  const [isExporting, setIsExporting] = useState(false)
  const [propertySearchOpen, setPropertySearchOpen] = useState(false)
  const [selectedProperty, setSelectedProperty] = useState<PropertyOption | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Hooks
  const { settings: calculatorSettings, loading: settingsLoading, error: settingsError } = useLoanCalculatorSettings()
  const { properties, isLoading: propertiesLoading, error: propertiesError, refreshData } = usePropertyData()

  const loanSummaryRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const pathname = usePathname()

  // Default property price
  const defaultPrice = 4707475
  const basePrice = initialPrice || defaultPrice

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedPropertyId: "",
      basePrice: basePrice,
      propertyType: propertyType,
      lotPrice: lotPrice,
      houseConstructionCost: houseConstructionCost,
      financingOption: "in-house",
      paymentTerm: 5,
    },
  })

  // Memoize URL parameters to prevent unnecessary re-renders
  const urlParams = useMemo(() => {
    if (!searchParams) return null
    return {
      propertyId: searchParams.get("propertyId"),
      price: searchParams.get("price"),
      propertyType: searchParams.get("propertyType"),
      lotPrice: searchParams.get("lotPrice"),
      houseConstructionCost: searchParams.get("houseConstructionCost"),
    }
  }, [searchParams])

  // Function to scroll to loan summary on mobile
  const scrollToLoanSummary = useCallback(() => {
    if (window.innerWidth < 768 && loanSummaryRef.current) {
      loanSummaryRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [])

  const handlePropertySelect = useCallback(
    (property: PropertyOption) => {
      setSelectedProperty(property)

      // Update form values without triggering re-renders
      const updates = {
        selectedPropertyId: property.id,
        basePrice: property.price,
        propertyType: property.type === "lot-only" ? ("lot-only" as const) : ("model-house" as const),
        lotPrice: property.type === "lot-only" ? undefined : property.lotPrice || 0,
        houseConstructionCost: property.type === "lot-only" ? undefined : property.houseConstructionPrice || 0,
      }

      // Use batch updates to prevent multiple re-renders
      Object.entries(updates).forEach(([key, value]) => {
        form.setValue(key as keyof typeof updates, value, { shouldValidate: false })
      })

      setPropertySearchOpen(false)
    },
    [form],
  )

  // Initialize from URL parameters only once
  useEffect(() => {
    if (!isInitialized && urlParams && properties.length > 0) {
      if (urlParams.propertyId) {
        const property = properties.find((p) => p.id === urlParams.propertyId)
        if (property) {
          handlePropertySelect(property)
        }
      } else if (urlParams.price) {
        const price = Number.parseFloat(urlParams.price)
        if (!isNaN(price)) {
          form.setValue("basePrice", price, { shouldValidate: false })
          if (urlParams.propertyType) {
            form.setValue("propertyType", urlParams.propertyType as PropertyType, { shouldValidate: false })
          }
          if (urlParams.lotPrice) {
            const lotPrice = Number.parseFloat(urlParams.lotPrice)
            if (!isNaN(lotPrice)) {
              form.setValue("lotPrice", lotPrice, { shouldValidate: false })
            }
          }
          if (urlParams.houseConstructionCost) {
            const houseConstructionCost = Number.parseFloat(urlParams.houseConstructionCost)
            if (!isNaN(houseConstructionCost)) {
              form.setValue("houseConstructionCost", houseConstructionCost, { shouldValidate: false })
            }
          }
        }
      }
      setIsInitialized(true)
    }
  }, [urlParams, properties, handlePropertySelect, form, isInitialized])

  // Reset form values when navigating directly from navbar - only once
  useEffect(() => {
    if (pathname === "/loan-calculator" && !initialPrice && !urlParams?.propertyId && !isInitialized) {
      form.reset({
        selectedPropertyId: "",
        basePrice: defaultPrice,
        propertyType: "model-house",
        lotPrice: undefined,
        houseConstructionCost: undefined,
        financingOption: "in-house",
        paymentTerm: 5,
      })
      setResult(null)
      setSelectedProperty(null)
      setIsInitialized(true)
    }
  }, [pathname, initialPrice, urlParams, defaultPrice, form, isInitialized])

  // Save schedule view preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("amortizationScheduleView", scheduleView)
    }
  }, [scheduleView])

  const onSubmit = useCallback(
    (values: z.infer<typeof formSchema>) => {
      if (!calculatorSettings) {
        console.error("Calculator settings not available")
        return
      }

      try {
        const calculation = calculateCompleteLoanDetails(
          values.basePrice,
          values.propertyType,
          values.lotPrice,
          values.houseConstructionCost,
          values.financingOption as FinancingOption,
          values.paymentTerm as PaymentTerm,
          calculatorSettings.reservationFees || { modelHouse: 25000, lotOnly: 10000, isActive: true },
          calculatorSettings.governmentFeesConfig || {
            fixedAmountThreshold: 1000000,
            fixedAmount: 205000,
            percentageRate: 20.5,
            isActive: true,
          },
          calculatorSettings.constructionFeesConfig || {
            houseConstructionFeeRate: 8.5,
            lotFeeRate: 8.5,
            isActive: true,
          },
        )

        setResult(calculation)
        setTimeout(() => scrollToLoanSummary(), 100)
      } catch (error) {
        console.error("Error calculating loan:", error)
        alert("Error calculating loan. Please check your inputs and try again.")
      }
    },
    [calculatorSettings, scrollToLoanSummary],
  )

  // Generate amortization schedule
  const generateAmortizationSchedule = useCallback(() => {
    if (!result) return []

    return generateLoanAmortizationSchedule(
      result.loanAmortization.loanAmount,
      result.loanAmortization.interestRate,
      form.getValues("paymentTerm"),
      result.loanAmortization.monthlyPayment,
    )
  }, [result, form])

  // Generate yearly amortization schedule
  const generateYearlyAmortizationSchedule = useCallback((monthlySchedule: any[], termYears: number) => {
    const yearlySchedule = []

    for (let year = 1; year <= termYears; year++) {
      const startMonth = (year - 1) * 12 + 1
      const endMonth = Math.min(year * 12, monthlySchedule.length)

      let yearlyPrincipal = 0
      let yearlyInterest = 0
      let yearlyPayment = 0

      for (let month = startMonth; month <= endMonth; month++) {
        const monthData = monthlySchedule[month - 1]
        if (monthData) {
          yearlyPrincipal += monthData.principal
          yearlyInterest += monthData.interest
          yearlyPayment += monthData.payment
        }
      }

      const lastMonthData = monthlySchedule[endMonth - 1]

      yearlySchedule.push({
        year,
        principal: yearlyPrincipal,
        interest: yearlyInterest,
        payment: yearlyPayment,
        balance: lastMonthData ? lastMonthData.balance : 0,
      })
    }

    return yearlySchedule
  }, [])

  const handleExport = useCallback(
    async (format: "csv" | "pdf") => {
      if (!result) return

      try {
        setIsExporting(true)
        const monthlySchedule = generateAmortizationSchedule()
        const scheduleData =
          scheduleView === "monthly"
            ? monthlySchedule
            : generateYearlyAmortizationSchedule(monthlySchedule, form.getValues("paymentTerm"))

        if (format === "csv") {
          let csvContent = "data:text/csv;charset=utf-8,"

          const propertyName = selectedProperty?.name || modelName || "Property"
          csvContent += `Property: ${propertyName}\n\n`

          csvContent += `${scheduleView === "monthly" ? "Month" : "Year"},Principal,Interest,Payment,Balance\n`

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

          const encodedUri = encodeURI(csvContent)
          const link = document.createElement("a")
          link.setAttribute("href", encodedUri)
          link.setAttribute(
            "download",
            `amortization_schedule_${propertyName.replace(/\s+/g, "_")}_${scheduleView}.csv`,
          )
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
        } else if (format === "pdf") {
          exportToPDF(
            scheduleData,
            scheduleView,
            {
              propertyPrice: result.propertyBreakdown.totalAllInPrice,
              downPayment: result.propertyBreakdown.totalAllInPrice * 0.2,
              loanAmount: result.loanAmortization.loanAmount,
              interestRate: result.loanAmortization.interestRate,
              monthlyPayment: result.loanAmortization.monthlyPayment,
              totalPayment: result.loanAmortization.totalPayment,
              term: form.getValues("paymentTerm"),
            },
            selectedProperty?.name || modelName,
          )
        }
      } catch (error) {
        console.error("Error exporting:", error)
        alert("Error exporting data. Please try again.")
      } finally {
        setIsExporting(false)
      }
    },
    [
      result,
      scheduleView,
      generateAmortizationSchedule,
      generateYearlyAmortizationSchedule,
      form,
      selectedProperty,
      modelName,
    ],
  )

  const renderMobileTable = useCallback(() => {
    if (!result) return null

    const monthlySchedule = generateAmortizationSchedule()
    const schedule =
      scheduleView === "monthly"
        ? monthlySchedule
        : generateYearlyAmortizationSchedule(monthlySchedule, form.getValues("paymentTerm"))

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
  }, [result, scheduleView, generateAmortizationSchedule, generateYearlyAmortizationSchedule, form])

  // Memoize schedule data to prevent unnecessary recalculations
  const scheduleData = useMemo(() => {
    if (!result) return []
    const monthlySchedule = generateAmortizationSchedule()
    return scheduleView === "monthly"
      ? monthlySchedule
      : generateYearlyAmortizationSchedule(monthlySchedule, form.getValues("paymentTerm"))
  }, [result, scheduleView, generateAmortizationSchedule, generateYearlyAmortizationSchedule, form])

  // Default financing options if settings are not available
  const defaultFinancingOptions = [
    { id: "in-house", name: "In-House Financing", value: "in-house", isActive: true },
    { id: "pag-ibig", name: "Pag-IBIG", value: "pag-ibig", isActive: true },
    { id: "bank", name: "Bank Financing", value: "bank", isActive: true },
  ]

  const availableFinancingOptions = useMemo(() => {
    return calculatorSettings?.financingOptions?.filter((option) => option.isActive) || defaultFinancingOptions
  }, [calculatorSettings?.financingOptions])

  // Group properties by type for better organization
  const modelHouseProperties = useMemo(() => properties.filter((p) => p.type === "model-house"), [properties])
  const rfoProperties = useMemo(() => properties.filter((p) => p.type === "rfo-unit"), [properties])
  const lotOnlyProperties = useMemo(() => properties.filter((p) => p.type === "lot-only"), [properties])

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
          {selectedProperty?.name || modelName
            ? `Loan Calculator - ${selectedProperty?.name || modelName}`
            : "Loan Calculator"}
        </h1>
        <p className="text-muted-foreground">
          {selectedProperty?.name || modelName
            ? `Calculate monthly payments and loan details for ${selectedProperty?.name || modelName}.`
            : "Select a property and calculate your monthly amortization based on different financing options."}
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
                  <CardTitle>Property Selection & Loan Parameters</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid gap-4">
                      {/* Property Search */}
                      <div className="space-y-2">
                        <Label>Select Property (Optional)</Label>
                        <Popover open={propertySearchOpen} onOpenChange={setPropertySearchOpen}>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={propertySearchOpen}
                              className="w-full justify-between"
                              type="button"
                            >
                              {selectedProperty ? (
                                <div className="flex items-center gap-2">
                                  <Building className="h-4 w-4" />
                                  <span className="truncate">{selectedProperty.name}</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {selectedProperty.type === "model-house"
                                      ? "Model House"
                                      : selectedProperty.type === "rfo-unit"
                                        ? "RFO"
                                        : "Lot Only"}
                                  </Badge>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <Search className="h-4 w-4" />
                                  <span>Search properties...</span>
                                </div>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-full p-0" align="start">
                            <Command>
                              <CommandInput placeholder="Search properties..." />
                              <CommandList>
                                <CommandEmpty>No properties found.</CommandEmpty>

                                {modelHouseProperties.length > 0 && (
                                  <CommandGroup heading="Model Houses">
                                    {modelHouseProperties.map((property) => (
                                      <CommandItem
                                        key={property.id}
                                        onSelect={() => handlePropertySelect(property)}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{property.name}</span>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{property.location}</span>
                                            <span>•</span>
                                            <span>{formatCurrency(property.price)}</span>
                                          </div>
                                        </div>
                                        <Badge variant="outline">Model House</Badge>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}

                                {rfoProperties.length > 0 && (
                                  <CommandGroup heading="Ready for Occupancy (RFO)">
                                    {rfoProperties.map((property) => (
                                      <CommandItem
                                        key={property.id}
                                        onSelect={() => handlePropertySelect(property)}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{property.name}</span>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{property.location}</span>
                                            <span>•</span>
                                            <span>{formatCurrency(property.price)}</span>
                                          </div>
                                        </div>
                                        <Badge variant="outline">RFO</Badge>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}

                                {lotOnlyProperties.length > 0 && (
                                  <CommandGroup heading="Lot Only Properties">
                                    {lotOnlyProperties.map((property) => (
                                      <CommandItem
                                        key={property.id}
                                        onSelect={() => handlePropertySelect(property)}
                                        className="flex items-center justify-between"
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{property.name}</span>
                                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <MapPin className="h-3 w-3" />
                                            <span>{property.location}</span>
                                            <span>•</span>
                                            <span>{formatCurrency(property.price)}</span>
                                          </div>
                                        </div>
                                        <Badge variant="outline">Lot Only</Badge>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                )}
                              </CommandList>
                            </Command>
                          </PopoverContent>
                        </Popover>

                        {selectedProperty && (
                          <div className="p-3 bg-blue-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{selectedProperty.name}</span>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedProperty(null)
                                  form.setValue("selectedPropertyId", "", { shouldValidate: false })
                                }}
                              >
                                Clear
                              </Button>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div>
                                <span className="text-muted-foreground">Price:</span>
                                <div className="font-semibold">{formatCurrency(selectedProperty.price)}</div>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Type:</span>
                                <div className="font-semibold capitalize">
                                  {selectedProperty.type === "model-house"
                                    ? "Model House"
                                    : selectedProperty.type === "rfo-unit"
                                      ? "RFO Unit"
                                      : "Lot Only"}
                                </div>
                              </div>
                              {selectedProperty.floorArea && (
                                <div>
                                  <span className="text-muted-foreground">Area:</span>
                                  <div className="font-semibold">{selectedProperty.floorArea}</div>
                                </div>
                              )}
                              {selectedProperty.developer && (
                                <div>
                                  <span className="text-muted-foreground">Developer:</span>
                                  <div className="font-semibold">{selectedProperty.developer}</div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="basePrice">Base Property Price</Label>
                        <Input
                          id="basePrice"
                          type="text"
                          disabled={!!selectedProperty}
                          value={formatNumberWithCommas(form.watch("basePrice") || 0)}
                          onChange={(e) => {
                            const rawValue = e.target.value.replace(/,/g, "")
                            const value = rawValue ? Number(rawValue) : 0

                            if (!isNaN(value)) {
                              form.setValue("basePrice", value, { shouldValidate: false })
                            }
                          }}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="propertyType">Property Type</Label>
                        <Select
                          onValueChange={(value) =>
                            form.setValue("propertyType", value as PropertyType, { shouldValidate: false })
                          }
                          value={form.watch("propertyType")}
                          disabled={!!selectedProperty}
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

                      {form.watch("propertyType") === "model-house" && (
                        <>
                          <div className="space-y-2">
                            <Label htmlFor="lotPrice">Lot Price</Label>
                            <Input
                              id="lotPrice"
                              type="text"
                              disabled={!!selectedProperty}
                              value={formatNumberWithCommas(form.watch("lotPrice") || 0)}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, "")
                                const value = rawValue ? Number(rawValue) : 0

                                if (!isNaN(value)) {
                                  form.setValue("lotPrice", value, { shouldValidate: false })
                                }
                              }}
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="houseConstructionCost">House Construction Cost</Label>
                            <Input
                              id="houseConstructionCost"
                              type="text"
                              disabled={!!selectedProperty}
                              value={formatNumberWithCommas(form.watch("houseConstructionCost") || 0)}
                              onChange={(e) => {
                                const rawValue = e.target.value.replace(/,/g, "")
                                const value = rawValue ? Number(rawValue) : 0

                                if (!isNaN(value)) {
                                  form.setValue("houseConstructionCost", value, { shouldValidate: false })
                                }
                              }}
                            />
                          </div>
                        </>
                      )}

                      <div className="space-y-2">
                        <Label>Down Payment</Label>
                        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-green-800">Fixed at 20%</span>
                            <Badge variant="default" className="bg-green-600">
                              Special Rate Applied
                            </Badge>
                          </div>
                          <div className="text-sm text-green-700 mt-1">
                            • First 12 months: 0% interest • Months 13-24: 8.5% interest per annum
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="financingOption">Financing Option</Label>
                        <Select
                          onValueChange={(value) =>
                            form.setValue("financingOption", value as FinancingOption, { shouldValidate: false })
                          }
                          value={form.watch("financingOption")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select financing option" />
                          </SelectTrigger>
                          <SelectContent>
                            {availableFinancingOptions.map((option) => (
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
                          onValueChange={(value) =>
                            form.setValue("paymentTerm", Number.parseInt(value), { shouldValidate: false })
                          }
                          value={form.watch("paymentTerm").toString()}
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

                    <div className="flex gap-3">
                      <Button type="submit" className="flex-1">
                        <Calculator className="h-4 w-4 mr-2" />
                        Calculate Loan
                      </Button>
                      {selectedProperty && (
                        <Button type="button" variant="outline" onClick={() => onSubmit(form.getValues())}>
                          Recalculate
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rest of the tabs remain the same as before */}
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

                        {result.propertyBreakdown.propertyType === "model-house" && (
                          <>
                            {result.propertyBreakdown.lotPrice && (
                              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                                <span className="font-medium">Lot Price</span>
                                <span className="font-semibold">
                                  {formatCurrency(result.propertyBreakdown.lotPrice)}
                                </span>
                              </div>
                            )}

                            {result.propertyBreakdown.houseConstructionCost && (
                              <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                                <span className="font-medium">House Construction Cost</span>
                                <span className="font-semibold">
                                  {formatCurrency(result.propertyBreakdown.houseConstructionCost)}
                                </span>
                              </div>
                            )}

                            {result.propertyBreakdown.lotFees && (
                              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Lot Fees</span>
                                  <Badge variant="outline" className="text-xs">
                                    8.5%
                                  </Badge>
                                </div>
                                <span className="font-semibold">
                                  {formatCurrency(result.propertyBreakdown.lotFees)}
                                </span>
                              </div>
                            )}

                            {result.propertyBreakdown.constructionFees && (
                              <div className="flex justify-between items-center p-3 bg-pink-50 rounded-lg">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">Construction Fees</span>
                                  <Badge variant="outline" className="text-xs">
                                    8.5%
                                  </Badge>
                                </div>
                                <span className="font-semibold">
                                  {formatCurrency(result.propertyBreakdown.constructionFees)}
                                </span>
                              </div>
                            )}
                          </>
                        )}

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
                            {result.propertyBreakdown.propertyType === "model-house" && (
                              <>
                                <p>
                                  • <strong>Construction Fees:</strong> 8.5% of house construction cost
                                </p>
                                <p>
                                  • <strong>Lot Fees:</strong> 8.5% of lot price
                                </p>
                              </>
                            )}
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
                            <span className="text-muted-foreground">Total Down Payment (20%):</span>
                            <div className="font-semibold">{formatCurrency(result.totalDownPayment)}</div>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Monthly Payment:</span>
                            <div className="font-semibold">{formatCurrency(result.downPaymentMonthlyAmount)}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="default" className="bg-green-600">
                            20% Special Rate
                          </Badge>
                          <span className="text-sm font-medium text-green-800">Applied</span>
                        </div>
                        <div className="text-sm text-green-700">
                          <p>• First 12 months: 0% interest</p>
                          <p>• Months 13-24: 8.5% interest per annum</p>
                        </div>
                      </div>

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
                                <div className={row.isFirstYear ? "text-green-600 font-medium" : ""}>
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
                            {scheduleData.map((row) => (
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
                  {selectedProperty && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Selected Property</div>
                      <div className="font-semibold">{selectedProperty.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {selectedProperty.type === "model-house"
                          ? "Model House"
                          : selectedProperty.type === "rfo-unit"
                            ? "RFO Unit"
                            : "Lot Only"}
                      </div>
                    </div>
                  )}

                  <div>
                    <p className="text-sm text-muted-foreground">Total All-In Price</p>
                    <p className="text-xl font-semibold">{formatCurrency(result.propertyBreakdown.totalAllInPrice)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Down Payment Amount (20%)</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(result.propertyBreakdown.totalAllInPrice * 0.2)}
                    </p>
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
