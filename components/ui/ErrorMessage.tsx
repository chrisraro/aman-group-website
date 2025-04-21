import { AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface ErrorMessageProps {
  message: string
  className?: string
}

export function ErrorMessage({ message, className }: ErrorMessageProps) {
  if (!message) return null

  return (
    <div className={cn("flex items-center gap-2 text-red-500 text-sm mt-1", className)}>
      <AlertCircle className="h-4 w-4" />
      <span>{message}</span>
    </div>
  )
}
