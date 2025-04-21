import type React from "react"
import { AdminNav } from "@/components/admin-nav"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <AdminNav />
      {children}
    </div>
  )
}
