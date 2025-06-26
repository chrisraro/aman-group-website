import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Users, LinkIcon, BarChart3, UserCheck } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Model Houses",
      value: "12",
      description: "Active series",
      icon: Building,
      href: "/admin/model-houses",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Lot Only Properties",
      value: "8",
      description: "Available lots",
      icon: MapPin,
      href: "/admin/lot-only",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Brokerages",
      value: "26",
      description: "Partner agencies",
      icon: Building,
      href: "/admin/brokerage-management",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Agents",
      value: "45",
      description: "Registered agents",
      icon: Users,
      href: "/admin/brokerage-management",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const quickActions = [
    {
      title: "Manage Brokerages",
      description: "Add, edit, and manage partner brokerages",
      href: "/admin/brokerage-management",
      icon: Building,
    },
    {
      title: "Manage Agents",
      description: "Add, edit, and manage real estate agents",
      href: "/admin/brokerage-management",
      icon: UserCheck,
    },
    {
      title: "Generate Links",
      description: "Create referral links for agents and brokerages",
      href: "/admin/agent-links",
      icon: LinkIcon,
    },
    {
      title: "Model Houses",
      description: "Manage model house listings",
      href: "/admin/model-houses",
      icon: Building,
    },
    {
      title: "Lot Properties",
      description: "Manage lot-only properties",
      href: "/admin/lot-only",
      icon: MapPin,
    },
    {
      title: "Analytics",
      description: "View performance metrics",
      href: "/admin/analytics",
      icon: BarChart3,
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's what's happening with your properties.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/">
              <Building className="h-4 w-4 mr-2" />
              View Site
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                <div className={`p-2 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                <Button asChild variant="ghost" size="sm" className="mt-3 w-full">
                  <Link href={stat.href}>Manage</Link>
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Card key={action.title} className="hover:shadow-md transition-shadow cursor-pointer">
                <Link href={action.href}>
                  <CardHeader className="text-center pb-4">
                    <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-3">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-base">{action.title}</CardTitle>
                    <CardDescription className="text-sm">{action.description}</CardDescription>
                  </CardHeader>
                </Link>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes to your properties and partners</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Building className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">New brokerage added</p>
                <p className="text-sm text-gray-500">Sweetville Realty was added to the network</p>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <Users className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Agent profile updated</p>
                <p className="text-sm text-gray-500">Mariben Cleofe Pante updated contact information</p>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-purple-100 rounded-full">
                <LinkIcon className="h-4 w-4 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Referral link generated</p>
                <p className="text-sm text-gray-500">New agent referral link created for Red Zeal Realty</p>
              </div>
              <div className="text-sm text-gray-500">2 days ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
