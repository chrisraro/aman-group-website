"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 font-body",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  action?: () => void
  // Add Google Calendar event properties
  calendarEvent?: {
    title: string
    details?: string
    location?: string
    startDateTime?: string
    endDateTime?: string
  }
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, action, calendarEvent, onClick, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      // Handle Google Calendar event creation if calendarEvent is provided
      if (calendarEvent) {
        const { title, details = "", location = "", startDateTime, endDateTime } = calendarEvent

        // Only create calendar event if start and end times are provided
        if (startDateTime && endDateTime) {
          const googleCalendarUrl = new URL("https://calendar.google.com/calendar/render")
          googleCalendarUrl.searchParams.append("action", "TEMPLATE")
          googleCalendarUrl.searchParams.append("text", title)
          googleCalendarUrl.searchParams.append("details", details)
          googleCalendarUrl.searchParams.append("location", location)

          // Format dates for Google Calendar
          const formattedStart = startDateTime.replace(/[-:]/g, "")
          const formattedEnd = endDateTime.replace(/[-:]/g, "")
          googleCalendarUrl.searchParams.append("dates", `${formattedStart}/${formattedEnd}`)

          // Add timezone
          googleCalendarUrl.searchParams.append("ctz", Intl.DateTimeFormat().resolvedOptions().timeZone)

          // Open Google Calendar in a new tab
          window.open(googleCalendarUrl.toString(), "_blank")
        }
      }

      if (action) action()
      if (onClick) onClick(e)
    }

    return (
      <Comp className={cn(buttonVariants({ variant, size, className }))} onClick={handleClick} ref={ref} {...props} />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
