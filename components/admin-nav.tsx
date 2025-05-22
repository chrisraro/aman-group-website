"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function AdminNav() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navItems = [
    { href: "/admin/lot-only", label: "Lot Only Properties" },
    { href: "/admin/model-houses", label: "Model Houses" },
    { href: "/admin/agent-links", label: "Agent Links" },
    { href: "/admin/brokerage-links", label: "Brokerage Links" },
  ]

  return (
    <header className="bg-primary text-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold">
              Aman Group Admin
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-dark focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Desktop menu */}
          <nav className="hidden md:flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  pathname?.startsWith(item.href)
                    ? "bg-primary-dark text-white"
                    : "text-white hover:bg-primary-dark hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/"
              className="px-3 py-2 rounded-md text-sm font-medium text-white hover:bg-primary-dark hover:text-white"
            >
              Back to Site
            </Link>
          </nav>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`md:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-primary-dark">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                pathname?.startsWith(item.href)
                  ? "bg-primary text-white"
                  : "text-white hover:bg-primary hover:text-white"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-white hover:bg-primary hover:text-white"
            onClick={() => setIsMenuOpen(false)}
          >
            Back to Site
          </Link>
        </div>
      </div>
    </header>
  )
}
