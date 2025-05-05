"use client"

import { useEffect, useState } from "react"

// Define the type for model house specifications
export interface ModelHouseSpecifications {
  foundation?: string
  walls?: string
  roofing?: string
  ceiling?: string
  windows?: string
  doors?: string
  flooring?: string
  kitchen?: string
  bathroom?: string
  electrical?: string
  garage?: string
  landscape?: string
  excluded?: string
  loft?: string
  stairs?: string
  partition?: string
  finishing?: string
  toilet?: string
  plumbing?: string
  wall?: string
}

// Define the type for a model house unit
export interface ModelHouseUnit {
  id: string
  name: string
  seriesName: string
  description: string
  price: number
  lotOnlyPrice: number
  houseConstructionPrice: number
  location: string
  status: string
  isRFO: boolean
  features: string[]
  floorPlanImage: string
  imageUrl: string
  floorPlanPdfId?: string
  walkthrough?: string
  specifications?: ModelHouseSpecifications
  lotArea?: string
  reservationFee?: number
  financingOptions?: string
  downPaymentPercentage?: number
  downPaymentTerms?: string
  floorArea?: string
  completionDate?: string
  constructionProgress?: number
}

// Define the type for a model house series
export interface ModelHouseSeries {
  id: string
  name: string
  floorArea: string
  loftReady: boolean
  description: string
  longDescription: string
  features: string[]
  specifications: ModelHouseSpecifications
  basePrice: number
  floorPlanImage: string
  imageUrl: string
  developer: string
  developerColor: string
  project: string
  units: ModelHouseUnit[]
}

// Define the type for the model house series object
export interface ModelHouseSeriesObject {
  [key: string]: ModelHouseSeries
}

// Initialize with empty object, will be populated from localStorage if available
export const modelHouseSeries: ModelHouseSeriesObject = {}

// Load data from localStorage if available
if (typeof window !== "undefined") {
  const savedData = localStorage.getItem("modelHouseSeries")
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData)
      Object.assign(modelHouseSeries, parsedData)
    } catch (error) {
      console.error("Error parsing saved model house data:", error)
    }
  }
}

/**
 * Gets a model house series by its ID.
 */
export function getModelHouseSeriesById(id: string) {
  if (typeof window !== "undefined") {
    // Try to get fresh data from localStorage
    const savedData = localStorage.getItem("modelHouseSeries")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        return parsedData[id] || null
      } catch (error) {
        console.error("Error parsing saved model house data:", error)
      }
    }
  }

  return modelHouseSeries[id as keyof typeof modelHouseSeries] || null
}

/**
 * Gets a model house unit by its series ID and unit ID.
 */
export function getModelHouseUnitById(seriesId: string, unitId: string) {
  const series = getModelHouseSeriesById(seriesId)
  if (!series) return null

  return series.units.find((unit) => unit.id === unitId) || null
}

/**
 * Gets all model house series.
 */
export function getAllModelHouseSeries() {
  if (typeof window !== "undefined") {
    // Try to get fresh data from localStorage
    const savedData = localStorage.getItem("modelHouseSeries")
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData)
        return Object.values(parsedData)
      } catch (error) {
        console.error("Error parsing saved model house data:", error)
      }
    }
  }

  return Object.values(modelHouseSeries)
}

/**
 * Gets all model house series for a specific project.
 */
export function getModelHousesByProject(project: string) {
  return getAllModelHouseSeries().filter((series) => series.project === project)
}

/**
 * Gets all projects.
 */
export function getAllProjects() {
  return [...new Set(getAllModelHouseSeries().map((series) => series.project))]
}

/**
 * Gets all ready for occupancy units.
 */
export function getAllRFOUnits() {
  const allSeries = getAllModelHouseSeries()
  const rfoUnits = allSeries.flatMap((series) =>
    series.units
      .filter((unit) => unit.isRFO)
      .map((unit) => ({
        ...unit,
        seriesId: series.id,
        seriesName: series.name.split(" ")[0], // Extract just the first part of the name (e.g., "Jade" from "Jade 45 Series")
        floorArea: series.floorArea,
        loftReady: series.loftReady,
        developer: series.developer,
        developerColor: series.developerColor,
        project: series.project,
      })),
  )
  return rfoUnits
}

/**
 * Gets a ready for occupancy unit by its ID.
 */
export function getRFOUnitById(unitId: string) {
  const allSeries = getAllModelHouseSeries()

  for (const series of allSeries) {
    const unit = series.units.find((unit) => unit.id === unitId && unit.isRFO)
    if (unit) {
      return {
        ...unit,
        seriesId: series.id,
        seriesName: series.name.split(" ")[0],
        floorArea: series.floorArea,
        loftReady: series.loftReady,
        developer: series.developer,
        developerColor: series.developerColor,
        project: series.project,
      }
    }
  }
  return null
}

// Initialize with data from the original file if available
// This ensures backward compatibility with existing code
if (typeof window !== "undefined" && Object.keys(modelHouseSeries).length === 0) {
  // Try to load from localStorage first
  const savedData = localStorage.getItem("modelHouseSeries")
  if (!savedData) {
    // If no data in localStorage, try to import from the original file
    import("../lib/constants/model-houses-data")
      .then((importedData) => {
        if (importedData && importedData.default) {
          // Store the imported data in localStorage
          localStorage.setItem("modelHouseSeries", JSON.stringify(importedData.default))

          // Update the modelHouseSeries object
          Object.assign(modelHouseSeries, importedData.default)
        }
      })
      .catch((error) => {
        console.error("Error importing model houses data:", error)
      })
  }
}

// Export a hook to use model houses data with state updates
export function useModelHouses() {
  const [houses, setHouses] = useState<ModelHouseSeriesObject>({})

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedData = localStorage.getItem("modelHouseSeries")
      if (savedData) {
        try {
          const parsedData = JSON.parse(savedData)
          setHouses(parsedData)
        } catch (error) {
          console.error("Error parsing saved model house data:", error)
        }
      }
    }
  }, [])

  return houses
}
