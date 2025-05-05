"use client"

import type React from "react"

import { ModelHousesProvider } from "@/lib/context/ModelHousesContext"

export default function AdminModelHousesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ModelHousesProvider>{children}</ModelHousesProvider>
}
