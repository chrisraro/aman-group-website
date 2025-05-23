"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { LoanCalculatorButton } from "@/components/loan-calculator-button"
import { PDFViewer } from "@/components/pdf-viewer"
import { Badge } from "@/components/ui/badge"
import ScheduleViewingButton from "@/components/shared/ScheduleViewingButton"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { ModelHouseSeries, ModelHouseUnit } from "@/lib/hooks/useModelHouses"

export default function ModelHouseUnitPage({
  params,
}: {
  params: { seriesId: string; unitId: string }
}) {
  const { seriesId, unitId } = params
  const { getModelHouseSeriesById, getModelHouseUnitById, isLoading, error, refreshData } = useModelHousesContext()
  const [series, setSeries] = useState<ModelHouseSeries | null>(null)
  const [unit, setUnit] = useState<ModelHouseUnit | null>(null)

  useEffect(() => {
    setSeries(getModelHouseSeriesById(seriesId))
    setUnit(getModelHouseUnitById(seriesId, unitId))
  }, [seriesId, unitId, getModelHouseSeriesById, getModelHouseUnitById])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading model house unit...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error.message || "There was a problem loading the model house unit."}</AlertDescription>
        </Alert>
        <Button onClick={refreshData}>Try Again</Button>
      </div>
    )
  }

  if (!series || !unit) {
    return <div className="container mx-auto px-4 py-12">Model house unit not found</div>
  }

  // Define status color classes
  const statusColorClass = unit.status === "Fully Constructed" ? "bg-[#65932D]" : "bg-[#f59e0b]"
  const progressBarClass = "bg-primary"

  // For progress bar
  const progressWidthClass = unit.constructionProgress
    ? unit.constructionProgress <= 25
      ? "w-1/4"
      : unit.constructionProgress <= 50
        ? "w-1/2"
        : unit.constructionProgress <= 75
          ? "w-3/4"
          : "w-full"
    : "w-0"

  // Create query parameters for the contact form
  const contactQueryParams = new URLSearchParams({
    propertyInterest: unit.isRFO ? "Ready for Occupancy" : "Model House",
    modelHousesSeries: seriesId,
    projectLocation: series.project,
    unitId: unitId,
  }).toString()

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href="/model-houses" className="text-muted-foreground hover:text-primary">
          Model House Series
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <Link href={`/model-houses/${seriesId}`} className="text-muted-foreground hover:text-primary">
          {series.name}
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">{unit.name}</span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link href={`/model-houses/${seriesId}`}>
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to {series.name}
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-[400px]">
            <Image
              src={unit.imageUrl || `/placeholder.svg?height=800&width=800&text=${series.name}+${unit.name}`}
              alt={`${series.name} ${unit.name}`}
              fill
              className="object-cover"
            />
            {unit.isRFO && (
              <div className={cn("absolute top-0 right-0 px-3 py-1 font-semibold text-white", statusColorClass)}>
                {unit.status}
              </div>
            )}
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">{unit.name}</h1>
                <p className="text-lg text-muted-foreground">{series.name}</p>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                ₱{unit.price.toLocaleString()}
              </div>
            </div>

            {/* Location and RFO Badge */}
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">{unit.location}</span>
              {unit.isRFO && (
                <Badge variant="outline" className="ml-2">
                  Ready For Occupancy
                </Badge>
              )}
            </div>

            <p className="text-muted-foreground mb-6">{unit.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-1">Floor Area</h3>
                <p className="text-muted-foreground">{series.floorArea}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Design Type</h3>
                <p className="text-muted-foreground">{series.loftReady ? "Loft Ready" : "Standard Design"}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Project</h3>
                <p className="text-muted-foreground">{series.project}</p>
              </div>
              {unit.isRFO && unit.status === "On Going" && unit.constructionProgress && (
                <div>
                  <h3 className="font-semibold mb-1">Construction</h3>
                  <p className="text-muted-foreground">{unit.constructionProgress}% Complete</p>
                </div>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h3 className="font-semibold mb-2">Price Breakdown</h3>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Lot Only:</div>
                <div className="text-right">₱{unit.lotOnlyPrice.toLocaleString()}</div>
                <div>House Construction:</div>
                <div className="text-right">₱{unit.houseConstructionPrice.toLocaleString()}</div>
                <div className="font-semibold">Total Price:</div>
                <div className="text-right font-semibold">₱{unit.price.toLocaleString()}</div>
              </div>
            </div>

            {/* Construction Progress for RFO On Going units */}
            {unit.isRFO && unit.status === "On Going" && unit.constructionProgress && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Construction Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={cn("h-2.5 rounded-full", progressBarClass, progressWidthClass)}></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{unit.constructionProgress}% Complete</span>
                  {unit.completionDate && (
                    <span className="text-xs text-muted-foreground">Expected Completion: {unit.completionDate}</span>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <ScheduleViewingButton
                propertyName={`${unit.name} - ${series.name}`}
                propertyLocation={`${unit.location}, Naga City`}
                className="w-full"
                style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
              />
              <Link href={`/contact?${contactQueryParams}`}>
                <Button variant="outline" className="w-full">
                  Inquire Now
                </Button>
              </Link>
            </div>

            <LoanCalculatorButton
              modelName={`${series.name} - ${unit.name}`}
              floorArea={series.floorArea}
              price={unit.price}
              returnUrl={`/model-houses/${seriesId}/${unitId}`}
              className="mt-4"
            />
          </div>
        </div>
      </div>

      {/* Unit Details Tabs */}
      <Tabs defaultValue="features" className="w-full mb-16">
        <TabsList className="grid w-full grid-cols-3 gap-2 mb-6 md:mb-8 mobile-tabs overflow-x-auto">
          <TabsTrigger value="features" className="text-xs md:text-sm">
            Features & Specifications
          </TabsTrigger>
          <TabsTrigger value="floor-plan" className="text-xs md:text-sm">
            Floor Plan
          </TabsTrigger>
          <TabsTrigger value="walkthrough" className="text-xs md:text-sm">
            Walkthrough Video
          </TabsTrigger>
        </TabsList>

        <TabsContent value="features">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5 mb-6 text-muted-foreground">
              {unit.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            <h2 className="text-2xl font-bold mb-4">Specifications</h2>
            {unit.specifications ? (
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <tbody>
                    {Object.entries(unit.specifications).map(([key, value]) => (
                      <tr key={key} className="border-b">
                        <th className="text-left py-2 px-4 font-semibold capitalize bg-gray-50 w-1/4">{key}</th>
                        <td className="py-2 px-4 text-muted-foreground">{value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(series.specifications).map(([key, value]) => (
                  <div key={key} className="border-b pb-2">
                    <h3 className="font-semibold capitalize">{key}</h3>
                    <p className="text-muted-foreground">{value}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="floor-plan">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">Floor Plan</h2>

            {unit.floorPlanPdfId ? (
              <PDFViewer
                googleDriveId={unit.floorPlanPdfId}
                fileName={`${series.name}-${unit.name}-FloorPlan.pdf`}
                primaryColor="#000000"
              />
            ) : (
              <>
                <div className="relative h-[500px] md:h-[700px] mb-4">
                  <Image
                    src={unit.floorPlanImage || "/placeholder.svg"}
                    alt={`${series.name} ${unit.name} Floor Plan`}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="text-center">
                  <Button>Download Floor Plan</Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>

        <TabsContent value="walkthrough">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">Walkthrough Video</h2>
            <div className="aspect-video mb-4">
              <iframe
                className="w-full h-full"
                src={unit.walkthrough}
                title={`${series.name} ${unit.name} Walkthrough`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-muted-foreground text-center">
              Take a virtual tour of the {series.name} {unit.name} to experience the layout and features.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Project Information */}
      <section>
        <h2 className="text-2xl font-bold mb-8 text-center">Available in {series.project}</h2>

        <div className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative h-48">
            <Image src="/placeholder.svg?height=300&width=600" alt={series.project} fill className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#65932D]/80 to-transparent flex items-end">
              <div className="p-6 text-white">
                <h3 className="text-xl font-bold mb-2">{series.project}</h3>
                <p className="mb-4">Developed by {series.developer}</p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <p className="text-muted-foreground mb-4">
              This model house is available in {series.project}, offering a premium living experience in Naga City.
            </p>
            <Link href={series.developer === "Enjoy Realty" ? "/enjoy-realty" : "/aman-engineering"}>
              <Button
                className="w-full"
                style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
              >
                View Developer Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
