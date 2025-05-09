"use client"

import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import type { ModelHouseUnit } from "./useModelHouses"

// Define the RFO unit type
export interface RFOUnit extends ModelHouseUnit {
  seriesId: string
  seriesName: string
  floorArea: string
  loftReady: boolean
  developer: string
  developerColor: string
  project: string
  lotArea?: string
  reservationFee?: number
  financingOptions?: string
  downPaymentPercentage?: number
  downPaymentTerms?: string
}

// Custom hook for fetching all RFO units
export function useRFOUnits() {
  const { getAllRFOUnits, isLoading, error, refreshData } = useModelHousesContext()

  return {
    rfoUnits: getAllRFOUnits(),
    isLoading,
    isError: error,
    mutate: refreshData,
  }
}

// Custom hook for fetching a specific RFO unit by ID
export function useRFOUnitById(id: string | null) {
  const { getRFOUnitById, isLoading, error } = useModelHousesContext()

  return {
    unit: id ? getRFOUnitById(id) : null,
    isLoading,
    isError: error,
  }
}

// Custom hook for filtering RFO units by status
export function useRFOUnitsByStatus(status: string | null) {
  const { getAllRFOUnits, isLoading, error } = useModelHousesContext()

  const rfoUnits = getAllRFOUnits()
  const filteredUnits = status ? rfoUnits.filter((unit) => unit.status === status) : rfoUnits

  return {
    rfoUnits: filteredUnits,
    isLoading,
    isError: error,
  }
}
