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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Calculator, Plus, Edit, Trash2, Settings, Percent, Calendar, DollarSign } from "lucide-react"
import type { FinancingOption, PaymentTerm, DownPaymentTerm } from "@/types/loan-calculator"

// Mock data - in real app this would come from your storage
const mockFinancingOptions = [
  {
    id: "1",
    name: "In-House Financing",
    value: "in-house" as FinancingOption,
    description: "Direct financing from Aman Group",
    interestRates: { 5: 8.5, 10: 9.5, 15: 10.5 },
    availableTerms: [5, 10, 15] as PaymentTerm[],
    isActive: true,
  },
  {
    id: "2",
    name: "In-House Bridge Financing",
    value: "in-house-bridge" as FinancingOption,
    description: "Bridge financing option",
    interestRates: { 5: 8.5, 10: 8.5, 15: 8.5 },
    availableTerms: [5, 10, 15] as PaymentTerm[],
    isActive: true,
  },
  {
    id: "3",
    name: "Pag-IBIG Financing",
    value: "pag-ibig" as FinancingOption,
    description: "Government housing loan program",
    interestRates: { 5: 6.25, 10: 6.25, 15: 6.25, 20: 6.25, 25: 6.25, 30: 6.25 },
    availableTerms: [5, 10, 15, 20, 25, 30] as PaymentTerm[],
    isActive: true,
  },
  {
    id: "4",
    name: "Bank Financing",
    value: "bank" as FinancingOption,
    description: "Traditional bank loan",
    interestRates: { 5: 7.5, 10: 7.5, 15: 7.5 },
    availableTerms: [5, 10, 15] as PaymentTerm[],
    isActive: true,
  },
]

const mockDownPaymentTerms = [
  {
    id: "1",
    name: "Lump Sum",
    value: 1 as DownPaymentTerm,
    description: "One-time payment",
    interestRate: 0,
    isActive: true,
    applicableFinancing: ["in-house", "in-house-bridge", "pag-ibig", "bank"] as FinancingOption[],
  },
  {
    id: "2",
    name: "3 Months",
    value: 3 as DownPaymentTerm,
    description: "3-month installment plan",
    interestRate: 2.0,
    isActive: true,
    applicableFinancing: ["in-house", "in-house-bridge"] as FinancingOption[],
  },
  {
    id: "3",
    name: "6 Months",
    value: 6 as DownPaymentTerm,
    description: "6-month installment plan",
    interestRate: 3.0,
    isActive: true,
    applicableFinancing: ["in-house", "in-house-bridge"] as FinancingOption[],
  },
  {
    id: "4",
    name: "12 Months",
    value: 12 as DownPaymentTerm,
    description: "12-month installment plan",
    interestRate: 4.0,
    isActive: true,
    applicableFinancing: ["in-house", "in-house-bridge"] as FinancingOption[],
  },
  {
    id: "5",
    name: "18 Months",
    value: 18 as DownPaymentTerm,
    description: "18-month installment plan",
    interestRate: 5.0,
    isActive: true,
    applicableFinancing: ["in-house"] as FinancingOption[],
  },
  {
    id: "6",
    name: "24 Months",
    value: 24 as DownPaymentTerm,
    description: "24-month installment plan",
    interestRate: 6.0,
    isActive: true,
    applicableFinancing: ["in-house"] as FinancingOption[],
  },
  {
    id: "7",
    name: "36 Months",
    value: 36 as DownPaymentTerm,
    description: "36-month installment plan",
    interestRate: 7.0,
    isActive: false,
    applicableFinancing: ["in-house"] as FinancingOption[],
  },
]

