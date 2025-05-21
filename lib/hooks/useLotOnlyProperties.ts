"use client"

import { useState, useEffect } from "react"
import type { LotOnlyProperty } from "@/data/lot-only-properties"

// API endpoints
const LOT_ONLY_API = "/api/lot-only"

export function useLotOnlyProperties() {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(LOT_ONLY_API)

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
    }

    fetchProperties()
  }, [])

  return { properties, isLoading, error }
}

export function useLotOnlyPropertiesByProject(project: string | null) {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!project) {
        setProperties([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(LOT_ONLY_API)

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
    }

    fetchProperties()
  }, [project])

  return { properties, isLoading, error }
}

export function useLotOnlyProperty(id: string | null) {
  const [property, setProperty] = useState<LotOnlyProperty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProperty = async () => {
      if (!id) {
        setProperty(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(`${LOT_ONLY_API}/${id}`)

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
    }

    fetchProperty()
  }, [id])

  return { property, isLoading, error }
}

export function useLotOnlyPropertiesByDeveloper(developer: string | null) {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchProperties = async () => {
      if (!developer) {
        setProperties([])
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const response = await fetch(LOT_ONLY_API)

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
    }

    fetchProperties()
  }, [developer])

  return { properties, isLoading, error }
}
