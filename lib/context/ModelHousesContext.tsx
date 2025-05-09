"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import type { ModelHouseSeries, ModelHouseUnit } from "@/lib/hooks/useModelHouses"
import type { RFOUnit } from "@/lib/hooks/useRFOUnits"
import { modelHouseSeries as initialModelHouseSeries } from "@/data/model-houses"
import useSWR from "swr"

// API endpoints
const MODEL_HOUSES_API = "/api/model-houses"

type ModelHousesContextType = {
  modelHouses: Record<string, ModelHouseSeries>
  rfoUnits: RFOUnit[]
  isLoading: boolean
  error: Error | null
  addModelHouseSeries: (series: ModelHouseSeries) => Promise<void>
  updateModelHouseSeries: (id: string, series: ModelHouseSeries) => Promise<void>
  deleteModelHouseSeries: (id: string) => Promise<void>
  addModelHouseUnit: (seriesId: string, unit: ModelHouseUnit) => Promise<void>
  updateModelHouseUnit: (seriesId: string, unitId: string, unit: ModelHouseUnit) => Promise<void>
  deleteModelHouseUnit: (seriesId: string, unitId: string) => Promise<void>
  updateRFOUnit: (unitId: string, unit: Partial<RFOUnit>) => Promise<void>
  getAllModelHouseSeries: () => ModelHouseSeries[]
  getModelHouseSeriesById: (id: string) => ModelHouseSeries | null
  getModelHouseUnitById: (seriesId: string, unitId: string) => ModelHouseUnit | null
  getRFOUnitById: (unitId: string) => RFOUnit | null
  getModelHousesByProject: (project: string) => ModelHouseSeries[]
  getAllProjects: () => string[]
  getAllRFOUnits: () => RFOUnit[]
  resetToDefaultData: () => Promise<void>
  refreshData: () => Promise<void>
}

const ModelHousesContext = createContext<ModelHousesContextType | undefined>(undefined)

// Fetcher function for SWR with error handling
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
    }
    return response.json()
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}

