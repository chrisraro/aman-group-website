"use client"

import { useState } from "react"
import { ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface CanvaEmbedProps {
  canvaDesignUrl: string
  title: string
  primaryColor: string
  height?: string
}

export function CanvaEmbed({ canvaDesignUrl, title, primaryColor, height }: CanvaEmbedProps) {
  const [isLoading, setIsLoading] = useState(true)

  // Determine button color class based on primaryColor
  const buttonColorClass =
    primaryColor === "#65932D"
      ? "bg-[#65932D] hover:bg-[#65932D]/90"
      : primaryColor === "#04009D"
        ? "bg-[#04009D] hover:bg-[#04009D]/90"
        : "bg-primary hover:bg-primary/90"

  return (
    <div className="flex flex-col items-center">
      <div className="w-full max-w-4xl mx-auto mb-4 md:mb-6 border rounded-lg overflow-hidden bg-white relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}
        <iframe
          src={canvaDesignUrl}
          width="100%"
          className={cn("border-0 w-full", height || "h-[400px] md:h-[600px]")}
          onLoad={() => setIsLoading(false)}
          allow="autoplay"
          allowFullScreen
          title={title}
        />
      </div>

      <Button
        asChild
        className={cn(
          "inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-8 px-3 py-1",
          buttonColorClass,
        )}
      >
        <a href={canvaDesignUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
          <ExternalLink className="h-3 w-3 mr-1" />
          Open in Canva
        </a>
      </Button>
    </div>
  )
}
