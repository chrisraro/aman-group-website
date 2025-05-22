import * as React from "react"

import { cn } from "@/lib/utils"

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "elevated" | "filled" | "outlined"
    isHoverable?: boolean
    isInteractive?: boolean
  }
>(({ className, variant = "elevated", isHoverable = false, isInteractive = false, ...props }, ref) => {
  const variantClasses = {
    elevated: "bg-card text-card-foreground shadow-elevation-1 hover:shadow-elevation-2 transition-shadow",
    filled: "bg-surface-variant text-surface-variant-foreground",
    outlined: "bg-card text-card-foreground border border-outline shadow-none",
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-lg m3-transition overflow-hidden",
        variantClasses[variant],
        isHoverable && "hover:shadow-elevation-3 transition-all duration-300",
        isInteractive && "cursor-pointer m3-state-layer",
        className,
      )}
      {...props}
    />
  )
})
Card.displayName = "Card"

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-4 sm:p-6", className)} {...props} />
  ),
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => <h3 ref={ref} className={cn("card-title", className)} {...props} />,
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => <p ref={ref} className={cn("card-subtitle", className)} {...props} />,
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4 sm:p-6 pt-0 card-content", className)} {...props} />
  ),
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center p-4 sm:p-6 pt-0", className)} {...props} />
  ),
)
CardFooter.displayName = "CardFooter"

export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
