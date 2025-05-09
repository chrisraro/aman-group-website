"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home, MapPin, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LoanCalculatorButton } from "@/components/loan-calculator-button"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import ScheduleViewingButton from "@/components/schedule-viewing-button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { RFOUnit } from "@/lib/hooks/useRFOUnits"

export default function RFOUnitDetailPage({ params }: { params: { unitId: string } }) {
  const { unitId } = params
  const { getRFOUnitById, getAllRFOUnits, isLoading, error, refreshData } = useModelHousesContext()
  const [unit, setUnit] = useState<RFOUnit | null>(null)
  const [similarUnits, setSimilarUnits] = useState<RFOUnit[]>([])

  useEffect(() => {
    setUnit(getRFOUnitById(unitId))

    // Get similar units (excluding current unit)
    const allRFOUnits = getAllRFOUnits()
    setSimilarUnits(allRFOUnits.filter((item) => item.id !== unitId).slice(0, 3))
  }, [unitId, getRFOUnitById, getAllRFOUnits])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading RFO unit...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error.message || "There was a problem loading the RFO unit."}</AlertDescription>
        </Alert>
        <Button onClick={refreshData}>Try Again</Button>
      </div>
    )
  }

  if (!unit) {
    return <div className="container mx-auto px-4 py-12">Unit not found</div>
  }

  // Extract colors for use in className
  const developerColorClass = unit.developerColor === "#65932D" ? "bg-[#65932D]" : "bg-[#04009D]"
  const textWhiteClass = "text-white"

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
  const projectLocation = unit.location || "Palm Village"
  const contactQueryParams = new URLSearchParams({
    propertyInterest: "Ready for Occupancy",
    modelHousesSeries: unit.seriesId,
    projectLocation: projectLocation,
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
        <Link href="/ready-for-occupancy" className="text-muted-foreground hover:text-primary">
          Ready For Occupancy
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">
          {unit.seriesName} {unit.name}
        </span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/ready-for-occupancy">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Ready For Occupancy
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-[400px]">
            <Image
              src={unit.imageUrl || `/placeholder.svg?height=800&width=800&text=${unit.seriesName}+${unit.name}`}
              alt={`${unit.seriesName} ${unit.name}`}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold">
                  {unit.seriesName} {unit.name}
                </h1>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{unit.location}</span>
                </div>
              </div>
              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                ₱{unit.price.toLocaleString()}
              </div>
            </div>
            <div
              className={cn(
                "inline-block px-3 py-1 rounded-full text-sm font-medium mb-4",
                developerColorClass,
                textWhiteClass,
              )}
            >
              {unit.status}
            </div>
            <p className="text-muted-foreground mb-6">{unit.description}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold mb-1">Floor Area</h3>
                <p className="text-muted-foreground">{unit.floorArea}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Design Type</h3>
                <p className="text-muted-foreground">{unit.loftReady ? "Loft Ready" : "Standard Design"}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Developer</h3>
                <p className="text-muted-foreground">{unit.developer}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Block & Lot</h3>
                <p className="text-muted-foreground">{unit.location}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Series</h3>
                <p className="text-muted-foreground">{unit.seriesName} Series</p>
              </div>
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

            {unit.status === "On Going" && unit.constructionProgress && (
              <div className="mb-6">
                <h3 className="font-semibold mb-2">Construction Progress</h3>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div className={cn("h-2.5 rounded-full", developerColorClass, progressWidthClass)}></div>
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
                propertyName={`${unit.seriesName} ${unit.name}`}
                propertyLocation={unit.location}
                className="w-full"
              />
              <Link href={`/contact?${contactQueryParams}`}>
                <Button variant="outline" className="w-full">
                  Inquire Now
                </Button>
              </Link>
            </div>

            <LoanCalculatorButton
              modelName={`${unit.seriesName} ${unit.name}`}
              floorArea={unit.floorArea}
              price={unit.price}
              lotOnlyPrice={unit.lotOnlyPrice}
              houseConstructionPrice={unit.houseConstructionPrice}
              returnUrl={`/ready-for-occupancy/${unitId}`}
              className="mt-4"
            />
          </div>
        </div>
      </div>

      {/* Unit Details Tabs */}
      <Tabs defaultValue="details" className="w-full mb-16">
        <TabsList className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-6 md:mb-8">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="walkthrough">Walkthrough Video</TabsTrigger>
        </TabsList>

        <TabsContent value="details">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">
              About {unit.seriesName} {unit.name}
            </h2>
            <p className="text-muted-foreground mb-6">{unit.description}</p>

            {unit.status === "On Going" && (
              <div className="bg-gray-50 p-4 rounded-lg mt-6">
                <h3 className="font-semibold mb-2">Construction Status</h3>
                <p className="text-muted-foreground mb-2">
                  This unit is currently under construction and is {unit.constructionProgress}% complete.
                </p>
                <p className="text-muted-foreground">
                  Expected completion date: <span className="font-medium">{unit.completionDate}</span>
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="features">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-2xl font-bold mb-4">Features</h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 list-disc pl-5 mb-6 text-muted-foreground">
              {unit.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>

            {unit.specifications && (
              <>
                <h2 className="text-2xl font-bold mb-4 mt-8">Specifications</h2>
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
                title={`${unit.seriesName} ${unit.name} Walkthrough`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="text-muted-foreground text-center">
              Take a virtual tour of the {unit.seriesName} {unit.name} to experience the layout and features.
            </p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Location Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-bold mb-8">Location</h2>
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="aspect-video bg-gray-100 flex items-center justify-center">
            <p className="text-muted-foreground">Map Embed Placeholder</p>
          </div>
          <div className="p-6">
            <h3 className="font-semibold mb-2">{unit.location}</h3>
            <p className="text-muted-foreground mb-4">
              This unit is located in a prime area with easy access to essential establishments and transportation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="font-medium text-sm mb-1">Nearby Schools</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Ateneo de Naga University (2.5 km)</li>
                  <li>• Universidad de Santa Isabel (3 km)</li>
                  <li>• Naga Central School (1.8 km)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Nearby Hospitals</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Bicol Medical Center (3.2 km)</li>
                  <li>• Mother Seton Hospital (2.7 km)</li>
                  <li>• St. John Hospital (4 km)</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-sm mb-1">Nearby Malls</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• SM City Naga (2 km)</li>
                  <li>• Robinsons Place Naga (3.5 km)</li>
                  <li>• LCC Central Mall (2.8 km)</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Similar Units Section */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Similar Units</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {similarUnits.map((similarUnit) => {
            const similarUnitColorClass = similarUnit.developerColor === "#65932D" ? "bg-[#65932D]" : "bg-[#04009D]"
            return (
              <div
                key={similarUnit.id}
                className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={`/placeholder.svg?height=300&width=400&text=${similarUnit.seriesName}+${similarUnit.name}`}
                    alt={`${similarUnit.seriesName} ${similarUnit.name}`}
                    fill
                    className="object-cover"
                  />
                  <div
                    className={cn("absolute top-0 right-0 px-3 py-1 font-semibold text-white", similarUnitColorClass)}
                  >
                    {similarUnit.status}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold">
                      {similarUnit.seriesName} {similarUnit.name}
                    </h3>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                      ₱{similarUnit.price.toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mb-1 text-sm text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span>{similarUnit.location}</span>
                  </div>
                  <div className="flex gap-4 my-3">
                    <div>
                      <span className="text-sm font-medium">{similarUnit.loftReady ? "Loft Ready" : "Standard"}</span>
                      <span className="text-xs text-muted-foreground"> design</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">{similarUnit.floorArea}</span>
                      <span className="text-xs text-muted-foreground"> area</span>
                    </div>
                  </div>
                  <Link href={`/ready-for-occupancy/${similarUnit.id}`}>
                    <Button className={cn("w-full", similarUnitColorClass)}>View Details</Button>
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}
