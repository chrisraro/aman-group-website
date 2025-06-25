"use client"

import { useState } from "react"
import { useModelHouseSeries } from "@/lib/hooks/useModelHouses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search, Home } from "lucide-react"
import { LoadingState } from "@/components/loading-state"
import { ErrorFallback } from "@/components/error-fallback"

export default function ModelHousesPage() {
  const { modelHouses, isLoading, isError, mutate } = useModelHouseSeries()
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [isRetrying, setIsRetrying] = useState(false)

  // Get unique projects
  const projects = Array.from(new Set(modelHouses.map((series) => series.project)))

  // Filter model houses based on search term and active tab
  const filteredModelHouses = modelHouses.filter((series) => {
    const matchesSearch =
      searchTerm === "" ||
      series.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      series.project.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesTab = activeTab === "all" || series.project === activeTab

    return matchesSearch && matchesTab
  })

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      await mutate()
    } catch (error) {
      console.error("Error retrying:", error)
    } finally {
      setIsRetrying(false)
    }
  }

  if (isLoading) {
    return <LoadingState message="Loading model houses..." size="lg" fullHeight />
  }

  if (isError) {
    return (
      <ErrorFallback
        title="Error loading model houses"
        description="There was a problem loading the model houses. Please try again."
        onRetry={handleRetry}
        isRetrying={isRetrying}
      />
    )
  }

  // Create abbreviated names for mobile view
  const getAbbreviation = (name) => {
    if (!name) return ""
    const words = name.split(" ")
    if (words.length === 1) return name.substring(0, 3)
    return words.map((word) => word[0]).join("")
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6">
      <h1 className="text-3xl font-bold mb-6">Model Houses</h1>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search model houses..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="relative mb-6">
          <TabsList className="w-full overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide pb-2 gap-1 sm:gap-2 bg-gray-100/80 p-1 rounded-lg">
            <TabsTrigger
              value="all"
              className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 sm:py-3 min-w-[100px] sm:min-w-[120px] justify-center text-sm sm:text-base font-medium rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-gray-200/80"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">All Projects</span>
              <span className="sm:hidden">All</span>
            </TabsTrigger>

            {projects.map((project) => (
              <TabsTrigger
                key={project}
                value={project}
                className="px-3 sm:px-4 py-2 sm:py-3 min-w-[100px] sm:min-w-[120px] justify-center text-sm sm:text-base font-medium rounded-md transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm hover:bg-gray-200/80"
              >
                <span className="hidden sm:inline">{project}</span>
                <span className="sm:hidden">{getAbbreviation(project)}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-6 focus-visible:outline-none focus-visible:ring-0">
          {filteredModelHouses.length === 0 ? (
            <div className="text-center py-16 bg-muted rounded-xl">
              <p className="text-muted-foreground text-base">No model houses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {filteredModelHouses.map((series) => (
                <Card
                  key={series.id}
                  className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow"
                >
                  <div
                    className="h-48 sm:h-56 bg-cover bg-center"
                    style={{ backgroundImage: `url(${series.imageUrl || "/placeholder.svg?height=200&width=400"})` }}
                  ></div>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg sm:text-xl">{series.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {series.floorArea} | {series.project}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col pt-0">
                    <p className="text-sm text-muted-foreground mb-4 flex-grow leading-relaxed">{series.description}</p>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mt-auto">
                      <p className="font-semibold text-base">Starting at ₱{series.basePrice.toLocaleString()}</p>
                      <a
                        href={`/model-houses/${series.id}`}
                        className="w-full sm:w-auto inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                      >
                        View Details
                      </a>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
