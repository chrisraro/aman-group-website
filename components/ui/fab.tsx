import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "@radix-ui/react-slot"

const fabVariants = cva(
  "inline-flex items-center justify-center rounded-full shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-2 m3-state-layer m3-transition",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground",
        secondary: "bg-secondary text-secondary-foreground",
        tertiary: "bg-tertiary text-tertiary-foreground",
        surface: "bg-surface text-primary",
      },
      size: {
        default: "h-14 w-14",
        small: "h-10 w-10",
        large: "h-24 w-24",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface FabProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof fabVariants> {
  asChild?: boolean
}

const Fab = React.forwardRef<HTMLButtonElement, FabProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(fabVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Fab.displayName = "Fab"

export { Fab, fabVariants }
