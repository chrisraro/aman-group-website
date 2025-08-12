// Secret key for hash generation - in a real app, this would be in environment variables
const SECRET_KEY = process.env.BROKERAGE_SECRET_KEY || "aman-group-brokerage-links-secret"

// Import accreditedBrokerages and BrokerageLink
import { accreditedBrokerages } from "@/lib/data/brokerages"
import type { BrokerageLink } from "@/types/BrokerageLink"

/**
 * Generate a secure hash for a brokerage link using Web Crypto API.
 * Works in both browser and Node.js environments.
 */
export async function generateBrokerageHash(brokerageId: string, agentId?: string): Promise<string> {
  try {
    const text = `${brokerageId}-${agentId || ""}-${SECRET_KEY}`
    const encoder = new TextEncoder()
    const data = encoder.encode(text)

    // Use Web Crypto API which works in both browser and modern Node.js
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    const hexHash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("")
    return hexHash.substring(0, 16)
  } catch (error) {
    console.error("Error generating brokerage hash:", error)
    // Fallback to a simple hash if Web Crypto fails
    return btoa(`${brokerageId}-${agentId || ""}`).substring(0, 16)
  }
}

/**
 * Generate a shareable link for a brokerage
 */
export async function generateBrokerageLink(brokerageId: string, baseUrl: string, agentId?: string): Promise<string> {
  // Try to get brokerage from API first, fallback to static data
  let brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)

  // If not found in static data, try to fetch from API
  if (!brokerage && typeof window !== "undefined") {
    try {
      const response = await fetch("/api/brokerages")
      if (response.ok) {
        const brokerages = await response.json()
        brokerage = brokerages.find((b: any) => b.id === brokerageId)
      }
    } catch (error) {
      console.error("Error fetching brokerages for link generation:", error)
    }
  }

  if (!brokerage) return ""

  const hash = await generateBrokerageHash(brokerageId, agentId)
  const params = new URLSearchParams({
    bid: brokerageId,
    agency: encodeURIComponent(brokerage.agency),
    h: hash,
  })

  // Add agent ID if provided
  if (agentId) {
    params.append("aid", agentId)
  }

  return `${baseUrl}/?${params.toString()}`
}

/**
 * Validate a brokerage link hash
 */
export async function validateBrokerageLink(brokerageId: string, hash: string, agentId?: string): Promise<boolean> {
  const expectedHash = await generateBrokerageHash(brokerageId, agentId)
  return hash === expectedHash
}

/**
 * Get brokerage information from URL parameters
 */
export async function getBrokerageFromParams(params: URLSearchParams): Promise<BrokerageLink | null> {
  const brokerageId = params.get("bid")
  const agency = params.get("agency")
  const hash = params.get("h")
  const agentId = params.get("aid")

  if (!brokerageId || !agency || !hash) return null

  // Validate the hash
  if (!(await validateBrokerageLink(brokerageId, hash, agentId || undefined))) return null

  // Try to find brokerage in API data first, fallback to static data
  let brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)

  // If not found in static data and we're in browser, try API
  if (!brokerage && typeof window !== "undefined") {
    try {
      const response = await fetch("/api/brokerages")
      if (response.ok) {
        const brokerages = await response.json()
        brokerage = brokerages.find((b: any) => b.id === brokerageId)
      }
    } catch (error) {
      console.error("Error fetching brokerages for params validation:", error)
    }
  }

  if (!brokerage) return null

  // Create the base brokerage link
  const brokerageLink: BrokerageLink = {
    id: brokerageId,
    name: brokerage.name,
    agency: decodeURIComponent(agency),
    department: brokerage.department,
    hash,
  }

  // If agent ID is provided, add agent information
  if (agentId) {
    try {
      // Try to get agent from API first
      if (typeof window !== "undefined") {
        try {
          const response = await fetch("/api/agents")
          if (response.ok) {
            const agents = await response.json()
            const agent = agents.find((a: any) => a.id === agentId)
            if (agent) {
              brokerageLink.agentId = agent.id
              brokerageLink.agentName = agent.name
              brokerageLink.agentClassification = agent.classification
            }
          }
        } catch (error) {
          console.error("Error fetching agents from API:", error)
        }
      }

      // Fallback to static data if API fails
      if (!brokerageLink.agentId) {
        const { getAgentById } = await import("@/lib/data/agents")
        const agent = getAgentById(agentId)
        if (agent) {
          brokerageLink.agentId = agent.id
          brokerageLink.agentName = agent.name
          brokerageLink.agentClassification = agent.classification
        }
      }
    } catch (error) {
      console.error("Error importing agent data:", error)
    }
  }

  return brokerageLink
}
