import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Users, Settings } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600">Manage your Aman Group website content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Building className="h-5 w-5" />
              <span>Model Houses</span>
            </CardTitle>
            <CardDescription>Manage model house listings and details</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/model-houses">
              <Button className="w-full">Manage Model Houses</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="h-5 w-5" />
              <span>Lot Only Properties</span>
            </CardTitle>
            <CardDescription>Manage lot-only property listings</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/lot-only">
              <Button className="w-full">Manage Lot Only</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5" />
              <span>Agent Links</span>
            </CardTitle>
            <CardDescription>Manage agent contact information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/agent-links">
              <Button className="w-full">Manage Agents</Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Brokerage Links</span>
            </CardTitle>
            <CardDescription>Manage brokerage information</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/admin/brokerage-links">
              <Button className="w-full">Manage Brokerage</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
          <CardDescription>Overview of your website content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600">Model Houses</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">8</div>
              <div className="text-sm text-gray-600">Lot Properties</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">5</div>
              <div className="text-sm text-gray-600">Active Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">24</div>
              <div className="text-sm text-gray-600">Total Listings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
