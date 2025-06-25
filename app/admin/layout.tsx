import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { requireAdmin } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()

  return (
    <div className="min-h-screen flex flex-col">
      <AdminNav />
      <main className="flex-1 pb-16 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
