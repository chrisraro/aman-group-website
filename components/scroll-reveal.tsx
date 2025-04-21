"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface ScrollRevealProps {
  children: ReactNode
  className?: string
  delay?: number
  direction?: "up" | "down" | "left" | "right"
  distance?: number
  duration?: number
  once?: boolean
}

export function ScrollReveal({
  children,
  className,
  delay = 0,
  direction = "up",
  distance = 50,
  duration = 0.6,
  once = true,
}: ScrollRevealProps) {
  const { ref, isInView } = useScrollAnimation({ threshold: 0.1 })

  const directionMap = {
    up: { y: distance },
    down: { y: -distance },
    left: { x: distance },
    right: { x: -distance },
  }

  const initial = {
    opacity: 0,
    ...directionMap[direction],
  }

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={isInView ? { opacity: 1, x: 0, y: 0 } : initial}
      transition={{ duration, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
