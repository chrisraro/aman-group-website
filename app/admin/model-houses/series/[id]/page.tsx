"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import type { ModelHouseSeries } from "@/lib/hooks/useModelHouses"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function EditModelHouseSeriesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getModelHouseSeriesById, addModelHouseSeries, updateModelHouseSeries, isLoading, error } =
    useModelHousesContext()

  const isNewSeries = params.id === "new"
  const existingSeries = !isNewSeries ? getModelHouseSeriesById(params.id) : null

  const [formData, setFormData] = useState<Partial<ModelHouseSeries>>(
    existingSeries || {
      id: "",
      name: "",
      floorArea: "",
      loftReady: false,
      description: "",
      longDescription: "",
      features: [],
      specifications: {},
      basePrice: 0,
      floorPlanImage: "",
      imageUrl: "",
      developer: "",
      developerColor: "#000000",
      project: "",
      units: [],
    },
  )

  const [newFeature, setNewFeature] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    if (existingSeries) {
      setFormData(existingSeries)
    }
  }, [existingSeries])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "basePrice" ? (value ? Number.parseFloat(value) : 0) : value,
    }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      loftReady: checked,
    }))
  }

  const addFeature = () => {
    if (!newFeature.trim()) return

    setFormData((prev) => ({
      ...prev,
      features: [...(prev.features || []), newFeature],
    }))

    setNewFeature("")
  }

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }))
  }

  const addSpecification = () => {
    if (!newSpecKey.trim() || !newSpecValue.trim()) return

    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...(prev.specifications || {}),
        [newSpecKey]: newSpecValue,
      },
    }))

    setNewSpecKey("")
    setNewSpecValue("")
  }

  const removeSpecification = (key: string) => {
    setFormData((prev) => {
      const newSpecs = { ...(prev.specifications || {}) }
      delete newSpecs[key]

      return {
        ...prev,
        specifications: newSpecs,
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)

    if (!formData.id || !formData.name || !formData.floorArea) {
      setFormError("Please fill in all required fields")
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      const seriesData = {
        ...formData,
        units: formData.units || [],
      } as ModelHouseSeries

      if (isNewSeries) {
        await addModelHouseSeries(seriesData)
        toast({
          title: "Success",
          description: `${seriesData.name} has been created successfully`,
        })
      } else {
        await updateModelHouseSeries(params.id, seriesData)
        toast({
          title: "Success",
          description: `${seriesData.name} has been updated successfully`,
        })
      }

      // Navigate back to the model houses admin page
      router.push("/admin/model-houses")
    } catch (error) {
      console.error("Error saving model house series:", error)
      setFormError("There was a problem saving the model house series. Please try again.")
      toast({
        title: "Error",
        description: "There was a problem saving the model house series. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading && !isNewSeries) {
    return (
      <div className="container mx-auto flex items-center justify-center h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-semibold">Loading series data...</h2>
        </div>
      </div>
    )
  }

  if (error && !isNewSeries) {
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

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/model-houses">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{isNewSeries ? "Add New Series" : "Edit Series"}</h1>
        </div>
      </div>

      {formError && (
        <Alert variant="destructive" className="mb-6">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">ID (unique identifier) *</Label>
                <Input
                  id="id"
                  name="id"
                  value={formData.id}
                  onChange={handleInputChange}
                  required
                  disabled={!isNewSeries}
                  placeholder="e.g., chelsea-81"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Chelsea 81 Series"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="floorArea">Floor Area *</Label>
                <Input
                  id="floorArea"
                  name="floorArea"
                  value={formData.floorArea}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 81 sqm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="basePrice">Base Price *</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  value={formData.basePrice || 0}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 3000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developer">Developer *</Label>
                <Input
                  id="developer"
                  name="developer"
                  value={formData.developer}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Aman Engineering"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="developerColor">Developer Color</Label>
                <Input
                  id="developerColor"
                  name="developerColor"
                  type="color"
                  value={formData.developerColor}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="project">Project *</Label>
                <Input
                  id="project"
                  name="project"
                  value={formData.project}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Parkview Naga Urban Residence"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loftReady" className="flex items-center gap-2 cursor-pointer">
                  <Checkbox id="loftReady" checked={formData.loftReady} onCheckedChange={handleCheckboxChange} />
                  Loft Ready
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Short Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Brief description of the model house series"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="longDescription">Long Description</Label>
              <Textarea
                id="longDescription"
                name="longDescription"
                value={formData.longDescription}
                onChange={handleInputChange}
                placeholder="Detailed description of the model house series"
                rows={5}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleInputChange}
                placeholder="URL to the main image"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="floorPlanImage">Floor Plan Image URL</Label>
              <Input
                id="floorPlanImage"
                name="floorPlanImage"
                value={formData.floorPlanImage}
                onChange={handleInputChange}
                placeholder="URL to the floor plan image"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Features</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add a feature" />
                <Button type="button" onClick={addFeature}>
                  Add
                </Button>
              </div>

              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted rounded">
                    <span>{feature}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFeature(index)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  value={newSpecKey}
                  onChange={(e) => setNewSpecKey(e.target.value)}
                  placeholder="Specification name"
                />
                <Input
                  value={newSpecValue}
                  onChange={(e) => setNewSpecValue(e.target.value)}
                  placeholder="Specification value"
                />
              </div>
              <Button type="button" onClick={addSpecification} className="w-full">
                Add Specification
              </Button>

              <div className="space-y-2">
                {Object.entries(formData.specifications || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-2 bg-muted rounded">
                    <div>
                      <span className="font-medium">{key}:</span> {value}
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeSpecification(key)}>
                      Remove
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button" asChild>
            <Link href="/admin/model-houses">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Series
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
