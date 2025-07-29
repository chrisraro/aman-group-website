"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
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
import { Check, ChevronsUpDown, Calculator, Download, Search, Loader2, AlertCircle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  calculateLoan,
  formatCurrency,
  calculateAmortizationSchedule,
  calculateDownPaymentSchedule,
} from "@/lib/loan-calculations"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"
import { usePropertyData } from "@/lib/hooks/usePropertyData"
import { LoanCalculatorNote } from "./loan-calculator-note"
import { exportToPDF } from "./pdf-export-utils"
import {
  type MonthlyScheduleItem,
  type YearlyScheduleItem,
  DEFAULT_LOAN_CALCULATOR_SETTINGS,
} from "@/types/loan-calculator"

interface Property {
  id: string
  name: string
  location: string
  price: number
  type: "model-house" | "lot-only"
  lotPrice?: number
  constructionCost?: number
}

interface LoanCalculatorFormProps {
  initialPropertyId?: string
  initialPropertyType?: "model-house" | "lot-only"
}

// Generate yearly schedule from monthly - moved outside component
const generateYearlySchedule = (monthlySchedule: MonthlyScheduleItem[], years: number): YearlyScheduleItem[] => {
  const yearlySchedule: YearlyScheduleItem[] = []

  for (let year = 1; year <= years; year++) {
    const yearStart = (year - 1) * 12
    const yearEnd = year * 12
    const yearMonths = monthlySchedule.slice(yearStart, yearEnd)

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

export function LoanCalculatorForm({ initialPropertyId, initialPropertyType }: LoanCalculatorFormProps) {
  // Form state
  const [propertyPrice, setPropertyPrice] = useState("")
  const [downPaymentPercentage, setDownPaymentPercentage] = useState("20")
  const [loanTermYears, setLoanTermYears] = useState("15")
  const [interestRate, setInterestRate] = useState("8.5")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [propertySearchOpen, setPropertySearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [scheduleView, setScheduleView] = useState<"monthly" | "yearly">("monthly")

  // Data hooks
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = usePropertyData()
  const { settings, loading: settingsLoading } = useLoanCalculatorSettings()

  // Memoized calculations
  const calculation = useMemo(() => {
    const price = Number.parseFloat(propertyPrice) || 0
    const downPayment = Number.parseFloat(downPaymentPercentage) || 0
    const term = Number.parseInt(loanTermYears) || 0
    const rate = Number.parseFloat(interestRate) || 0

    if (price <= 0 || downPayment < 0 || term <= 0 || rate < 0) {
      return null
    }

    // Use settings from hook, or fallback to DEFAULT_LOAN_CALCULATOR_SETTINGS
    const currentSettings = settings || DEFAULT_LOAN_CALCULATOR_SETTINGS

    return calculateLoan({
      propertyPrice: price,
      downPaymentPercentage: downPayment,
      loanTermYears: term,
      interestRate: rate,
      propertyType: selectedProperty?.type || "lot-only",
      lotPrice: selectedProperty?.lotPrice || 0,
      constructionCost: selectedProperty?.constructionCost || 0,
      settings: currentSettings,
    })
  }, [propertyPrice, downPaymentPercentage, loanTermYears, interestRate, selectedProperty, settings])

  // Calculate amortization schedule
  const amortizationSchedule = useMemo(() => {
    if (!calculation) return { monthly: [], yearly: [] }

    const monthlySchedule = calculateAmortizationSchedule(calculation)
    const yearlySchedule = generateYearlySchedule(monthlySchedule, calculation.loanTermYears)

    return { monthly: monthlySchedule, yearly: yearlySchedule }
  }, [calculation])

  // Calculate down payment schedule using the special rule
  const downPaymentSchedule = useMemo(() => {
    if (!calculation || !settings) return []

    // Use the down payment amount from the main calculation
    const downPaymentAmount = calculation.downPayment

    // Use the special down payment rules from settings
    const specialRules = settings.specialDownPaymentRules

    return calculateDownPaymentSchedule(downPaymentAmount, specialRules)
  }, [calculation, settings])

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

  // Initialize with selected property
  useEffect(() => {
    if (initialPropertyId && properties && !selectedProperty) {
      const property = properties.find((p) => p.id === initialPropertyId)
      if (property) {
        handlePropertySelect(property)
      }
    }
  }, [initialPropertyId, properties, selectedProperty, handlePropertySelect])

  // Export to PDF
  const handleExportToPDF = useCallback(() => {
    if (!calculation) return

    const loanSchedule = scheduleView === "monthly" ? amortizationSchedule.monthly : amortizationSchedule.yearly
    const loanDetails = {
      propertyPrice: calculation.propertyPrice,
      downPayment: calculation.downPayment,
      loanAmount: calculation.loanAmount,
      interestRate: calculation.interestRate,
      monthlyPayment: calculation.monthlyPayments.subsequentYears, // Use subsequent years for main monthly payment
      firstYearMonthlyPayment: calculation.monthlyPayments.firstYear, // First year loan payment
      totalPayment: calculation.totalAmount,
      term: calculation.loanTermYears,
    }

    exportToPDF(loanSchedule, scheduleView, loanDetails, downPaymentSchedule, selectedProperty?.name)
  }, [calculation, amortizationSchedule, scheduleView, downPaymentSchedule, selectedProperty])

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
                    <span className="text-muted-foreground">- {formatCurrency(selectedProperty.price)}</span>
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
                              {property.location} • {formatCurrency(property.price)}
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
        </div>

        {/* Results */}
        {calculation && (
          <div className="space-y-6">
            <Separator />

            <Tabs defaultValue="summary" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
                <TabsTrigger value="down-payment">Down Payment</TabsTrigger>
                <TabsTrigger value="amortization">Amortization</TabsTrigger>
              </TabsList>

              <TabsContent value="summary" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-primary">
                        {formatCurrency(calculation.monthlyPayments.firstYear)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Loan Payment (1st Year)</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(downPaymentSchedule[0]?.payment || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Down Payment (1st Month)</p>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{formatCurrency(calculation.totalInterest)}</div>
                      <p className="text-sm text-muted-foreground">Total Interest</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Property Price:</span>
                      <span className="font-medium">{formatCurrency(calculation.propertyPrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Down Payment ({calculation.downPaymentPercentage}%):</span>
                      <span className="font-medium">{formatCurrency(calculation.downPayment)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.loanAmount)}</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Interest Rate:</span>
                      <span className="font-medium">{calculation.interestRate}% per annum</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Term:</span>
                      <span className="font-medium">{calculation.loanTermYears} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Amount:</span>
                      <span className="font-medium">{formatCurrency(calculation.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="breakdown" className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">Additional Fees & Charges</h4>

                  {calculation.reservationFee > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Reservation Fee:</span>
                      <span className="font-medium">{formatCurrency(calculation.reservationFee)}</span>
                    </div>
                  )}

                  {calculation.governmentFees > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Government Fees:</span>
                      <span className="font-medium">{formatCurrency(calculation.governmentFees)}</span>
                    </div>
                  )}

                  {calculation.constructionFees > 0 && (
                    <div className="flex justify-between items-center py-2 border-b">
                      <span>Construction Fees:</span>
                      <span className="font-medium">{formatCurrency(calculation.constructionFees)}</span>
                    </div>
                  )}

                  {calculation.reservationFee === 0 &&
                    calculation.governmentFees === 0 &&
                    calculation.constructionFees === 0 && (
                      <p className="text-muted-foreground text-center py-4">
                        No additional fees apply to this calculation.
                      </p>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="down-payment" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">
                    Down Payment Schedule ({settings?.defaultSettings?.fixedDownPaymentTermMonths} Months)
                  </h4>
                  <div className="text-sm text-muted-foreground">
                    Monthly Payment (1st Year): {formatCurrency(downPaymentSchedule[0]?.payment || 0)}
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-2">Month</th>
                        <th className="text-right p-2">Payment</th>
                        <th className="text-right p-2">Balance</th>
                        <th className="text-right p-2">Cumulative</th>
                        <th className="text-right p-2">Interest Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {downPaymentSchedule.map((item) => (
                        <tr key={item.month} className="border-b">
                          <td className="p-2">{item.month}</td>
                          <td className="text-right p-2">{formatCurrency(item.payment)}</td>
                          <td className="text-right p-2">{formatCurrency(item.balance)}</td>
                          <td className="text-right p-2">{formatCurrency(item.cumulativePaid)}</td>
                          <td className="text-right p-2">{item.interestRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </TabsContent>

              <TabsContent value="amortization" className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Loan Amortization Schedule</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={scheduleView === "monthly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScheduleView("monthly")}
                    >
                      Monthly
                    </Button>
                    <Button
                      variant={scheduleView === "yearly" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setScheduleView("yearly")}
                    >
                      Yearly
                    </Button>
                  </div>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-background">
                      <tr className="border-b">
                        <th className="text-left p-2">{scheduleView === "monthly" ? "Month" : "Year"}</th>
                        <th className="text-right p-2">Principal</th>
                        <th className="text-right p-2">Interest</th>
                        <th className="text-right p-2">Payment</th>
                        <th className="text-right p-2">Balance</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(scheduleView === "monthly" ? amortizationSchedule.monthly : amortizationSchedule.yearly).map(
                        (item, index) => (
                          <tr key={index} className="border-b">
                            <td className="p-2">{scheduleView === "monthly" ? index + 1 : item.year}</td>
                            <td className="text-right p-2">{formatCurrency(item.principal)}</td>
                            <td className="text-right p-2">{formatCurrency(item.interest)}</td>
                            <td className="text-right p-2">{formatCurrency(item.payment)}</td>
                            <td className="text-right p-2">{formatCurrency(item.balance)}</td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-2">
              <Button onClick={handleExportToPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export PDF
              </Button>
            </div>
          </div>
        )}

        <LoanCalculatorNote />
      </CardContent>
    </Card>
  )
}
