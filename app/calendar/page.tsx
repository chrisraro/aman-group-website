import type { Metadata } from "next"
import { CalendarSubscribeButton } from "@/components/calendar-subscribe-button"
import { ICAL_URL } from "@/lib/google-calendar-api"
import { getGoogleCalendarUrl } from "@/lib/env"

export const metadata: Metadata = {
  title: "Property Viewing Calendar | Aman Group",
  description: "View available property viewing slots and schedule your visit",
}

export default function CalendarPage() {
  // Get the calendar URL from environment variables or use the default
  const calendarEmbedUrl = getGoogleCalendarUrl()

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Property Viewing Calendar</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View our available property viewing slots and schedule your visit. You can also subscribe to our calendar to
          stay updated with our availability.
        </p>
      </div>

      <div className="flex justify-center mb-8">
        <CalendarSubscribeButton variant="default">Subscribe to Our Calendar</CalendarSubscribeButton>
      </div>

      <div className="bg-card rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-muted flex justify-between items-center border-b">
          <h2 className="text-xl font-semibold">Available Viewing Slots</h2>
          <a
            href={ICAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline flex items-center"
          >
            Open in Google Calendar
          </a>
        </div>
        <div className="p-0 h-[600px] w-full">
          <iframe
            src={calendarEmbedUrl}
            style={{ border: 0 }}
            width="100%"
            height="600"
            frameBorder="0"
            scrolling="no"
            title="Property Viewing Calendar"
          ></iframe>
        </div>
      </div>

      <div className="mt-8 bg-card rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">How to Subscribe to Our Calendar</h2>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">Option 1: Use the iCal URL</h3>
            <p className="mb-2">Copy the following URL and add it to your calendar app:</p>
            <div className="bg-muted p-3 rounded-md overflow-x-auto">
              <code className="text-sm break-all">{ICAL_URL}</code>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Option 2: Download the iCal File</h3>
            <p className="mb-2">Download the iCal file and import it into your calendar app:</p>
            <a
              href={ICAL_URL}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
            >
              Download iCal File
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
