"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function AutoScrollTop() {
  const pathname = usePathname()

  useEffect(() => {
    // Skip initial page load scroll
    if (document.readyState !== "complete") {
      return
    }

    // Get the current scroll position
    const currentScrollY = window.scrollY

    // Only auto-scroll if we're not at the top already
    // This prevents unnecessary scrolling animations
    if (currentScrollY > 0) {
      // Use requestAnimationFrame to ensure smooth scrolling after the page content has rendered
      window.requestAnimationFrame(() => {
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        })
      })
    }
  }, [pathname]) // This will trigger whenever the pathname changes

  return null // This component doesn't render anything
}
