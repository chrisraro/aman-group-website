"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { cn } from "@/lib/utils"

interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
  animation?: "fadeIn" | "fadeInUp" | "slideIn" | "scaleIn"
}

export function AnimatedSection({ children, className, delay = 0, animation = "fadeInUp" }: AnimatedSectionProps) {
  const { ref, isInView } = useScrollAnimation()

  const variants = {
    fadeIn: {
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: { duration: 0.5, delay },
      },
    },
    fadeInUp: {
      hidden: { opacity: 0, y: 30 },
      visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.5, delay },
      },
    },
    slideIn: {
      hidden: { x: -30, opacity: 0 },
      visible: {
        x: 0,
        opacity: 1,
        transition: { duration: 0.5, delay },
      },
    },
    scaleIn: {
      hidden: { scale: 0.9, opacity: 0 },
      visible: {
        scale: 1,
        opacity: 1,
        transition: { duration: 0.5, delay },
      },
    },
  }

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={variants[animation]}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
