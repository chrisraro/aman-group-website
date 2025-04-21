"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile on mount and on resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    const toggleVisibility = () => {
      // Show button when page is scrolled more than 500px on mobile, 1000px on desktop
      const scrollThreshold = isMobile ? 500 : 1000
      if (window.scrollY > scrollThreshold) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => {
      window.removeEventListener("scroll", toggleVisibility)
      window.removeEventListener("resize", checkMobile)
    }
  }, [isMobile])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <Button
      onClick={scrollToTop}
      className={cn(
        "fixed z-50 shadow-md",
        isMobile ? "bottom-20 right-4 h-12 w-12 rounded-full" : "bottom-8 right-8 h-10 w-10 rounded-full",
      )}
      aria-label="Back to top"
    >
      <ArrowUp className={cn(isMobile ? "h-6 w-6" : "h-5 w-5")} />
    </Button>
  )
}
