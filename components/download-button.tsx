"use client"

import { Download } from "lucide-react"
import { Button, type ButtonProps } from "@/components/ui/button"

interface DownloadButtonProps extends ButtonProps {
  imageUrl: string
  fileName: string
}

export function DownloadButton({ imageUrl, fileName, className, ...props }: DownloadButtonProps) {
  const handleDownload = async () => {
    try {
      // Fetch the image
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      // Create a download link
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = fileName

      // Trigger download
      document.body.appendChild(link)
      link.click()

      // Clean up
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error downloading image:", error)
    }
  }

  return (
    <Button onClick={handleDownload} className={className} {...props}>
      <Download className="h-4 w-4 mr-2" />
      Download Sales Map
    </Button>
  )
}
