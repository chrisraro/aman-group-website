import { accreditedBrokerages } from "@/lib/data/brokerages"
import type { BrokerageLink } from "@/types/BrokerageLink"

// Secret key for hash generation - in a real app, this would be in environment variables
const SECRET_KEY = process.env.BROKERAGE_SECRET_KEY || "aman-group-brokerage-links-secret"

/**
 * Generate a secure hash for a brokerage link using Web Crypto API
 * @deprecated Use the async version from @/lib/brokerage-links instead
 */
export async function generateBrokerageHash(brokerageId: string): Promise<string> {
  try {
    const text = `${brokerageId}-${SECRET_KEY}`
    const encoder = new TextEncoder()
    const data = encoder.encode(text)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hexHash.substring(0, 16)
  } catch (error) {
    console.error("Error generating brokerage hash:", error)
    return btoa(`${brokerageId}`).substring(0, 16)
  }
}

/**
 * Generate a shareable link for a brokerage
 * @deprecated Use the async version from @/lib/brokerage-links instead
 */
export async function generateBrokerageLink(brokerageId: string, baseUrl: string): Promise<string> {
  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
  if (!brokerage) return ""

  const hash = await generateBrokerageHash(brokerageId)
  const params = new URLSearchParams({
    bid: brokerageId,
    agency: encodeURIComponent(brokerage.agency),
    h: hash,
  })

  return `${baseUrl}/?${params.toString()}`
}

/**
 * Validate a brokerage link hash
 * @deprecated Use the async version from @/lib/brokerage-links instead
 */
export async function validateBrokerageLink(brokerageId: string, hash: string): Promise<boolean> {
  const expectedHash = await generateBrokerageHash(brokerageId)
  return hash === expectedHash
}

/**
 * Get brokerage information from URL parameters
 * @deprecated Use the async version from @/lib/brokerage-links instead
 */
export async function getBrokerageFromParams(params: URLSearchParams): Promise<BrokerageLink | null> {
  const brokerageId = params.get("bid")
  const agency = params.get("agency")
  const hash = params.get("h")

  if (!brokerageId || !agency || !hash) return null

  // Validate the hash
  if (!(await validateBrokerageLink(brokerageId, hash))) return null

  // Find the brokerage in our list
  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
  if (!brokerage) return null

  return {
    id: brokerageId,
    name: brokerage.name,
    agency: decodeURIComponent(agency),
    department: brokerage.department,
    hash,
  }
}
