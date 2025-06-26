"use client"

import { useLotOnlyProperties } from "@/lib/hooks/useLotOnlyProperties"
import { LotOnlyCard } from "./LotOnlyCard"
import { LoadingSpinner } from "@/components/ui/LoadingSpinner"
import { Button } from "@/components/ui/button"
import { RefreshCw, AlertCircle } from "lucide-react"

interface LotOnlyListProps {
  project?: string
  developer?: string
  className?: string
}

export function LotOnlyList({ project, developer, className }: LotOnlyListProps) {
  const { properties, isLoading, error, refreshData, total } = useLotOnlyProperties()

  // Filter properties based on props
  const filteredProperties = properties.filter((property) => {
    if (project && property.project !== project) return false
    if (developer && property.developer !== developer) return false
    return true
  })

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading lot-only properties...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`py-12 ${className}`}>
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-red-500" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Properties</h3>
          <p className="text-muted-foreground mb-4">{error.message}</p>
          <Button onClick={refreshData} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  if (filteredProperties.length === 0) {
    return (
      <div className={`py-12 text-center ${className}`}>
        <div className="text-muted-foreground">
          <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
          <p>
            {project || developer
              ? `No lot-only properties found for the selected ${project ? "project" : "developer"}.`
              : "No lot-only properties are currently available."}
          </p>
          <Button onClick={refreshData} variant="outline" className="mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {project
              ? `${project} - Lot Only Properties`
              : developer
                ? `${developer} Properties`
                : "Lot Only Properties"}
          </h2>
          <p className="text-muted-foreground">
            {filteredProperties.length} {filteredProperties.length === 1 ? "property" : "properties"} available
          </p>
        </div>
        <Button onClick={refreshData} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProperties.map((property) => (
          <LotOnlyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  )
}
