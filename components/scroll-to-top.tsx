"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
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

  return (
    <>
      {isVisible && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-4 right-4 z-50 p-2 h-10 w-10 rounded-full shadow-md"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}
    </>
  )
}
