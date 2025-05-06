"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PlusCircle, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ManageUnitsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { getModelHouseSeriesById, deleteModelHouseUnit } = useModelHousesContext()

  const [series, setSeries] = useState(getModelHouseSeriesById(params.id))
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null)

  useEffect(() => {
    const seriesData = getModelHouseSeriesById(params.id)
    if (!seriesData) {
      router.push("/admin/model-houses")
    } else {
      setSeries(seriesData)
    }
  }, [params.id, getModelHouseSeriesById, router])

  const confirmDelete = (unitId: string) => {
    setUnitToDelete(unitId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = () => {
    if (!unitToDelete) return

    deleteModelHouseUnit(params.id, unitToDelete)
    setDeleteDialogOpen(false)
    setUnitToDelete(null)

    // Refresh series data
    setSeries(getModelHouseSeriesById(params.id))
  }

  if (!series) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-6xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/model-houses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Manage Units: {series.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/admin/model-houses/series/${params.id}/units/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Unit
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {series.units.map((unit) => (
          <Card key={unit.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{unit.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">{unit.location}</div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon" asChild>
                    <Link href={`/admin/model-houses/series/${params.id}/units/${unit.id}`}>
                      <Edit className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => confirmDelete(unit.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
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
                  <span className="font-medium">Lot Price:</span> ₱{unit.lotOnlyPrice.toLocaleString()}
                </div>
                <div className="text-sm">
                  <span className="font-medium">House Price:</span> ₱{unit.houseConstructionPrice.toLocaleString()}
                </div>
              </div>
              <div className="flex gap-2 mt-2">
                {unit.isRFO && <Badge variant="secondary">RFO</Badge>}
                <Badge variant="outline">{unit.status}</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {series.units.length === 0 && (
        <Card className="mt-6">
          <CardContent className="flex flex-col items-center justify-center py-10">
            <p className="text-muted-foreground mb-4">No units found for this series</p>
            <Button asChild>
              <Link href={`/admin/model-houses/series/${params.id}/units/new`}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add First Unit
              </Link>
            </Button>
          </CardContent>
        </Card>
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
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
