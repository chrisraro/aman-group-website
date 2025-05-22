"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const chipVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm m3-state-layer m3-transition",
  {
    variants: {
      variant: {
        filled: "m3-chip-filled",
        outlined: "m3-chip-outlined",
        elevated: "m3-chip-elevated",
      },
      selected: {
        true: "ring-2 ring-primary",
      },
    },
    defaultVariants: {
      variant: "filled",
      selected: false,
    },
  },
)

export interface ChipProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof chipVariants> {
  onDelete?: () => void
  icon?: React.ReactNode
}

const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ className, variant, selected, children, onDelete, icon, ...props }, ref) => {
    return (
      <div className={cn(chipVariants({ variant, selected }), className)} ref={ref} {...props}>
        {icon && <span className="chip-icon">{icon}</span>}
        <span className="chip-label">{children}</span>
        {onDelete && (
          <button
            type="button"
            className="chip-delete-button p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label="Delete"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    )
  },
)
Chip.displayName = "Chip"

export { Chip }
