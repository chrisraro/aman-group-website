"use client"

import { useState } from "react"
import Link from "next/link"
import { useLotOnlyContext } from "@/lib/context/LotOnlyContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
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
import { formatNumberWithCommas } from "@/lib/utils/format-utils"

export default function LotOnlyAdminPage() {
  const { properties, deleteProperty, resetToDefaultData, refreshData, isLoading, error } = useLotOnlyContext()
  const { toast } = useToast()

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [resetDialogOpen, setResetDialogOpen] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [propertyToDelete, setPropertyToDelete] = useState<string | null>(null)

  const handleDelete = async () => {
    if (!propertyToDelete) return

    setIsProcessing(true)
    try {
      await deleteProperty(propertyToDelete)
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setDeleteDialogOpen(false)
      setPropertyToDelete(null)
    }
  }

  const confirmDelete = (id: string) => {
    setPropertyToDelete(id)
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
          <h2 className="text-xl font-semibold">Loading lot-only properties data...</h2>
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
            There was a problem loading the lot-only properties data. Please try refreshing the page.
          </AlertDescription>
        </Alert>
        <Button onClick={handleRefreshData} disabled={isProcessing}>
          {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
          Retry
        </Button>
      </div>
    )
  }

  // Group properties by developer
  const propertiesByDeveloper = properties.reduce(
    (acc, property) => {
      const developer = property.developer
      if (!acc[developer]) {
        acc[developer] = []
      }
      acc[developer].push(property)
      return acc
    },
    {} as Record<string, typeof properties>,
  )

  return (
    <div className="container mx-auto px-4 py-6 md:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Lot Only Properties Admin</h1>
        <Button asChild size="sm" className="w-full sm:w-auto">
          <Link href="/admin/lot-only/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add New Property
          </Link>
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>
            Manage your lot-only properties data. All changes are saved to the server and visible to all users.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Lot Only Properties</h3>
                <p className="text-sm text-muted-foreground">{properties.length} properties available</p>
              </div>
              <Badge variant="outline">{properties.length} Properties</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Developers</h3>
                <p className="text-sm text-muted-foreground">{Object.keys(propertiesByDeveloper).length} developers</p>
              </div>
              <Badge variant="outline">{Object.keys(propertiesByDeveloper).length} Developers</Badge>
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

      {Object.entries(propertiesByDeveloper).map(([developer, developerProperties]) => (
        <div key={developer} className="mb-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">{developer}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {developerProperties.map((property) => (
              <Card key={property.id} className="overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{property.name}</CardTitle>
                      <CardDescription className="text-sm">
                        {property.lotArea} | {property.project}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/lot-only/${property.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => confirmDelete(property.id)}
                        disabled={isProcessing}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <div className="text-sm">
                      <span className="font-medium">Price:</span> ₱{formatNumberWithCommas(property.price)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Status:</span> {property.status}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Lot Area:</span> {property.lotArea}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Location:</span> {property.location.substring(0, 20)}...
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className="bg-opacity-20"
                    style={{ backgroundColor: `${property.developerColor}20`, borderColor: property.developerColor }}
                  >
                    {property.developer}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>Are you sure you want to delete this property?</DialogDescription>
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
              Are you sure you want to reset all lot-only properties to their default values? This will discard all your
              changes.
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
