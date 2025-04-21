"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getBrokerageFromParams } from "@/lib/utils/brokerage-links"
import { getStoredBrokerageInfo, storeBrokerageInfo } from "@/lib/utils/storage-utils"

export interface BrokerageInfo {
  id: string
  name: string
  agency: string
  department: string
  hash: string
}

export function useBrokerageInfo() {
  const searchParams = useSearchParams()
  const [brokerageInfo, setBrokerageInfo] = useState<BrokerageInfo | null>(null)

  useEffect(() => {
    // First check URL parameters
    const brokerageFromParams = getBrokerageFromParams(searchParams)
    if (brokerageFromParams) {
      setBrokerageInfo(brokerageFromParams)
      storeBrokerageInfo(brokerageFromParams)
      return
    }

    // If not in URL, check localStorage
    const storedBrokerage = getStoredBrokerageInfo()
    if (storedBrokerage) {
      setBrokerageInfo({
        id: storedBrokerage.id,
        name: storedBrokerage.name,
        agency: storedBrokerage.agency,
        department: storedBrokerage.department,
        hash: storedBrokerage.hash,
      })
    }
  }, [searchParams])

  return { brokerageInfo }
}
