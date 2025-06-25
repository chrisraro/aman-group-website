"use client"

import type React from "react"
import { createContext, useContext, useCallback, useMemo } from "react"
import type { LotOnlyProperty } from "@/data/lot-only-properties"
import { lotOnlyProperties as initialLotOnlyProperties } from "@/data/lot-only-properties"
import useSWR from "swr"

// API endpoints
const LOT_ONLY_API = "/api/lot-only"

type LotOnlyContextType = {
  properties: LotOnlyProperty[]
  isLoading: boolean
  error: Error | null
  addProperty: (property: LotOnlyProperty) => Promise<void>
  updateProperty: (id: string, property: LotOnlyProperty) => Promise<void>
  deleteProperty: (id: string) => Promise<void>
  getPropertyById: (id: string) => LotOnlyProperty | null
  getPropertiesByProject: (project: string) => LotOnlyProperty[]
  getPropertiesByDeveloper: (developer: string) => LotOnlyProperty[]
  getAllProjects: () => string[]
  getAllDevelopers: () => string[]
  resetToDefaultData: () => Promise<void>
  refreshData: () => Promise<void>
}

const LotOnlyContext = createContext<LotOnlyContextType | undefined>(undefined)

// Fetcher function for SWR with error handling and fallback
const fetcher = async (url: string) => {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      // If API fails, return initial data as fallback
      console.warn(`API fetch failed: ${response.status} ${response.statusText}`)
      return initialLotOnlyProperties
    }
    const data = await response.json()
    return data.properties || initialLotOnlyProperties
  } catch (error) {
    console.warn("Fetch error, using fallback data:", error)
    // Return initial data as fallback instead of throwing
    return initialLotOnlyProperties
  }
}

export const LotOnlyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use SWR for data fetching with fallback to initial data
  const { data, error, isLoading, mutate } = useSWR<LotOnlyProperty[]>(LOT_ONLY_API, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 5000, // 5 seconds
    fallbackData: initialLotOnlyProperties, // Provide fallback data to avoid null/undefined
    shouldRetryOnError: false, // Don't retry on error, use fallback instead
    onError: (err) => {
      console.warn("SWR Error, using fallback data:", err)
    },
  })

  // Ensure properties is never undefined
  const properties = data || []

  // Function to save properties to the API with error handling
  const savePropertiesToAPI = useCallback(
    async (data: LotOnlyProperty[]) => {
      try {
        const response = await fetch(LOT_ONLY_API, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ properties: data }),
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(`Failed to save: ${response.status} ${response.statusText} ${JSON.stringify(errorData)}`)
        }

        // Update the local cache
        await mutate(data, false)

        console.log("Lot-only properties data saved to API")
      } catch (error) {
        console.error("Failed to save lot-only properties data to API:", error)
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
      const response = await fetch(LOT_ONLY_API, {
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

  // CRUD operations for lot-only properties
  const addProperty = useCallback(
    async (property: LotOnlyProperty) => {
      try {
        const updatedProperties = [...properties, property]
        await savePropertiesToAPI(updatedProperties)
      } catch (error) {
        console.error("Error adding lot-only property:", error)
        throw error
      }
    },
    [properties, savePropertiesToAPI],
  )

  const updateProperty = useCallback(
    async (id: string, property: LotOnlyProperty) => {
      try {
        const updatedProperties = properties.map((p) => (p.id === id ? { ...p, ...property } : p))
        await savePropertiesToAPI(updatedProperties)
      } catch (error) {
        console.error("Error updating lot-only property:", error)
        throw error
      }
    },
    [properties, savePropertiesToAPI],
  )

  const deleteProperty = useCallback(
    async (id: string) => {
      try {
        const updatedProperties = properties.filter((p) => p.id !== id)
        await savePropertiesToAPI(updatedProperties)
      } catch (error) {
        console.error("Error deleting lot-only property:", error)
        throw error
      }
    },
    [properties, savePropertiesToAPI],
  )

  // Getter functions
  const getPropertyById = useCallback(
    (id: string) => {
      return properties.find((p) => p.id === id) || null
    },
    [properties],
  )

  const getPropertiesByProject = useCallback(
    (project: string) => {
      return properties.filter((p) => p.project === project)
    },
    [properties],
  )

  const getPropertiesByDeveloper = useCallback(
    (developer: string) => {
      return properties.filter((p) => p.developer === developer)
    },
    [properties],
  )

  const getAllProjects = useCallback(() => {
    const projects = new Set<string>()
    properties.forEach((p) => {
      if (p.project) {
        projects.add(p.project)
      }
    })
    return Array.from(projects)
  }, [properties])

  const getAllDevelopers = useCallback(() => {
    const developers = new Set<string>()
    properties.forEach((p) => {
      if (p.developer) {
        developers.add(p.developer)
      }
    })
    return Array.from(developers)
  }, [properties])

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(
    () => ({
      properties,
      isLoading,
      error: error ? new Error(error.message) : null,
      addProperty,
      updateProperty,
      deleteProperty,
      getPropertyById,
      getPropertiesByProject,
      getPropertiesByDeveloper,
      getAllProjects,
      getAllDevelopers,
      resetToDefaultData,
      refreshData,
    }),
    [
      properties,
      isLoading,
      error,
      addProperty,
      updateProperty,
      deleteProperty,
      getPropertyById,
      getPropertiesByProject,
      getPropertiesByDeveloper,
      getAllProjects,
      getAllDevelopers,
      resetToDefaultData,
      refreshData,
    ],
  )

  return <LotOnlyContext.Provider value={value}>{children}</LotOnlyContext.Provider>
}

export const useLotOnlyContext = () => {
  const context = useContext(LotOnlyContext)
  if (context === undefined) {
    throw new Error("useLotOnlyContext must be used within a LotOnlyProvider")
  }
  return context
}
