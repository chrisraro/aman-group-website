"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { ModelHousesProvider } from "@/lib/context/ModelHousesContext"
import { Toaster } from "@/components/ui/toaster"
import { SWRConfig } from "swr"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        errorRetryCount: 3,
        dedupingInterval: 5000,
      }}
    >
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <ModelHousesProvider>
          {children}
          <Toaster />
        </ModelHousesProvider>
      </ThemeProvider>
    </SWRConfig>
  )
}
