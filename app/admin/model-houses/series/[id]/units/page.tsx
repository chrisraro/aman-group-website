"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, PlusCircle, Edit, Trash2, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

export default function ModelHouseUnitsPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getModelHouseSeriesById, deleteModelHouseUnit, isLoading, error } = useModelHousesContext()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [unitToDelete, setUnitToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const series = getModelHouseSeriesById(params.id)

  // Redirect if series not found and not loading
  useEffect(() => {
    if (!series && !isLoading && !error) {
      router.push("/admin/model-houses")
    }
  }, [series, router, isLoading, error])

  const handleDeleteUnit = async () => {
    if (!unitToDelete) return

    setIsDeleting(true)
    try {
      await deleteModelHouseUnit(params.id, unitToDelete)
      toast({
        title: "Success",
        description: "Unit deleted successfully",
      })
      setDeleteDialogOpen(false)
      setUnitToDelete(null)
    } catch (error) {
      console.error("Error deleting unit:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the unit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading series data...</h2>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error loading data</AlertTitle>
          <AlertDescription>
            There was a problem loading the series data. Please try going back and trying again.
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/admin/model-houses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Model Houses
          </Link>
        </Button>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="container mx-auto py-8">
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Series not found</AlertTitle>
          <AlertDescription>The requested model house series could not be found.</AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/admin/model-houses">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Model Houses
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/model-houses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Units: {series.name}</h1>
        </div>
        <Button asChild>
          <Link href={`/admin/model-houses/series/${params.id}/units/new`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Unit
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Series Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium">Floor Area</p>
              <p>{series.floorArea}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Base Price</p>
              <p>₱{series.basePrice.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Project</p>
              <p>{series.project}</p>
            </div>
            <div>
              <p className="text-sm font-medium">Developer</p>
              <p>{series.developer}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-2xl font-bold mb-4">Units ({series.units?.length || 0})</h2>

      {!series.units || series.units.length === 0 ? (
        <div className="text-center py-8 bg-muted rounded-lg">
          <p className="text-muted-foreground">No units found for this series.</p>
          <Button asChild className="mt-4">
            <Link href={`/admin/model-houses/series/${params.id}/units/new`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add First Unit
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {series.units.map((unit) => (
            <Card key={unit.id} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{unit.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{unit.location}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/model-houses/series/${params.id}/units/${unit.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setUnitToDelete(unit.id)
                        setDeleteDialogOpen(true)
                      }}
                      disabled={isDeleting}
                    >
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
                </div>
                <div className="flex flex-wrap gap-2">
                  {unit.isRFO && <Badge variant="outline">RFO</Badge>}
                  {unit.constructionProgress !== undefined && unit.constructionProgress > 0 && (
                    <Badge variant="outline">{unit.constructionProgress}% Complete</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this unit?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteUnit} disabled={isDeleting}>
              {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
