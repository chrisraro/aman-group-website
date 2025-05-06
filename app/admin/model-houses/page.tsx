"use client"

import { useState } from "react"
import Link from "next/link"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Edit, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ModelHousesAdminPage() {
  const { getAllModelHouseSeries, rfoUnits, deleteModelHouseSeries, deleteModelHouseUnit } = useModelHousesContext()

  const [activeTab, setActiveTab] = useState("model-houses")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{
    type: "series" | "unit"
    seriesId: string
    unitId?: string
  } | null>(null)

  const modelHouses = getAllModelHouseSeries()

  const handleDelete = () => {
    if (!itemToDelete) return

    if (itemToDelete.type === "series") {
      deleteModelHouseSeries(itemToDelete.seriesId)
    } else if (itemToDelete.type === "unit" && itemToDelete.unitId) {
      deleteModelHouseUnit(itemToDelete.seriesId, itemToDelete.unitId)
    }

    setDeleteDialogOpen(false)
    setItemToDelete(null)
  }

  const confirmDelete = (type: "series" | "unit", seriesId: string, unitId?: string) => {
    setItemToDelete({ type, seriesId, unitId })
    setDeleteDialogOpen(true)
  }

  return (
    <div className="container mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Model Houses & RFO Units Admin</h1>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/admin/model-houses/series/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Series
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="model-houses" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="model-houses">Model House Series</TabsTrigger>
          <TabsTrigger value="rfo-units">RFO Units</TabsTrigger>
        </TabsList>

        <TabsContent value="model-houses">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {modelHouses.map((series) => (
              <Card key={series.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{series.name}</CardTitle>
                      <CardDescription>
                        {series.floorArea} | {series.project}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/model-houses/series/${series.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => confirmDelete("series", series.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm mb-2">{series.description}</div>
                  <div className="flex justify-between items-center">
                    <Badge variant="outline">{series.loftReady ? "Loft Ready" : "No Loft"}</Badge>
                    <Button variant="outline" size="sm" asChild>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rfoUnits.map((unit) => (
              <Card key={unit.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>
                        {unit.seriesName} - {unit.name}
                      </CardTitle>
                      <CardDescription>{unit.location}</CardDescription>
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
