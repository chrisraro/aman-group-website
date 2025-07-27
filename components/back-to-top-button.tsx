"use client"

import { useState, useEffect, useCallback } from "react"
import { ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface BackToTopButtonProps {
  className?: string
  threshold?: number
  showProgress?: boolean
}

export function BackToTopButton({ className, threshold = 300, showProgress = true }: BackToTopButtonProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [scrollProgress, setScrollProgress] = useState(0)

  const calculateScrollProgress = useCallback(() => {
    const scrollTop = window.pageYOffset
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = Math.min((scrollTop / docHeight) * 100, 100)
    return progress
  }, [])

  const handleScroll = useCallback(() => {
    const scrollTop = window.pageYOffset
    const viewportHeight = window.innerHeight
    const dynamicThreshold = Math.min(threshold, viewportHeight * 0.2)

    setIsVisible(scrollTop > dynamicThreshold)

    if (showProgress) {
      setScrollProgress(calculateScrollProgress())
    }
  }, [threshold, showProgress, calculateScrollProgress])

  const scrollToTop = useCallback(() => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    })
  }, [])

  useEffect(() => {
    let timeoutId: NodeJS.Timeout

    const throttledHandleScroll = () => {
      clearTimeout(timeoutId)
      timeoutId = setTimeout(handleScroll, 16) // ~60fps
    }

    window.addEventListener("scroll", throttledHandleScroll, { passive: true })

    // Initial check
    handleScroll()

    return () => {
      window.removeEventListener("scroll", throttledHandleScroll)
      clearTimeout(timeoutId)
    }
  }, [handleScroll])

  if (!isVisible) return null

  const progressStyle = showProgress
    ? {
        background: `conic-gradient(hsl(var(--primary)) ${scrollProgress * 3.6}deg, transparent 0deg)`,
      }
    : {}

  return (
    <>
      {/* Large screens: Full FAB with progress indicator */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed z-50 hidden sm:flex items-center justify-center",
          "w-14 h-14 rounded-full",
          "bg-primary text-primary-foreground",
          "shadow-elevation-3 hover:shadow-elevation-4",
          "transition-all duration-300 ease-in-out",
          "hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
          "animate-fade-in",
          "no-print",
          className,
        )}
        style={progressStyle}
        aria-label={`Back to top (${Math.round(scrollProgress)}% scrolled)`}
        title={`Back to top - ${Math.round(scrollProgress)}% scrolled`}
      >
        <div className="relative">
          {showProgress && (
            <div
              className="absolute inset-0 rounded-full border-2 border-primary/20"
              style={{
                background: `conic-gradient(hsl(var(--primary)) ${scrollProgress * 3.6}deg, transparent 0deg)`,
                mask: "radial-gradient(circle at center, transparent 60%, black 60%)",
                WebkitMask: "radial-gradient(circle at center, transparent 60%, black 60%)",
              }}
            />
          )}
          <ArrowUp className="w-5 h-5 relative z-10" />
        </div>
      </button>

      {/* Small screens: Compact text button */}
      <button
        onClick={scrollToTop}
        className={cn(
          "fixed z-50 flex sm:hidden items-center justify-center",
          "px-3 py-2 rounded-full",
          "bg-primary/90 backdrop-blur-sm text-primary-foreground",
          "shadow-elevation-2 hover:shadow-elevation-3",
          "transition-all duration-300 ease-in-out",
          "hover:scale-105 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "bottom-4 right-4",
          "animate-fade-in",
          "no-print",
          "text-xs font-medium",
          className,
        )}
        aria-label={`Back to top (${Math.round(scrollProgress)}% scrolled)`}
        title={`Back to top - ${Math.round(scrollProgress)}% scrolled`}
      >
        <ArrowUp className="w-3 h-3 mr-1" />
        Top
      </button>
    </>
  )
}

export default BackToTopButton
