"use client"

import type React from "react"

import { useState } from "react"
import { Calendar, Check, Loader2 } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { formatDate, formatTime } from "@/lib/hooks/useCalendar"
import { CalendarAvailabilityView } from "@/components/calendar-availability-view"
import { createGoogleCalendarUrl } from "@/lib/hooks/useCalendar"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface ScheduleViewingButtonProps extends ButtonProps {
  propertyName: string
  propertyLocation?: string
  children?: React.ReactNode
}

export function ScheduleViewingButton({
  propertyName,
  propertyLocation = "Naga City",
  children = "Schedule a Viewing",
  className,
  ...props
}: ScheduleViewingButtonProps) {
  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [selectedStartTime, setSelectedStartTime] = useState<string>("")
  const [selectedEndTime, setSelectedEndTime] = useState<string>("")

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [open, setOpen] = useState(false)

  const handleTimeSlotSelect = (date: string, startTime: string, endTime: string) => {
    setSelectedDate(date)
    setSelectedStartTime(startTime)
    setSelectedEndTime(endTime)
  }

  const handleNextStep = () => {
    setStep(2)
  }

  const handlePrevStep = () => {
    setStep(1)
  }

  const resetForm = () => {
    setName("")
    setEmail("")
    setPhone("")
    setSelectedDate("")
    setSelectedStartTime("")
    setSelectedEndTime("")
    setStep(1)
    setIsSuccess(false)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      if (!selectedDate || !selectedStartTime || !selectedEndTime) {
        throw new Error("Please select a date and time")
      }

      // Format the event details for Google Calendar
      const eventTitle = `Property Viewing: ${propertyName}`
      const eventDetails = `
Property: ${propertyName}
Location: ${propertyLocation}
Visitor: ${name}
Contact: ${email} / ${phone}
Date: ${formatDate(selectedDate)}
Time: ${formatTime(selectedStartTime)}
      `

      // Create Google Calendar event URL for the user
      const googleCalendarUrl = createGoogleCalendarUrl(
        eventTitle,
        eventDetails,
        propertyLocation,
        selectedStartTime,
        selectedEndTime,
      )

      // Open Google Calendar in a new tab
      window.open(googleCalendarUrl, "_blank")

      setIsSuccess(true)

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSuccess(false)
        resetForm()
        setOpen(false)
      }, 3000)
    } catch (error) {
      console.error("Error scheduling viewing:", error)
      setError(error instanceof Error ? error.message : "Failed to schedule viewing")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        if (!isOpen) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button className={`whitespace-nowrap text-ellipsis overflow-hidden ${className}`} {...props}>
          {/* Only add Calendar icon if children doesn't already contain it */}
          {typeof children === "string" && !children.includes("Viewing") ? (
            <>
              <Calendar className="mr-2 h-4 w-4" /> {children}
            </>
          ) : (
            children
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule a Property Viewing</DialogTitle>
          <DialogDescription>
            {step === 1
              ? "Fill out your information to schedule a viewing."
              : `Select an available time slot to schedule your viewing of ${propertyName}.`}
          </DialogDescription>
        </DialogHeader>

        {isSuccess ? (
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mb-2 text-lg font-medium">Viewing Scheduled!</h3>
            <p className="text-sm text-gray-500 mb-4">
              Your viewing for {propertyName} on {formatDate(selectedDate)} at {formatTime(selectedStartTime)} has been
              added to your Google Calendar. You'll receive a confirmation email shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 py-4">
            {step === 1 ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Your Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>

                {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

                <DialogFooter>
                  <Button type="button" onClick={handleNextStep} disabled={!name || !email || !phone}>
                    Next: Select Time
                  </Button>
                </DialogFooter>
              </>
            ) : (
              <>
                <CalendarAvailabilityView
                  onSelectTimeSlot={handleTimeSlotSelect}
                  selectedDate={selectedDate}
                  selectedStartTime={selectedStartTime}
                />

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <DialogFooter className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
                  <Button type="button" variant="outline" onClick={handlePrevStep}>
                    Back
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !selectedDate || !selectedStartTime}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scheduling...
                      </>
                    ) : (
                      "Schedule Viewing"
                    )}
                  </Button>
                </DialogFooter>
              </>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}

// Add a default export that re-exports the named export for backward compatibility
export default ScheduleViewingButton
