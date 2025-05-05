"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { ModelHouseSeries, ModelHouseUnit } from "../../data/model-houses"

interface ModelHousesContextType {
  modelHouses: Record<string, ModelHouseSeries>
  addModelHouseSeries: (series: ModelHouseSeries) => void
  updateModelHouseSeries: (id: string, series: ModelHouseSeries) => void
  deleteModelHouseSeries: (id: string) => void
  addUnit: (seriesId: string, unit: ModelHouseUnit) => void
  updateUnit: (seriesId: string, unitId: string, unit: ModelHouseUnit) => void
  deleteUnit: (seriesId: string, unitId: string) => void
  loading: boolean
}

const ModelHousesContext = createContext<ModelHousesContextType | undefined>(undefined)

export function ModelHousesProvider({ children }: { children: ReactNode }) {
  const [modelHouses, setModelHouses] = useState<Record<string, ModelHouseSeries>>({})
  const [loading, setLoading] = useState(true)

  // Load data from localStorage on mount
  useEffect(() => {
    const loadData = () => {
      try {
        const savedData = localStorage.getItem("modelHouseSeries")
        if (savedData) {
          setModelHouses(JSON.parse(savedData))
        } else {
          // If no data in localStorage, try to import from the original file
          import("../constants/model-houses-data")
            .then((importedData) => {
              if (importedData && importedData.default) {
                setModelHouses(importedData.default)
                localStorage.setItem("modelHouseSeries", JSON.stringify(importedData.default))
              }
            })
            .catch((error) => {
              console.error("Error importing model houses data:", error)
            })
        }
      } catch (error) {
        console.error("Error loading model houses data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      localStorage.setItem("modelHouseSeries", JSON.stringify(modelHouses))
    }
  }, [modelHouses, loading])

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
        ...series,
        units: prev[id]?.units || [],
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

  const addUnit = (seriesId: string, unit: ModelHouseUnit) => {
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
  }

  const updateUnit = (seriesId: string, unitId: string, unit: ModelHouseUnit) => {
    setModelHouses((prev) => {
      if (!prev[seriesId]) return prev

      return {
        ...prev,
        [seriesId]: {
          ...prev[seriesId],
          units: prev[seriesId].units.map((u) => (u.id === unitId ? unit : u)),
        },
      }
    })
  }

  const deleteUnit = (seriesId: string, unitId: string) => {
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
  }

  return (
    <ModelHousesContext.Provider
      value={{
        modelHouses,
        addModelHouseSeries,
        updateModelHouseSeries,
        deleteModelHouseSeries,
        addUnit,
        updateUnit,
        deleteUnit,
        loading,
      }}
    >
      {children}
    </ModelHousesContext.Provider>
  )
}

export function useModelHousesContext() {
  const context = useContext(ModelHousesContext)
  if (context === undefined) {
    throw new Error("useModelHousesContext must be used within a ModelHousesProvider")
  }
  return context
}
