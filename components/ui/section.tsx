import type * as React from "react"
import { cn } from "@/lib/utils"
import { Container } from "./container"

interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  container?: boolean
  containerSize?: "sm" | "md" | "lg" | "xl" | "full"
  spacing?: "none" | "sm" | "md" | "lg" | "xl"
}

export function Section({
  children,
  className,
  container = true,
  containerSize = "lg",
  spacing = "lg",
  ...props
}: SectionProps) {
  const spacingClasses = {
    none: "py-0",
    sm: "py-4 md:py-6",
    md: "py-6 md:py-8",
    lg: "py-8 md:py-12",
    xl: "py-12 md:py-16",
  }

  const content = container ? <Container size={containerSize}>{children}</Container> : children

  return (
    <section className={cn(spacingClasses[spacing], className)} {...props}>
      {content}
    </section>
  )
}
