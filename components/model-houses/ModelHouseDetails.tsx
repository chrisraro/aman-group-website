"use client"

import type React from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, Home, MapPin, Ruler, DollarSign } from "lucide-react"
import { formatCurrency } from "@/lib/loan-calculations"

interface ModelHouseDetailsProps {
  modelHouse: any
  unit: any
}

const ModelHouseDetails: React.FC<ModelHouseDetailsProps> = ({ modelHouse, unit }) => {
  const router = useRouter()

  const handleLoanCalculatorRedirect = () => {
    // Create URL parameters for the loan calculator
    const params = new URLSearchParams({
      propertyPrice: unit.price?.toString() || "0",
      propertyType: "model-house",
      lotPrice: unit.lotPrice?.toString() || "0",
      houseConstructionCost: unit.houseConstructionCost?.toString() || "0",
      propertyName: `${modelHouse.name} - ${unit.name}`,
      propertyId: unit.id || "",
      seriesId: modelHouse.id || "",
    })

    router.push(`/loan-calculator?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl md:text-3xl font-bold text-gray-900">
                {modelHouse.name} - {unit.name}
              </CardTitle>
              <p className="text-muted-foreground mt-2">{modelHouse.description}</p>
            </div>
            <Badge variant="secondary" className="w-fit">
              Model House
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Property Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-primary" />
            </div>
            <div className="text-2xl font-bold text-primary mb-1">{formatCurrency(unit.price || 0)}</div>
            <p className="text-sm text-muted-foreground">Total Unit Price</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-3">
              <MapPin className="h-6 w-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-blue-600 mb-1">{formatCurrency(unit.lotPrice || 0)}</div>
            <p className="text-sm text-muted-foreground">Lot Price</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-3">
              <Home className="h-6 w-6 text-green-600" />
            </div>
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatCurrency(unit.houseConstructionCost || 0)}
            </div>
            <p className="text-sm text-muted-foreground">House Construction</p>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-3">
              <Ruler className="h-6 w-6 text-orange-600" />
            </div>
            <div className="text-2xl font-bold text-orange-600 mb-1">{unit.lotArea || "N/A"} sqm</div>
            <p className="text-sm text-muted-foreground">Lot Area</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Details */}
      {(unit.bedrooms || unit.bathrooms || unit.carport) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Unit Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              {unit.bedrooms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bedrooms:</span>
                  <span className="font-medium">{unit.bedrooms}</span>
                </div>
              )}
              {unit.bathrooms && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bathrooms:</span>
                  <span className="font-medium">{unit.bathrooms}</span>
                </div>
              )}
              {unit.carport && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Carport:</span>
                  <span className="font-medium">{unit.carport ? "Yes" : "No"}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loan Calculator Button */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mx-auto">
              <Calculator className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-2">Calculate Your Monthly Payments</h3>
              <p className="text-muted-foreground mb-4">
                Get an instant estimate of your monthly payments and explore financing options for this property.
              </p>
            </div>
            <Button
              onClick={handleLoanCalculatorRedirect}
              size="lg"
              className="w-full sm:w-auto px-8 py-3 text-lg font-semibold"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Calculate Loan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ModelHouseDetails
