import type * as React from "react"
import { cn } from "@/lib/utils"

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full"
  gutter?: boolean
}

export function Container({ children, className, size = "lg", gutter = true, ...props }: ContainerProps) {
  const sizeClasses = {
    sm: "max-w-screen-sm",
    md: "max-w-screen-md",
    lg: "max-w-screen-lg",
    xl: "max-w-screen-xl",
    full: "max-w-full",
  }

  return (
    <div className={cn("mx-auto w-full", sizeClasses[size], gutter && "px-4 sm:px-6 md:px-8", className)} {...props}>
      {children}
    </div>
  )
}
