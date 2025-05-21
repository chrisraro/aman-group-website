import { modelHouseSeries as initialModelHouseSeries } from "@/data/model-houses"
import { lotOnlyProperties as initialLotOnlyProperties } from "@/data/lot-only-properties"
import { kv } from "@vercel/kv"

// Constants
const MODEL_HOUSES_KEY = "model_houses_data"
const LOT_ONLY_KEY = "lot_only_data"
const DATA_VERSION_KEY = "model_houses_version"
const LOT_ONLY_VERSION_KEY = "lot_only_version"
const CURRENT_VERSION = "1.0.0"

// In-memory fallback when KV is not available
const inMemoryStorage: Record<string, any> = {}

// Helper function to get value from storage
export async function getValue(key: string): Promise<any> {
  try {
    // Try to use Vercel KV (Upstash)
    try {
      return await kv.get(key)
    } catch (kvError) {
      console.warn("Vercel KV access error:", kvError)
      // Fall back to in-memory storage
      return inMemoryStorage[key]
    }
  } catch (error) {
    console.error(`Error getting value for key ${key}:`, error)
    return null
  }
}

// Helper function to set value in storage
export async function setValue(key: string, value: any): Promise<void> {
  try {
    // Try to use Vercel KV (Upstash)
    try {
      await kv.set(key, value)
    } catch (kvError) {
      console.warn("Vercel KV access error:", kvError)
      // Fall back to in-memory storage
      inMemoryStorage[key] = value
    }
  } catch (error) {
    console.error(`Error setting value for key ${key}:`, error)
    throw error
  }
}

// Get model houses data
export async function getModelHousesData() {
  try {
    // Check if data exists in storage
    const storedData = await getValue(MODEL_HOUSES_KEY)
    const storedVersion = await getValue(DATA_VERSION_KEY)

    // If no data or version mismatch, initialize with default data
    if (!storedData || storedVersion !== CURRENT_VERSION) {
      await setValue(MODEL_HOUSES_KEY, initialModelHouseSeries)
      await setValue(DATA_VERSION_KEY, CURRENT_VERSION)
      return initialModelHouseSeries
    }

    return storedData
  } catch (error) {
    console.error("Error fetching model houses data:", error)
    // Return initial data as fallback
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
    throw error
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
    throw error
  }
}

// Get lot-only properties data
export async function getLotOnlyData() {
  try {
    // Check if data exists in storage
    const storedData = await getValue(LOT_ONLY_KEY)
    const storedVersion = await getValue(LOT_ONLY_VERSION_KEY)

    // If no data or version mismatch, initialize with default data
    if (!storedData || storedVersion !== CURRENT_VERSION) {
      await setValue(LOT_ONLY_KEY, initialLotOnlyProperties)
      await setValue(LOT_ONLY_VERSION_KEY, CURRENT_VERSION)
      return initialLotOnlyProperties
    }

    return storedData
  } catch (error) {
    console.error("Error fetching lot-only data:", error)
    // Return initial data as fallback
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
    throw error
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
    throw error
  }
}
