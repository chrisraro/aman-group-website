"use client"

import { useState, useEffect, useCallback } from "react"
import type { LotOnlyProperty } from "@/data/lot-only-properties"

// API endpoints
const LOT_ONLY_API = "/api/lot-only"

export function useLotOnlyProperties() {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${LOT_ONLY_API}?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch properties")
      }

      setProperties(data.properties || [])
    } catch (err) {
      console.error("Error fetching lot-only properties:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return {
    properties,
    isLoading,
    error,
    refreshData: fetchProperties,
    total: properties.length,
  }
}

export function useLotOnlyPropertiesByProject(project: string | null) {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!project) {
      setProperties([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${LOT_ONLY_API}?project=${encodeURIComponent(project)}&t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch properties")
      }

      setProperties(data.properties || [])
    } catch (err) {
      console.error("Error fetching lot-only properties by project:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [project])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return {
    properties,
    isLoading,
    error,
    refreshData: fetchProperties,
    total: properties.length,
  }
}

export function useLotOnlyProperty(id: string | null) {
  const [property, setProperty] = useState<LotOnlyProperty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProperty = useCallback(async () => {
    if (!id) {
      setProperty(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${LOT_ONLY_API}/${id}?t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error("Property not found")
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch property")
      }

      setProperty(data.property || null)
    } catch (err) {
      console.error("Error fetching lot-only property:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only property"))
      setProperty(null)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  return {
    property,
    isLoading,
    error,
    refreshData: fetchProperty,
  }
}

export function useLotOnlyPropertiesByDeveloper(developer: string | null) {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchProperties = useCallback(async () => {
    if (!developer) {
      setProperties([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const response = await fetch(`${LOT_ONLY_API}?developer=${encodeURIComponent(developer)}&t=${Date.now()}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (!data.success) {
        throw new Error(data.error || "Failed to fetch properties")
      }

      setProperties(data.properties || [])
    } catch (err) {
      console.error("Error fetching lot-only properties by developer:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setProperties([])
    } finally {
      setIsLoading(false)
    }
  }, [developer])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return {
    properties,
    isLoading,
    error,
    refreshData: fetchProperties,
    total: properties.length,
  }
}
