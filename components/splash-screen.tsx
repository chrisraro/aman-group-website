"use client"

import { useState, useEffect } from "react"

export function SplashScreen() {
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Check if this is a standalone PWA
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches

    // Only show splash screen in standalone mode
    if (!isStandalone) {
      setShow(false)
      return
    }

    // Hide splash screen after 2 seconds
    const timer = setTimeout(() => {
      setShow(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  if (!show) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <div className="flex flex-col items-center">
        <div className="animate-pulse">
          <div className="flex items-center justify-center bg-primary text-primary-foreground font-bold text-5xl rounded-xl h-32 w-32">
            A
          </div>
        </div>
        <h1 className="mt-4 text-2xl font-bold text-primary animate-fade-in">Aman Group</h1>
        <p className="text-sm text-muted-foreground animate-fade-in">Building quality homes since 1989</p>
      </div>
    </div>
  )
}
