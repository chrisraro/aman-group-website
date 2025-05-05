"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useModelHousesContext } from "@/lib/context/ModelHousesContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import type { ModelHouseUnit } from "@/data/model-houses"

export default function EditUnitPage({ params }: { params: { id: string; unitId: string } }) {
  const router = useRouter()
  const { modelHouses, addUnit, updateUnit, loading } = useModelHousesContext()

  const isNewUnit = params.unitId === "new"
  const series = modelHouses[params.id]
  const initialUnit = isNewUnit ? null : series?.units.find((unit) => unit.id === params.unitId)

  const [formData, setFormData] = useState<Partial<ModelHouseUnit>>({
    id: "",
    name: "",
    seriesName: "",
    description: "",
    price: 0,
    lotOnlyPrice: 0,
    houseConstructionPrice: 0,
    location: "",
    status: "Available",
    isRFO: false,
    features: [],
    floorPlanImage: "",
    imageUrl: "",
    specifications: {},
  })

  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isNewUnit && initialUnit) {
      setFormData({
        ...initialUnit,
        // Ensure all fields have default values to prevent controlled/uncontrolled input errors
        id: initialUnit.id || "",
        name: initialUnit.name || "",
        seriesName: initialUnit.seriesName || series?.name?.split(" ")[0] || "",
        description: initialUnit.description || "",
        price: initialUnit.price || 0,
        lotOnlyPrice: initialUnit.lotOnlyPrice || 0,
        houseConstructionPrice: initialUnit.houseConstructionPrice || 0,
        location: initialUnit.location || "",
        status: initialUnit.status || "Available",
        isRFO: initialUnit.isRFO || false,
        features: initialUnit.features || [],
        floorPlanImage: initialUnit.floorPlanImage || "",
        imageUrl: initialUnit.imageUrl || "",
        floorPlanPdfId: initialUnit.floorPlanPdfId || "",
        walkthrough: initialUnit.walkthrough || "",
        specifications: initialUnit.specifications || {},
        lotArea: initialUnit.lotArea || "",
        reservationFee: initialUnit.reservationFee || 0,
        financingOptions: initialUnit.financingOptions || "",
        downPaymentPercentage: initialUnit.downPaymentPercentage || 0,
        downPaymentTerms: initialUnit.downPaymentTerms || "",
        floorArea: initialUnit.floorArea || "",
        completionDate: initialUnit.completionDate || "",
        constructionProgress: initialUnit.constructionProgress || 0,
      })
    } else if (series) {
      // For new units, pre-fill with series data
      setFormData((prev) => ({
        ...prev,
        seriesName: series.name.split(" ")[0] || "",
        location: series.project ? `${series.project}, Zone 7, Brgy. San Felipe, Naga City` : "",
      }))
    }
  }, [isNewUnit, initialUnit, series])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading unit data...</span>
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Handle numeric inputs
    if (
      [
        "price",
        "lotOnlyPrice",
        "houseConstructionPrice",
        "reservationFee",
        "downPaymentPercentage",
        "constructionProgress",
      ].includes(name)
    ) {
      const numValue = value === "" ? 0 : Number(value)
      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  const handleSpecificationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      specifications: {
        ...prev.specifications,
        [name]: value,
      },
    }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isRFO: checked,
    }))
  }

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFormData((prev) => ({
        ...prev,
        features: [...(prev.features || []), newFeature.trim()],
      }))
      setNewFeature("")
    }
  }

  const handleRemoveFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features?.filter((_, i) => i !== index) || [],
    }))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.id) newErrors.id = "ID is required"
    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.price) newErrors.price = "Price is required"
    if (!formData.location) newErrors.location = "Location is required"
    if (!formData.status) newErrors.status = "Status is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const unitData = {
        ...formData,
        id: formData.id || "",
        name: formData.name || "",
        seriesName: formData.seriesName || series.name.split(" ")[0] || "",
        description: formData.description || "",
        price: Number(formData.price) || 0,
        lotOnlyPrice: Number(formData.lotOnlyPrice) || 0,
        houseConstructionPrice: Number(formData.houseConstructionPrice) || 0,
        location: formData.location || "",
        status: formData.status || "Available",
        isRFO: formData.isRFO || false,
        features: formData.features || [],
        floorPlanImage: formData.floorPlanImage || "",
        imageUrl: formData.imageUrl || "",
        specifications: formData.specifications || {},
      } as ModelHouseUnit

      if (isNewUnit) {
        addUnit(params.id, unitData)
      } else {
        updateUnit(params.id, params.unitId, unitData)
      }

      router.push(`/admin/model-houses/series/${params.id}/units`)
    } catch (error) {
      console.error("Error saving unit:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href={`/admin/model-houses/series/${params.id}/units`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Units
          </Button>
        </Link>
        <h1 className="text-3xl font-bold ml-4">
          {isNewUnit ? "Add New Unit" : `Edit ${initialUnit?.name || "Unit"}`}
        </h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="id">ID (used in URLs)</Label>
                <Input
                  id="id"
                  name="id"
                  value={formData.id || ""}
                  onChange={handleInputChange}
                  disabled={!isNewUnit}
                  className={errors.id ? "border-red-500" : ""}
                />
                {errors.id && <p className="text-red-500 text-sm mt-1">{errors.id}</p>}
              </div>

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name || ""}
                  onChange={handleInputChange}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>

              <div>
                <Label htmlFor="seriesName">Series Name</Label>
                <Input
                  id="seriesName"
                  name="seriesName"
                  value={formData.seriesName || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ""}
                  onChange={handleInputChange}
                  className={errors.description ? "border-red-500" : ""}
                />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={formData.location || ""}
                  onChange={handleInputChange}
                  className={errors.location ? "border-red-500" : ""}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Input
                  id="status"
                  name="status"
                  value={formData.status || ""}
                  onChange={handleInputChange}
                  className={errors.status ? "border-red-500" : ""}
                />
                {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="isRFO" checked={formData.isRFO || false} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="isRFO">Ready For Occupancy (RFO)</Label>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pricing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="price">Total Price</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price || 0}
                  onChange={handleInputChange}
                  className={errors.price ? "border-red-500" : ""}
                />
                {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
              </div>

              <div>
                <Label htmlFor="lotOnlyPrice">Lot Only Price</Label>
                <Input
                  id="lotOnlyPrice"
                  name="lotOnlyPrice"
                  type="number"
                  value={formData.lotOnlyPrice || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="houseConstructionPrice">House Construction Price</Label>
                <Input
                  id="houseConstructionPrice"
                  name="houseConstructionPrice"
                  type="number"
                  value={formData.houseConstructionPrice || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="reservationFee">Reservation Fee</Label>
                <Input
                  id="reservationFee"
                  name="reservationFee"
                  type="number"
                  value={formData.reservationFee || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="downPaymentPercentage">Down Payment Percentage</Label>
                <Input
                  id="downPaymentPercentage"
                  name="downPaymentPercentage"
                  type="number"
                  value={formData.downPaymentPercentage || 0}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="downPaymentTerms">Down Payment Terms</Label>
                <Input
                  id="downPaymentTerms"
                  name="downPaymentTerms"
                  value={formData.downPaymentTerms || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., payable in 2 years with 0% interest"
                />
              </div>

              <div>
                <Label htmlFor="financingOptions">Financing Options</Label>
                <Input
                  id="financingOptions"
                  name="financingOptions"
                  value={formData.financingOptions || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., Bank/Pag-Ibig Financing"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Input value={newFeature} onChange={(e) => setNewFeature(e.target.value)} placeholder="Add a feature" />
                <Button type="button" onClick={handleAddFeature}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                {formData.features?.map((feature, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded-md">
                    <span>{feature}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveFeature(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Media & Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ""} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="floorPlanImage">Floor Plan Image URL</Label>
                <Input
                  id="floorPlanImage"
                  name="floorPlanImage"
                  value={formData.floorPlanImage || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="floorPlanPdfId">Floor Plan PDF ID (Google Drive)</Label>
                <Input
                  id="floorPlanPdfId"
                  name="floorPlanPdfId"
                  value={formData.floorPlanPdfId || ""}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <Label htmlFor="walkthrough">Walkthrough Video URL</Label>
                <Input
                  id="walkthrough"
                  name="walkthrough"
                  value={formData.walkthrough || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., https://www.youtube.com/embed/..."
                />
              </div>

              <div>
                <Label htmlFor="lotArea">Lot Area</Label>
                <Input
                  id="lotArea"
                  name="lotArea"
                  value={formData.lotArea || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 80 sqm"
                />
              </div>

              <div>
                <Label htmlFor="floorArea">Floor Area</Label>
                <Input
                  id="floorArea"
                  name="floorArea"
                  value={formData.floorArea || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 45 sqm"
                />
              </div>

              <div>
                <Label htmlFor="completionDate">Completion Date</Label>
                <Input
                  id="completionDate"
                  name="completionDate"
                  value={formData.completionDate || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., December 2025"
                />
              </div>

              <div>
                <Label htmlFor="constructionProgress">Construction Progress (%)</Label>
                <Input
                  id="constructionProgress"
                  name="constructionProgress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.constructionProgress || 0}
                  onChange={handleInputChange}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Link href={`/admin/model-houses/series/${params.id}/units`}>
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNewUnit ? "Create Unit" : "Update Unit"}
          </Button>
        </div>
      </form>
    </div>
  )
}
