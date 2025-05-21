"use client"

import { useState, useMemo } from "react"
import { LotOnlyCard } from "./LotOnlyCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { ErrorMessage } from "@/components/ui/ErrorMessage"
import {
  useLotOnlyProperties,
  useLotOnlyPropertiesByProject,
  useLotOnlyPropertiesByDeveloper,
} from "@/lib/hooks/useLotOnlyProperties"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { formatNumberWithCommas } from "@/lib/utils/format-utils"

interface LotOnlyListProps {
  project?: string
  developer?: string
}

export function LotOnlyList({ project, developer }: LotOnlyListProps) {
  // Fetch properties based on props
  const {
    properties: projectProperties,
    isLoading: isProjectLoading,
    error: projectError,
  } = useLotOnlyPropertiesByProject(project || "")
  const {
    properties: developerProperties,
    isLoading: isDeveloperLoading,
    error: developerError,
  } = useLotOnlyPropertiesByDeveloper(developer || "")
  const { properties: allProperties, isLoading: isAllLoading, error: allError } = useLotOnlyProperties()

  const properties = project ? projectProperties : developer ? developerProperties : allProperties
  const isLoading = isProjectLoading || isDeveloperLoading || isAllLoading
  const error = projectError || developerError || allError

  // Filter state
  const [searchTerm, setSearchTerm] = useState("")
  const [sortOption, setSortOption] = useState("price-asc")
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000000])
  const [locationFilter, setLocationFilter] = useState<string>("all")

  // Get min and max prices for the slider
  const minPrice = Math.min(...properties.map((p) => p.price), 0)
  const maxPrice = Math.max(...properties.map((p) => p.price), 2000000)

  // Get unique locations for the dropdown
  const locations = useMemo(() => {
    return Array.from(new Set(properties.map((p) => p.location))).sort()
  }, [properties])

  // Filter and sort properties
  const filteredProperties = properties
    .filter(
      (property) =>
        property.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.location.toLowerCase().includes(searchTerm.toLowerCase()),
    )
    .filter((property) => property.price >= priceRange[0] && property.price <= priceRange[1])
    .filter((property) => (locationFilter === "all" ? true : property.location === locationFilter))
    .sort((a, b) => {
      switch (sortOption) {
        case "price-asc":
          return a.price - b.price
        case "price-desc":
          return b.price - a.price
        case "area-asc":
          return Number.parseInt(a.lotArea) - Number.parseInt(b.lotArea)
        case "area-desc":
          return Number.parseInt(b.lotArea) - Number.parseInt(a.lotArea)
        default:
          return 0
      }
    })

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12">
        <ErrorMessage message="Error loading lot-only properties. Please try again later." />
      </div>
    )
  }

  if (properties.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No lot-only properties found.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Filters */}
      <div className="bg-gray-50 p-6 rounded-lg space-y-4">
        <h3 className="text-lg font-semibold mb-4">Filter Properties</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              placeholder="Search by name, description, or location"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          <div>
            <Label htmlFor="sort">Sort By</Label>
            <Select value={sortOption} onValueChange={setSortOption}>
              <SelectTrigger id="sort">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="price-asc">Price: Low to High</SelectItem>
                <SelectItem value="price-desc">Price: High to Low</SelectItem>
                <SelectItem value="area-asc">Area: Small to Large</SelectItem>
                <SelectItem value="area-desc">Area: Large to Small</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="location">Location</Label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger id="location">
                <SelectValue placeholder="All locations" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All locations</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <Label htmlFor="price-range">Price Range</Label>
            <span className="text-sm text-muted-foreground">
              ₱{formatNumberWithCommas(priceRange[0])} - ₱{formatNumberWithCommas(priceRange[1])}
            </span>
          </div>
          <Slider
            id="price-range"
            min={minPrice}
            max={maxPrice}
            step={50000}
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            className="my-4"
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredProperties.length} of {properties.length} properties
      </div>

      {/* Property list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProperties.map((property) => (
          <LotOnlyCard key={property.id} property={property} />
        ))}
      </div>

      {filteredProperties.length === 0 && (
        <div className="text-center py-8">
          <p className="text-lg text-muted-foreground">No properties found matching your criteria.</p>
        </div>
      )}
    </div>
  )
}
