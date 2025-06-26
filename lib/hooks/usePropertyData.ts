"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { useLotOnlyProperties } from "./useLotOnlyProperties"
import { useRFOUnits } from "./useRFOUnits"

export interface PropertyOption {
  id: string
  name: string
  type: "model-house" | "rfo-unit" | "lot-only"
  price: number
  lotPrice?: number
  houseConstructionPrice?: number
  floorArea?: string
  location?: string
  developer?: string
  project?: string
  series?: string
  status?: string
}

export function usePropertyData() {
  const [allProperties, setAllProperties] = useState<PropertyOption[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // Get data from all sources
  const {
    getAllModelHouseSeries,
    getAllRFOUnits,
    isLoading: modelHousesLoading,
    error: modelHousesError,
  } = useModelHousesContext()
  const { properties: lotOnlyProperties, isLoading: lotOnlyLoading, error: lotOnlyError } = useLotOnlyProperties()
  const { rfoUnits, isLoading: rfoLoading, error: rfoError } = useRFOUnits()

  // Memoize the processed properties to prevent unnecessary recalculations
  const processedProperties = useMemo(() => {
    if (modelHousesLoading || lotOnlyLoading || rfoLoading) {
      return []
    }

    const properties: PropertyOption[] = []

    try {
      // Add model house units
      const modelHouseSeries = getAllModelHouseSeries()
      modelHouseSeries.forEach((series) => {
        series.units.forEach((unit) => {
          if (!unit.isRFO) {
            // Only non-RFO units for model houses
            properties.push({
              id: `model-${series.id}-${unit.id}`,
              name: `${series.name} - ${unit.name}`,
              type: "model-house",
              price: unit.price,
              lotPrice: unit.lotOnlyPrice,
              houseConstructionPrice: unit.houseConstructionPrice,
              floorArea: series.floorArea,
              location: unit.location,
              developer: series.developer,
              project: series.project,
              series: series.name,
              status: unit.status,
            })
          }
        })
      })

      // Add RFO units
      if (rfoUnits && Array.isArray(rfoUnits)) {
        rfoUnits.forEach((unit) => {
          properties.push({
            id: `rfo-${unit.id}`,
            name: `${unit.seriesName} - ${unit.name} (RFO)`,
            type: "rfo-unit",
            price: unit.price,
            lotPrice: unit.lotOnlyPrice,
            houseConstructionPrice: unit.houseConstructionPrice,
            floorArea: unit.floorArea,
            location: unit.location,
            developer: unit.developer,
            project: unit.project,
            series: unit.seriesName,
            status: unit.status,
          })
        })
      }

      // Add lot-only properties
      if (lotOnlyProperties && Array.isArray(lotOnlyProperties)) {
        lotOnlyProperties.forEach((property) => {
          properties.push({
            id: `lot-${property.id}`,
            name: property.name,
            type: "lot-only",
            price: property.price,
            floorArea: property.lotArea,
            location: property.location,
            developer: property.developer,
            project: property.project,
            status: property.status,
          })
        })
      }
    } catch (err) {
      console.error("Error processing property data:", err)
      setError(err instanceof Error ? err : new Error("Failed to process property data"))
    }

    return properties
  }, [
    modelHousesLoading,
    lotOnlyLoading,
    rfoLoading,
    getAllModelHouseSeries,
    getAllRFOUnits,
    rfoUnits,
    lotOnlyProperties,
  ])

  // Update state only when processed properties change
  useEffect(() => {
    if (!modelHousesLoading && !lotOnlyLoading && !rfoLoading) {
      setAllProperties(processedProperties)
      setIsLoading(false)
    }
  }, [processedProperties, modelHousesLoading, lotOnlyLoading, rfoLoading])

  // Combine loading states
  const combinedLoading = modelHousesLoading || lotOnlyLoading || rfoLoading || isLoading

  // Combine errors
  const combinedError = modelHousesError || lotOnlyError || rfoError || error

  const refreshData = useCallback(() => {
    setIsLoading(true)
    setError(null)
    // The data will be refreshed automatically when the hooks re-fetch
  }, [])

  return {
    properties: allProperties,
    isLoading: combinedLoading,
    error: combinedError,
    refreshData,
  }
}

export function usePropertyById(propertyId: string | null) {
  const { properties, isLoading, error } = usePropertyData()

  const property = useMemo(() => {
    return propertyId ? properties.find((p) => p.id === propertyId) : null
  }, [propertyId, properties])

  return {
    property,
    isLoading,
    error,
  }
}
