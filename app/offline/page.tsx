"use client"

import Link from "next/link"
import { WifiOff, Home, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export default function OfflinePage() {
  const [cachedPages, setCachedPages] = useState<string[]>([])

  useEffect(() => {
    // Get list of cached pages if available
    if ("caches" in window) {
      caches.open("aman-group-cache-v1").then((cache) => {
        cache.keys().then((keys) => {
          const pages = keys
            .map((key) => {
              const url = new URL(key.url)
              return url.pathname
            })
            .filter((path) => path !== "/" && !path.includes(".") && path !== "/offline")

          // Remove duplicates
          setCachedPages([...new Set(pages)])
        })
      })
    }
  }, [])

  return (
    <div className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[70vh] text-center">
      <WifiOff className="h-16 w-16 text-muted-foreground mb-6" />
      <h1 className="text-3xl font-bold mb-4">You're offline</h1>
      <p className="text-muted-foreground mb-8 max-w-md">
        It looks like you're not connected to the internet. Check your connection and try again.
      </p>
      <div className="space-y-4">
        <Button onClick={() => window.location.reload()} className="flex items-center">
          <RefreshCw className="mr-2 h-4 w-4" />
          Try Again
        </Button>

        <div className="pt-4">
          <Link href="/" className="text-primary hover:underline flex items-center justify-center">
            <Home className="mr-2 h-4 w-4" />
            Go to Homepage
          </Link>
        </div>

        {cachedPages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium mb-4">Available offline pages:</h2>
            <div className="flex flex-wrap justify-center gap-2">
              {cachedPages.map((page) => (
                <Link
                  key={page}
                  href={page}
                  className="px-3 py-1 bg-gray-100 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {page.replace(/^\//, "")}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
