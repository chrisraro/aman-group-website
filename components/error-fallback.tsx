"use client"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

interface ErrorFallbackProps {
  title?: string
  description?: string
  onRetry?: () => void
  isRetrying?: boolean
}

export function ErrorFallback({
  title = "Something went wrong",
  description = "There was a problem loading the data. Please try again.",
  onRetry,
  isRetrying = false,
}: ErrorFallbackProps) {
  return (
    <div className="p-4">
      <Alert variant="destructive" className="mb-4">
        <AlertTitle>{title}</AlertTitle>
        <AlertDescription>{description}</AlertDescription>
      </Alert>

      {onRetry && (
        <Button onClick={onRetry} disabled={isRetrying}>
          {isRetrying ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="mr-2 h-4 w-4" />
              Retry
            </>
          )}
        </Button>
      )}
    </div>
  )
}
