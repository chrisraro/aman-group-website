import { kv } from "@vercel/kv"
import type { LoanCalculatorSettings } from "@/types/loan-calculator"
import { DEFAULT_LOAN_CALCULATOR_SETTINGS } from "@/types/loan-calculator"
import { modelHouseSeries } from "@/data/model-houses"

const LOAN_CALCULATOR_SETTINGS_KEY = "loan-calculator-settings"
const MODEL_HOUSES_DATA_KEY = "model-houses-data"

// Loan Calculator Settings Functions
export async function getLoanCalculatorSettings(): Promise<LoanCalculatorSettings> {
  try {
    const settings = await kv.get<LoanCalculatorSettings>(LOAN_CALCULATOR_SETTINGS_KEY)

    if (!settings) {
      // If no settings exist, save and return defaults
      await saveLoanCalculatorSettings(DEFAULT_LOAN_CALCULATOR_SETTINGS)
      return DEFAULT_LOAN_CALCULATOR_SETTINGS
    }

    // Ensure all required fields exist (for backward compatibility)
    const mergedSettings: LoanCalculatorSettings = {
      ...DEFAULT_LOAN_CALCULATOR_SETTINGS,
      ...settings,
    }

    return mergedSettings
  } catch (error) {
    console.error("Error getting loan calculator settings:", error)
    return DEFAULT_LOAN_CALCULATOR_SETTINGS
  }
}

export async function saveLoanCalculatorSettings(settings: LoanCalculatorSettings): Promise<void> {
  try {
    await kv.set(LOAN_CALCULATOR_SETTINGS_KEY, settings)
  } catch (error) {
    console.error("Error saving loan calculator settings:", error)
    throw new Error("Failed to save loan calculator settings")
  }
}

export async function resetLoanCalculatorSettings(): Promise<void> {
  try {
    await kv.set(LOAN_CALCULATOR_SETTINGS_KEY, DEFAULT_LOAN_CALCULATOR_SETTINGS)
  } catch (error) {
    console.error("Error resetting loan calculator settings:", error)
    throw new Error("Failed to reset loan calculator settings")
  }
}

// Model Houses Data Functions
export async function getModelHousesData() {
  try {
    const data = await kv.get(MODEL_HOUSES_DATA_KEY)

    if (!data) {
      // If no data exists, save and return defaults from static data
      await saveModelHousesData(modelHouseSeries)
      return modelHouseSeries
    }

    return data
  } catch (error) {
    console.error("Error getting model houses data:", error)
    // Return static data as fallback
    return modelHouseSeries
  }
}

export async function saveModelHousesData(data: typeof modelHouseSeries): Promise<void> {
  try {
    await kv.set(MODEL_HOUSES_DATA_KEY, data)
  } catch (error) {
    console.error("Error saving model houses data:", error)
    throw new Error("Failed to save model houses data")
  }
}

export async function resetModelHousesData(): Promise<void> {
  try {
    await kv.set(MODEL_HOUSES_DATA_KEY, modelHouseSeries)
  } catch (error) {
    console.error("Error resetting model houses data:", error)
    throw new Error("Failed to reset model houses data")
  }
}
