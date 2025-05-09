"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { ModelHousesProvider } from "@/lib/context/ModelHousesContext"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <ModelHousesProvider>{children}</ModelHousesProvider>
    </ThemeProvider>
  )
}