export const ModelHousesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use SWR for data fetching with fallback to initial data
  const { data, error, isLoading, mutate } = useSWR<Record<string, ModelHouseSeries>>(MODEL_HOUSES_API, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
    fallbackData: initialModelHouseSeries, // Provide fallback data to avoid null/undefined
    onError: (err) => {
      console.error("SWR Error:", err)
    },
  })

  const [rfoUnits, setRFOUnits] = useState<RFOUnit[]>([])

  // Ensure modelHouses is never undefined
  const modelHouses = data || {}

  // Helper function to derive RFO units from model houses
  const deriveRFOUnitsFromModelHouses = useCallback((houses: Record<string, ModelHouseSeries>): RFOUnit[] => {
    const rfoUnits: RFOUnit[] = []

    Object.values(houses).forEach((series) => {
      if (!series.units) return // Skip if units is undefined

      series.units
        .filter((unit) => unit.isRFO)
        .forEach((unit) => {
          rfoUnits.push({
            ...unit,
            seriesId: series.id,
            seriesName: series.name.split(" ")[0],
            floorArea: series.floorArea,
            loftReady: series.loftReady,
            developer: series.developer,
            developerColor: series.developerColor || "#000000",
            project: series.project,
          })
        })
    })

    return rfoUnits
  }, [])

  // Update RFO units whenever model houses data changes
  useEffect(() => {
    if (data) {
      const derivedRFOUnits = deriveRFOUnitsFromModelHouses(data)
      setRFOUnits(derivedRFOUnits)
    }
  }, [data, deriveRFOUnitsFromModelHouses])

  // Function to save model houses to the API with error handling
  const saveModelHousesToAPI = useCallback(
    async (data: Record<string, ModelHouseSeries>) => {
      try {
        const response = await fetch(MODEL_HOUSES_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Failed to save: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
        }

        // Update the local cache
        await mutate(data, false)

        console.log("Model houses data saved to API")
      } catch (error) {
        console.error("Failed to save model houses data to API:", error)
        throw error
      }
    },
    [mutate],
  )

  // Function to refresh data
  const refreshData = useCallback(async () => {
    try {
      await mutate()
    } catch (error) {
      console.error("Error refreshing data:", error)
      throw error
    }
  }, [mutate])

  // Reset to default data
  const resetToDefaultData = useCallback(async () => {
    try {
      const response = await fetch(MODEL_HOUSES_API, {
        method: "PUT", // Use PUT for reset operation
      })

      if (!response.ok) {
        throw new Error(`Failed to reset data: ${response.status} ${response.statusText}`)
      }

      await mutate()
    } catch (error) {
      console.error("Error resetting data:", error)
      throw error
    }
  }, [mutate])

  // CRUD operations for model house series
  const addModelHouseSeries = useCallback(
    async (series: ModelHouseSeries) => {
      try {
        const updatedModelHouses = {
          ...modelHouses,
          [series.id]: series,
        }
        await saveModelHousesToAPI(updatedModelHouses)
      } catch (error) {
        console.error("Error adding model house series:", error)
        throw error
      }
    },
    [modelHouses, saveModelHousesToAPI],
  )

  const updateModelHouseSeries = useCallback(
    async (id: string, series: ModelHouseSeries) => {
      try {
        // Preserve units if not provided in the update
        const updatedSeries = {
          ...modelHouses[id],
          ...series,
          units: series.units || modelHouses[id]?.units || [],
        }

        const updatedModelHouses = {
          ...modelHouses,
          [id]: updatedSeries,
        }

        await saveModelHousesToAPI(updatedModelHouses)
      } catch (error) {
        console.error("Error updating model house series:", error)
        throw error
      }
    },
    [modelHouses, saveModelHousesToAPI],
  )

  const deleteModelHouseSeries = useCallback(
    async (id: string) => {
      try {
        const newModelHouses = { ...modelHouses }
        delete newModelHouses[id]
        await saveModelHousesToAPI(newModelHouses)
      } catch (error) {
        console.error("Error deleting model house series:", error)
        throw error
      }
    },
    [modelHouses, saveModelHousesToAPI],
  )

  // CRUD operations for model house units
  const addModelHouseUnit = useCallback(
    async (seriesId: string, unit: ModelHouseUnit) => {
      try {
        if (!modelHouses[seriesId]) throw new Error("Series not found")

        const updatedSeries = {
          ...modelHouses[seriesId],
          units: [...(modelHouses[seriesId].units || []), unit],
        }

        const updatedModelHouses = {
          ...modelHouses,
          [seriesId]: updatedSeries,
        }

        await saveModelHousesToAPI(updatedModelHouses)
      } catch (error) {
        console.error("Error adding model house unit:", error)
        throw error
      }
    },
    [modelHouses, saveModelHousesToAPI],
  )

  const updateModelHouseUnit = useCallback(
    async (seriesId: string, unitId: string, unit: ModelHouseUnit) => {
      try {
        if (!modelHouses[seriesId]) throw new Error("Series not found")
        if (!modelHouses[seriesId].units) {
          modelHouses[seriesId].units = []
        }

        const updatedUnits = modelHouses[seriesId].units.map((u) => (u.id === unitId ? { ...u, ...unit } : u))

        const updatedSeries = {
          ...modelHouses[seriesId],
          units: updatedUnits,
        }

        const updatedModelHouses = {
          ...modelHouses,
          [seriesId]: updatedSeries,
        }

        await saveModelHousesToAPI(updatedModelHouses)
      } catch (error) {
        console.error("Error updating model house unit:", error)
        throw error
      }
    },
    [modelHouses, saveModelHousesToAPI],
  )

  const deleteModelHouseUnit = useCallback(
    async (seriesId: string, unitId: string) => {
      try {
        if (!modelHouses[seriesId]) throw new Error("Series not found")
        if (!modelHouses[seriesId].units) {
          modelHouses[seriesId].units = []
        }

        const updatedSeries = {
          ...modelHouses[seriesId],
          units: modelHouses[seriesId].units.filter((u) => u.id !== unitId),
        }

        const updatedModelHouses = {
          ...modelHouses,
          [seriesId]: updatedSeries,
        }

        await saveModelHousesToAPI(updatedModelHouses)
      } catch (error) {
        console.error("Error deleting model house unit:", error)
        throw error
      }
    },
    [modelHouses, saveModelHousesToAPI],
  )

  // Update RFO unit directly
  const updateRFOUnit = useCallback(
    async (unitId: string, updatedUnit: Partial<RFOUnit>) => {
      try {
        // Find the RFO unit
        const rfoUnit = rfoUnits.find((u) => u.id === unitId)
        if (!rfoUnit) throw new Error("RFO unit not found")

        // Update the model house unit
        await updateModelHouseUnit(rfoUnit.seriesId, unitId, { ...rfoUnit, ...updatedUnit } as ModelHouseUnit)
      } catch (error) {
        console.error("Error updating RFO unit:", error)
        throw error
      }
    },
    [rfoUnits, updateModelHouseUnit],
  )

  // Getter functions with null checks
  const getAllModelHouseSeries = useCallback(() => {
    return Object.values(modelHouses || {})
  }, [modelHouses])

  const getModelHouseSeriesById = useCallback(
    (id: string) => {
      return modelHouses?.[id] || null
    },
    [modelHouses],
  )

  const getModelHouseUnitById = useCallback(
    (seriesId: string, unitId: string) => {
      const series = modelHouses?.[seriesId]
      if (!series || !series.units) return null
      return series.units.find((unit) => unit.id === unitId) || null
    },
    [modelHouses],
  )

  const getRFOUnitById = useCallback(
    (unitId: string) => {
      return rfoUnits.find((unit) => unit.id === unitId) || null
    },
    [rfoUnits],
  )

  // New functions to replace direct imports from data files
  const getModelHousesByProject = useCallback(
    (project: string) => {
      return getAllModelHouseSeries().filter((series) => series.project === project)
    },
    [getAllModelHouseSeries],
  )

  const getAllProjects = useCallback(() => {
    const projects = new Set<string>()
    getAllModelHouseSeries().forEach((series) => {
      if (series.project) {
        projects.add(series.project)
      }
    })
    return Array.from(projects)
  }, [getAllModelHouseSeries])

  const getAllRFOUnits = useCallback(() => rfoUnits, [rfoUnits])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      modelHouses,
      rfoUnits,
      isLoading,
      error: error ? new Error(error.message) : null,
      addModelHouseSeries,
      updateModelHouseSeries,
      deleteModelHouseSeries,
      addModelHouseUnit,
      updateModelHouseUnit,
      deleteModelHouseUnit,
      updateRFOUnit,
      getAllModelHouseSeries,
      getModelHouseSeriesById,
      getModelHouseUnitById,
      getRFOUnitById,
      getModelHousesByProject,
      getAllProjects,
      getAllRFOUnits,
      resetToDefaultData,
      refreshData,
    }),
    [
      modelHouses,
      rfoUnits,
      isLoading,
      error,
      addModelHouseSeries,
      updateModelHouseSeries,
      deleteModelHouseSeries,
      addModelHouseUnit,
      updateModelHouseUnit,
      deleteModelHouseUnit,
      updateRFOUnit,
      getAllModelHouseSeries,
      getModelHouseSeriesById,
      getModelHouseUnitById,
      getRFOUnitById,
      getModelHousesByProject,
      getAllProjects,
      getAllRFOUnits,
      resetToDefaultData,
      refreshData,
    ],
  )

  return <ModelHousesContext.Provider value={value}>{children}</ModelHousesContext.Provider>
}

export const useModelHousesContext = () => {
  const context = useContext(ModelHousesContext)
  if (context === undefined) {
    throw new Error("useModelHousesContext must be used within a ModelHousesProvider")
  }
  return context
}
