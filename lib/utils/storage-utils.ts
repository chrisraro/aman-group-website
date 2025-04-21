// Storage keys
const BROKERAGE_INFO_KEY = "aman-group-brokerage-info"

// Interface for stored brokerage info
export interface StoredBrokerageInfo {
  id: string
  name: string
  agency: string
  department: string
  hash: string
  timestamp: number // When the info was stored
}

/**
 * Store brokerage information in localStorage
 */
export function storeBrokerageInfo(brokerageInfo: Omit<StoredBrokerageInfo, "timestamp">): void {
  if (typeof window === "undefined") return

  try {
    const infoWithTimestamp: StoredBrokerageInfo = {
      ...brokerageInfo,
      timestamp: Date.now(),
    }
    localStorage.setItem(BROKERAGE_INFO_KEY, JSON.stringify(infoWithTimestamp))
  } catch (error) {
    console.error("Failed to store brokerage info:", error)
  }
}

/**
 * Get stored brokerage information from localStorage
 */
export function getStoredBrokerageInfo(): StoredBrokerageInfo | null {
  if (typeof window === "undefined") return null

  try {
    const storedInfo = localStorage.getItem(BROKERAGE_INFO_KEY)
    if (!storedInfo) return null

    return JSON.parse(storedInfo) as StoredBrokerageInfo
  } catch (error) {
    console.error("Failed to retrieve brokerage info:", error)
    return null
  }
}

/**
 * Clear stored brokerage information
 */
export function clearBrokerageInfo(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(BROKERAGE_INFO_KEY)
  } catch (error) {
    console.error("Failed to clear brokerage info:", error)
  }
}
