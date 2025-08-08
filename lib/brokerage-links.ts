import { createHash } from "crypto"

// Interface for brokerage data
export interface BrokerageLink {
  id: string
  name: string
  agency: string
  department: string
  hash: string
  // Add agent information
  agentId?: string
  agentName?: string
  agentClassification?: "Broker" | "Salesperson"
}

// List of accredited brokerages (this could come from a database in a real app)
export const accreditedBrokerages = [
  { id: "m10", name: "Mariben C. Pante", agency: "Aces & B Realty", department: "Marketing" },
  { id: "s1", name: "Sany De Guzman & Edna Chavez", agency: "ADEG Realty", department: "Sales" },
  { id: "s2", name: "Adolfo Encila Jr.", agency: "Advench Realty", department: "Sales" },
  { id: "m2", name: "Armando Aman", agency: "Audjean Realty", department: "Marketing" },
  { id: "s9", name: "Mary Grace A. Hallare", agency: "Buena Tierra Realty", department: "Sales" },
  { id: "s6", name: "Engr. Reinaldo Corre Jr.", agency: "C-Realty", department: "Sales" },
  { id: "l2", name: "Cecile M. Rivera", agency: "CMR Realty", department: "Loans" },
  { id: "s3", name: "Romeo Delas Alas", agency: "Delaber Realty", department: "Sales" },
  { id: "m9", name: "Angelica De Castro", agency: "Deocrats Realty", department: "Marketing" },
  { id: "m3", name: "Desiree Bentor", agency: "Dezhomes Realty", department: "Marketing" },
  { id: "l6", name: "Emma Dolor Parco", agency: "EDP968 Real Estate Services", department: "Loans" },
  { id: "s8", name: "Jenelyn T. Janculan", agency: "EasyHomes Realty Services", department: "Sales" },
  { id: "m5", name: "Renato Guzman", agency: "First Gold Land Realty", department: "Marketing" },
  { id: "s4", name: "Roi Marc Teodoro & Glennda Teodoro", agency: "G.A. Teodoro Realty", department: "Sales" },
  { id: "m8", name: "Maricel Adan", agency: "Giya Realty", department: "Marketing" },
  { id: "l1", name: "Emily and Jaime Kalaw", agency: "K-Realty", department: "Loans" },
  { id: "l4", name: "Magie R. Hernandez", agency: "MRH Realty", department: "Loans" },
  { id: "m7", name: "Luz Obsum", agency: "Obsum Realty", department: "Marketing" },
  { id: "s5", name: "Marianne Olaño", agency: "Olaño Realty", department: "Sales" },
  { id: "m1", name: "Roden Rojo", agency: "Red Zeal Realty", department: "Marketing" },
  { id: "m6", name: "Ma. Shiela E. Salvo", agency: "Salvo's House Realty", department: "Marketing" },
  { id: "m4", name: "Allan Remoquillo", agency: "Sweetville Realty", department: "Marketing" },
  { id: "l5", name: "Wewet Mago", agency: "Terra Verde Realty", department: "Loans" },
  { id: "s7", name: "Jun Kalaw", agency: "UMG Realty", department: "Sales" },
  { id: "m11", name: "Viva Francia A. Rojo", agency: "Viva Realm Realty", department: "Marketing" },
  { id: "l3", name: "Jerwin Rojo", agency: "Young Achiever Realty", department: "Loans" },
]

// Secret key for hash generation - in a real app, this would be in environment variables
const SECRET_KEY = process.env.BROKERAGE_SECRET_KEY || "aman-group-brokerage-links-secret"

/**
 * Generate a secure hash for a brokerage link using Web Crypto API.
 */
export async function generateBrokerageHash(brokerageId: string, agentId?: string): Promise<string> {
  const text = `${brokerageId}-${agentId || ""}-${SECRET_KEY}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hexHash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hexHash.substring(0, 16);
}

/**
 * Generate a shareable link for a brokerage
 */
export async function generateBrokerageLink(brokerageId: string, baseUrl: string, agentId?: string): Promise<string> {
  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
  if (!brokerage) return ""

  const hash = await generateBrokerageHash(brokerageId, agentId) // Await the async hash generation
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
  const expectedHash = await generateBrokerageHash(brokerageId, agentId) // Await the async hash generation
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

  // Find the brokerage in our list
  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
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
      const { getAgentById } = await import("@/lib/data/agents")
      const agent = getAgentById(agentId)
      if (agent) {
        brokerageLink.agentId = agent.id
        brokerageLink.agentName = agent.name
        brokerageLink.agentClassification = agent.classification
      }
    } catch (error) {
      console.error("Error importing agent data:", error)
    }
  }

  return brokerageLink
}
