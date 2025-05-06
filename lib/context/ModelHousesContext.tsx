"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { ModelHouseSeries, ModelHouseUnit } from "@/lib/hooks/useModelHouses"
import type { RFOUnit } from "@/lib/hooks/useRFOUnits"
import { modelHouseSeries as initialModelHouseSeries, getAllRFOUnits } from "@/data/model-houses"

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
}

const ModelHousesContext = createContext<ModelHousesContextType | undefined>(undefined)

export const ModelHousesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modelHouses, setModelHouses] = useState<Record<string, ModelHouseSeries>>({})
  const [rfoUnits, setRFOUnits] = useState<RFOUnit[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize data from localStorage or default data
  useEffect(() => {
    if (typeof window !== "undefined" && !isInitialized) {
      const storedModelHouses = localStorage.getItem("modelHouses")
      if (storedModelHouses) {
        setModelHouses(JSON.parse(storedModelHouses))
      } else {
        setModelHouses(initialModelHouseSeries)
      }

      // Initialize RFO units
      const initialRFOUnits = getAllRFOUnits()
      setRFOUnits(initialRFOUnits)

      setIsInitialized(true)
    }
  }, [isInitialized])

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("modelHouses", JSON.stringify(modelHouses))

      // We don't need to separately store RFO units as they're derived from model houses
    }
  }, [modelHouses, isInitialized])

  // CRUD operations for model house series
  const addModelHouseSeries = (series: ModelHouseSeries) => {
    setModelHouses((prev) => ({
      ...prev,
      [series.id]: series,
    }))
  }

  const updateModelHouseSeries = (id: string, series: ModelHouseSeries) => {
    setModelHouses((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        ...series,
        units: prev[id]?.units || [], // Preserve units if not provided
      },
    }))
  }

  const deleteModelHouseSeries = (id: string) => {
    setModelHouses((prev) => {
      const newModelHouses = { ...prev }
      delete newModelHouses[id]
      return newModelHouses
    })
  }

  // CRUD operations for model house units
  const addModelHouseUnit = (seriesId: string, unit: ModelHouseUnit) => {
    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      return {
        ...prev,
        [seriesId]: {
          ...prev[seriesId],
          units: [...prev[seriesId].units, unit],
        },
      }
    })

    // Update RFO units if the new unit is RFO
    if (unit.isRFO) {
      const series = modelHouses[seriesId]
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
    }
  }

  const updateModelHouseUnit = (seriesId: string, unitId: string, unit: ModelHouseUnit) => {
    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      return {
        ...prev,
        [seriesId]: {
          ...prev[seriesId],
          units: prev[seriesId].units.map((u) => (u.id === unitId ? { ...u, ...unit } : u)),
        },
      }
    })

    // Update RFO units if needed
    const wasRFO = modelHouses[seriesId]?.units.find((u) => u.id === unitId)?.isRFO

    if (unit.isRFO || wasRFO) {
      // If the unit is now RFO or was RFO, we need to update the RFO units
      const series = modelHouses[seriesId]
      if (series) {
        if (unit.isRFO) {
          // Add or update RFO unit
          const updatedUnit = {
            ...modelHouses[seriesId].units.find((u) => u.id === unitId),
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
  }

  const deleteModelHouseUnit = (seriesId: string, unitId: string) => {
    // Check if the unit is RFO before deleting
    const isRFO = modelHouses[seriesId]?.units.find((u) => u.id === unitId)?.isRFO

    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      return {
        ...prev,
        [seriesId]: {
          ...prev[seriesId],
          units: prev[seriesId].units.filter((u) => u.id !== unitId),
        },
      }
    })

    // Remove from RFO units if it was an RFO unit
    if (isRFO) {
      setRFOUnits((prev) => prev.filter((u) => u.id !== unitId))
    }
  }

  // Update RFO unit directly
  const updateRFOUnit = (unitId: string, updatedUnit: Partial<RFOUnit>) => {
    // Find the RFO unit
    const rfoUnit = rfoUnits.find((u) => u.id === unitId)
    if (!rfoUnit) return

    // Update the model house unit first
    updateModelHouseUnit(rfoUnit.seriesId, unitId, { ...rfoUnit, ...updatedUnit } as ModelHouseUnit)

    // The RFO units will be updated automatically by the updateModelHouseUnit function
  }

  // Getter functions
  const getAllModelHouseSeries = () => Object.values(modelHouses)

  const getModelHouseSeriesById = (id: string) => modelHouses[id] || null

  const getModelHouseUnitById = (seriesId: string, unitId: string) => {
    const series = modelHouses[seriesId]
    if (!series) return null
    return series.units.find((unit) => unit.id === unitId) || null
  }

  const getRFOUnitById = (unitId: string) => {
    return rfoUnits.find((unit) => unit.id === unitId) || null
  }

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
