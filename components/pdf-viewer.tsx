"use client"

import { useState } from "react"
import { Download, ExternalLink, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface PdfViewerProps {
  // Changed from PDFViewerProps to PdfViewerProps
  googleDriveId: string
  fileName: string
  primaryColor: string
  height?: string
}

export function PdfViewer({ googleDriveId, fileName, primaryColor, height }: PdfViewerProps) {
  // Changed from PDFViewer to PdfViewer
  const [isLoading, setIsLoading] = useState(true)

  // Google Drive embed URL format
  const embedUrl = `https://drive.google.com/file/d/${googleDriveId}/preview`

  // Direct download link for Google Drive files
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${googleDriveId}`

  // View in Google Drive link
  const viewUrl = `https://drive.google.com/file/d/${googleDriveId}/view`

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
          src={embedUrl}
          width="100%"
          className={cn("border-0 w-full", height || "h-[400px] md:h-[600px]")}
          onLoad={() => setIsLoading(false)}
          allow="autoplay"
          allowFullScreen
        ></iframe>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs sm:max-w-none mx-auto sm:mx-0">
        <a
          href={downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 text-primary-foreground h-8 px-3 py-1",
            buttonColorClass,
          )}
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </a>

        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center rounded-md text-xs font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 py-1"
        >
          <ExternalLink className="h-3 w-3 mr-1" />
          Open in Drive
        </a>
      </div>
    </div>
  )
}
