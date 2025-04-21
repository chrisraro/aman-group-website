"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Clock, MapPin, X } from "lucide-react"
import { formatDate, formatTime } from "@/lib/google-calendar"

// This would come from your backend in a real application
interface Viewing {
  id: string
  propertyName: string
  propertyLocation: string
  date: string
  startTime: string
  endTime: string
}

interface UpcomingViewingsProps {
  viewings?: Viewing[]
}

export default function UpcomingViewings({ viewings: initialViewings }: UpcomingViewingsProps) {
  // In a real app, this would be fetched from your backend
  const [viewings, setViewings] = useState<Viewing[]>(
    initialViewings || [
      {
        id: "1",
        propertyName: "Palm Village - Model House A",
        propertyLocation: "Palm Village, Naga City",
        date: "2025-04-15",
        startTime: "2025-04-15T10:00",
        endTime: "2025-04-15T11:00",
      },
      {
        id: "2",
        propertyName: "Parkview Naga - Model House B",
        propertyLocation: "Parkview Naga Urban Residences, Naga City",
        date: "2025-04-18",
        startTime: "2025-04-18T14:00",
        endTime: "2025-04-18T15:00",
      },
    ],
  )

  const handleCancel = (id: string) => {
    // In a real app, you would call your API to cancel the viewing
    setViewings(viewings.filter((viewing) => viewing.id !== id))
    // You would also remove the event from Google Calendar using the Google Calendar API
  }

  const handleReschedule = (id: string) => {
    // In a real app, this would open the scheduling dialog with pre-filled information
    console.log("Reschedule viewing", id)
  }

  if (viewings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Viewings</CardTitle>
          <CardDescription>You have no upcoming property viewings scheduled.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-6">
            <Button>Schedule a Viewing</Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upcoming Viewings</CardTitle>
        <CardDescription>Your scheduled property viewings</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {viewings.map((viewing) => (
          <div key={viewing.id} className="rounded-lg border p-4">
            <div className="flex flex-col space-y-2 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
              <div>
                <h3 className="font-medium">{viewing.propertyName}</h3>
                <div className="mt-2 flex flex-col space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center">
                    <MapPin className="mr-1 h-4 w-4" />
                    <span>{viewing.propertyLocation}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-1 h-4 w-4" />
                    <span>{formatDate(viewing.date)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{formatTime(viewing.startTime)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-2 flex flex-row space-x-2 sm:mt-0 sm:flex-col sm:space-x-0 sm:space-y-2">
                <Button variant="outline" size="sm" onClick={() => handleReschedule(viewing.id)}>
                  Reschedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => handleCancel(viewing.id)}
                >
                  <X className="mr-1 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="outline" className="w-full">
          Add to Calendar
        </Button>
      </CardFooter>
    </Card>
  )
}
