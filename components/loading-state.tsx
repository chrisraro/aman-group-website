import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  message?: string
  size?: "sm" | "md" | "lg"
  fullHeight?: boolean
}

export function LoadingState({ message = "Loading...", size = "md", fullHeight = false }: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  }

  return (
    <div className={`flex items-center justify-center ${fullHeight ? "h-[60vh]" : "py-8"}`}>
      <div className="text-center">
        <Loader2 className={`${sizeClasses[size]} animate-spin mx-auto mb-4`} />
        <p className={size === "lg" ? "text-xl font-semibold" : "text-sm text-muted-foreground"}>{message}</p>
      </div>
    </div>
  )
}
