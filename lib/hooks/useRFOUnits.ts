"use client"

import { useState, useEffect } from "react"
import useSWR from "swr"
import { API_ENDPOINTS } from "@/lib/constants"
import type { ModelHouseUnit } from "./useModelHouses"

export interface RFOUnit extends ModelHouseUnit {
  seriesId: string
  developer: string
  developerColor: string
  project: string
  loftReady: boolean
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Custom hook for fetching all RFO units
export function useRFOUnits() {
  const { data, error, isLoading, mutate } = useSWR<RFOUnit[]>(API_ENDPOINTS.rfoUnits, fetcher)

  return {
    rfoUnits: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Custom hook for fetching a specific RFO unit by ID
export function useRFOUnitById(id: string | null) {
  const { data, error, isLoading } = useSWR<RFOUnit>(id ? `${API_ENDPOINTS.rfoUnits}/${id}` : null, fetcher)

  return {
    unit: data,
    isLoading,
    isError: error,
  }
}

// Custom hook for filtering RFO units by status
export function useRFOUnitsByStatus(status: string | null) {
  const { rfoUnits, isLoading, isError } = useRFOUnits()
  const [filteredUnits, setFilteredUnits] = useState<RFOUnit[]>([])

  useEffect(() => {
    if (rfoUnits && status) {
      setFilteredUnits(rfoUnits.filter((unit) => unit.status === status))
    } else if (rfoUnits) {
      setFilteredUnits(rfoUnits)
    }
  }, [rfoUnits, status])

  return {
    rfoUnits: filteredUnits,
    isLoading,
    isError,
  }
}
