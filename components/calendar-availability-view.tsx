"use client"

import { useState, useEffect } from "react"
import { CalendarIcon, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react"
import { format, addDays, startOfWeek, addWeeks, subWeeks, isToday } from "date-fns"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getAvailabilityForDateRange, type CalendarAvailability } from "@/lib/google-calendar-api"
import { formatTime } from "@/lib/google-calendar"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface CalendarAvailabilityViewProps {
  onSelectTimeSlot: (date: string, startTime: string, endTime: string) => void
  selectedDate?: string
  selectedStartTime?: string
}

export function CalendarAvailabilityView({
  onSelectTimeSlot,
  selectedDate,
  selectedStartTime,
}: CalendarAvailabilityViewProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    // Start with current week, but ensure we don't show past days
    const today = new Date()
    const weekStart = startOfWeek(today, { weekStartsOn: 0 })
    return today < weekStart ? weekStart : today
  })

  const [availability, setAvailability] = useState<CalendarAvailability[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Generate array of 7 days starting from currentWeekStart
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i))

  // Fetch availability data when week changes or on retry
  useEffect(() => {
    let isMounted = true

    async function fetchAvailability() {
      if (!isMounted) return

      setLoading(true)
      setError(null)

      try {
        const startDate = format(currentWeekStart, "yyyy-MM-dd")
        const endDate = format(addDays(currentWeekStart, 6), "yyyy-MM-dd")

        const availabilityData = await getAvailabilityForDateRange(startDate, endDate)

        if (isMounted) {
          setAvailability(availabilityData)
          setLoading(false)
        }
      } catch (err) {
        console.error("Error fetching availability:", err)

        if (isMounted) {
          // More user-friendly error message
          setError("We couldn't load the calendar availability. Please try again.")
          setLoading(false)
        }
      }
    }

    fetchAvailability()

    return () => {
      isMounted = false
    }
  }, [currentWeekStart, retryCount])

  // Navigate to previous week
  const goToPreviousWeek = () => {
    const prevWeek = subWeeks(currentWeekStart, 1)
    // Don't allow navigating to past weeks
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (prevWeek >= today) {
      setCurrentWeekStart(prevWeek)
    } else {
      // If previous week is in the past, set to today
      setCurrentWeekStart(today)
    }
  }

  // Navigate to next week
  const goToNextWeek = () => {
    setCurrentWeekStart(addWeeks(currentWeekStart, 1))
  }

  // Get time slots for a specific date
  const getTimeSlotsForDate = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    const dayAvailability = availability.find((day) => day.date === dateStr)
    return dayAvailability?.slots || []
  }

  // Check if a date is selected
  const isDateSelected = (date: Date) => {
    return selectedDate === format(date, "yyyy-MM-dd")
  }

  // Handle date selection
  const handleDateSelect = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd")
    // If there are available slots for this date, select the first one
    const slots = getTimeSlotsForDate(date)
    const firstAvailableSlot = slots.find((slot) => slot.available)

    if (firstAvailableSlot) {
      onSelectTimeSlot(dateStr, firstAvailableSlot.startTime, firstAvailableSlot.endTime)
    }
  }

  // Handle time slot selection
  const handleTimeSlotSelect = (date: string, startTime: string, endTime: string) => {
    onSelectTimeSlot(date, startTime, endTime)
  }

  // Check if a date has any available slots
  const hasAvailableSlots = (date: Date) => {
    return getTimeSlotsForDate(date).some((slot) => slot.available)
  }

  return (
    <div className="space-y-4">
      {/* Calendar navigation */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Select a date & time</h3>
        <div className="flex space-x-2">
          <Button variant="outline" size="icon" onClick={goToPreviousWeek} aria-label="Previous week">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNextWeek} aria-label="Next week">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Days of the week */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((day) => (
          <div
            key={day.toString()}
            className={cn(
              "flex flex-col items-center p-2 rounded-md cursor-pointer border transition-colors",
              isDateSelected(day)
                ? "bg-primary text-primary-foreground border-primary"
                : "hover:bg-accent hover:text-accent-foreground border-muted",
              hasAvailableSlots(day) ? "" : "opacity-50 cursor-not-allowed",
              isToday(day) && !isDateSelected(day) && "border-blue-400",
            )}
            onClick={() => {
              if (hasAvailableSlots(day)) {
                handleDateSelect(day)
              }
            }}
          >
            <span className="text-xs font-medium">{format(day, "EEE")}</span>
            <span className={cn("text-sm", isToday(day) && "font-bold")}>{format(day, "d")}</span>
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="mt-4">
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setRetryCount((prev) => prev + 1)
                }}
              >
                Retry Loading Calendar
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground mt-2">
              <p>You can still continue with booking. All time slots will be shown as available.</p>
            </div>
          </div>
        ) : selectedDate ? (
          <div>
            <h4 className="text-sm font-medium mb-2">
              Available times for {format(new Date(selectedDate), "EEEE, MMMM d")}
            </h4>
            <div className="grid grid-cols-3 gap-2">
              {availability
                .find((day) => day.date === selectedDate)
                ?.slots.map((slot, index) => (
                  <Button
                    key={index}
                    variant={slot.startTime === selectedStartTime ? "default" : "outline"}
                    size="sm"
                    disabled={!slot.available}
                    className={cn(
                      "flex items-center justify-center",
                      !slot.available && "opacity-50 cursor-not-allowed",
                    )}
                    onClick={() => {
                      if (slot.available) {
                        handleTimeSlotSelect(selectedDate, slot.startTime, slot.endTime)
                      }
                    }}
                  >
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    {formatTime(slot.startTime)}
                  </Button>
                ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-4 text-muted-foreground">
            <p>Select a date to view available time slots</p>
          </div>
        )}
      </div>
    </div>
  )
}
