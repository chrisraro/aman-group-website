"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Calculator, Settings, Calendar, DollarSign, Loader2, RefreshCw, Save } from "lucide-react"
import type { FinancingOption, PaymentTerm, DownPaymentTerm } from "@/types/loan-calculator"
import { useLoanCalculatorSettings } from "@/lib/hooks/useLoanCalculatorSettings"

export default function LoanCalculatorAdmin() {
  const { settings, loading, error, saveSettings, updateSettings, resetSettings, refetch } = useLoanCalculatorSettings()

  const { toast } = useToast()
  const [isEditingFinancing, setIsEditingFinancing] = useState(false)
  const [isEditingDownPayment, setIsEditingDownPayment] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Form states for fees and settings
  const [reservationFees, setReservationFees] = useState({
    modelHouse: settings.reservationFees.modelHouse,
    lotOnly: settings.reservationFees.lotOnly,
    isActive: settings.reservationFees.isActive,
  })

  const [governmentFees, setGovernmentFees] = useState({
    fixedAmountThreshold: settings.governmentFeesConfig.fixedAmountThreshold,
    fixedAmount: settings.governmentFeesConfig.fixedAmount,
    percentageRate: settings.governmentFeesConfig.percentageRate,
    isActive: settings.governmentFeesConfig.isActive,
  })

  const [specialRules, setSpecialRules] = useState({
    isActive: settings.specialDownPaymentRules.twentyPercentRule.isActive,
    firstYearRate: settings.specialDownPaymentRules.twentyPercentRule.firstYearInterestRate,
    subsequentYearRate: settings.specialDownPaymentRules.twentyPercentRule.subsequentYearInterestRate,
    applicableTerms: settings.specialDownPaymentRules.twentyPercentRule.applicableTerms,
  })

  const [defaultSettings, setDefaultSettings] = useState({
    defaultFinancingOption: settings.defaultSettings.defaultFinancingOption,
    defaultPaymentTerm: settings.defaultSettings.defaultPaymentTerm,
    defaultDownPaymentTerm: settings.defaultSettings.defaultDownPaymentTerm,
    defaultDownPaymentPercentage: settings.defaultSettings.defaultDownPaymentPercentage,
    minimumDownPaymentPercentage: settings.defaultSettings.minimumDownPaymentPercentage,
    maximumDownPaymentPercentage: settings.defaultSettings.maximumDownPaymentPercentage,
  })

  // Update form states when settings change
  useState(() => {
    setReservationFees({
      modelHouse: settings.reservationFees.modelHouse,
      lotOnly: settings.reservationFees.lotOnly,
      isActive: settings.reservationFees.isActive,
    })
    setGovernmentFees({
      fixedAmountThreshold: settings.governmentFeesConfig.fixedAmountThreshold,
      fixedAmount: settings.governmentFeesConfig.fixedAmount,
      percentageRate: settings.governmentFeesConfig.percentageRate,
      isActive: settings.governmentFeesConfig.isActive,
    })
    setSpecialRules({
      isActive: settings.specialDownPaymentRules.twentyPercentRule.isActive,
      firstYearRate: settings.specialDownPaymentRules.twentyPercentRule.firstYearInterestRate,
      subsequentYearRate: settings.specialDownPaymentRules.twentyPercentRule.subsequentYearInterestRate,
      applicableTerms: settings.specialDownPaymentRules.twentyPercentRule.applicableTerms,
    })
    setDefaultSettings({
      defaultFinancingOption: settings.defaultSettings.defaultFinancingOption,
      defaultPaymentTerm: settings.defaultSettings.defaultPaymentTerm,
      defaultDownPaymentTerm: settings.defaultSettings.defaultDownPaymentTerm,
      defaultDownPaymentPercentage: settings.defaultSettings.defaultDownPaymentPercentage,
      minimumDownPaymentPercentage: settings.defaultSettings.minimumDownPaymentPercentage,
      maximumDownPaymentPercentage: settings.defaultSettings.maximumDownPaymentPercentage,
    })
  })

  const toggleFinancingStatus = async (id: string) => {
    const updatedOptions = settings.financingOptions.map((option) =>
      option.id === id ? { ...option, isActive: !option.isActive } : option,
    )

    const result = await updateSettings({
      financingOptions: updatedOptions,
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Financing option updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update financing option",
        variant: "destructive",
      })
    }
  }

  const toggleDownPaymentStatus = async (id: string) => {
    const updatedTerms = settings.downPaymentTerms.map((term) =>
      term.id === id ? { ...term, isActive: !term.isActive } : term,
    )

    const result = await updateSettings({
      downPaymentTerms: updatedTerms,
    })

    if (result.success) {
      toast({
        title: "Success",
        description: "Down payment term updated successfully",
      })
    } else {
      toast({
        title: "Error",
        description: result.error || "Failed to update down payment term",
        variant: "destructive",
      })
    }
  }

  const saveFeesConfiguration = async () => {
    setIsSaving(true)
    try {
      const result = await updateSettings({
        reservationFees: reservationFees,
        governmentFeesConfig: governmentFees,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Fees configuration saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save fees configuration",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const saveSpecialRules = async () => {
    setIsSaving(true)
    try {
      const result = await updateSettings({
        specialDownPaymentRules: {
          twentyPercentRule: {
            isActive: specialRules.isActive,
            firstYearInterestRate: specialRules.firstYearRate,
            subsequentYearInterestRate: specialRules.subsequentYearRate,
            applicableTerms: specialRules.applicableTerms,
          },
        },
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Special rules saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save special rules",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const saveDefaultSettings = async () => {
    setIsSaving(true)
    try {
      const result = await updateSettings({
        defaultSettings: defaultSettings,
      })

      if (result.success) {
        toast({
          title: "Success",
          description: "Default settings saved successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to save default settings",
          variant: "destructive",
        })
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetSettings = async () => {
    if (confirm("Are you sure you want to reset all settings to default? This action cannot be undone.")) {
      const result = await resetSettings()

      if (result.success) {
        toast({
          title: "Success",
          description: "Settings reset to default successfully",
        })
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to reset settings",
          variant: "destructive",
        })
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Loading loan calculator settings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">Error loading settings: {error}</p>
        <Button onClick={refetch} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <Calculator className="mr-3 h-8 w-8 text-primary" />
            Loan Calculator Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure financing options, payment terms, and calculator settings
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={refetch} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={handleResetSettings} variant="outline" size="sm">
            Reset to Default
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financing Options</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.financingOptions.filter((f) => f.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{settings.financingOptions.length} total options</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Down Payment Terms</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{settings.downPaymentTerms.filter((d) => d.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{settings.downPaymentTerms.length} total terms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reservation Fees</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₱{reservationFees.modelHouse.toLocaleString()} / ₱{reservationFees.lotOnly.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">Model House / Lot Only</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Special Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{specialRules.isActive ? "Active" : "Inactive"}</div>
            <p className="text-xs text-muted-foreground">20% down payment rule</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="financing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="financing">Financing Options</TabsTrigger>
          <TabsTrigger value="downpayment">Down Payment Terms</TabsTrigger>
          <TabsTrigger value="fees">Fees & Taxes</TabsTrigger>
          <TabsTrigger value="special-rules">Special Rules</TabsTrigger>
          <TabsTrigger value="settings">Calculator Settings</TabsTrigger>
        </TabsList>

        {/* Financing Options Tab */}
        <TabsContent value="financing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Financing Options</CardTitle>
              <CardDescription>Manage available financing options and their interest rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.financingOptions.map((option) => (
                  <div key={option.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{option.name}</h3>
                        <Badge variant={option.isActive ? "default" : "secondary"}>
                          {option.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {option.availableTerms.map((term) => (
                          <Badge key={term} variant="outline" className="text-xs">
                            {term}yr: {option.interestRates[term]}%
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={option.isActive} onCheckedChange={() => toggleFinancingStatus(option.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Down Payment Terms Tab */}
        <TabsContent value="downpayment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Down Payment Terms</CardTitle>
              <CardDescription>Manage down payment installment options and their interest rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {settings.downPaymentTerms.map((term) => (
                  <div key={term.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{term.name}</h3>
                        <Badge variant={term.isActive ? "default" : "secondary"}>
                          {term.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{term.interestRate}% interest</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{term.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {term.applicableFinancing.map((financing) => (
                          <Badge key={financing} variant="outline" className="text-xs">
                            {financing}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch checked={term.isActive} onCheckedChange={() => toggleDownPaymentStatus(term.id)} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fees & Taxes Tab */}
        <TabsContent value="fees" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reservation Fees</CardTitle>
                <CardDescription>Configure reservation fees for different property types</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="modelHouseReservation">Model House Reservation Fee</Label>
                    <Input
                      id="modelHouseReservation"
                      type="number"
                      value={reservationFees.modelHouse}
                      onChange={(e) =>
                        setReservationFees((prev) => ({
                          ...prev,
                          modelHouse: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lotOnlyReservation">Lot Only Reservation Fee</Label>
                    <Input
                      id="lotOnlyReservation"
                      type="number"
                      value={reservationFees.lotOnly}
                      onChange={(e) =>
                        setReservationFees((prev) => ({
                          ...prev,
                          lotOnly: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="reservationActive"
                    checked={reservationFees.isActive}
                    onCheckedChange={(checked) =>
                      setReservationFees((prev) => ({
                        ...prev,
                        isActive: checked,
                      }))
                    }
                  />
                  <Label htmlFor="reservationActive">Enable reservation fees</Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Government Fees & Taxes</CardTitle>
                <CardDescription>Configure government fees and taxes calculation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="fixedAmountThreshold">Fixed Amount Threshold</Label>
                    <Input
                      id="fixedAmountThreshold"
                      type="number"
                      value={governmentFees.fixedAmountThreshold}
                      onChange={(e) =>
                        setGovernmentFees((prev) => ({
                          ...prev,
                          fixedAmountThreshold: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">Properties ≥ this amount use fixed fee</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fixedAmount">Fixed Amount</Label>
                    <Input
                      id="fixedAmount"
                      type="number"
                      value={governmentFees.fixedAmount}
                      onChange={(e) =>
                        setGovernmentFees((prev) => ({
                          ...prev,
                          fixedAmount: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">Fixed fee for properties ≥ threshold</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="percentageRate">Percentage Rate (%)</Label>
                    <Input
                      id="percentageRate"
                      type="number"
                      step="0.1"
                      value={governmentFees.percentageRate}
                      onChange={(e) =>
                        setGovernmentFees((prev) => ({
                          ...prev,
                          percentageRate: Number(e.target.value),
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground">Percentage for properties &lt; threshold</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="governmentFeesActive"
                    checked={governmentFees.isActive}
                    onCheckedChange={(checked) =>
                      setGovernmentFees((prev) => ({
                        ...prev,
                        isActive: checked,
                      }))
                    }
                  />
                  <Label htmlFor="governmentFeesActive">Enable government fees & taxes</Label>
                </div>

                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium mb-2">Calculation Logic:</h4>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>
                      • If property price ≥ {governmentFees.fixedAmountThreshold.toLocaleString()}: Add fixed ₱
                      {governmentFees.fixedAmount.toLocaleString()}
                    </p>
                    <p>
                      • If property price &lt; {governmentFees.fixedAmountThreshold.toLocaleString()}: Add{" "}
                      {governmentFees.percentageRate}% of property price
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveFeesConfiguration} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Fees Configuration
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Special Rules Tab */}
        <TabsContent value="special-rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>20% Down Payment Special Rule</CardTitle>
              <CardDescription>Configure special interest rates for 20% down payments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Switch
                  id="twentyPercentRuleActive"
                  checked={specialRules.isActive}
                  onCheckedChange={(checked) =>
                    setSpecialRules((prev) => ({
                      ...prev,
                      isActive: checked,
                    }))
                  }
                />
                <Label htmlFor="twentyPercentRuleActive">Enable 20% down payment special rule</Label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstYearRate">First Year Interest Rate (%)</Label>
                  <Input
                    id="firstYearRate"
                    type="number"
                    step="0.1"
                    value={specialRules.firstYearRate}
                    onChange={(e) =>
                      setSpecialRules((prev) => ({
                        ...prev,
                        firstYearRate: Number(e.target.value),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Interest rate for first 12 months</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subsequentYearRate">Subsequent Years Interest Rate (%)</Label>
                  <Input
                    id="subsequentYearRate"
                    type="number"
                    step="0.1"
                    value={specialRules.subsequentYearRate}
                    onChange={(e) =>
                      setSpecialRules((prev) => ({
                        ...prev,
                        subsequentYearRate: Number(e.target.value),
                      }))
                    }
                  />
                  <p className="text-xs text-muted-foreground">Interest rate for months 13 onwards</p>
                </div>
              </div>

              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium mb-2">Rule Logic:</h4>
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>
                    • <strong>Option 1:</strong> 12 months at {specialRules.firstYearRate}% interest (when down payment
                    = 20%)
                  </p>
                  <p>
                    • <strong>Option 2:</strong> First year at {specialRules.firstYearRate}%, subsequent years at{" "}
                    {specialRules.subsequentYearRate}% (when down payment = 20%)
                  </p>
                  <p>• Rule only applies when down payment percentage is exactly 20%</p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={saveSpecialRules} disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Special Rules
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Calculator Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Default Calculator Settings</CardTitle>
                <CardDescription>Configure the default values for the loan calculator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="defaultFinancing">Default Financing Option</Label>
                    <Select
                      value={defaultSettings.defaultFinancingOption}
                      onValueChange={(value) =>
                        setDefaultSettings((prev) => ({
                          ...prev,
                          defaultFinancingOption: value as FinancingOption,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="in-house">In-House Financing</SelectItem>
                        <SelectItem value="in-house-bridge">In-House Bridge</SelectItem>
                        <SelectItem value="pag-ibig">Pag-IBIG</SelectItem>
                        <SelectItem value="bank">Bank Financing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultPaymentTerm">Default Payment Term</Label>
                    <Select
                      value={defaultSettings.defaultPaymentTerm.toString()}
                      onValueChange={(value) =>
                        setDefaultSettings((prev) => ({
                          ...prev,
                          defaultPaymentTerm: Number(value) as PaymentTerm,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 Years</SelectItem>
                        <SelectItem value="10">10 Years</SelectItem>
                        <SelectItem value="15">15 Years</SelectItem>
                        <SelectItem value="20">20 Years</SelectItem>
                        <SelectItem value="25">25 Years</SelectItem>
                        <SelectItem value="30">30 Years</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDownPaymentTerm">Default Down Payment Term</Label>
                    <Select
                      value={defaultSettings.defaultDownPaymentTerm.toString()}
                      onValueChange={(value) =>
                        setDefaultSettings((prev) => ({
                          ...prev,
                          defaultDownPaymentTerm: Number(value) as DownPaymentTerm,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">Lump Sum</SelectItem>
                        <SelectItem value="3">3 Months</SelectItem>
                        <SelectItem value="6">6 Months</SelectItem>
                        <SelectItem value="12">12 Months</SelectItem>
                        <SelectItem value="18">18 Months</SelectItem>
                        <SelectItem value="24">24 Months</SelectItem>
                        <SelectItem value="36">36 Months</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="defaultDownPaymentPercentage">Default Down Payment %</Label>
                    <Input
                      id="defaultDownPaymentPercentage"
                      type="number"
                      value={defaultSettings.defaultDownPaymentPercentage}
                      onChange={(e) =>
                        setDefaultSettings((prev) => ({
                          ...prev,
                          defaultDownPaymentPercentage: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Calculator Constraints</CardTitle>
                <CardDescription>Set minimum and maximum values for the calculator</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="minDownPayment">Minimum Down Payment %</Label>
                    <Input
                      id="minDownPayment"
                      type="number"
                      value={defaultSettings.minimumDownPaymentPercentage}
                      onChange={(e) =>
                        setDefaultSettings((prev) => ({
                          ...prev,
                          minimumDownPaymentPercentage: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDownPayment">Maximum Down Payment %</Label>
                    <Input
                      id="maxDownPayment"
                      type="number"
                      value={defaultSettings.maximumDownPaymentPercentage}
                      onChange={(e) =>
                        setDefaultSettings((prev) => ({
                          ...prev,
                          maximumDownPaymentPercentage: Number(e.target.value),
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button onClick={saveDefaultSettings} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
