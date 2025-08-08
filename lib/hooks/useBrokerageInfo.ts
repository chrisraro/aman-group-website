'use client'

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import type { BrokerageLink } from "@/lib/brokerage-links"
import { getBrokerageFromParams } from "@/lib/brokerage-links"

/**
 * Reads and validates brokerage info from the current URL.
 * Note: Prefer the global ReferralCapture to persist to storage.
 */
export function useBrokerageInfo() {
  const sp = useSearchParams()
  const queryString = sp.toString()
  const params = useMemo(() => new URLSearchParams(queryString), [queryString])

  const [brokerageInfo, setBrokerageInfo] = useState<BrokerageLink | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const load = async () => {
      setIsLoading(true)
      try {
        const info = await getBrokerageFromParams(params)
        if (isMounted) setBrokerageInfo(info)
      } catch (err) {
        console.error("Error fetching brokerage info:", err)
        if (isMounted) setBrokerageInfo(null)
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }
    load()
    return () => {
      isMounted = false
    }
  }, [params])

  return { brokerageInfo, isLoading }
}
