'use client'

/**
 * Brokerage referral link utilities (client-safe).
 * - Uses Web Crypto API for SHA-256 hashing
 * - Avoids Node 'crypto' in the browser
 * - Avoids manual encodeURIComponent; URLSearchParams handles encoding
 */

export interface BrokerageLink {
  id: string
  name: string
  agency: string
  department: string
  hash: string
  agentId?: string
  agentName?: string
  agentClassification?: 'Broker' | 'Salesperson'
}

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

// Secret used to derive hashes. On client, avoid reading server-only envs.
const SECRET_KEY =
  typeof process !== "undefined" && (process as any)?.env?.BROKERAGE_SECRET_KEY
    ? (process as any).env.BROKERAGE_SECRET_KEY
    : "aman-group-brokerage-links-secret"

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const buf = await crypto.subtle.digest("SHA-256", data)
  const arr = Array.from(new Uint8Array(buf))
  return arr.map((b) => b.toString(16).padStart(2, "0")).join("")
}

/**
 * Generate a secure-ish short hash for a brokerage+agent pair (client-side).
 */
export async function generateBrokerageHash(brokerageId: string, agentId?: string): Promise<string> {
  const text = `${brokerageId}-${agentId || ""}-${SECRET_KEY}`
  const hex = await sha256Hex(text)
  return hex.substring(0, 16)
}

/**
 * Build a shareable referral link. Do NOT double-encode; URLSearchParams will encode values.
 */
export async function generateBrokerageLink(brokerageId: string, baseUrl: string, agentId?: string): Promise<string> {
  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
  if (!brokerage) return ""

  const hash = await generateBrokerageHash(brokerageId, agentId)
  const params = new URLSearchParams({
    bid: brokerageId,
    agency: brokerage.agency,
    h: hash,
  })
  if (agentId) params.set("aid", agentId)

  return `${baseUrl}/?${params.toString()}`
}

export async function validateBrokerageLink(brokerageId: string, hash: string, agentId?: string): Promise<boolean> {
  const expected = await generateBrokerageHash(brokerageId, agentId)
  return hash === expected
}

/**
 * Read and validate a referral from URL parameters.
 * Accepts URLSearchParams or Next.js ReadonlyURLSearchParams.
 */
export async function getBrokerageFromParams(
  params: URLSearchParams | { get: (key: string) => string | null }
): Promise<BrokerageLink | null> {
  const brokerageId = params.get("bid")
  const agency = params.get("agency")
  const hash = params.get("h")
  const agentId = params.get("aid") || undefined

  if (!brokerageId || !agency || !hash) return null
  if (!(await validateBrokerageLink(brokerageId, hash, agentId))) return null

  const brokerage = accreditedBrokerages.find((b) => b.id === brokerageId)
  if (!brokerage) return null

  const link: BrokerageLink = {
    id: brokerageId,
    name: brokerage.name,
    agency, // already decoded by URLSearchParams
    department: brokerage.department,
    hash,
  }

  if (agentId) {
    try {
      const { getAgentById } = await import("@/lib/data/agents")
      const agent = getAgentById(agentId)
      if (agent) {
        link.agentId = agent.id
        link.agentName = agent.name
        link.agentClassification = agent.classification
      }
    } catch (err) {
      console.error("Error loading agent data:", err)
    }
  }

  return link
}
