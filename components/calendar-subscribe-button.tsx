"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Calendar, Copy, Check, ExternalLink } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ICAL_URL } from "@/lib/google-calendar-api"
import { toast } from "@/components/ui/use-toast"

interface CalendarSubscribeButtonProps {
  variant?: "default" | "outline" | "secondary"
  size?: "default" | "sm" | "lg"
  className?: string
  children?: React.ReactNode
}

export function CalendarSubscribeButton({
  variant = "outline",
  size = "default",
  className,
  children = "Subscribe to Calendar",
}: CalendarSubscribeButtonProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    navigator.clipboard.writeText(ICAL_URL).then(
      () => {
        setCopied(true)
        toast({
          title: "Calendar URL copied",
          description: "The calendar URL has been copied to your clipboard.",
        })
        setTimeout(() => setCopied(false), 2000)
      },
      (err) => {
        console.error("Could not copy text: ", err)
        toast({
          title: "Failed to copy",
          description: "Please try again or copy the URL manually.",
          variant: "destructive",
        })
      },
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Calendar className="mr-2 h-4 w-4" />
          {children}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => window.open(ICAL_URL, "_blank")}>
          <ExternalLink className="mr-2 h-4 w-4" />
          Open in Calendar App
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copyToClipboard}>
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Copy className="mr-2 h-4 w-4" />}
          Copy Calendar URL
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
