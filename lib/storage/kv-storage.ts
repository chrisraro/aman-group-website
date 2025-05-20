import { modelHouseSeries as initialModelHouseSeries } from "@/data/model-houses"
import { lotOnlyProperties as initialLotOnlyProperties } from "@/data/lot-only-properties"

// Constants
const MODEL_HOUSES_KEY = "model_houses_data"
const LOT_ONLY_KEY = "lot_only_data"
const DATA_VERSION_KEY = "model_houses_version"
const LOT_ONLY_VERSION_KEY = "lot_only_version"
const CURRENT_VERSION = "1.0.0"

// In-memory fallback when KV is not available
const inMemoryStorage: Record<string, any> = {}

// Check if Vercel KV is available
let kvClient: any

try {
  // Dynamic import to avoid issues in environments where KV is not available
  const importKV = async () => {
    try {
      const { kv } = await import("@vercel/kv")
      return kv
    } catch (error) {
      console.warn("Vercel KV not available, using in-memory storage instead")
      return null
    }
  }

  // Initialize KV client
  importKV().then((client) => {
    kvClient = client
  })
} catch (error) {
  console.warn("Vercel KV not available, using in-memory storage instead")
}

// Helper function to get value from storage
export async function getValue(key: string): Promise<any> {
  try {
    if (kvClient) {
      return await kvClient.get(key)
    } else {
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
    if (kvClient) {
      await kvClient.set(key, value)
    } else {
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
