"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { ArrowUp } from "lucide-react"

const fabVariants = cva(
  "fixed rounded-full flex items-center justify-center shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-2 m3-state-layer transition-all duration-300 z-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/70",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/70",
        tertiary: "bg-tertiary text-tertiary-foreground hover:bg-tertiary/90 active:bg-tertiary/70",
      },
      size: {
        default: "h-14 w-14",
        small: "h-10 w-10",
        large: "h-16 w-16",
      },
      position: {
        "bottom-right": "bottom-4 right-4",
        "bottom-left": "bottom-4 left-4",
        "top-right": "top-4 right-4",
        "top-left": "top-4 left-4",
        "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      position: "bottom-right",
    },
  },
)

export interface FloatingActionButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof fabVariants> {
  icon?: React.ReactNode
  showLabel?: boolean
  label?: string
}

export const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, variant, size, position, icon, showLabel = false, label, ...props }, ref) => {
    return (
      <button className={cn(fabVariants({ variant, size, position, className }))} ref={ref} {...props}>
        {icon || <ArrowUp className="h-6 w-6" />}
        {showLabel && label && <span className="ml-2 text-sm font-medium">{label}</span>}
      </button>
    )
  },
)
FloatingActionButton.displayName = "FloatingActionButton"

export { fabVariants }
