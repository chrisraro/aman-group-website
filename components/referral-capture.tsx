'use client'

import { useEffect } from "react"

type ReferralData = {
  bid?: string
  aid?: string
  agency?: string
  h?: string
  src?: string
}

const STORAGE_KEY = "referralInfo"
const DEFAULT_TTL_DAYS = 30

export default function ReferralCapture() {
  useEffect(() => {
    try {
      const url = new URL(window.location.href)
      const params = url.searchParams

      // Keys we care about for referral tracking
      const keys: (keyof ReferralData)[] = ["bid", "aid", "agency", "h", "src"]
      const found: ReferralData = {}
      let hasAny = false

      for (const k of keys) {
        const v = params.get(k)
        if (v && v.trim().length) {
          found[k] = v.trim()
          hasAny = true
        }
      }

      if (!hasAny) return

      // Persist to localStorage with expiration
      const now = Date.now()
      const expiresAt = now + DEFAULT_TTL_DAYS * 24 * 60 * 60 * 1000
      const payload = {
        data: found,
        capturedAt: now,
        expiresAt,
        version: 1,
      }

      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
      } catch {
        // Ignore storage failures (private mode, quota, etc.)
      }

      // Clean URL by removing referral params while preserving others
      const clean = new URL(window.location.href)
      keys.forEach((k) => clean.searchParams.delete(k))

      if (clean.search !== url.search) {
        window.history.replaceState({}, document.title, clean.toString())
      }
    } catch {
      // Silently ignore any parsing errors
    }
  }, [])

  // Nothing to render
  return null
}
