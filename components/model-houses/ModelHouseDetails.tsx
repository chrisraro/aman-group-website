"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Home, Ruler, Bed, Bath, Car, MapPin, Calculator, Download, Eye, Calendar } from "lucide-react"
import { ScheduleViewingButton } from "@/components/shared/ScheduleViewingButton"
import { ContactButton } from "@/components/contact-button"
import { DownloadButton } from "@/components/download-button"
import { PdfViewer } from "@/components/pdf-viewer"
import type { ModelHouse, ModelHouseUnit } from "@/data/model-houses"

interface ModelHouseDetailsProps {
  modelHouse: ModelHouse
  unit: ModelHouseUnit
}

export function ModelHouseDetails({ modelHouse, unit }: ModelHouseDetailsProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [showPdfViewer, setShowPdfViewer] = useState(false)

  const images = unit.images || modelHouse.images || []
  const selectedImage = images[selectedImageIndex]

  // Calculate total property price
  const totalPropertyPrice = (unit.lotPrice || 0) + (unit.houseConstructionCost || 0)

  // Generate loan calculator URL with parameters
  const getLoanCalculatorUrl = () => {
    const params = new URLSearchParams({
      propertyId: unit.id,
      propertyType: "model-house",
      propertyName: `${modelHouse.name} - ${unit.name}`,
      propertyPrice: totalPropertyPrice.toString(),
      lotPrice: (unit.lotPrice || 0).toString(),
      houseConstructionCost: (unit.houseConstructionCost || 0).toString(),
      lotArea: (unit.lotArea || 0).toString(),
      floorArea: (unit.floorArea || 0).toString(),
    })
    return `/loan-calculator?${params.toString()}`
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-6">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href="/model-houses" className="text-muted-foreground hover:text-primary">
          Model Houses
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href={`/model-houses/${modelHouse.id}`} className="text-muted-foreground hover:text-primary">
          {modelHouse.name}
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">{unit.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Images and Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image */}
          <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
            {selectedImage ? (
              <Image
                src={selectedImage || "/placeholder.svg"}
                alt={`${modelHouse.name} - ${unit.name}`}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Home className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Image Thumbnails */}
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative aspect-video rounded-md overflow-hidden border-2 transition-colors ${
                    selectedImageIndex === index ? "border-primary" : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={`${modelHouse.name} thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Property Details Tabs */}
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-5 w-5" />
                    Property Specifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Ruler className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Lot Area: {unit.lotArea} sqm</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Floor Area: {unit.floorArea} sqm</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Bed className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unit.bedrooms} Bedrooms</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{unit.bathrooms} Bathrooms</span>
                    </div>
                    {unit.carport && (
                      <div className="flex items-center gap-2">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">Carport</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {unit.description && (
                <Card>
                  <CardHeader>
                    <CardTitle>Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{unit.description}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="features" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Features & Amenities</CardTitle>
                </CardHeader>
                <CardContent>
                  {unit.features && unit.features.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {unit.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-primary rounded-full" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No specific features listed.</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="location" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Location
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    {modelHouse.location || "Location details will be provided upon inquiry."}
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column - Pricing and Actions */}
        <div className="lg:col-span-1">
          <div className="sticky top-6 space-y-6">
            {/* Property Info Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">{modelHouse.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{unit.name}</Badge>
                  {unit.status && (
                    <Badge variant={unit.status === "available" ? "default" : "secondary"}>{unit.status}</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Pricing Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">Lot Price:</span>
                    <span className="font-medium">₱{(unit.lotPrice || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">House Construction:</span>
                    <span className="font-medium">₱{(unit.houseConstructionCost || 0).toLocaleString()}</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Property Price:</span>
                    <span className="text-xl font-bold text-primary">₱{totalPropertyPrice.toLocaleString()}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <Link href={getLoanCalculatorUrl()} className="w-full">
                    <Button className="w-full" size="lg">
                      <Calculator className="h-4 w-4 mr-2" />
                      Calculate Loan
                    </Button>
                  </Link>

                  <ScheduleViewingButton
                    propertyType="Model House"
                    propertyName={`${modelHouse.name} - ${unit.name}`}
                    className="w-full"
                    variant="outline"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule Viewing
                  </ScheduleViewingButton>

                  <ContactButton
                    subject={`Inquiry about ${modelHouse.name} - ${unit.name}`}
                    className="w-full"
                    variant="outline"
                  >
                    Contact Us
                  </ContactButton>
                </div>

                {/* Downloads */}
                {(unit.floorPlanPdf || unit.brochurePdf) && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Downloads:</h4>
                    <div className="space-y-2">
                      {unit.floorPlanPdf && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => setShowPdfViewer(true)} className="flex-1">
                            <Eye className="h-4 w-4 mr-2" />
                            View Floor Plan
                          </Button>
                          <DownloadButton
                            fileUrl={unit.floorPlanPdf}
                            fileName={`${modelHouse.name}-${unit.name}-floor-plan.pdf`}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </DownloadButton>
                        </div>
                      )}
                      {unit.brochurePdf && (
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(unit.brochurePdf, "_blank")}
                            className="flex-1"
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Brochure
                          </Button>
                          <DownloadButton
                            fileUrl={unit.brochurePdf}
                            fileName={`${modelHouse.name}-${unit.name}-brochure.pdf`}
                            variant="outline"
                            size="sm"
                          >
                            <Download className="h-4 w-4" />
                          </DownloadButton>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* PDF Viewer Modal */}
      {showPdfViewer && unit.floorPlanPdf && (
        <PdfViewer
          pdfUrl={unit.floorPlanPdf}
          title={`${modelHouse.name} - ${unit.name} Floor Plan`}
          onClose={() => setShowPdfViewer(false)}
        />
      )}
    </div>
  )
}
