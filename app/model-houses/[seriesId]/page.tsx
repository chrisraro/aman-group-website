"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Home, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import ScheduleViewingButton from "@/components/schedule-viewing-button"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import type { ModelHouseSeries } from "@/lib/hooks/useModelHouses"

export default function ModelHouseSeriesPage({ params }: { params: { seriesId: string } }) {
  const { seriesId } = params
  const { getModelHouseSeriesById, isLoading, error, refreshData } = useModelHousesContext()
  const [series, setSeries] = useState<ModelHouseSeries | null>(null)

  useEffect(() => {
    setSeries(getModelHouseSeriesById(seriesId))
  }, [seriesId, getModelHouseSeriesById])

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading model house series...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>{error.message || "There was a problem loading the model house series."}</AlertDescription>
        </Alert>
        <Button onClick={refreshData}>Try Again</Button>
      </div>
    )
  }

  if (!series) {
    return <div className="container mx-auto px-4 py-12">Model house series not found</div>
  }

  // Create query parameters for the contact form
  const contactQueryParams = new URLSearchParams({
    propertyInterest: "Model House",
    modelHousesSeries: seriesId,
    projectLocation: series.project,
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
        <span className="font-medium">{series.name}</span>
      </div>

      {/* Back Button */}
      <div className="mb-6">
        <Link href="/model-houses">
          <Button variant="outline" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Model House Series
          </Button>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden border mb-12">
        <div className="md:flex">
          <div className="md:w-1/2 relative h-[400px]">
            <Image
              src={series.imageUrl || `/placeholder.svg?height=300&width=400&text=${series.name}`}
              alt={series.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="md:w-1/2 p-6 md:p-8">
            <h1 className="text-3xl font-bold mb-2">{series.name}</h1>
            <p className="text-muted-foreground mb-6">{series.description}</p>

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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <ScheduleViewingButton
                propertyName={series.name}
                propertyLocation={series.project}
                className="w-full"
                style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
              />
              <Link href={`/contact?${contactQueryParams}`}>
                <Button variant="outline" className="w-full">
                  Inquire Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Units Sections */}
      <section>
        <h2 className="text-2xl font-bold mb-8">Available Units</h2>

        {/* Filter units into RFO and non-RFO */}
        {(() => {
          const regularUnits = series.units.filter((unit) => !unit.isRFO)
          const rfoUnits = series.units.filter((unit) => unit.isRFO)

          return (
            <>
              {/* Regular Units Section */}
              {regularUnits.length > 0 && (
                <div className="mb-12">
                  <h3 className="text-xl font-semibold mb-4">Standard Units</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {regularUnits.map((unit) => {
                      // Create query parameters for the unit contact form
                      const unitContactQueryParams = new URLSearchParams({
                        propertyInterest: "Model House",
                        modelHousesSeries: seriesId,
                        projectLocation: series.project,
                        unitId: unit.id,
                      }).toString()

                      return (
                        <div
                          key={unit.id}
                          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-48">
                            <Image
                              src={
                                unit.imageUrl ||
                                `/placeholder.svg?height=300&width=400&text=${series.name || "/placeholder.svg"}+${unit.name}`
                              }
                              alt={`${series.name} ${unit.name}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold">{unit.name}</h3>
                              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                ₱{unit.price.toLocaleString()}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{unit.description}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <Link href={`/model-houses/${seriesId}/${unit.id}`}>
                                <Button
                                  className="w-full"
                                  style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
                                >
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/contact?${unitContactQueryParams}`}>
                                <Button variant="outline" className="w-full">
                                  Inquire Now
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* RFO Units Section */}
              {rfoUnits.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">Ready for Occupancy Units</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {rfoUnits.map((unit) => {
                      // Create query parameters for the unit contact form
                      const unitContactQueryParams = new URLSearchParams({
                        propertyInterest: "Ready for Occupancy",
                        modelHousesSeries: seriesId,
                        projectLocation: series.project,
                        unitId: unit.id,
                      }).toString()

                      return (
                        <div
                          key={unit.id}
                          className="bg-white rounded-lg shadow-sm border overflow-hidden hover:shadow-md transition-shadow"
                        >
                          <div className="relative h-48">
                            <Image
                              src={
                                unit.imageUrl ||
                                `/placeholder.svg?height=300&width=400&text=${series.name || "/placeholder.svg"}+${unit.name}`
                              }
                              alt={`${series.name} ${unit.name}`}
                              fill
                              className="object-cover"
                            />
                            <div
                              className={`absolute top-0 right-0 px-3 py-1 font-semibold text-white ${
                                unit.status === "Fully Constructed" ? "bg-[#65932D]" : "bg-[#f59e0b]"
                              }`}
                            >
                              {unit.status}
                            </div>
                          </div>
                          <div className="p-6">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="text-xl font-bold">{unit.name}</h3>
                              <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium">
                                ₱{unit.price.toLocaleString()}
                              </div>
                            </div>
                            <p className="text-muted-foreground mb-4 line-clamp-2">{unit.description}</p>
                            <div className="grid grid-cols-2 gap-2">
                              <Link href={`/model-houses/${seriesId}/${unit.id}`}>
                                <Button
                                  className="w-full"
                                  style={{ backgroundColor: series.developerColor, borderColor: series.developerColor }}
                                >
                                  View Details
                                </Button>
                              </Link>
                              <Link href={`/contact?${unitContactQueryParams}`}>
                                <Button variant="outline" className="w-full">
                                  Inquire Now
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Show message if no units available */}
              {series.units.length === 0 && (
                <div className="text-center py-8 bg-gray-50 rounded-lg border">
                  <p className="text-muted-foreground">No units available for this model house series.</p>
                </div>
              )}
            </>
          )
        })()}
      </section>
    </div>
  )
}
