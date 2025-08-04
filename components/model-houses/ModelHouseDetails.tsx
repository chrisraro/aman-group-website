"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calculator, Calendar, Check, MapPin } from "lucide-react"
import { formatNumberWithCommas } from "@/lib/utils/format-utils"
import { ScheduleViewingButton } from "@/components/shared/ScheduleViewingButton"
import Link from "next/link"

interface ModelHouseDetailsProps {
  modelHouse: {
    id: string
    name: string
    description: string
    location: string
    developer: string
    developerColor: string
    features: string[]
    imageUrl?: string
  }
  unit: {
    id: string
    name: string
    price: number
    lotPrice: number
    houseConstructionCost: number
    lotArea: string
    floorArea: string
    bedrooms: number
    bathrooms: number
    carport: number
    status: string
    features?: string[]
  }
}

const ModelHouseDetails: React.FC<ModelHouseDetailsProps> = ({ modelHouse, unit }) => {
  // Calculate total price for loan calculator
  const totalPrice = unit.price
  const modelName = `${modelHouse.name} - ${unit.name}`

  // Create URL parameters for loan calculator
  const loanCalculatorParams = new URLSearchParams({
    propertyId: `${modelHouse.id}-${unit.id}`,
    propertyType: "model-house",
    propertyName: modelName,
    propertyPrice: totalPrice.toString(),
    lotPrice: unit.lotPrice.toString(),
    houseConstructionCost: unit.houseConstructionCost.toString(),
  })

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{modelName}</h1>
              <div className="flex items-center mb-3 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{modelHouse.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge
                  className="text-sm"
                  style={{
                    backgroundColor: unit.status === "Available" ? "rgb(22, 163, 74)" : "rgb(234, 88, 12)",
                    color: "white",
                  }}
                >
                  {unit.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-sm"
                  style={{
                    backgroundColor: `${modelHouse.developerColor}20`,
                    borderColor: modelHouse.developerColor,
                    color: modelHouse.developerColor,
                  }}
                >
                  {modelHouse.developer}
                </Badge>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[320px]">
              <ScheduleViewingButton
                propertyName={modelName}
                propertyType="Model House"
                className="h-12 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 flex-1"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Viewing</span>
              </ScheduleViewingButton>

              <Button
                asChild
                className="h-12 border-gray-300 hover:bg-gray-50 hover:border-gray-400 flex items-center justify-center gap-2 flex-1 bg-transparent"
                variant="outline"
              >
                <Link href={`/loan-calculator?${loanCalculatorParams.toString()}`}>
                  <Calculator className="h-4 w-4" />
                  <span>Calculate Loan</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Images and Description */}
          <div className="lg:col-span-2 space-y-8">
            {/* Image Gallery */}
            <div className="aspect-video bg-muted rounded-lg overflow-hidden">
              {unit.imageUrl || modelHouse.imageUrl ? (
                <img
                  src={unit.imageUrl || modelHouse.imageUrl || "/placeholder.svg"}
                  alt={modelName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Property Description</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{modelHouse.description}</p>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">Features & Amenities</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {modelHouse.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
                {unit.features?.map((feature, index) => (
                  <div key={`unit-${index}`} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Property Details */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-xl">Property Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Pricing Information */}
                <div className="space-y-4">
                  <div className="text-center p-4 bg-primary/5 rounded-lg border">
                    <div className="text-2xl font-bold text-primary mb-1">₱{formatNumberWithCommas(totalPrice)}</div>
                    <div className="text-sm text-muted-foreground">Total Package Price</div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">₱{formatNumberWithCommas(unit.lotPrice)}</div>
                      <div className="text-muted-foreground">Lot Price</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded-lg">
                      <div className="font-semibold text-lg">₱{formatNumberWithCommas(unit.houseConstructionCost)}</div>
                      <div className="text-muted-foreground">House Cost</div>
                    </div>
                  </div>
                </div>

                {/* Property Specifications */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-lg">Specifications</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Lot Area:</span>
                      <span className="font-medium">{unit.lotArea}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Floor Area:</span>
                      <span className="font-medium">{unit.floorArea}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Bedrooms:</span>
                      <span className="font-medium">{unit.bedrooms}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Bathrooms:</span>
                      <span className="font-medium">{unit.bathrooms}</span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-gray-100">
                      <span className="text-muted-foreground">Carport:</span>
                      <span className="font-medium">{unit.carport}</span>
                    </div>
                    <div className="flex justify-between items-center py-2">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        style={{
                          backgroundColor: unit.status === "Available" ? "rgb(22, 163, 74)" : "rgb(234, 88, 12)",
                          color: "white",
                        }}
                      >
                        {unit.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Call to Action */}
                <div className="pt-4 border-t border-gray-200">
                  <Button asChild className="w-full h-12 bg-primary hover:bg-primary/90 text-white mb-3">
                    <Link href={`/loan-calculator?${loanCalculatorParams.toString()}`}>
                      <Calculator className="h-4 w-4 mr-2" />
                      Get Loan Quotation
                    </Link>
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    Calculate your monthly payments and get a detailed quotation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}

export default ModelHouseDetails
