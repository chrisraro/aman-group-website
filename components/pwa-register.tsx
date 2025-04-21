"use client"

import { useEffect, useState } from "react"
import { toast } from "@/components/ui/use-toast"

export function PWARegister() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    // Only register service worker in production or when running on localhost
    // This prevents errors in preview environments like vusercontent.net
    const isProduction =
      window.location.hostname === "localhost" ||
      window.location.hostname === "amangroup.com" ||
      !window.location.hostname.includes("vusercontent.net")

    if (typeof window !== "undefined" && "serviceWorker" in navigator && isProduction) {
      // Register the service worker
      navigator.serviceWorker
        .register("/sw.js", {
          // Specify the correct MIME type to help some environments
          type: "module",
        })
        .then((reg) => {
          console.log("Service Worker registered with scope:", reg.scope)
          setRegistration(reg)

          // Check for updates
          reg.addEventListener("updatefound", () => {
            const newWorker = reg.installing
            if (newWorker) {
              newWorker.addEventListener("statechange", () => {
                if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                  setIsUpdateAvailable(true)
                  toast({
                    title: "Update Available",
                    description: "A new version of the app is available. Refresh to update.",
                    action: (
                      <button
                        onClick={() => window.location.reload()}
                        className="bg-primary text-white px-3 py-1 rounded-md text-xs"
                      >
                        Refresh
                      </button>
                    ),
                    duration: 10000,
                  })
                }
              })
            }
          })
        })
        .catch((err) => {
          console.error("Service Worker registration failed:", err)
          // Don't show error toast in development/preview environments
          if (isProduction) {
            toast({
              title: "Service Worker Error",
              description: "App may not work offline. Please refresh the page.",
              variant: "destructive",
              duration: 5000,
            })
          }
        })

      // Handle offline/online status changes regardless of service worker
      window.addEventListener("online", () => {
        toast({
          title: "You're back online",
          description: "Your internet connection has been restored.",
          duration: 3000,
        })
      })

      window.addEventListener("offline", () => {
        toast({
          title: "You're offline",
          description: "The app will continue to work with limited functionality.",
          duration: 3000,
        })
      })
    }
  }, [isUpdateAvailable])

  return null
}
