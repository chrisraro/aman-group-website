import type React from "react"
import { ModelHousesProvider } from "@/lib/context/ModelHousesContext"
import { AdminNav } from "@/components/admin-nav"

export default function ModelHousesAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ModelHousesProvider>
      <div className="flex min-h-screen flex-col">
        <AdminNav />
        <div className="flex-1 p-8">{children}</div>
      </div>
    </ModelHousesProvider>
  )
}
