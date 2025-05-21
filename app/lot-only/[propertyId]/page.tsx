"use client"

import { useEffect, useState, useCallback } from "react"
import { useLotOnlyProperty } from "@/lib/hooks/useLotOnlyProperties"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Loader2, ArrowLeft, MapPin, Check, AlertCircle, Calendar, Calculator, RefreshCw } from "lucide-react"
import { formatNumberWithCommas } from "@/lib/utils/format-utils"
import { ScheduleViewingButton } from "@/components/shared/ScheduleViewingButton"
import { LoanCalculatorButton } from "@/components/loan-calculator-button"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function LotOnlyPropertyPage({ params }: { params: { propertyId: string } }) {
  const { property, isLoading, error, refreshData } = useLotOnlyProperty(params.propertyId)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [syncSource, setSyncSource] = useState<string>("Loading...")

  // Scroll to top on page load
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Check data source on load
  useEffect(() => {
    const checkDataSource = async () => {
      try {
        // Make a request to check if we're using KV or static data
        const response = await fetch(`/api/lot-only/source?t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          setSyncSource(data.source || "Unknown")
        }
      } catch (err) {
        console.error("Error checking data source:", err)
        setSyncSource("Static Data (Fallback)")
      }
    }

    checkDataSource()
  }, [])

  // Auto-refresh data every 30 seconds if the page is visible
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null

    if (document.visibilityState === "visible") {
      intervalId = setInterval(() => {
        refreshData()
        setLastRefreshed(new Date())
      }, 30000) // 30 seconds
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && !intervalId) {
        intervalId = setInterval(() => {
          refreshData()
          setLastRefreshed(new Date())
        }, 30000)
      } else if (document.visibilityState === "hidden" && intervalId) {
        clearInterval(intervalId)
        intervalId = null
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)

    return () => {
      if (intervalId) clearInterval(intervalId)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [refreshData])

  // Function to manually refresh data
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    try {
      await refreshData()

      // Check data source again after refresh
      try {
        const response = await fetch(`/api/lot-only/source?t=${Date.now()}`)
        if (response.ok) {
          const data = await response.json()
          setSyncSource(data.source || "Unknown")
        }
      } catch (err) {
        console.error("Error checking data source:", err)
      }

      setLastRefreshed(new Date())
      // Wait a moment to show the loading state
      await new Promise((resolve) => setTimeout(resolve, 500))
    } catch (err) {
      console.error("Error refreshing data:", err)
    } finally {
      setIsRefreshing(false)
    }
  }, [refreshData])

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading property details...</h2>
        </div>
      </div>
    )
  }

  if (error || !property) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error ? error.message : "Property not found. Please try another property."}
          </AlertDescription>
        </Alert>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="outline">
            <Link href="/lot-only">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Properties
            </Link>
          </Button>
          <Button onClick={handleRefresh} disabled={isRefreshing}>
            {isRefreshing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh Data
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Data synchronization indicator */}
        {isRefreshing && (
          <div className="fixed top-4 right-4 bg-primary text-white px-3 py-2 rounded-md shadow-md flex items-center z-50 animate-pulse">
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span className="text-sm font-medium">Syncing data...</span>
          </div>
        )}

        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <Button variant="ghost" asChild className="hover:bg-gray-100">
              <Link href="/lot-only">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Properties
              </Link>
            </Button>

            <div className="flex items-center">
              <div className="text-sm text-muted-foreground mr-3">
                <span className="mr-2">Source: {syncSource}</span>
                <span>Last synced: {lastRefreshed.toLocaleTimeString()}</span>
              </div>
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={isRefreshing} className="h-9 px-3">
                {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">{property.name}</h1>
              <div className="flex items-center mt-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span>{property.location}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge
                  className="text-sm font-medium"
                  style={{
                    backgroundColor:
                      property.status === "Available"
                        ? "rgb(22, 163, 74)"
                        : property.status === "Reserved"
                          ? "rgb(234, 88, 12)"
                          : "rgb(220, 38, 38)",
                    color: "white",
                  }}
                >
                  {property.status}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-sm font-medium"
                  style={{
                    backgroundColor: `${property.developerColor}20`,
                    borderColor: property.developerColor,
                    color: property.developerColor,
                  }}
                >
                  {property.developer}
                </Badge>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-2 md:mt-0">
              <ScheduleViewingButton
                propertyName={property.name}
                propertyType="Lot Only"
                className="h-11 bg-primary hover:bg-primary/90 text-white font-medium flex items-center justify-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                <span>Schedule Viewing</span>
              </ScheduleViewingButton>
              <LoanCalculatorButton
                propertyName={property.name}
                propertyPrice={property.price}
                propertyType="Lot Only"
                className="h-11 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium flex items-center justify-center gap-2"
              >
                <Calculator className="h-4 w-4" />
                <span>Calculate Loan</span>
              </LoanCalculatorButton>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="aspect-video bg-muted rounded-lg overflow-hidden mb-6">
              {property.imageUrl ? (
                <img
                  src={`${property.imageUrl || "/placeholder.svg"}?t=${Date.now()}`}
                  alt={property.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-muted-foreground">No image available</span>
                </div>
              )}
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Property Description</h2>
              <p className="text-muted-foreground whitespace-pre-line">{property.description}</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">Features</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {property.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            {property.utilities && property.utilities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Utilities</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.utilities.map((utility, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                      <span>{utility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {property.nearbyAmenities && property.nearbyAmenities.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-semibold mb-4">Nearby Amenities</h2>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {property.nearbyAmenities.map((amenity, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 mr-2 text-primary flex-shrink-0" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div>
            <Card className="sticky top-4">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h3 className="text-xl font-semibold mb-4">Property Details</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Price:</span>
                      <span className="font-medium">₱{formatNumberWithCommas(property.price)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        style={{
                          backgroundColor:
                            property.status === "Available"
                              ? "rgb(22, 163, 74)"
                              : property.status === "Reserved"
                                ? "rgb(234, 88, 12)"
                                : "rgb(220, 38, 38)",
                          color: "white",
                        }}
                      >
                        {property.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Lot Area:</span>
                      <span>{property.lotArea}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Project:</span>
                      <span>{property.project}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Developer:</span>
                      <Badge
                        variant="outline"
                        style={{
                          backgroundColor: `${property.developerColor}20`,
                          borderColor: property.developerColor,
                          color: property.developerColor,
                        }}
                      >
                        {property.developer}
                      </Badge>
                    </div>
                  </div>
                </div>

                {(property.reservationFee ||
                  property.downPaymentPercentage ||
                  property.financingOptions ||
                  property.downPaymentTerms) && (
                  <div>
                    <h3 className="text-xl font-semibold mb-4">Financing Information</h3>
                    <div className="space-y-3">
                      {property.reservationFee && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Reservation Fee:</span>
                          <span>₱{formatNumberWithCommas(property.reservationFee)}</span>
                        </div>
                      )}
                      {property.downPaymentPercentage && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Down Payment:</span>
                          <span>{property.downPaymentPercentage}%</span>
                        </div>
                      )}
                      {property.downPaymentTerms && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Down Payment Terms:</span>
                          <span>{property.downPaymentTerms}</span>
                        </div>
                      )}
                      {property.financingOptions && (
                        <div className="flex justify-between items-center">
                          <span className="text-muted-foreground">Financing Options:</span>
                          <span>{property.financingOptions}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-muted-foreground">Last updated:</span>
                    <span className="text-sm">{lastRefreshed.toLocaleTimeString()}</span>
                  </div>
                  <Button
                    onClick={handleRefresh}
                    variant="outline"
                    className="w-full h-11 border-gray-300 hover:bg-gray-50"
                    disabled={isRefreshing}
                  >
                    {isRefreshing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Refreshing...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refresh Property Data
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  )
}
