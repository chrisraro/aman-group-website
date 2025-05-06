"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ModelHouseSeries, ModelHouseUnit } from "@/lib/hooks/useModelHouses"
import type { RFOUnit } from "@/lib/hooks/useRFOUnits"
import { modelHouseSeries as initialModelHouseSeries, getAllRFOUnits } from "@/data/model-houses"

// Storage keys
const MODEL_HOUSES_STORAGE_KEY = "modelHouses"

type ModelHousesContextType = {
  modelHouses: Record<string, ModelHouseSeries>
  rfoUnits: RFOUnit[]
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
  resetToDefaultData: () => void
}

const ModelHousesContext = createContext<ModelHousesContextType | undefined>(undefined)

export const ModelHousesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modelHouses, setModelHouses] = useState<Record<string, ModelHouseSeries>>({})
  const [rfoUnits, setRFOUnits] = useState<RFOUnit[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Function to save model houses to localStorage
  const saveModelHousesToStorage = useCallback((data: Record<string, ModelHouseSeries>) => {
    if (typeof window === "undefined") return

    try {
      localStorage.setItem(MODEL_HOUSES_STORAGE_KEY, JSON.stringify(data))
      console.log("Model houses data saved to localStorage")
    } catch (error) {
      console.error("Failed to save model houses data to localStorage:", error)
    }
  }, [])

  // Initialize data from localStorage or default data
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      try {
        const storedModelHouses = localStorage.getItem(MODEL_HOUSES_STORAGE_KEY)

        if (storedModelHouses) {
          const parsedData = JSON.parse(storedModelHouses)
          setModelHouses(parsedData)
          console.log("Loaded model houses data from localStorage")

          // Derive RFO units from the loaded model houses
          const derivedRFOUnits = deriveRFOUnitsFromModelHouses(parsedData)
          setRFOUnits(derivedRFOUnits)
        } else {
          console.log("No stored data found, using initial data")
          setModelHouses(initialModelHouseSeries)

          // Initialize RFO units from default data
          const initialRFOUnits = getAllRFOUnits()
          setRFOUnits(initialRFOUnits)
        }
      } catch (error) {
        console.error("Error loading data from localStorage:", error)
        // Fallback to initial data if there's an error
        setModelHouses(initialModelHouseSeries)
        const initialRFOUnits = getAllRFOUnits()
        setRFOUnits(initialRFOUnits)
      }

      setIsInitialized(true)
    }
  }, [isInitialized])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      saveModelHousesToStorage(modelHouses)
    }
  }, [modelHouses, isInitialized, saveModelHousesToStorage])

  // Helper function to derive RFO units from model houses
  const deriveRFOUnitsFromModelHouses = (houses: Record<string, ModelHouseSeries>): RFOUnit[] => {
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
  }

  // Reset to default data
  const resetToDefaultData = () => {
    setModelHouses(initialModelHouseSeries)
    const initialRFOUnits = getAllRFOUnits()
    setRFOUnits(initialRFOUnits)
    saveModelHousesToStorage(initialModelHouseSeries)
  }

  // CRUD operations for model house series
  const addModelHouseSeries = (series: ModelHouseSeries) => {
    setModelHouses((prev) => {
      const updated = {
        ...prev,
        [series.id]: series,
      }
      return updated
    })
  }

  const updateModelHouseSeries = (id: string, series: ModelHouseSeries) => {
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
  }

  const deleteModelHouseSeries = (id: string) => {
    setModelHouses((prev) => {
      const newModelHouses = { ...prev }

      // Check if any units in this series are RFO before deleting
      const seriesUnits = prev[id]?.units || []
      const rfoUnitIds = seriesUnits.filter((unit) => unit.isRFO).map((unit) => unit.id)

      // Remove RFO units from the RFO units list
      if (rfoUnitIds.length > 0) {
        setRFOUnits((prevRFOUnits) => prevRFOUnits.filter((unit) => !rfoUnitIds.includes(unit.id)))
      }

      // Delete the series
      delete newModelHouses[id]
      return newModelHouses
    })
  }

  // CRUD operations for model house units
  const addModelHouseUnit = (seriesId: string, unit: ModelHouseUnit) => {
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

    // Update RFO units if the new unit is RFO
    if (unit.isRFO) {
      setModelHouses((currentModelHouses) => {
        const series = currentModelHouses[seriesId]
        if (series) {
          const newRFOUnit: RFOUnit = {
            ...unit,
            seriesId,
            seriesName: series.name.split(" ")[0],
            floorArea: series.floorArea,
            loftReady: series.loftReady,
            developer: series.developer,
            developerColor: series.developerColor || "#000000",
            project: series.project,
          }

          setRFOUnits((prev) => [...prev, newRFOUnit])
        }
        return currentModelHouses
      })
    }
  }

  const updateModelHouseUnit = (seriesId: string, unitId: string, unit: ModelHouseUnit) => {
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

    // Update RFO units if needed
    setModelHouses((currentModelHouses) => {
      const wasRFO = currentModelHouses[seriesId]?.units.find((u) => u.id === unitId)?.isRFO

      if (unit.isRFO || wasRFO) {
        // If the unit is now RFO or was RFO, we need to update the RFO units
        const series = currentModelHouses[seriesId]
        if (series) {
          if (unit.isRFO) {
            // Add or update RFO unit
            const updatedUnit = {
              ...currentModelHouses[seriesId].units.find((u) => u.id === unitId),
              ...unit,
            }

            const newRFOUnit: RFOUnit = {
              ...(updatedUnit as ModelHouseUnit),
              seriesId,
              seriesName: series.name.split(" ")[0],
              floorArea: series.floorArea,
              loftReady: series.loftReady,
              developer: series.developer,
              developerColor: series.developerColor || "#000000",
              project: series.project,
            }

            setRFOUnits((prev) => {
              const existingIndex = prev.findIndex((u) => u.id === unitId)
              if (existingIndex >= 0) {
                // Update existing RFO unit
                const newRFOUnits = [...prev]
                newRFOUnits[existingIndex] = newRFOUnit
                return newRFOUnits
              } else {
                // Add new RFO unit
                return [...prev, newRFOUnit]
              }
            })
          } else if (wasRFO && !unit.isRFO) {
            // Remove from RFO units if it's no longer RFO
            setRFOUnits((prev) => prev.filter((u) => u.id !== unitId))
          }
        }
      }

      return currentModelHouses
    })
  }

  const deleteModelHouseUnit = (seriesId: string, unitId: string) => {
    // Check if the unit is RFO before deleting
    setModelHouses((currentModelHouses) => {
      const isRFO = currentModelHouses[seriesId]?.units.find((u) => u.id === unitId)?.isRFO

      if (isRFO) {
        // Remove from RFO units if it was an RFO unit
        setRFOUnits((prev) => prev.filter((u) => u.id !== unitId))
      }

      // Remove the unit from the series
      const updated = {
        ...currentModelHouses,
        [seriesId]: {
          ...currentModelHouses[seriesId],
          units: currentModelHouses[seriesId].units.filter((u) => u.id !== unitId),
        },
      }

      return updated
    })
  }

  // Update RFO unit directly
  const updateRFOUnit = (unitId: string, updatedUnit: Partial<RFOUnit>) => {
    // Find the RFO unit
    const rfoUnit = rfoUnits.find((u) => u.id === unitId)
    if (!rfoUnit) return

    // Update the model house unit first
    updateModelHouseUnit(rfoUnit.seriesId, unitId, { ...rfoUnit, ...updatedUnit } as ModelHouseUnit)
  }

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

  const value = {
    modelHouses,
    rfoUnits,
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
    resetToDefaultData,
  }

  return <ModelHousesContext.Provider value={value}>{children}</ModelHousesContext.Provider>
}

export const useModelHousesContext = () => {
  const context = useContext(ModelHousesContext)
  if (context === undefined) {
    throw new Error("useModelHousesContext must be used within a ModelHousesProvider")
  }
  return context
}
