"use client"

import { useState, useEffect } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Set initial value
    const media = window.matchMedia(query)
    setMatches(media.matches)

    // Set up listener for changes
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches)
    media.addEventListener("change", listener)

    // Clean up
    return () => media.removeEventListener("change", listener)
  }, [query])

  return matches
}
