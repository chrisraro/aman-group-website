import { kv } from "@vercel/kv"
import type { LoanCalculatorSettings } from "@/types/loan-calculator"
import { DEFAULT_LOAN_CALCULATOR_SETTINGS } from "@/types/loan-calculator"
import { modelHouseSeries } from "@/data/model-houses"
import { accreditedBrokerages } from "@/lib/data/brokerages"
import { getAllAgents } from "@/lib/data/agents"

const LOAN_CALCULATOR_SETTINGS_KEY = "loan-calculator-settings"
const MODEL_HOUSES_DATA_KEY = "model-houses-data"
const BROKERAGES_DATA_KEY = "brokerages-data"
const AGENTS_DATA_KEY = "agents-data"

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

export async function resetModelHousesData(): Promise<{ success: boolean; error?: string }> {
  try {
    await kv.set(MODEL_HOUSES_DATA_KEY, modelHouseSeries)
    return { success: true }
  } catch (error) {
    console.error("Error resetting model houses data:", error)
    return { success: false, error: "Failed to reset model houses data" }
  }
}

// Brokerage CRUD Functions
export async function getBrokeragesData() {
  try {
    const data = await kv.get(BROKERAGES_DATA_KEY)

    if (!data) {
      // If no data exists, save and return defaults from static data
      const defaultBrokerages = accreditedBrokerages.map((b) => ({
        ...b,
        contactEmail: `contact@${b.agency.toLowerCase().replace(/\s+/g, "")}.com`,
        contactPhone: "+63 912 345 6789",
        address: "Metro Manila, Philippines",
        status: "Active" as const,
      }))
      await saveBrokeragesData(defaultBrokerages)
      return defaultBrokerages
    }

    return data
  } catch (error) {
    console.error("Error getting brokerages data:", error)
    // Return static data as fallback
    return accreditedBrokerages.map((b) => ({
      ...b,
      contactEmail: `contact@${b.agency.toLowerCase().replace(/\s+/g, "")}.com`,
      contactPhone: "+63 912 345 6789",
      address: "Metro Manila, Philippines",
      status: "Active" as const,
    }))
  }
}

export async function saveBrokeragesData(data: any[]): Promise<{ success: boolean; error?: string }> {
  try {
    await kv.set(BROKERAGES_DATA_KEY, data)
    return { success: true }
  } catch (error) {
    console.error("Error saving brokerages data:", error)
    return { success: false, error: "Failed to save brokerages data" }
  }
}

export async function resetBrokeragesData(): Promise<{ success: boolean; error?: string }> {
  try {
    const defaultBrokerages = accreditedBrokerages.map((b) => ({
      ...b,
      contactEmail: `contact@${b.agency.toLowerCase().replace(/\s+/g, "")}.com`,
      contactPhone: "+63 912 345 6789",
      address: "Metro Manila, Philippines",
      status: "Active" as const,
    }))
    await kv.set(BROKERAGES_DATA_KEY, defaultBrokerages)
    return { success: true }
  } catch (error) {
    console.error("Error resetting brokerages data:", error)
    return { success: false, error: "Failed to reset brokerages data" }
  }
}

// Agent CRUD Functions
export async function getAgentsData() {
  try {
    const data = await kv.get(AGENTS_DATA_KEY)

    if (!data) {
      // If no data exists, save and return defaults from static data
      const defaultAgents = getAllAgents().map((a) => ({
        ...a,
        email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@${
          accreditedBrokerages
            .find((b) => b.id === a.agencyId)
            ?.agency.toLowerCase()
            .replace(/\s+/g, "") || "agency"
        }.com`,
        phone: "+63 912 345 6789",
        status: "Active" as const,
      }))
      await saveAgentsData(defaultAgents)
      return defaultAgents
    }

    return data
  } catch (error) {
    console.error("Error getting agents data:", error)
    // Return static data as fallback
    return getAllAgents().map((a) => ({
      ...a,
      email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@${
        accreditedBrokerages
          .find((b) => b.id === a.agencyId)
          ?.agency.toLowerCase()
          .replace(/\s+/g, "") || "agency"
      }.com`,
      phone: "+63 912 345 6789",
      status: "Active" as const,
    }))
  }
}

export async function saveAgentsData(data: any[]): Promise<{ success: boolean; error?: string }> {
  try {
    await kv.set(AGENTS_DATA_KEY, data)
    return { success: true }
  } catch (error) {
    console.error("Error saving agents data:", error)
    return { success: false, error: "Failed to save agents data" }
  }
}

export async function resetAgentsData(): Promise<{ success: boolean; error?: string }> {
  try {
    const defaultAgents = getAllAgents().map((a) => ({
      ...a,
      email: `${a.name.toLowerCase().replace(/\s+/g, ".")}@${
        accreditedBrokerages
          .find((b) => b.id === a.agencyId)
          ?.agency.toLowerCase()
          .replace(/\s+/g, "") || "agency"
      }.com`,
      phone: "+63 912 345 6789",
      status: "Active" as const,
    }))
    await kv.set(AGENTS_DATA_KEY, defaultAgents)
    return { success: true }
  } catch (error) {
    console.error("Error resetting agents data:", error)
    return { success: false, error: "Failed to reset agents data" }
  }
}
