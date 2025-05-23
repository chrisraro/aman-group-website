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
        <div className="relative">
          <TabsList className="w-full mb-6 overflow-x-auto flex-nowrap whitespace-nowrap scrollbar-hide pb-2 gap-1 sm:gap-2">
            <TabsTrigger
              value="all"
              className="flex items-center gap-1 px-3 py-2 min-w-[80px] justify-center"
              mobileAbbr="All"
            >
              <Home className="h-4 w-4 mr-1 sm:mr-2" />
              All Projects
            </TabsTrigger>

            {projects.map((project) => (
              <TabsTrigger
                key={project}
                value={project}
                className="px-3 py-2 min-w-[80px] justify-center"
                mobileAbbr={getAbbreviation(project)}
              >
                {project}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-4 focus-visible:outline-none focus-visible:ring-0">
          {filteredModelHouses.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No model houses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModelHouses.map((series) => (
                <Card key={series.id} className="overflow-hidden h-full flex flex-col">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${series.imageUrl || "/placeholder.svg?height=200&width=400"})` }}
                  ></div>
                  <CardHeader className="pb-2">
                    <CardTitle>{series.name}</CardTitle>
                    <CardDescription>
                      {series.floorArea} | {series.project}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow flex flex-col">
                    <p className="text-sm mb-4 flex-grow">{series.description}</p>
                    <div className="flex justify-between items-center mt-auto">
                      <p className="font-semibold">Starting at ₱{series.basePrice.toLocaleString()}</p>
                      <a
                        href={`/model-houses/${series.id}`}
                        className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
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
