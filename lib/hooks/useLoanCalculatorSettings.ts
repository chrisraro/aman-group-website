"use client"

import { useState, useEffect } from "react"
import type { LoanCalculatorSettings } from "@/types/loan-calculator"

const defaultSettings: LoanCalculatorSettings = {
  financingOptions: [
    {
      id: "in-house",
      name: "In-House Financing",
      value: "in-house",
      interestRate: 0.12,
      isActive: true,
    },
    {
      id: "in-house-bridge",
      name: "In-House Bridge Financing",
      value: "in-house-bridge",
      interestRate: 0.15,
      isActive: true,
    },
    {
      id: "pag-ibig",
      name: "Pag-IBIG",
      value: "pag-ibig",
      interestRate: 0.105,
      isActive: true,
    },
    {
      id: "bank",
      name: "Bank Financing",
      value: "bank",
      interestRate: 0.08,
      isActive: true,
    },
  ],
  downPaymentTerms: [
    {
      id: "24-months",
      name: "24 Months",
      value: 24,
      interestRate: 0.085,
      isActive: true,
    },
  ],
  reservationFees: {
    modelHouse: 25000,
    lotOnly: 10000,
  },
  governmentFeesConfig: {
    fixedFeeThreshold: 1000000,
    fixedFeeAmount: 205000,
    percentageFee: 0.205,
  },
  constructionFeesConfig: {
    lotFeePercentage: 0.085,
    constructionFeePercentage: 0.085,
  },
  specialRules: {
    downPaymentSpecialRate: {
      isActive: true,
      firstYearRate: 0,
      subsequentYearRate: 0.085,
    },
  },
}

export function useLoanCalculatorSettings() {
  const [settings, setSettings] = useState<LoanCalculatorSettings>(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch("/api/loan-calculator/settings")

        if (!response.ok) {
          // If API fails, use default settings
          console.warn("Failed to fetch settings, using defaults")
          setSettings(defaultSettings)
          setLoading(false)
          return
        }

        const data = await response.json()

        if (data.success && data.settings) {
          setSettings(data.settings)
        } else {
          // Use default settings if API returns invalid data
          setSettings(defaultSettings)
        }
      } catch (err) {
        console.warn("Error fetching loan calculator settings, using defaults:", err)
        setSettings(defaultSettings)
        setError(null) // Don't show error to user, just use defaults
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const updateSettings = async (newSettings: LoanCalculatorSettings) => {
    try {
      const response = await fetch("/api/loan-calculator/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ settings: newSettings }),
      })

      if (response.ok) {
        setSettings(newSettings)
        return { success: true }
      } else {
        throw new Error("Failed to update settings")
      }
    } catch (err) {
      console.error("Error updating settings:", err)
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
    }
  }

  const resetSettings = async () => {
    try {
      const response = await fetch("/api/loan-calculator/settings/reset", {
        method: "POST",
      })

      if (response.ok) {
        setSettings(defaultSettings)
        return { success: true }
      } else {
        throw new Error("Failed to reset settings")
      }
    } catch (err) {
      console.error("Error resetting settings:", err)
      return { success: false, error: err instanceof Error ? err.message : "Unknown error" }
    }
  }

  return {
    settings,
    loading,
    error,
    updateSettings,
    resetSettings,
  }
}
