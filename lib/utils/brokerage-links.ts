import { createHash } from "crypto"

// Interface for brokerage data
export interface BrokerageLink {
  id: string
  name: string
  agency: string
  department: string
  hash: string
}

// List of accredited brokerages (this could come from a database in a real app)
export const accreditedBrokerages = [
  { id: "m10", name: "Mariben C. Pante", agency: "Aces & B Realty", department: "Marketing" },
  { id: "s1", name: "Sany De Guzman & Edna Chavez", agency: "ADEG Realty", department: "Sales" },
  // ... other brokerages
]

// Secret key for hash generation - in a real app, this would be in environment variables
const SECRET_KEY = process.env.BROKERAGE_SECRET_KEY || "aman-group-brokerage-links-secret"

/**
 * Generate a secure hash for a brokerage link
 */
export function generateBrokerageHash(brokerageId: string): string {
  return createHash("sha256").update(`${brokerageId}-${SECRET_KEY}`).digest("hex").substring(0, 16)
}

/**
 * Generate a shareable link for a brokerage
 */
export function generateBrokerageLink(brokerageId: string, baseUrl: string): string {
  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
  if (!brokerage) return ""

  const hash = generateBrokerageHash(brokerageId)
  const params = new URLSearchParams({
    bid: brokerageId,
    agency: encodeURIComponent(brokerage.agency),
    h: hash,
  })

  return `${baseUrl}/?${params.toString()}`
}

/**
 * Validate a brokerage link hash
 */
export function validateBrokerageLink(brokerageId: string, hash: string): boolean {
  const expectedHash = generateBrokerageHash(brokerageId)
  return hash === expectedHash
}

/**
 * Get brokerage information from URL parameters
 */
export function getBrokerageFromParams(params: URLSearchParams): BrokerageLink | null {
  const brokerageId = params.get("bid")
  const agency = params.get("agency")
  const hash = params.get("h")

  if (!brokerageId || !agency || !hash) return null

  // Validate the hash
  if (!validateBrokerageLink(brokerageId, hash)) return null

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
