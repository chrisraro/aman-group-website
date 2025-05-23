"use client"

import { useModelHousesContext } from "@/lib/context/ModelHousesContext"

// Define types for model houses data
export interface ModelHouseSeries {
  id: string
  name: string
  floorArea: string
  loftReady: boolean
  description: string
  longDescription: string
  features: string[]
  specifications: Record<string, string>
  basePrice: number
  floorPlanImage: string
  imageUrl: string
  developer: string
  developerColor: string
  project: string
  units: ModelHouseUnit[]
}

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
  specifications?: Record<string, string>
  floorPlanImage: string
  imageUrl: string
  floorPlanPdfId?: string
  walkthrough: string
  completionDate?: string
  constructionProgress?: number
}

// Custom hook for fetching all model house series
export function useModelHouseSeries() {
  const { getAllModelHouseSeries, isLoading, error, refreshData } = useModelHousesContext()

  return {
    modelHouses: getAllModelHouseSeries(),
    isLoading,
    isError: error,
    mutate: refreshData,
  }
}

// Custom hook for fetching a specific model house series by ID
export function useModelHouseSeriesById(id: string | null) {
  const { getModelHouseSeriesById, isLoading, error } = useModelHousesContext()

  return {
    series: id ? getModelHouseSeriesById(id) : null,
    isLoading,
    isError: error,
  }
}

// Custom hook for fetching model houses by project
export function useModelHousesByProject(project: string | null) {
  const { getModelHousesByProject, isLoading, error } = useModelHousesContext()

  return {
    modelHouses: project ? getModelHousesByProject(project) : [],
    isLoading,
    isError: error,
  }
}

// Custom hook for fetching a specific model house unit
export function useModelHouseUnit(seriesId: string | null, unitId: string | null) {
  const { getModelHouseSeriesById, getModelHouseUnitById, isLoading, error } = useModelHousesContext()

  const series = seriesId ? getModelHouseSeriesById(seriesId) : null
  const unit = seriesId && unitId ? getModelHouseUnitById(seriesId, unitId) : null

  return {
    unit,
    series,
    isLoading,
    isError: error,
  }
}

// Custom hook for fetching all model house units across all series
export function useModelHouseUnits(filterByRFO?: boolean) {
  const { getAllModelHouseSeries, isLoading, error } = useModelHousesContext()

  const allSeries = getAllModelHouseSeries()
  const allUnits = allSeries.flatMap((series) =>
    series.units.map((unit) => ({
      ...unit,
      seriesId: series.id,
      seriesName: series.name,
      developer: series.developer,
      developerColor: series.developerColor,
      project: series.project,
    })),
  )

  const filteredUnits = filterByRFO !== undefined ? allUnits.filter((unit) => unit.isRFO === filterByRFO) : allUnits

  return {
    units: filteredUnits,
    isLoading,
    isError: error,
  }
}
