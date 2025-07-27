"use client"

import { useState, useEffect, useCallback } from "react"
import { ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function BackToTopButton() {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const toggleVisibility = useCallback(() => {
    const scrolled = document.documentElement.scrollTop
    const maxHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.min((scrolled / maxHeight) * 100, 100)

    setScrollProgress(progress)
    setIsVisible(scrolled > 300 || progress > 20)
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const handleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(toggleVisibility, 10)
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", handleScroll)
      clearTimeout(timeoutId)
    }
  }, [toggleVisibility])

  if (!isVisible) {
    return null
  }

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className={cn(
        "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
        "z-50 h-12 w-12 rounded-full shadow-lg",
        "bg-primary hover:bg-primary/90 text-primary-foreground",
        "transition-all duration-300 ease-in-out",
        "hover:scale-110 active:scale-95",
        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
      )}
      aria-label={`Back to top (${Math.round(scrollProgress)}% scrolled)`}
    >
      <ChevronUp className="h-5 w-5" />
    </Button>
  )
}
