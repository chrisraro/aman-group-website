"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function NavigationProgress() {
  const pathname = usePathname()
  const [isNavigating, setIsNavigating] = useState(false)

  useEffect(() => {
    // Start the progress indicator
    setIsNavigating(true)

    // After a short delay, hide the progress indicator
    const timer = setTimeout(() => {
      setIsNavigating(false)
    }, 500) // Adjust timing as needed

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <div
      className={cn(
        "fixed top-0 left-0 h-0.5 bg-primary z-50 transition-all duration-300",
        isNavigating ? "opacity-100 w-full" : "opacity-0 w-0",
      )}
      aria-hidden="true"
    />
  )
}
