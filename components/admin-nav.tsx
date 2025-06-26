import Link from "next/link"
import { Button } from "@/components/ui/button"
import { logoutAction } from "@/app/actions/auth"
import { Home, Settings, Users, Building, LogOut, Calculator } from "lucide-react"

export function AdminNav() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin" className="text-xl font-bold text-gray-900">
              Admin Panel
            </Link>
            <div className="hidden md:flex space-x-4">
              <Link
                href="/admin"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
              <Link
                href="/admin/model-houses"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Building className="h-4 w-4" />
                <span>Model Houses</span>
              </Link>
              <Link
                href="/admin/lot-only"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Settings className="h-4 w-4" />
                <span>Lot Only</span>
              </Link>
              <Link
                href="/admin/agent-links"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Users className="h-4 w-4" />
                <span>Agent Links</span>
              </Link>
              <Link
                href="/admin/loan-calculator"
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                <Calculator className="h-4 w-4" />
                <span>Loan Calculator</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">
              View Site
            </Link>
            <form action={logoutAction}>
              <Button variant="outline" size="sm" type="submit">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </form>
          </div>
        </div>
      </div>
    </nav>
  )
}
