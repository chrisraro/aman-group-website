import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-full text-sm font-medium m3-state-layer m3-transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        filled: "bg-primary text-primary-foreground hover:shadow-elevation-1",
        tonal: "bg-primary-container text-primary-container-foreground hover:shadow-elevation-1",
        outlined: "border border-outline bg-transparent text-primary hover:bg-primary/5",
        text: "bg-transparent text-primary hover:bg-primary/5",
        elevated: "bg-surface text-primary shadow-elevation-1 hover:shadow-elevation-2",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 py-1.5 text-xs",
        lg: "h-12 px-8 py-3 text-base",
        icon: "h-10 w-10 p-2",
      },
    },
    defaultVariants: {
      variant: "filled",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const M3Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => {
  return <button className={cn(buttonVariants({ variant, size }), className)} ref={ref} {...props} />
})
M3Button.displayName = "M3Button"

export { M3Button, buttonVariants }
