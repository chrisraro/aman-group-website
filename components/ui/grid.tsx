import type * as React from "react"
import { cn } from "@/lib/utils"

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number
  gap?: "none" | "sm" | "md" | "lg"
  flow?: "row" | "col"
  responsive?: boolean
}

export function Grid({
  children,
  className,
  cols = 1,
  gap = "md",
  flow = "row",
  responsive = true,
  ...props
}: GridProps) {
  const gapClasses = {
    none: "gap-0",
    sm: "gap-2",
    md: "gap-4",
    lg: "gap-8",
  }

  const getResponsiveClasses = () => {
    if (!responsive) return `grid-cols-${cols}`

    switch (cols) {
      case 1:
        return "grid-cols-1"
      case 2:
        return "grid-cols-1 sm:grid-cols-2"
      case 3:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      case 4:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
      case 5:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
      case 6:
        return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6"
      default:
        return `grid-cols-1 sm:grid-cols-2 lg:grid-cols-${Math.min(cols, 12)}`
    }
  }

  return (
    <div
      className={cn(
        "grid",
        flow === "col" ? "grid-flow-col" : "grid-flow-row",
        responsive ? getResponsiveClasses() : `grid-cols-${cols}`,
        gapClasses[gap],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
