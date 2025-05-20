"use client"

import { useState, useEffect } from "react"
import {
  type LotOnlyProperty,
  getAllLotOnlyProperties,
  getLotOnlyPropertiesByProject,
  getLotOnlyPropertyById,
  getLotOnlyPropertiesByDeveloper,
} from "@/data/lot-only-properties"

export function useLotOnlyProperties() {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    try {
      const data = getAllLotOnlyProperties()
      setProperties(data)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setIsLoading(false)
    }
  }, [])

  return { properties, isLoading, error }
}

export function useLotOnlyPropertiesByProject(project: string | null) {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!project) {
      setProperties([])
      setIsLoading(false)
      return
    }

    try {
      const data = getLotOnlyPropertiesByProject(project)
      setProperties(data)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setIsLoading(false)
    }
  }, [project])

  return { properties, isLoading, error }
}

export function useLotOnlyProperty(id: string | null) {
  const [property, setProperty] = useState<LotOnlyProperty | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!id) {
      setProperty(null)
      setIsLoading(false)
      return
    }

    try {
      const data = getLotOnlyPropertyById(id)
      setProperty(data)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only property"))
      setIsLoading(false)
    }
  }, [id])

  return { property, isLoading, error }
}

export function useLotOnlyPropertiesByDeveloper(developer: string | null) {
  const [properties, setProperties] = useState<LotOnlyProperty[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!developer) {
      setProperties([])
      setIsLoading(false)
      return
    }

    try {
      const data = getLotOnlyPropertiesByDeveloper(developer)
      setProperties(data)
      setIsLoading(false)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch lot-only properties"))
      setIsLoading(false)
    }
  }, [developer])

  return { properties, isLoading, error }
}
