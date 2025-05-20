import type React from "react"
// Add the import for LotOnlyProvider
import { LotOnlyProvider } from "@/lib/context/LotOnlyContext"
import { ThemeProvider } from "@/components/theme-provider"
import { ModelHousesProvider } from "@/lib/context/ModelHousesContext"

// Update the Providers component to include LotOnlyProvider
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ModelHousesProvider>
        <LotOnlyProvider>{children}</LotOnlyProvider>
      </ModelHousesProvider>
    </ThemeProvider>
  )
}
