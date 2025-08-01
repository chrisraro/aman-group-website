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
import { calculateLoan, formatCurrency, generateLoanAmortizationSchedule } from "@/lib/loan-calculations"
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
}

interface LoanCalculatorFormProps {
  initialPropertyId?: string
  initialPropertyType?: "model-house" | "lot-only"
}

export function LoanCalculatorForm({ initialPropertyId, initialPropertyType }: LoanCalculatorFormProps) {
  // Form state
  const [propertyPrice, setPropertyPrice] = useState("")
  const [downPaymentPercentage, setDownPaymentPercentage] = useState("20")
  const [loanTermYears, setLoanTermYears] = useState("15")
  const [interestRate, setInterestRate] = useState("6")
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [propertySearchOpen, setPropertySearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [downPaymentTerm, setDownPaymentTerm] = useState("24")

  // Data hooks
  const {
    properties,
    loading: propertiesLoading,
    error: propertiesError,
    refetch: refetchProperties,
  } = usePropertyData()
  const { settings, loading: settingsLoading } = useLoanCalculatorSettings()

  // Handle URL parameters
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const propertyPriceParam = urlParams.get("propertyPrice")
      const propertyTypeParam = urlParams.get("propertyType")
      const lotPriceParam = urlParams.get("lotPrice")
      const houseConstructionCostParam = urlParams.get("houseConstructionCost")
      const propertyNameParam = urlParams.get("propertyName")
      const propertyIdParam = urlParams.get("propertyId")

      if (propertyPriceParam) {
        setPropertyPrice(propertyPriceParam)
      }

      if (propertyTypeParam && lotPriceParam && houseConstructionCostParam && propertyNameParam) {
        const mockProperty = {
          id: propertyIdParam || "url-param",
          name: propertyNameParam,
          location: "Model House",
          price: Number.parseFloat(propertyPriceParam || "0"),
          type: propertyTypeParam as "model-house" | "lot-only",
          lotPrice: Number.parseFloat(lotPriceParam || "0"),
          houseConstructionPrice: Number.parseFloat(houseConstructionCostParam || "0"),
        }
        setSelectedProperty(mockProperty)
      }
    }
  }, [])

  // Memoized calculations
  const calculation = useMemo(() => {
    const price = Number.parseFloat(propertyPrice) || 0
    const downPayment = Number.parseFloat(downPaymentPercentage) || 0
    const term = Number.parseInt(loanTermYears) || 0
    const rate = Number.parseFloat(interestRate) || 0
    const dpTermMonths = Number.parseInt(downPaymentTerm) || 24

    if (price <= 0 || downPayment < 0 || term <= 0 || rate < 0) {
      return null
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
      settings: settings || {
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
        specialDownPaymentRules: {
          twentyPercentRule: {
            isActive: true,
            firstYearInterestRate: 0,
            subsequentYearInterestRate: 8.5,
            downPaymentTermMonths: 24,
          },
        },
        defaultSettings: {
          defaultFinancingOption: "in-house",
          defaultPaymentTerm: 5,
          fixedDownPaymentPercentage: 20,
          fixedDownPaymentTermMonths: 24,
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      },
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

  // Initialize with selected property
  useEffect(() => {
    if (initialPropertyId && properties && !selectedProperty) {
      const property = properties.find((p) => p.id === initialPropertyId)
      if (property) {
        handlePropertySelect(property)
      }
    }
  }, [initialPropertyId, properties, selectedProperty, handlePropertySelect])

  // Export to PDF using the utility function
  const handleExportToPDF = useCallback(() => {
    if (!calculation) return

    const monthlyLoanSchedule = generateLoanAmortizationSchedule(
      calculation.loanAmount,
      calculation.interestRate,
      calculation.loanTermYears,
      calculation.monthlyPayment,
    )

    const loanDetailsForPdf = {
      propertyPrice: calculation.propertyPrice,
      downPayment: calculation.downPayment,
      loanAmount: calculation.loanAmount,
      interestRate: calculation.interestRate,
      monthlyPayment: calculation.monthlyPayment,
      totalPayment: calculation.totalAmount,
      term: calculation.loanTermYears,
    }

    exportToPDFUtil(monthlyLoanSchedule, "monthly", loanDetailsForPdf, selectedProperty?.name)
  }, [calculation, selectedProperty])

  // Export Standing Offer Agreement
  const handleExportSOA = useCallback(() => {
    if (!calculation || !selectedProperty) return

    const soaContent = `DHSUD LTS NO. 048
QUOTATION FOR PURCHASE OF LOT
(Effective ${new Date().toLocaleDateString()})

${selectedProperty.name}
${new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()}

Lot Information
DESCRIPTION                    LOT
LOT AREA: ${selectedProperty.lotPrice ? "120" : "N/A"} sq.m.
Unit Price / sq.m.: ${selectedProperty.lotPrice ? formatCurrency(selectedProperty.lotPrice / 120) : "N/A"}
LOT Price: ${formatCurrency(selectedProperty.lotPrice || 0)}

House Information
DESCRIPTION                    HOUSE
BUILDING Price: ${formatCurrency(selectedProperty.houseConstructionPrice || 0)}

TOTAL SELLING PRICE: ${formatCurrency(calculation.propertyPrice)}
Less: Discount: ${formatCurrency(0)}
Add: Government Fees and Taxes: ${formatCurrency(calculation.governmentFees)}
FINAL CONTRACT PRICE (ALL-IN): ${formatCurrency(calculation.totalAmount)}

TERMS OF PAYMENT:
Spot DOWN PAYMENT (SDP) / RESERVATION FEE: ${formatCurrency(calculation.reservationFee)}
DOWNPAYMENT (DP) 20%: ${formatCurrency(calculation.downPayment)}
BALANCE DOWNPAYMENT (BDP): ${formatCurrency(calculation.downPayment - calculation.reservationFee)}

DP Payable in 2 years - 24 months
Year 1 (No Interest): ${formatCurrency(calculation.downPaymentSchedule[0]?.payment * 12 || 0)} / ${formatCurrency(calculation.downPaymentSchedule[0]?.payment || 0)}
Year 2 (with 8.5% p.a.): ${formatCurrency((calculation.downPaymentSchedule[12]?.payment || 0) * 12)} / ${formatCurrency(calculation.downPaymentSchedule[12]?.payment || 0)}

AMORTIZATION (Terms and Interest Rate) - 80%: ${formatCurrency(calculation.loanAmount)}
Terms: ${calculation.loanTermYears} years
Rate: ${calculation.interestRate}% p.a.
Monthly: ${formatCurrency(calculation.monthlyPayment)}

TOTAL DOWNPAYMENT and AMORTIZATION: ${formatCurrency(calculation.totalAmount)}

NOTES:
1. RESERVATION FEE is part of the Downpayment, NON-REFUNDABLE and NON-TRANSFERABLE.
2. Above Pricing is INCLUSIVE of (O.C.) applicable government transfer fees, taxes & 12% EVAT
3. Above LOT PRICING is inclusive of advantage cost in case of SPECIAL LOTS (ie. corner, east, etc.)
4. Lot purchase shall be covered with Contract to Sell with AMAN ENGINEERING ENTERPRISES (AEE).
5. Building contract quotation shall be covered by Construction Agreement with accredited In-house contractor
6. Prices, discounts & interest rates are subject to change without prior notice.
7. Any excess payment in government fee and taxes will be refunded.

Generated on: ${new Date().toLocaleDateString()}
Property: ${selectedProperty.name}`

    const blob = new Blob([soaContent], { type: "text/plain" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `SOA_${selectedProperty.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }, [calculation, selectedProperty])

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
                className="w-full justify-between bg-white hover:bg-gray-50 border-gray-300"
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
                        {formatCurrency(calculation.monthlyPayment)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Loan Payment</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(calculation.downPaymentSchedule[0]?.payment || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">Monthly Downpayment (1st Year)</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedProperty?.houseConstructionPrice || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">House Construction Cost</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">{formatCurrency(selectedProperty?.lotPrice || 0)}</div>
                      <p className="text-sm text-muted-foreground">Lot Cost</p>
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
                      <span>Interest Rate (Loan):</span>
                      <span className="font-medium">{calculation.interestRate}% per annum</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Loan Term:</span>
                      <span className="font-medium">{calculation.loanTermYears} years</span>
                    </div>
                    {selectedProperty?.houseConstructionPrice !== undefined && (
                      <div className="flex justify-between">
                        <span>House Construction Cost:</span>
                        <span className="font-medium">
                          {formatCurrency(selectedProperty.houseConstructionPrice || 0)}
                        </span>
                      </div>
                    )}
                    {selectedProperty?.lotPrice !== undefined && (
                      <div className="flex justify-between">
                        <span>Lot Cost:</span>
                        <span className="font-medium">{formatCurrency(selectedProperty.lotPrice || 0)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Monthly Downpayment (1st Year):</span>
                      <span className="font-medium">
                        {formatCurrency(calculation.downPaymentSchedule[0]?.payment || 0)}
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
                              {item.month}
                            </td>
                            <td className="px-6 py-4">{formatCurrency(item.payment)}</td>
                            <td className="px-6 py-4">{item.interestRate}%</td>
                            <td className="px-6 py-4">{formatCurrency(item.balance)}</td>
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
                Export PDF
              </Button>
              <Button onClick={handleExportSOA} variant="outline" className="flex items-center gap-2 bg-transparent">
                <Download className="h-4 w-4" />
                Export SOA
              </Button>
            </div>
          </div>
        )}

        <LoanCalculatorNote />
      </CardContent>
    </Card>
  )
}
