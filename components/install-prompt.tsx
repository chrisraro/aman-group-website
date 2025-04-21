"use client"

import { useState, useEffect } from "react"
import { Download, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function InstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isIOS, setIsIOS] = useState(false)
  const [isIOSPWA, setIsIOSPWA] = useState(false)

  useEffect(() => {
    // Check if in preview environment
    const isPreviewEnvironment = window.location.hostname.includes("vusercontent.net")
    if (isPreviewEnvironment) {
      // Don't show install prompt in preview environments
      return
    }

    // Check if on iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if already installed
    const isInstalled = window.matchMedia("(display-mode: standalone)").matches
    if (isInstalled) {
      return
    }

    // Check if user has already dismissed or installed
    const hasPromptBeenShown = localStorage.getItem("installPromptShown")
    const lastPromptDate = localStorage.getItem("installPromptDate")
    const currentDate = new Date().toDateString()

    // Only show prompt if it hasn't been shown today
    if (hasPromptBeenShown && lastPromptDate === currentDate) {
      setShowPrompt(false)
      return
    }

    // For iOS devices, check if in standalone mode
    if (isIOSDevice) {
      const isInStandaloneMode = window.navigator.standalone === true
      if (!isInStandaloneMode) {
        // Show iOS specific install instructions
        setIsIOSPWA(true)
        setShowPrompt(true)
      }
    }

    // Listen for the beforeinstallprompt event for non-iOS devices
    window.addEventListener("beforeinstallprompt", (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show the install prompt
      setShowPrompt(true)
    })

    // Track PWA installation
    window.addEventListener("appinstalled", () => {
      // Log app installation
      console.log("PWA was installed")
      localStorage.setItem("appInstalled", "true")
      setShowPrompt(false)
    })
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    // We no longer need the prompt
    setDeferredPrompt(null)

    // Hide the install button
    setShowPrompt(false)

    // Log the outcome
    console.log(`User ${outcome} the install prompt`)

    // Save that the prompt has been shown
    localStorage.setItem("installPromptShown", "true")
    localStorage.setItem("installPromptDate", new Date().toDateString())
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Save that the prompt has been dismissed
    localStorage.setItem("installPromptShown", "true")
    localStorage.setItem("installPromptDate", new Date().toDateString())
  }

  if (!showPrompt) {
    return null
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-50 flex items-center justify-between">
      <div className="flex-1">
        <h3 className="font-medium">Install Aman Group App</h3>
        {isIOSPWA ? (
          <p className="text-sm text-muted-foreground">
            Tap{" "}
            <span className="inline-block">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M12 5V19M12 5L6 11M12 5L18 11"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>{" "}
            then "Add to Home Screen" for a better experience
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">Install our app for a better experience</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {!isIOSPWA && (
          <Button onClick={handleInstallClick} size="sm" className="whitespace-nowrap">
            <Download className="h-4 w-4 mr-1" />
            Install
          </Button>
        )}
        <Button variant="ghost" size="sm" onClick={handleDismiss}>
          <X className="h-4 w-4" />
          <span className="sr-only">Dismiss</span>
        </Button>
      </div>
    </div>
  )
}
