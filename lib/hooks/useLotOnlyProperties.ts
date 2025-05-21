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
      // Add cache-busting timestamp
      const response = await fetch(`${LOT_ONLY_API}?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setProperties(data.properties || [])
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching lot-only properties:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return { properties, isLoading, error, refreshData: fetchProperties }
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
      // Add cache-busting timestamp
      const response = await fetch(`${LOT_ONLY_API}?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const filteredProperties = (data.properties || []).filter(
        (property: LotOnlyProperty) => property.project === project,
      )
      setProperties(filteredProperties)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching lot-only properties by project:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setIsLoading(false)
    }
  }, [project])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return { properties, isLoading, error, refreshData: fetchProperties }
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
      // Add cache-busting timestamp
      const response = await fetch(`${LOT_ONLY_API}/${id}?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      setProperty(data.property || null)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching lot-only property:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only property"))
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchProperty()
  }, [fetchProperty])

  return { property, isLoading, error, refreshData: fetchProperty }
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
      // Add cache-busting timestamp
      const response = await fetch(`${LOT_ONLY_API}?t=${Date.now()}`)

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      const filteredProperties = (data.properties || []).filter(
        (property: LotOnlyProperty) => property.developer === developer,
      )
      setProperties(filteredProperties)
      setIsLoading(false)
    } catch (err) {
      console.error("Error fetching lot-only properties by developer:", err)
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setIsLoading(false)
    }
  }, [developer])

  useEffect(() => {
    fetchProperties()
  }, [fetchProperties])

  return { properties, isLoading, error, refreshData: fetchProperties }
}
