'use client'

import { useEffect } from "react"
import type { BrokerageLink } from "@/lib/brokerage-links"
import { getBrokerageFromParams } from "@/lib/brokerage-links"
import { storeBrokerageInfo } from "@/lib/storage-utils"

/**
 * Mount this globally (e.g., in app/layout.tsx) to:
 * - Parse referral params (?bid, h, agency, aid)
 * - Validate them
 * - Persist to localStorage with expiration
 * - Clean up the URL (remove referral params)
 */
export default function ReferralCapture() {
  useEffect(() => {
    const run = async () => {
      try {
        const current = new URL(window.location.href)
        if (!current.search) return

        // Only handle our referral params
        const hasReferralParams =
          current.searchParams.has("bid") || current.searchParams.has("h") || current.searchParams.has("agency") || current.searchParams.has("aid")
        if (!hasReferralParams) return

        const info: BrokerageLink | null = await getBrokerageFromParams(current.searchParams)
        if (info) {
          // Persist with expiration (see lib/storage-utils.ts)
          storeBrokerageInfo({
            id: info.id,
            name: info.name,
            agency: info.agency,
            department: info.department,
            hash: info.hash,
            agentId: info.agentId,
            agentName: info.agentName,
            agentClassification: info.agentClassification,
          })
        }

        // Clean the URL ref params so they don't linger
        current.searchParams.delete("bid")
        current.searchParams.delete("h")
        current.searchParams.delete("agency")
        current.searchParams.delete("aid")
        const cleaned = `${current.pathname}${current.search ? `?${current.searchParams.toString()}` : ""}${current.hash}`
        window.history.replaceState({}, "", cleaned)
      } catch (e) {
        console.error("Referral capture error:", e)
      }
    }

    run()
  }, [])

  return null
}
