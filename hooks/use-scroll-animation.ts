"use client"

import { useEffect, useRef, useState } from "react"

interface UseScrollAnimationProps {
  threshold?: number
  rootMargin?: string
}

export function useScrollAnimation({ threshold = 0.1, rootMargin = "0px" }: UseScrollAnimationProps = {}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          // Once the animation has played, we can disconnect the observer
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [threshold, rootMargin])

  return { ref, isInView }
}
