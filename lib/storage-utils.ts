import { BROKERAGE } from "@/lib/constants"

// Interface for stored brokerage info
export interface StoredBrokerageInfo {
  id: string
  name: string
  agency: string
  department: string
  hash: string
  timestamp: number // When the info was stored
  expirationDate: string // When the referral expires
  // Add agent information
  agentId?: string
  agentName?: string
  agentClassification?: "Broker" | "Salesperson"
}

/**
 * Store brokerage information in localStorage
 */
export function storeBrokerageInfo(brokerageInfo: Omit<StoredBrokerageInfo, "timestamp" | "expirationDate">): void {
  if (typeof window === "undefined") return

  try {
    // Calculate expiration date (15 days from now)
    const now = new Date()
    const expirationDate = new Date(now)
    expirationDate.setDate(now.getDate() + BROKERAGE.referralValidityDays)

    const infoWithTimestamp: StoredBrokerageInfo = {
      ...brokerageInfo,
      timestamp: Date.now(),
      expirationDate: expirationDate.toISOString(),
    }
    localStorage.setItem(BROKERAGE.storageKey, JSON.stringify(infoWithTimestamp))
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
    const storedInfo = localStorage.getItem(BROKERAGE.storageKey)
    if (!storedInfo) return null

    const info = JSON.parse(storedInfo) as StoredBrokerageInfo

    // Check if the referral has expired
    if (info.expirationDate) {
      const expirationDate = new Date(info.expirationDate)
      if (expirationDate < new Date()) {
        // Referral has expired, clear it and return null
        clearBrokerageInfo()
        return null
      }
    }

    return info
  } catch (error) {
    console.error("Failed to retrieve brokerage info:", error)
    return null
  }
}

/**
 * Check if the brokerage referral has expired
 */
export function hasReferralExpired(): boolean {
  const info = getStoredBrokerageInfo()
  if (!info || !info.expirationDate) return true

  const expirationDate = new Date(info.expirationDate)
  return expirationDate < new Date()
}

/**
 * Get the formatted expiration date string
 */
export function getReferralExpirationDate(): string {
  const info = getStoredBrokerageInfo()
  if (!info || !info.expirationDate) return "Expired"

  return new Date(info.expirationDate).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * Get days remaining until expiration
 */
export function getDaysUntilExpiration(): number {
  const info = getStoredBrokerageInfo()
  if (!info || !info.expirationDate) return 0

  const expirationDate = new Date(info.expirationDate)
  const now = new Date()

  // Calculate difference in days
  const diffTime = expirationDate.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays) // Ensure we don't return negative days
}

/**
 * Clear stored brokerage information
 */
export function clearBrokerageInfo(): void {
  if (typeof window === "undefined") return

  try {
    localStorage.removeItem(BROKERAGE.storageKey)
  } catch (error) {
    console.error("Failed to clear brokerage info:", error)
  }
}
