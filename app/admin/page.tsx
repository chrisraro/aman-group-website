import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building2, MapPin, Users, Calculator, TrendingUp, Eye } from "lucide-react"
import Link from "next/link"

export default function AdminDashboard() {
  const stats = [
    {
      title: "Model Houses",
      value: "12",
      description: "Active series",
      icon: Building2,
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
      title: "Agent Links",
      value: "25",
      description: "Active agents",
      icon: Users,
      href: "/admin/agent-links",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Brokerage Links",
      value: "5",
      description: "Partner brokerages",
      icon: Calculator,
      href: "/admin/brokerage-links",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  const quickActions = [
    {
      title: "Add Model House",
      description: "Create a new model house series",
      href: "/admin/model-houses",
      icon: Building2,
    },
    {
      title: "Add Lot Property",
      description: "List a new lot-only property",
      href: "/admin/lot-only",
      icon: MapPin,
    },
    {
      title: "View Analytics",
      description: "Check website performance",
      href: "/admin/analytics",
      icon: TrendingUp,
    },
    {
      title: "Preview Site",
      description: "View the public website",
      href: "/",
      icon: Eye,
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
              <Eye className="h-4 w-4 mr-2" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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
          <CardDescription>Latest updates and changes to your properties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-blue-100 rounded-full">
                <Building2 className="h-4 w-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">New model house series added</p>
                <p className="text-sm text-gray-500">Queenie 72 Complete series was created</p>
              </div>
              <div className="text-sm text-gray-500">2 hours ago</div>
            </div>

            <div className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
              <div className="p-2 bg-green-100 rounded-full">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">Lot property updated</p>
                <p className="text-sm text-gray-500">Palm Village lot pricing updated</p>
              </div>
              <div className="text-sm text-gray-500">1 day ago</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
