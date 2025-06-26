"use client"

import { useState, useEffect } from "react"
import type { LoanCalculatorSettings } from "@/types/loan-calculator"
import { getDefaultLoanCalculatorSettings } from "@/lib/loan-calculations"

export function useLoanCalculatorSettings() {
  const [settings, setSettings] = useState<LoanCalculatorSettings>(getDefaultLoanCalculatorSettings())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch settings from API
  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/loan-calculator/settings")
      if (!response.ok) {
        throw new Error("Failed to fetch settings")
      }

      const data = await response.json()
      setSettings(data)
    } catch (err) {
      console.error("Error fetching loan calculator settings:", err)
      setError(err instanceof Error ? err.message : "Failed to fetch settings")
      // Keep default settings on error
    } finally {
      setLoading(false)
    }
  }

  // Save settings to API
  const saveSettings = async (newSettings: Partial<LoanCalculatorSettings>) => {
    try {
      setError(null)

      const response = await fetch("/api/loan-calculator/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newSettings),
      })

      if (!response.ok) {
        throw new Error("Failed to save settings")
      }

      const data = await response.json()
      setSettings(data.settings)
      return { success: true }
    } catch (err) {
      console.error("Error saving loan calculator settings:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to save settings"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Update specific settings
  const updateSettings = async (updates: Partial<LoanCalculatorSettings>) => {
    try {
      setError(null)

      const response = await fetch("/api/loan-calculator/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error("Failed to update settings")
      }

      const data = await response.json()
      setSettings(data.settings)
      return { success: true }
    } catch (err) {
      console.error("Error updating loan calculator settings:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to update settings"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Reset settings to default
  const resetSettings = async () => {
    try {
      setError(null)

      const response = await fetch("/api/loan-calculator/settings/reset", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to reset settings")
      }

      // Fetch updated settings
      await fetchSettings()
      return { success: true }
    } catch (err) {
      console.error("Error resetting loan calculator settings:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to reset settings"
      setError(errorMessage)
      return { success: false, error: errorMessage }
    }
  }

  // Load settings on mount
  useEffect(() => {
    fetchSettings()
  }, [])

  return {
    settings,
    loading,
    error,
    saveSettings,
    updateSettings,
    resetSettings,
    refetch: fetchSettings,
  }
}
