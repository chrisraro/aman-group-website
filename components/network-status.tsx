"use client"

import { useState, useEffect } from "react"
import { WifiOff, Wifi } from "lucide-react"

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)
  const [showStatus, setShowStatus] = useState(false)

  useEffect(() => {
    // Set initial online status
    setIsOnline(navigator.onLine)

    // Add event listeners for online/offline events
    const handleOnline = () => {
      setIsOnline(true)
      setShowStatus(true)
      // Hide the status after 3 seconds
      setTimeout(() => setShowStatus(false), 3000)
    }

    const handleOffline = () => {
      setIsOnline(false)
      setShowStatus(true)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  if (!showStatus) {
    return null
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 p-2 z-40 flex items-center justify-center transition-all duration-300 ${
        isOnline ? "bg-green-50 border-t border-green-200" : "bg-yellow-50 border-t border-yellow-200"
      }`}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4 text-green-600 mr-2" />
          <span className="text-sm text-green-800">You're back online.</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-yellow-600 mr-2" />
          <span className="text-sm text-yellow-800">You're offline. Some features may be limited.</span>
        </>
      )}
    </div>
  )
}
