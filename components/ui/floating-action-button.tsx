import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const floatingActionButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow-elevation-3 hover:shadow-elevation-4 m3-state-layer m3-transition",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-14 w-14",
        sm: "h-10 w-10",
        lg: "h-16 w-16",
        xl: "h-20 w-20",
      },
      position: {
        "bottom-right": "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8",
        "bottom-left": "fixed bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8",
        "top-right": "fixed top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8",
        "top-left": "fixed top-4 left-4 sm:top-6 sm:left-6 md:top-8 md:left-8",
        "bottom-right-safe": "fixed bottom-4 right-4 sm:bottom-6 sm:right-6 md:bottom-8 md:right-8 pb-safe pr-safe",
        "bottom-left-safe": "fixed bottom-4 left-4 sm:bottom-6 sm:left-6 md:bottom-8 md:left-8 pb-safe pl-safe",
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
    VariantProps<typeof floatingActionButtonVariants> {
  asChild?: boolean
}

const FloatingActionButton = React.forwardRef<HTMLButtonElement, FloatingActionButtonProps>(
  ({ className, variant, size, position, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(floatingActionButtonVariants({ variant, size, position, className }))}
        ref={ref}
        {...props}
      />
    )
  },
)
FloatingActionButton.displayName = "FloatingActionButton"

export { FloatingActionButton, floatingActionButtonVariants }
