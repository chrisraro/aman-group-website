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
import { calculateLoan, formatCurrency } from "@/lib/loan-calculations"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"
import { usePropertyData } from "@/lib/hooks/usePropertyData"
import { LoanCalculatorNote } from "./loan-calculator-note"
import jsPDF from "jspdf"
import "jspdf-autotable"
import type { DownPaymentScheduleItem } from "@/types/loan-calculator"

interface Property {
  id: string
  name: string
  location: string
  price: number
  type: "model-house" | "lot-only"
  lotPrice?: number
  houseConstructionPrice?: number // Corrected property name
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
  const [downPaymentTerm, setDownPaymentTerm] = useState("24") // New state for down payment term (in months)

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
    const dpTermMonths = Number.parseInt(downPaymentTerm) || 24 // Parse selected down payment term

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
      constructionCost: selectedProperty?.houseConstructionPrice || 0, // Pass houseConstructionPrice
      downPaymentTermMonths: dpTermMonths, // Pass the selected down payment term
      settings: settings || {
        // Pass the actual settings object
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
            downPaymentTermMonths: 24, // Default fallback
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

  // Export to PDF
  const exportToPDF = useCallback(() => {
    if (!calculation) return

    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width
    const margin = 20

    // Header
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("Loan Calculator Report", pageWidth / 2, 30, { align: "center" })

    // Property details
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    let yPos = 50

    if (selectedProperty) {
      doc.text(`Property: ${selectedProperty.name}`, margin, yPos)
      yPos += 8
      doc.text(`Location: ${selectedProperty.location}`, margin, yPos)
      yPos += 8
      doc.text(`Type: ${selectedProperty.type.replace("-", " ").toUpperCase()}`, margin, yPos)
      yPos += 15
    }

    // Loan details table
    const loanData = [
      ["Property Price", formatCurrency(calculation.propertyPrice)],
      ["Down Payment", `${calculation.downPaymentPercentage}% (${formatCurrency(calculation.downPayment)})`],
      ["Loan Amount", formatCurrency(calculation.loanAmount)],
      ["Interest Rate (Loan)", `${calculation.interestRate}% per annum`],
      ["Loan Term", `${calculation.loanTermYears} years`],
      ["Monthly Loan Payment", formatCurrency(calculation.monthlyPayment)],
      ["Monthly Downpayment (1st Year)", formatCurrency(calculation.downPaymentSchedule[0]?.payment || 0)], // Added
    ]

    if (selectedProperty?.houseConstructionPrice !== undefined) {
      loanData.push(["House Construction Cost", formatCurrency(selectedProperty.houseConstructionPrice || 0)])
    }
    if (selectedProperty?.lotPrice !== undefined) {
      loanData.push(["Lot Cost", formatCurrency(selectedProperty.lotPrice || 0)])
    }

    doc.autoTable({
      startY: yPos,
      head: [["Loan Details", "Amount"]],
      body: loanData,
      theme: "grid",
      headStyles: { fillColor: [65, 147, 45] },
      margin: { left: margin, right: margin },
    })

    yPos = (doc as any).lastAutoTable.finalY + 15

    // Breakdown table if there are fees
    const breakdownData = []
    if (calculation.reservationFee > 0) {
      breakdownData.push(["Reservation Fee", formatCurrency(calculation.reservationFee)])
    }
    if (calculation.governmentFees > 0) {
      breakdownData.push(["Government Fees", formatCurrency(calculation.governmentFees)])
    }
    if (calculation.constructionFees > 0) {
      breakdownData.push(["Construction Fees", formatCurrency(calculation.constructionFees)])
    }

    if (breakdownData.length > 0) {
      doc.autoTable({
        startY: yPos,
        head: [["Additional Fees", "Amount"]],
        body: breakdownData,
        theme: "grid",
        headStyles: { fillColor: [4, 0, 157] },
        margin: { left: margin, right: margin },
      })
    }

    // Down Payment Schedule table
    if (calculation.downPaymentSchedule && calculation.downPaymentSchedule.length > 0) {
      yPos = (doc as any).lastAutoTable.finalY + 15
      const dpScheduleData = calculation.downPaymentSchedule.map((item: DownPaymentScheduleItem) => [
        item.month,
        formatCurrency(item.payment),
        `${item.interestRate}%`,
        formatCurrency(item.balance),
      ])

      doc.autoTable({
        startY: yPos,
        head: [["Month", "Payment", "Interest Rate", "Balance"]],
        body: dpScheduleData,
        theme: "grid",
        headStyles: { fillColor: [100, 100, 100] }, // Grey color for DP schedule header
        margin: { left: margin, right: margin },
      })
    }

    // Footer
    const currentDate = new Date().toLocaleDateString()
    doc.setFontSize(10)
    doc.text(
      `Generated on ${currentDate} by Aman Group Loan Calculator`,
      pageWidth / 2,
      doc.internal.pageSize.height - 20,
      {
        align: "center",
      },
    )

    doc.save(`loan-calculation-${selectedProperty?.name || "property"}-${currentDate}.pdf`)
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

          {/* New: Down Payment Term dropdown */}
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
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                <TabsTrigger value="breakdown">Fees Breakdown</TabsTrigger>
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
                  {/* House Construction Cost Card */}
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-2xl font-bold">
                        {formatCurrency(selectedProperty?.houseConstructionPrice || 0)}
                      </div>
                      <p className="text-sm text-muted-foreground">House Construction Cost</p>
                    </CardContent>
                  </Card>
                  {/* Lot Cost Card */}
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

              {/* New Tab Content for Down Payment Schedule */}
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
              <Button onClick={exportToPDF} variant="outline" className="flex items-center gap-2 bg-transparent">
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
