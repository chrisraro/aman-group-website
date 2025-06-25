import { modelHouseSeries as initialModelHouseSeries } from "@/data/model-houses"
import { lotOnlyProperties as initialLotOnlyProperties } from "@/data/lot-only-properties"

// Constants
const MODEL_HOUSES_KEY = "model_houses_data"
const LOT_ONLY_KEY = "lot_only_data"
const DATA_VERSION_KEY = "model_houses_version"
const LOT_ONLY_VERSION_KEY = "lot_only_version"
const CURRENT_VERSION = "1.0.0"

// In-memory fallback storage
const inMemoryStorage: Record<string, any> = {
  [MODEL_HOUSES_KEY]: initialModelHouseSeries,
  [LOT_ONLY_KEY]: initialLotOnlyProperties,
  [DATA_VERSION_KEY]: CURRENT_VERSION,
  [LOT_ONLY_VERSION_KEY]: CURRENT_VERSION,
}

// Check if we're in a server environment and KV is available
function isKVAvailable(): boolean {
  return typeof process !== "undefined" && process.env && process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN
}

// Helper function to get value from storage
export async function getValue(key: string): Promise<any> {
  try {
    // Always fall back to in-memory storage for now to avoid KV issues
    if (inMemoryStorage[key] !== undefined) {
      return inMemoryStorage[key]
    }

    // Return default values based on key
    switch (key) {
      case MODEL_HOUSES_KEY:
        return initialModelHouseSeries
      case LOT_ONLY_KEY:
        return initialLotOnlyProperties
      case DATA_VERSION_KEY:
      case LOT_ONLY_VERSION_KEY:
        return CURRENT_VERSION
      default:
        return null
    }
  } catch (error) {
    console.error(`Error getting value for key ${key}:`, error)
    // Return appropriate fallback
    switch (key) {
      case MODEL_HOUSES_KEY:
        return initialModelHouseSeries
      case LOT_ONLY_KEY:
        return initialLotOnlyProperties
      default:
        return null
    }
  }
}

// Helper function to set value in storage
export async function setValue(key: string, value: any): Promise<void> {
  try {
    // Store in memory
    inMemoryStorage[key] = value
    console.log(`Stored ${key} in memory storage`)
  } catch (error) {
    console.error(`Error setting value for key ${key}:`, error)
    // Don't throw error, just log it
  }
}

// Get model houses data
export async function getModelHousesData() {
  try {
    const storedData = await getValue(MODEL_HOUSES_KEY)
    const storedVersion = await getValue(DATA_VERSION_KEY)

    // If no data or version mismatch, return initial data
    if (!storedData || storedVersion !== CURRENT_VERSION) {
      await setValue(MODEL_HOUSES_KEY, initialModelHouseSeries)
      await setValue(DATA_VERSION_KEY, CURRENT_VERSION)
      return initialModelHouseSeries
    }

    return storedData || initialModelHouseSeries
  } catch (error) {
    console.error("Error fetching model houses data:", error)
    return initialModelHouseSeries
  }
}

// Save model houses data
export async function saveModelHousesData(data: any) {
  try {
    await setValue(MODEL_HOUSES_KEY, data)
    return { success: true }
  } catch (error) {
    console.error("Error saving model houses data:", error)
    // Don't throw error, just return success false
    return { success: false, error: error.message }
  }
}

// Reset to default data
export async function resetModelHousesData() {
  try {
    await setValue(MODEL_HOUSES_KEY, initialModelHouseSeries)
    await setValue(DATA_VERSION_KEY, CURRENT_VERSION)
    return { success: true }
  } catch (error) {
    console.error("Error resetting model houses data:", error)
    return { success: false, error: error.message }
  }
}

// Get lot-only properties data
export async function getLotOnlyData() {
  try {
    const storedData = await getValue(LOT_ONLY_KEY)
    const storedVersion = await getValue(LOT_ONLY_VERSION_KEY)

    if (!storedData || storedVersion !== CURRENT_VERSION) {
      await setValue(LOT_ONLY_KEY, initialLotOnlyProperties)
      await setValue(LOT_ONLY_VERSION_KEY, CURRENT_VERSION)
      return initialLotOnlyProperties
    }

    return storedData || initialLotOnlyProperties
  } catch (error) {
    console.error("Error fetching lot-only data:", error)
    return initialLotOnlyProperties
  }
}

// Save lot-only properties data
export async function saveLotOnlyData(data: any) {
  try {
    await setValue(LOT_ONLY_KEY, data)
    return { success: true }
  } catch (error) {
    console.error("Error saving lot-only data:", error)
    return { success: false, error: error.message }
  }
}

// Reset lot-only properties to default data
export async function resetLotOnlyData() {
  try {
    await setValue(LOT_ONLY_KEY, initialLotOnlyProperties)
    await setValue(LOT_ONLY_VERSION_KEY, CURRENT_VERSION)
    return { success: true }
  } catch (error) {
    console.error("Error resetting lot-only data:", error)
    return { success: false, error: error.message }
  }
}
