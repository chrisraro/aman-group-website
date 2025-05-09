"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import type { ModelHouseSeries, ModelHouseUnit } from "@/lib/hooks/useModelHouses"
import type { RFOUnit } from "@/lib/hooks/useRFOUnits"
import { modelHouseSeries as initialModelHouseSeries } from "@/data/model-houses"

// Storage keys
const MODEL_HOUSES_STORAGE_KEY = "modelHouses"
const STORAGE_VERSION_KEY = "modelHousesVersion"
const CURRENT_VERSION = "1.0.1" // Increment this when data structure changes

type ModelHousesContextType = {
  modelHouses: Record<string, ModelHouseSeries>
  rfoUnits: RFOUnit[]
  isLoading: boolean
  error: Error | null
  addModelHouseSeries: (series: ModelHouseSeries) => void
  updateModelHouseSeries: (id: string, series: ModelHouseSeries) => void
  deleteModelHouseSeries: (id: string) => void
  addModelHouseUnit: (seriesId: string, unit: ModelHouseUnit) => void
  updateModelHouseUnit: (seriesId: string, unitId: string, unit: ModelHouseUnit) => void
  deleteModelHouseUnit: (seriesId: string, unitId: string) => void
  updateRFOUnit: (unitId: string, unit: Partial<RFOUnit>) => void
  getAllModelHouseSeries: () => ModelHouseSeries[]
  getModelHouseSeriesById: (id: string) => ModelHouseSeries | null
  getModelHouseUnitById: (seriesId: string, unitId: string) => ModelHouseUnit | null
  getRFOUnitById: (unitId: string) => RFOUnit | null
  getModelHousesByProject: (project: string) => ModelHouseSeries[]
  getAllProjects: () => string[]
  getAllRFOUnits: () => RFOUnit[]
  resetToDefaultData: () => void
  refreshData: () => void
}

const ModelHousesContext = createContext<ModelHousesContextType | undefined>(undefined)

