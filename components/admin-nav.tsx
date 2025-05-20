"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export function AdminNav() {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin/brokerage-links", label: "Brokerage Links" },
    { href: "/admin/agent-links", label: "Agent Links" },
    { href: "/admin/model-houses", label: "Model Houses" },
    { href: "/admin/lot-only", label: "Lot Only" },
  ]

  return (
    <div className="bg-white border-b mb-6">
      <div className="container mx-auto">
        <div className="flex overflow-x-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "px-4 py-3 text-sm font-medium whitespace-nowrap",
                pathname === item.href
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-gray-50",
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