export default function LoanCalculatorAdmin() {
  const [financingOptions, setFinancingOptions] = useState(mockFinancingOptions)
  const [downPaymentTerms, setDownPaymentTerms] = useState(mockDownPaymentTerms)
  const [isEditingFinancing, setIsEditingFinancing] = useState(false)
  const [isEditingDownPayment, setIsEditingDownPayment] = useState(false)
  const [editingItem, setEditingItem] = useState<any>(null)

  const toggleFinancingStatus = (id: string) => {
    setFinancingOptions((prev) =>
      prev.map((option) => (option.id === id ? { ...option, isActive: !option.isActive } : option)),
    )
  }

  const toggleDownPaymentStatus = (id: string) => {
    setDownPaymentTerms((prev) => prev.map((term) => (term.id === id ? { ...term, isActive: !term.isActive } : term)))
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
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financing Options</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financingOptions.filter((f) => f.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{financingOptions.length} total options</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Down Payment Terms</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{downPaymentTerms.filter((d) => d.isActive).length}</div>
            <p className="text-xs text-muted-foreground">{downPaymentTerms.length} total terms</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Interest Rates</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.25%</div>
            <p className="text-xs text-muted-foreground">Lowest available rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Max Term</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30</div>
            <p className="text-xs text-muted-foreground">Years maximum</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="financing" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="financing">Financing Options</TabsTrigger>
          <TabsTrigger value="downpayment">Down Payment Terms</TabsTrigger>
          <TabsTrigger value="settings">Calculator Settings</TabsTrigger>
        </TabsList>

        {/* Financing Options Tab */}
        <TabsContent value="financing" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Financing Options</CardTitle>
                <CardDescription>Manage available financing options and their interest rates</CardDescription>
              </div>
              <Dialog open={isEditingFinancing} onOpenChange={setIsEditingFinancing}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Financing Option" : "Add Financing Option"}</DialogTitle>
                    <DialogDescription>
                      Configure the financing option details and interest rates for different terms.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Option Name</Label>
                        <Input id="name" placeholder="e.g., Bank Financing" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="value">Option Value</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select value" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="in-house">in-house</SelectItem>
                            <SelectItem value="in-house-bridge">in-house-bridge</SelectItem>
                            <SelectItem value="pag-ibig">pag-ibig</SelectItem>
                            <SelectItem value="bank">bank</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" placeholder="Brief description of the financing option" />
                    </div>
                    <div className="space-y-2">
                      <Label>Interest Rates by Term</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <Label htmlFor="rate5" className="text-xs">
                            5 Years
                          </Label>
                          <Input id="rate5" type="number" step="0.01" placeholder="8.5" />
                        </div>
                        <div>
                          <Label htmlFor="rate10" className="text-xs">
                            10 Years
                          </Label>
                          <Input id="rate10" type="number" step="0.01" placeholder="9.5" />
                        </div>
                        <div>
                          <Label htmlFor="rate15" className="text-xs">
                            15 Years
                          </Label>
                          <Input id="rate15" type="number" step="0.01" placeholder="10.5" />
                        </div>
                        <div>
                          <Label htmlFor="rate20" className="text-xs">
                            20 Years
                          </Label>
                          <Input id="rate20" type="number" step="0.01" placeholder="11.0" />
                        </div>
                        <div>
                          <Label htmlFor="rate25" className="text-xs">
                            25 Years
                          </Label>
                          <Input id="rate25" type="number" step="0.01" placeholder="11.5" />
                        </div>
                        <div>
                          <Label htmlFor="rate30" className="text-xs">
                            30 Years
                          </Label>
                          <Input id="rate30" type="number" step="0.01" placeholder="12.0" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditingFinancing(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsEditingFinancing(false)}>
                      {editingItem ? "Update" : "Create"} Option
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {financingOptions.map((option) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(option)
                          setIsEditingFinancing(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Down Payment Terms</CardTitle>
                <CardDescription>Manage down payment installment options and their interest rates</CardDescription>
              </div>
              <Dialog open={isEditingDownPayment} onOpenChange={setIsEditingDownPayment}>
                <DialogTrigger asChild>
                  <Button onClick={() => setEditingItem(null)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Term
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingItem ? "Edit Down Payment Term" : "Add Down Payment Term"}</DialogTitle>
                    <DialogDescription>
                      Configure the down payment term details and applicable financing options.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="termName">Term Name</Label>
                        <Input id="termName" placeholder="e.g., 12 Months" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="termValue">Term (Months)</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1 Month</SelectItem>
                            <SelectItem value="3">3 Months</SelectItem>
                            <SelectItem value="6">6 Months</SelectItem>
                            <SelectItem value="12">12 Months</SelectItem>
                            <SelectItem value="18">18 Months</SelectItem>
                            <SelectItem value="24">24 Months</SelectItem>
                            <SelectItem value="36">36 Months</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="termDescription">Description</Label>
                      <Input id="termDescription" placeholder="Brief description of the payment term" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="interestRate">Interest Rate (%)</Label>
                      <Input id="interestRate" type="number" step="0.01" placeholder="4.0" />
                    </div>
                    <div className="space-y-2">
                      <Label>Applicable Financing Options</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="in-house" />
                          <Label htmlFor="in-house" className="text-sm">
                            In-House
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="in-house-bridge" />
                          <Label htmlFor="in-house-bridge" className="text-sm">
                            In-House Bridge
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="pag-ibig" />
                          <Label htmlFor="pag-ibig" className="text-sm">
                            Pag-IBIG
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <input type="checkbox" id="bank" />
                          <Label htmlFor="bank" className="text-sm">
                            Bank
                          </Label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsEditingDownPayment(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsEditingDownPayment(false)}>
                      {editingItem ? "Update" : "Create"} Term
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {downPaymentTerms.map((term) => (
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingItem(term)
                          setIsEditingDownPayment(true)
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
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
                    <Select defaultValue="in-house">
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
                    <Select defaultValue="5">
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
                    <Select defaultValue="12">
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
                    <Input id="defaultDownPaymentPercentage" type="number" defaultValue="20" />
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
                    <Input id="minDownPayment" type="number" defaultValue="5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxDownPayment">Maximum Down Payment %</Label>
                    <Input id="maxDownPayment" type="number" defaultValue="50" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minPropertyPrice">Minimum Property Price</Label>
                    <Input id="minPropertyPrice" type="number" defaultValue="1000000" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxPropertyPrice">Maximum Property Price</Label>
                    <Input id="maxPropertyPrice" type="number" defaultValue="50000000" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button>Save Settings</Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