export const ModelHousesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modelHouses, setModelHouses] = useState<Record<string, ModelHouseSeries>>({})
  const [rfoUnits, setRFOUnits] = useState<RFOUnit[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to save model houses to localStorage with versioning
  const saveModelHousesToStorage = useCallback((data: Record<string, ModelHouseSeries>) => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(MODEL_HOUSES_STORAGE_KEY, JSON.stringify(data))
      localStorage.setItem(STORAGE_VERSION_KEY, CURRENT_VERSION)
      console.log("Model houses data saved to localStorage")
    } catch (error) {
      console.error("Failed to save model houses data to localStorage:", error)
      setError(error instanceof Error ? error : new Error("Failed to save data"))
    }
  }, [])

  // Helper function to derive RFO units from model houses
  const deriveRFOUnitsFromModelHouses = useCallback((houses: Record<string, ModelHouseSeries>): RFOUnit[] => {
    const rfoUnits: RFOUnit[] = []

    Object.values(houses).forEach((series) => {
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

  // Initialize data from localStorage or default data
  const initializeData = useCallback(() => {
    if (typeof window === "undefined" || isInitialized) return

    setIsLoading(true)
    setError(null)

    try {
      const storedVersion = localStorage.getItem(STORAGE_VERSION_KEY)
      const storedModelHouses = localStorage.getItem(MODEL_HOUSES_STORAGE_KEY)

      // If version mismatch or no stored data, use initial data
      if (storedVersion !== CURRENT_VERSION || !storedModelHouses) {
        console.log("Using initial data (version mismatch or no stored data)")
        setModelHouses(initialModelHouseSeries)

        // Derive RFO units from the initial data
        const derivedRFOUnits = deriveRFOUnitsFromModelHouses(initialModelHouseSeries)
        setRFOUnits(derivedRFOUnits)

        saveModelHousesToStorage(initialModelHouseSeries)
      } else {
        // Use stored data
        const parsedData = JSON.parse(storedModelHouses)
        setModelHouses(parsedData)
        console.log("Loaded model houses data from localStorage")

        // Derive RFO units from the loaded model houses
        const derivedRFOUnits = deriveRFOUnitsFromModelHouses(parsedData)
        setRFOUnits(derivedRFOUnits)
      }
    } catch (error) {
      console.error("Error loading data from localStorage:", error)
      setError(error instanceof Error ? error : new Error("Failed to load data"))

      // Fallback to initial data if there's an error
      setModelHouses(initialModelHouseSeries)
      const derivedRFOUnits = deriveRFOUnitsFromModelHouses(initialModelHouseSeries)
      setRFOUnits(derivedRFOUnits)
      saveModelHousesToStorage(initialModelHouseSeries)
    } finally {
      setIsLoading(false)
      setIsInitialized(true)
    }
  }, [isInitialized, saveModelHousesToStorage, deriveRFOUnitsFromModelHouses])

  // Initialize data on component mount
  useEffect(() => {
    initializeData()
  }, [initializeData])

  // Listen for storage events (for cross-tab synchronization)
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === MODEL_HOUSES_STORAGE_KEY && event.newValue) {
        try {
          const newData = JSON.parse(event.newValue)

          // Update model houses
          setModelHouses(newData)

          // Derive RFO units from the new data
          const derivedRFOUnits = deriveRFOUnitsFromModelHouses(newData)
          setRFOUnits(derivedRFOUnits)

          console.log("Updated data from another tab")
        } catch (error) {
          console.error("Error parsing storage event data:", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [deriveRFOUnitsFromModelHouses])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      saveModelHousesToStorage(modelHouses)
    }
  }, [modelHouses, isInitialized, saveModelHousesToStorage])

  // Function to refresh data (useful for syncing between tabs)
  const refreshData = useCallback(() => {
    setIsInitialized(false)
    initializeData()
  }, [initializeData])

  // Reset to default data
  const resetToDefaultData = useCallback(() => {
    setIsLoading(true)
    try {
      setModelHouses(initialModelHouseSeries)
      const derivedRFOUnits = deriveRFOUnitsFromModelHouses(initialModelHouseSeries)
      setRFOUnits(derivedRFOUnits)
      saveModelHousesToStorage(initialModelHouseSeries)
      setError(null)
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Failed to reset data"))
    } finally {
      setIsLoading(false)
    }
  }, [saveModelHousesToStorage, deriveRFOUnitsFromModelHouses])

  // CRUD operations for model house series
  const addModelHouseSeries = useCallback((series: ModelHouseSeries) => {
    setModelHouses((prev) => {
      const updated = {
        ...prev,
        [series.id]: series,
      }
      return updated
    })
  }, [])

  const updateModelHouseSeries = useCallback((id: string, series: ModelHouseSeries) => {
    setModelHouses((prev) => {
      // Preserve units if not provided in the update
      const updatedSeries = {
        ...prev[id],
        ...series,
        units: series.units || prev[id]?.units || [],
      }

      const updated = {
        ...prev,
        [id]: updatedSeries,
      }

      return updated
    })
  }, [])

  const deleteModelHouseSeries = useCallback((id: string) => {
    setModelHouses((prev) => {
      const newModelHouses = { ...prev }
      delete newModelHouses[id]
      return newModelHouses
    })
  }, [])

  // CRUD operations for model house units
  const addModelHouseUnit = useCallback((seriesId: string, unit: ModelHouseUnit) => {
    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      const updatedSeries = {
        ...prev[seriesId],
        units: [...prev[seriesId].units, unit],
      }

      const updated = {
        ...prev,
        [seriesId]: updatedSeries,
      }

      return updated
    })
  }, [])

  const updateModelHouseUnit = useCallback((seriesId: string, unitId: string, unit: ModelHouseUnit) => {
    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      const updatedUnits = prev[seriesId].units.map((u) => (u.id === unitId ? { ...u, ...unit } : u))

      const updatedSeries = {
        ...prev[seriesId],
        units: updatedUnits,
      }

      const updated = {
        ...prev,
        [seriesId]: updatedSeries,
      }

      return updated
    })
  }, [])

  const deleteModelHouseUnit = useCallback((seriesId: string, unitId: string) => {
    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      const updated = {
        ...prev,
        [seriesId]: {
          ...prev[seriesId],
          units: prev[seriesId].units.filter((u) => u.id !== unitId),
        },
      }

      return updated
    })
  }, [])

  // Update RFO unit directly
  const updateRFOUnit = useCallback(
    (unitId: string, updatedUnit: Partial<RFOUnit>) => {
      // Find the RFO unit
      const rfoUnit = rfoUnits.find((u) => u.id === unitId)
      if (!rfoUnit) return

      // Update the model house unit first
      updateModelHouseUnit(rfoUnit.seriesId, unitId, { ...rfoUnit, ...updatedUnit } as ModelHouseUnit)
    },
    [rfoUnits, updateModelHouseUnit],
  )

  // Getter functions
  const getAllModelHouseSeries = useCallback(() => Object.values(modelHouses), [modelHouses])

  const getModelHouseSeriesById = useCallback((id: string) => modelHouses[id] || null, [modelHouses])

  const getModelHouseUnitById = useCallback(
    (seriesId: string, unitId: string) => {
      const series = modelHouses[seriesId]
      if (!series) return null
      return series.units.find((unit) => unit.id === unitId) || null
    },
    [modelHouses],
  )

  const getRFOUnitById = useCallback(
    (unitId: string) => rfoUnits.find((unit) => unit.id === unitId) || null,
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
