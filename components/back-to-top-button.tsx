"use client"

import { useState, useEffect } from "react"
import { ArrowUp } from "lucide-react"
import { FloatingActionButton } from "@/components/ui/floating-action-button"

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true)
      } else {
        setIsVisible(false)
      }
    }

    window.addEventListener("scroll", toggleVisibility)

    return () => window.removeEventListener("scroll", toggleVisibility)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }

  if (!isVisible) return null

  return (
    <FloatingActionButton
      onClick={scrollToTop}
      aria-label="Scroll to top"
      icon={<ArrowUp className="h-5 w-5" />}
      position="bottom-right"
      size="default"
      className="animate-fade-in"
    />
  )
}
