import type React from "react"
import { AdminNav } from "@/components/admin-nav"
import { getAdminSession } from "@/lib/auth"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const isAuthenticated = await getAdminSession()

  // Don't show nav for login page
  if (!isAuthenticated) {
    return <div className="min-h-screen">{children}</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />
      <main className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
