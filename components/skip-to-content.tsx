"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

export function SkipToContent() {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <a
      href="#main-content"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50",
        "focus:bg-white focus:p-4 focus:shadow-md focus:rounded-md focus:outline-none focus:ring-2 focus:ring-primary",
      )}
    >
      Skip to content
    </a>
  )
}
