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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Loader2 } from "lucide-react"
import Link from "next/link"
import type { ModelHouseUnit } from "@/lib/hooks/useModelHouses"
import { useToast } from "@/hooks/use-toast"

export default function EditUnitPage({
  params,
}: {
  params: { id: string; unitId: string }
}) {
  const router = useRouter()
  const { toast } = useToast()
  const { getModelHouseSeriesById, getModelHouseUnitById, addModelHouseUnit, updateModelHouseUnit } =
    useModelHousesContext()

  const isNewUnit = params.unitId === "new"
  const series = getModelHouseSeriesById(params.id)
  const existingUnit = !isNewUnit ? getModelHouseUnitById(params.id, params.unitId) : null

  const [formData, setFormData] = useState<Partial<ModelHouseUnit>>(
    existingUnit || {
      id: "",
      name: "",
      seriesName: series?.name.split(" ")[0] || "",
      description: "",
      price: 0,
      lotOnlyPrice: 0,
      houseConstructionPrice: 0,
      location: "",
      status: "Available",
      isRFO: false,
      features: [],
      specifications: {},
      floorPlanImage: "",
      imageUrl: "",
      floorPlanPdfId: "",
      walkthrough: "",
      completionDate: "",
      constructionProgress: 0,
    },
  )

  const [newFeature, setNewFeature] = useState("")
  const [newSpecKey, setNewSpecKey] = useState("")
  const [newSpecValue, setNewSpecValue] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!series) {
      router.push("/admin/model-houses")
    }
  }, [series, router])

  useEffect(() => {
    if (existingUnit) {
      setFormData(existingUnit)
    }
  }, [existingUnit])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: ["price", "lotOnlyPrice", "houseConstructionPrice", "constructionProgress"].includes(name)
        ? value
          ? Number.parseFloat(value)
          : 0
        : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
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

    if (!formData.id || !formData.name || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    try {
      // Calculate house construction price if not provided
      if (!formData.houseConstructionPrice && formData.price && formData.lotOnlyPrice) {
        formData.houseConstructionPrice = formData.price - formData.lotOnlyPrice
      }

      const unitData = {
        ...formData,
        seriesName: series?.name.split(" ")[0] || "",
        features: formData.features || [],
        specifications: formData.specifications || {},
      } as ModelHouseUnit

      if (isNewUnit) {
        addModelHouseUnit(params.id, unitData)
        toast({
          title: "Success",
          description: `${unitData.name} unit has been created successfully`,
        })
      } else {
        updateModelHouseUnit(params.id, params.unitId, unitData)
        toast({
          title: "Success",
          description: `${unitData.name} unit has been updated successfully`,
        })
      }

      // Simulate a small delay to ensure localStorage is updated
      await new Promise((resolve) => setTimeout(resolve, 300))

      router.push(`/admin/model-houses/series/${params.id}/units`)
    } catch (error) {
      console.error("Error saving model house unit:", error)
      toast({
        title: "Error",
        description: "There was a problem saving the unit. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!series) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto max-w-4xl">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/admin/model-houses/series/${params.id}/units`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {isNewUnit ? "Add New Unit" : "Edit Unit"}: {series.name}
          </h1>
        </div>
      </div>

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
                  disabled={!isNewUnit}
                  placeholder="e.g., chelsea-81-basic"
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
                  placeholder="e.g., Basic"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Total Price *</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 3000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lotOnlyPrice">Lot Only Price *</Label>
                <Input
                  id="lotOnlyPrice"
                  name="lotOnlyPrice"
                  type="number"
                  value={formData.lotOnlyPrice || 0}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., 1000000"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="houseConstructionPrice">House Construction Price</Label>
                <Input
                  id="houseConstructionPrice"
                  name="houseConstructionPrice"
                  type="number"
                  value={formData.houseConstructionPrice || 0}
                  onChange={handleInputChange}
                  placeholder="e.g., 2000000"
                />
                <p className="text-xs text-muted-foreground">
                  If left empty, will be calculated as (Total Price - Lot Price)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g., Parkview Naga Urban Residence, Zone 5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                    <SelectItem value="On Going">On Going</SelectItem>
                    <SelectItem value="Fully Constructed">Fully Constructed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.isRFO}
                    onCheckedChange={(checked) => handleCheckboxChange("isRFO", checked === true)}
                  />
                  Ready For Occupancy (RFO)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                placeholder="Description of the unit"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="space-y-2">
                <Label htmlFor="floorPlanPdfId">Floor Plan PDF ID (Google Drive)</Label>
                <Input
                  id="floorPlanPdfId"
                  name="floorPlanPdfId"
                  value={formData.floorPlanPdfId}
                  onChange={handleInputChange}
                  placeholder="Google Drive ID for floor plan PDF"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="walkthrough">Walkthrough Video URL</Label>
                <Input
                  id="walkthrough"
                  name="walkthrough"
                  value={formData.walkthrough}
                  onChange={handleInputChange}
                  placeholder="YouTube embed URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input
                  id="completionDate"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={handleInputChange}
                  placeholder="e.g., December 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="constructionProgress">Construction Progress (%)</Label>
                <Input
                  id="constructionProgress"
                  name="constructionProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.constructionProgress || 0}
                  onChange={handleInputChange}
                  placeholder="e.g., 75"
                />
              </div>
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
            <Link href={`/admin/model-houses/series/${params.id}/units`}>Cancel</Link>
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
                Save Unit
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
