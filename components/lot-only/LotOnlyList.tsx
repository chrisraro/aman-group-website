"use client"

import { useState, useMemo } from "react"
import { useLotOnlyProperties } from "@/lib/hooks/useLotOnlyProperties"
import { LotOnlyCard } from "./LotOnlyCard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function LotOnlyList() {
  const { properties, isLoading, error } = useLotOnlyProperties()
  const [sortBy, setSortBy] = useState<string>("price-asc")
  const [selectedLocation, setSelectedLocation] = useState<string>("all")

  // Get unique locations for the filter dropdown
  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>()
    properties.forEach((property) => {
      // Extract city from the full location (assuming format like "City, Province")
      const locationParts = property.location.split(",")
      const city = locationParts[0]?.trim() || property.location
      uniqueLocations.add(city)
    })
    return Array.from(uniqueLocations).sort()
  }, [properties])

  // Filter and sort properties
  const filteredAndSortedProperties = useMemo(() => {
    // First filter by location if needed
    let filtered = properties
    if (selectedLocation !== "all") {
      filtered = properties.filter((property) =>
        property.location.toLowerCase().includes(selectedLocation.toLowerCase()),
      )
    }

    // Then sort
    return [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "name-asc":
          return a.name.localeCompare(b.name)
        case "name-desc":
          return b.name.localeCompare(a.name)
        default:
          return 0
      }
    })
  }, [properties, sortBy, selectedLocation])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading properties...</span>
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive" className="my-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>There was an error loading the properties. Please try refreshing the page.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="w-full sm:w-1/2 md:w-1/3">
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Filter by Location" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Locations</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-full sm:w-1/2 md:w-1/3">
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="price-asc">Price: Low to High</SelectItem>
              <SelectItem value="price-desc">Price: High to Low</SelectItem>
              <SelectItem value="name-asc">Name: A to Z</SelectItem>
              <SelectItem value="name-desc">Name: Z to A</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredAndSortedProperties.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">No properties found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedProperties.map((property) => (
            <LotOnlyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  )
}
