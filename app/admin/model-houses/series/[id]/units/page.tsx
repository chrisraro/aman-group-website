"use client"

import { useState } from "react"
import Link from "next/link"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Loader2, ArrowLeft, Plus, Pencil, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function UnitsManagementPage({ params }: { params: { id: string } }) {
  const { modelHouses, deleteUnit, loading } = useModelHousesContext()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitIdToDelete, setUnitIdToDelete] = useState<string | null>(null)

  const series = modelHouses[params.id]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading units data...</span>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center mb-6">
          <Link href="/admin/model-houses">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Model Houses
            </Button>
          </Link>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold">Series not found</h2>
          <p className="mt-2">The model house series you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  const handleDeleteClick = (unitId: string) => {
    setUnitIdToDelete(unitId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (unitIdToDelete) {
      deleteUnit(params.id, unitIdToDelete)
      setDeleteDialogOpen(false)
      setUnitIdToDelete(null)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/model-houses">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Model Houses
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">Units for {series.name}</h1>
      </div>

      <div className="flex justify-end mb-6">
        <Link href={`/admin/model-houses/series/${params.id}/units/new`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add New Unit
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.units.map((unit) => (
          <Card key={unit.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{unit.name}</CardTitle>
                {unit.isRFO && <Badge>RFO</Badge>}
              </div>
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
              <div className="mt-1">
                <span className="text-sm font-medium">Status: </span>
                <span className="text-sm">{unit.status}</span>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm" onClick={() => handleDeleteClick(unit.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
              <Link href={`/admin/model-houses/series/${params.id}/units/${unit.id}`}>
                <Button size="sm">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {series.units.length === 0 && (
        <div className="text-center py-12 bg-muted rounded-lg">
          <h2 className="text-xl font-medium">No units found</h2>
          <p className="mt-2">This series doesn't have any units yet.</p>
          <Link href={`/admin/model-houses/series/${params.id}/units/new`} className="mt-4 inline-block">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Add First Unit
            </Button>
          </Link>
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this unit? This action cannot be undone.
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
