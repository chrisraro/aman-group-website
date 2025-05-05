"use client"

import { useState } from "react"
import Link from "next/link"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { getAllRFOUnits } from "@/data/model-houses"
import { Loader2, Plus, Pencil, Trash2, Home, Building } from "lucide-react"

export default function AdminModelHousesPage() {
  const { modelHouses, deleteModelHouseSeries, loading } = useModelHousesContext()
  const [activeTab, setActiveTab] = useState("model-houses")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [seriesIdToDelete, setSeriesIdToDelete] = useState<string | null>(null)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading model houses data...</span>
      </div>
    )
  }

  const handleDeleteClick = (id: string) => {
    setSeriesIdToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (seriesIdToDelete) {
      deleteModelHouseSeries(seriesIdToDelete)
      setDeleteDialogOpen(false)
      setSeriesIdToDelete(null)
    }
  }

  const rfoUnits = getAllRFOUnits()

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Model Houses Management</h1>
        <Link href="/admin/model-houses/series/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Series
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="model-houses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="model-houses">
            <Home className="mr-2 h-4 w-4" /> Model House Series
          </TabsTrigger>
          <TabsTrigger value="rfo-units">
            <Building className="mr-2 h-4 w-4" /> RFO Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model-houses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.values(modelHouses).map((series) => (
              <Card key={series.id}>
                <CardHeader>
                  <CardTitle>{series.name}</CardTitle>
                  <CardDescription>
                    {series.floorArea} | {series.project}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                    <img
                      src={series.imageUrl || "/placeholder.svg?height=400&width=600"}
                      alt={series.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm line-clamp-2">{series.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Units: </span>
                    <span className="text-sm">{series.units.length}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex space-x-2">
                    <Link href={`/admin/model-houses/series/${series.id}`}>
                      <Button variant="outline" size="sm">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteClick(series.id)}>
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </Button>
                  </div>
                  <Link href={`/admin/model-houses/series/${series.id}/units`}>
                    <Button size="sm">Manage Units</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rfo-units">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfoUnits.map((unit) => (
              <Card key={unit.id}>
                <CardHeader>
                  <CardTitle>{unit.name}</CardTitle>
                  <CardDescription>
                    {unit.seriesName} | {unit.location}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video bg-muted rounded-md overflow-hidden mb-4">
                    <img
                      src={unit.imageUrl || "/placeholder.svg?height=400&width=600"}
                      alt={unit.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p className="text-sm line-clamp-2">{unit.description}</p>
                  <div className="mt-2">
                    <span className="text-sm font-medium">Price: </span>
                    <span className="text-sm">₱{unit.price.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Link href={`/admin/model-houses/series/${unit.seriesId}/units/${unit.id}`}>
                    <Button variant="outline" size="sm">
                      <Pencil className="mr-2 h-4 w-4" /> Edit
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this model house series? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
