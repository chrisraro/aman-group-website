"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ScheduleViewingButtonProps {
  propertyName: string
  propertyLocation?: string
  propertyType?: string
  className?: string
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
  style?: React.CSSProperties
  children?: React.ReactNode
}

export default function ScheduleViewingButton({
  propertyName,
  propertyLocation,
  propertyType,
  className,
  variant = "default",
  style,
  children,
}: ScheduleViewingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleScheduleViewing = () => {
    // Create the subject and body for the email
    const subject = `Schedule Property Viewing - ${propertyName}`
    const body = `Hello,

I would like to schedule a viewing for the following property:

Property: ${propertyName}
${propertyLocation ? `Location: ${propertyLocation}` : ""}
${propertyType ? `Type: ${propertyType}` : ""}

Please let me know your available dates and times.

Thank you!`

    // Create mailto link
    const mailtoLink = `mailto:frontdesk@enjoyrealty.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

    // Open email client
    window.location.href = mailtoLink
    setIsOpen(false)
  }

  const handleCalendarView = () => {
    window.open("/calendar", "_blank")
    setIsOpen(false)
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className={className} variant={variant} style={style}>
          {children || (
            <>
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Viewing
            </>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schedule Property Viewing</DialogTitle>
          <DialogDescription>Choose how you'd like to schedule your viewing for {propertyName}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <Button onClick={handleScheduleViewing} className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            Send Email Request
          </Button>
          <Button onClick={handleCalendarView} variant="outline" className="w-full justify-start">
            <ExternalLink className="h-4 w-4 mr-2" />
            View Available Dates
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Export as both named and default for compatibility
export { ScheduleViewingButton }
