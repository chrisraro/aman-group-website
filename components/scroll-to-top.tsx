"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"

export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false)
  const pathname = usePathname()

  // Effect for handling scroll button visibility
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)
    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  // Effect for automatic scroll to top on page change
  useEffect(() => {
    // Scroll to top with a smooth animation
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [pathname]) // This will trigger whenever the pathname changes

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  // This component only handles auto-scroll on route change
  // The visible button is handled by BackToTopButton component
  return null
}
