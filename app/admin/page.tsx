import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Building, MapPin, Users, LinkIcon, BarChart3, UserCheck, Calculator, Loader2 } from 'lucide-react'
import Link from "next/link"
import { Redis } from "@upstash/redis"

type DashboardStats = {
  modelHouses: number
  lotOnly: number
  brokerages: number
  agents: number
}

type ActivityItem = {
  id: string
  type: "brokerage" | "agent" | "link" | "model-house" | "lot-only" | "loan" | "generic"
  title: string
  description: string
  timestamp: number // epoch ms
}

function getIconForActivity(type: ActivityItem["type"]) {
  switch (type) {
    case "brokerage":
      return { Icon: Building, color: "text-blue-600", bg: "bg-blue-100" }
    case "agent":
      return { Icon: Users, color: "text-green-600", bg: "bg-green-100" }
    case "link":
      return { Icon: LinkIcon, color: "text-purple-600", bg: "bg-purple-100" }
    case "model-house":
      return { Icon: Building, color: "text-indigo-600", bg: "bg-indigo-100" }
    case "lot-only":
      return { Icon: MapPin, color: "text-rose-600", bg: "bg-rose-100" }
    case "loan":
      return { Icon: Calculator, color: "text-amber-600", bg: "bg-amber-100" }
    default:
      return { Icon: BarChart3, color: "text-gray-600", bg: "bg-gray-100" }
  }
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "just now"
  if (minutes < 60) return `${minutes} min${minutes > 1 ? "s" : ""} ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? "s" : ""} ago`
}

async function getKV() {
  const url = process.env.KV_REST_API_URL
  const token = process.env.KV_REST_API_TOKEN
  if (!url || !token) return null
  return new Redis({ url, token })
}

async function getDashboardData(): Promise<{ stats: DashboardStats; activities: ActivityItem[] }> {
  const kv = await getKV()

  const defaults: DashboardStats = {
    modelHouses: 12,
    lotOnly: 8,
    brokerages: 26,
    agents: 45,
  }
  const fallbackActivities: ActivityItem[] = [
    {
      id: "seed-1",
      type: "brokerage",
      title: "New brokerage added",
      description: "Sweetville Realty was added to the network",
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
    },
    {
      id: "seed-2",
      type: "agent",
      title: "Agent profile updated",
      description: "Mariben Cleofe Pante updated contact information",
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
    },
    {
      id: "seed-3",
      type: "link",
      title: "Referral link generated",
      description: "New agent referral link created for Red Zeal Realty",
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    },
  ]

  if (!kv) {
    return { stats: defaults, activities: fallbackActivities }
  }

  try {
    // Read aggregated stats and recent activity from KV
    const [statsFromKv, activitiesFromKv] = await Promise.all([
      kv.get<DashboardStats>("admin:stats"),
      // Last 20 activities; adjust key name if your admin writes to a different stream/list
      kv.lrange<ActivityItem>("admin:recent-activity", -20, -1),
    ])

    const stats = statsFromKv ?? defaults
    const activities = Array.isArray(activitiesFromKv) && activitiesFromKv.length > 0 ? activitiesFromKv : fallbackActivities

    return { stats, activities: activities.sort((a, b) => b.timestamp - a.timestamp) }
  } catch {
    // On any KV error, fall back to defaults
    return { stats: defaults, activities: fallbackActivities }
  }
}

export default async function AdminDashboard() {
  const { stats, activities } = await getDashboardData()

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
    {
      title: "Loan Calculator",
      description: "Manage financing options and calculator settings",
      href: "/admin/loan-calculator",
      icon: Calculator,
    },
  ]

  const statsCards = [
    {
      title: "Model Houses",
      value: String(stats.modelHouses),
      description: "Active series",
      icon: Building,
      href: "/admin/model-houses",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Lot Only Properties",
      value: String(stats.lotOnly),
      description: "Available lots",
      icon: MapPin,
      href: "/admin/lot-only",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Active Brokerages",
      value: String(stats.brokerages),
      description: "Partner agencies",
      icon: Building,
      href: "/admin/brokerage-management",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Active Agents",
      value: String(stats.agents),
      description: "Registered agents",
      icon: Users,
      href: "/admin/brokerage-management",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ]

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here&apos;s what&apos;s happening with your properties.</p>
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
        {statsCards.map((stat) => {
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

      {/* Recent Activity (Dynamic) */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest updates and changes to your properties and partners</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              <span>Loading activity...</span>
            </div>
          ) : (
            activities.map((item) => {
              const { Icon, color, bg } = getIconForActivity(item.type)
              return (
                <div key={item.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                  <div className={`p-2 rounded-full ${bg}`}>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                  <div className="text-sm text-gray-500 whitespace-nowrap">
                    {timeAgo(item.timestamp)}
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </div>
  )
}
