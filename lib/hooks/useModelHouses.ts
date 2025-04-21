"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { API_ENDPOINTS } from "@/lib/constants"

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

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Custom hook for fetching all model house series
export function useModelHouseSeries() {
  const { data, error, isLoading, mutate } = useSWR<ModelHouseSeries[]>(API_ENDPOINTS.modelHouses, fetcher)

  return {
    modelHouses: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Custom hook for fetching a specific model house series by ID
export function useModelHouseSeriesById(id: string | null) {
  const { data, error, isLoading } = useSWR<ModelHouseSeries>(id ? `${API_ENDPOINTS.modelHouses}/${id}` : null, fetcher)

  return {
    series: data,
    isLoading,
    isError: error,
  }
}

// Custom hook for fetching model houses by project
export function useModelHousesByProject(project: string | null) {
  const { modelHouses, isLoading, isError } = useModelHouseSeries()
  const [filteredHouses, setFilteredHouses] = useState<ModelHouseSeries[]>([])

  useEffect(() => {
    if (modelHouses && project) {
      setFilteredHouses(modelHouses.filter((series) => series.project === project))
    }
  }, [modelHouses, project])

  return {
    modelHouses: filteredHouses,
    isLoading,
    isError,
  }
}

// Custom hook for fetching a specific model house unit
export function useModelHouseUnit(seriesId: string | null, unitId: string | null) {
  const { series, isLoading, isError } = useModelHouseSeriesById(seriesId)
  const [unit, setUnit] = useState<ModelHouseUnit | null>(null)

  useEffect(() => {
    if (series && unitId) {
      const foundUnit = series.units.find((u) => u.id === unitId) || null
      setUnit(foundUnit)
    }
  }, [series, unitId])

  return {
    unit,
    series,
    isLoading,
    isError,
  }
}
