import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "outlined" | "filled"
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant = "outlined", ...props }, ref) => {
    const variantClasses = {
      outlined: "border border-outline bg-transparent focus:border-primary",
      filled: "border-b border-outline bg-surface-variant focus:border-primary",
    }

    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 m3-transition",
          variantClasses[variant],
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Input.displayName = "Input"

export { Input }
