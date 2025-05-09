"use client"

import { useState } from "react"
import { useModelHouseSeries } from "@/lib/hooks/useModelHouses"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
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

  return (
    <div className="container mx-auto py-8">
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

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Projects</TabsTrigger>
          {projects.map((project) => (
            <TabsTrigger key={project} value={project}>
              {project}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab}>
          {filteredModelHouses.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No model houses found matching your criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredModelHouses.map((series) => (
                <Card key={series.id} className="overflow-hidden">
                  <div
                    className="h-48 bg-cover bg-center"
                    style={{ backgroundImage: `url(${series.imageUrl || "/placeholder.svg?height=200&width=400"})` }}
                  ></div>
                  <CardHeader>
                    <CardTitle>{series.name}</CardTitle>
                    <CardDescription>
                      {series.floorArea} | {series.project}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm mb-4">{series.description}</p>
                    <p className="font-semibold">Starting at ₱{series.basePrice.toLocaleString()}</p>
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
