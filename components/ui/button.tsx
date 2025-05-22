"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 m3-state-layer font-body relative overflow-hidden",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/70",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive/70",
        outline: "border border-outline bg-transparent text-primary hover:bg-primary/10 active:bg-primary/20",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/90 active:bg-secondary/70",
        ghost: "text-primary hover:bg-primary/10 active:bg-primary/20",
        link: "text-primary underline-offset-4 hover:underline",
        tonal:
          "bg-primary-container text-primary-container-foreground hover:bg-primary-container/90 active:bg-primary-container/70",
        elevated:
          "bg-surface text-surface-foreground shadow-elevation-1 hover:shadow-elevation-2 active:shadow-elevation-1",
      },
      size: {
        default: "h-10 px-6 py-2.5",
        sm: "h-9 rounded-full px-4 py-2 text-xs",
        lg: "h-12 rounded-full px-8 py-3 text-base",
        icon: "h-10 w-10",
        fab: "h-14 w-14 rounded-full shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-2",
        "fab-small": "h-10 w-10 rounded-full shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-2",
        "fab-large": "h-24 w-24 rounded-full shadow-elevation-3 hover:shadow-elevation-4 active:shadow-elevation-2",
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
      <Comp
        className={cn(
          buttonVariants({ variant, size, className }),
          "float-right mr-0 ml-auto absolute right-4", // Strong right positioning
        )}
        onClick={handleClick}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
