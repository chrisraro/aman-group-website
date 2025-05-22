"use client"

import { useState } from "react"
import Link from "next/link"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Edit, Trash2, RefreshCw, Database, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function ModelHousesAdminPage() {
  const {
    getAllModelHouseSeries,
    rfoUnits,
    deleteModelHouseSeries,
    deleteModelHouseUnit,
    resetToDefaultData,
    refreshData,
    isLoading,
    error,
  } = useModelHousesContext()
  const { toast } = useToast()

  const [activeTab, setActiveTab] = useState("model-houses")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "series" | "unit"
    seriesId: string
    unitId?: string
  } | null>(null)

  const modelHouses = getAllModelHouseSeries()

  const handleDelete = async () => {
    if (!itemToDelete) return

    setIsProcessing(true)
    try {
      if (itemToDelete.type === "series") {
        await deleteModelHouseSeries(itemToDelete.seriesId)
        toast({
          title: "Success",
          description: "Model house series deleted successfully",
        })
      } else if (itemToDelete.type === "unit" && itemToDelete.unitId) {
        await deleteModelHouseUnit(itemToDelete.seriesId, itemToDelete.unitId)
        toast({
          title: "Success",
          description: "Unit deleted successfully",
        })
      }
    } catch (error) {
      console.error("Error deleting item:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the item. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const confirmDelete = (type: "series" | "unit", seriesId: string, unitId?: string) => {
    setItemToDelete({ type, seriesId, unitId })
    setDeleteDialogOpen(true)
  }

  const handleResetData = async () => {
    setIsProcessing(true)
    try {
      await resetToDefaultData()
      toast({
        title: "Success",
        description: "Data has been reset to default values",
      })
    } catch (error) {
      console.error("Error resetting data:", error)
      toast({
        title: "Error",
        description: "There was a problem resetting the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setResetDialogOpen(false)
    }
  }

  const handleRefreshData = async () => {
    setIsProcessing(true)
    try {
      await refreshData()
      toast({
        title: "Success",
        description: "Data has been refreshed",
      })
    } catch (error) {
      console.error("Error refreshing data:", error)
      toast({
        title: "Error",
        description: "There was a problem refreshing the data. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading model houses data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            There was a problem loading the model houses data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefreshData} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Model Houses & RFO Units Admin</h1>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/admin/model-houses/series/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Series
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your model houses and RFO units data. All changes are saved to the server and visible to all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Model House Series</h3>
                <p className="text-sm text-muted-foreground">
                  {modelHouses.length} series with {modelHouses.reduce((acc, series) => acc + series.units.length, 0)}{" "}
                  units
                </p>
              </div>
              <Badge variant="outline">{modelHouses.length} Series</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">RFO Units</h3>
                <p className="text-sm text-muted-foreground">{rfoUnits.length} ready for occupancy units</p>
              </div>
              <Badge variant="outline">{rfoUnits.length} Units</Badge>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-2">
          <Button
            variant="outline"
            onClick={() => setResetDialogOpen(true)}
            disabled={isProcessing}
            className="w-full sm:w-auto"
          >
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
            Reset to Default Data
          </Button>
          <Button variant="secondary" onClick={handleRefreshData} disabled={isProcessing} className="w-full sm:w-auto">
            {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Refresh Data
          </Button>
        </CardFooter>
      </Card>

      <Tabs defaultValue="model-houses" value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="mb-4 w-full">
          <TabsTrigger value="model-houses" className="flex-1">
            Model House Series
          </TabsTrigger>
          <TabsTrigger value="rfo-units" className="flex-1">
            RFO Units
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model-houses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {modelHouses.map((series) => (
              <Card key={series.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{series.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {series.floorArea} | {series.project}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/model-houses/series/${series.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete("series", series.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-2 line-clamp-2">{series.description}</div>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Badge variant="outline">{series.loftReady ? "Loft Ready" : "No Loft"}</Badge>
                    <Button variant="outline" size="sm" asChild className="w-full sm:w-auto">
                      <Link href={`/admin/model-houses/series/${series.id}/units`}>
                        Manage Units ({series.units.length})
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="rfo-units">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {rfoUnits.map((unit) => (
              <Card key={unit.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">
                        {unit.seriesName} - {unit.name}
                      </CardTitle>
                      <CardDescription className="text-sm">{unit.location}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/model-houses/series/${unit.seriesId}/units/${unit.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-sm">
                      <span className="font-medium">Price:</span> ₱{unit.price.toLocaleString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> {unit.status}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Floor Area:</span> {unit.floorArea}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Project:</span> {unit.project}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-opacity-20"
                    style={{ backgroundColor: `${unit.developerColor}20`, borderColor: unit.developerColor }}
                  >
                    {unit.developer}
                  </Badge>
                </CardContent>
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
              {itemToDelete?.type === "series"
                ? "Are you sure you want to delete this model house series? This will also delete all units in this series."
                : "Are you sure you want to delete this unit?"}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isProcessing} className="w-full sm:w-auto">
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset to Default Data</DialogTitle>
            <DialogDescription>
              Are you sure you want to reset all model houses and RFO units to their default values? This will discard
              all your changes.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setResetDialogOpen(false)}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleResetData}
              disabled={isProcessing}
              className="w-full sm:w-auto"
            >
              {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Reset Data"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
