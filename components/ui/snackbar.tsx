"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const snackbarVariants = cva("fixed z-50 flex items-center justify-between p-4 shadow-elevation-3 m3-transition", {
  variants: {
    position: {
      bottom: "bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm",
      top: "top-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm",
      center: "top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 max-w-sm w-full",
    },
    variant: {
      default: "bg-inverse-surface text-inverse-on-surface rounded-lg",
      primary: "bg-primary text-primary-foreground rounded-lg",
      secondary: "bg-secondary text-secondary-foreground rounded-lg",
      destructive: "bg-destructive text-destructive-foreground rounded-lg",
    },
  },
  defaultVariants: {
    position: "bottom",
    variant: "default",
  },
})

export interface SnackbarProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof snackbarVariants> {
  open?: boolean
  onClose?: () => void
  autoHideDuration?: number
  action?: React.ReactNode
}

const Snackbar = React.forwardRef<HTMLDivElement, SnackbarProps>(
  (
    { className, position, variant, children, open = false, onClose, autoHideDuration = 5000, action, ...props },
    ref,
  ) => {
    React.useEffect(() => {
      if (open && autoHideDuration && onClose) {
        const timer = setTimeout(() => {
          onClose()
        }, autoHideDuration)
        return () => clearTimeout(timer)
      }
    }, [open, autoHideDuration, onClose])

    if (!open) return null

    return (
      <div ref={ref} className={cn(snackbarVariants({ position, variant }), "animate-fade-in", className)} {...props}>
        <div className="mr-4">{children}</div>
        <div className="flex items-center gap-2">
          {action}
          {onClose && (
            <button
              type="button"
              className="rounded-full p-1 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-ring"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          )}
        </div>
      </div>
    )
  },
)
Snackbar.displayName = "Snackbar"

export { Snackbar, snackbarVariants }
