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
import type { ModelHouseSeries } from "@/data/model-houses"

export default function EditModelHouseSeriesPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { modelHouses, addModelHouseSeries, updateModelHouseSeries, loading } = useModelHousesContext()

  const isNewSeries = params.id === "new"
  const initialSeries = isNewSeries ? null : modelHouses[params.id]

  const [formData, setFormData] = useState<Partial<ModelHouseSeries>>({
    id: "",
    name: "",
    floorArea: "",
    loftReady: false,
    description: "",
    longDescription: "",
    features: [],
    specifications: {
      foundation: "",
      walls: "",
      roofing: "",
      ceiling: "",
      windows: "",
      doors: "",
      flooring: "",
      kitchen: "",
      bathroom: "",
      electrical: "",
    },
    basePrice: 0,
    floorPlanImage: "",
    imageUrl: "",
    developer: "",
    developerColor: "#000000",
    project: "",
    units: [],
  })

  const [newFeature, setNewFeature] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isNewSeries && initialSeries) {
      setFormData({
        ...initialSeries,
        // Ensure all fields have default values to prevent controlled/uncontrolled input errors
        id: initialSeries.id || "",
        name: initialSeries.name || "",
        floorArea: initialSeries.floorArea || "",
        loftReady: initialSeries.loftReady || false,
        description: initialSeries.description || "",
        longDescription: initialSeries.longDescription || "",
        features: initialSeries.features || [],
        specifications: {
          foundation: initialSeries.specifications?.foundation || "",
          walls: initialSeries.specifications?.walls || "",
          roofing: initialSeries.specifications?.roofing || "",
          ceiling: initialSeries.specifications?.ceiling || "",
          windows: initialSeries.specifications?.windows || "",
          doors: initialSeries.specifications?.doors || "",
          flooring: initialSeries.specifications?.flooring || "",
          kitchen: initialSeries.specifications?.kitchen || "",
          bathroom: initialSeries.specifications?.bathroom || "",
          electrical: initialSeries.specifications?.electrical || "",
          ...initialSeries.specifications,
        },
        basePrice: initialSeries.basePrice || 0,
        floorPlanImage: initialSeries.floorPlanImage || "",
        imageUrl: initialSeries.imageUrl || "",
        developer: initialSeries.developer || "",
        developerColor: initialSeries.developerColor || "#000000",
        project: initialSeries.project || "",
        units: initialSeries.units || [],
      })
    }
  }, [isNewSeries, initialSeries])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading model houses data...</span>
      </div>
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
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
      loftReady: checked,
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
    if (!formData.floorArea) newErrors.floorArea = "Floor area is required"
    if (!formData.description) newErrors.description = "Description is required"
    if (!formData.developer) newErrors.developer = "Developer is required"
    if (!formData.project) newErrors.project = "Project is required"
    if (!formData.basePrice) newErrors.basePrice = "Base price is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const seriesData = {
        ...formData,
        id: formData.id || "",
        name: formData.name || "",
        floorArea: formData.floorArea || "",
        loftReady: formData.loftReady || false,
        description: formData.description || "",
        longDescription: formData.longDescription || "",
        features: formData.features || [],
        specifications: formData.specifications || {},
        basePrice: Number(formData.basePrice) || 0,
        floorPlanImage: formData.floorPlanImage || "",
        imageUrl: formData.imageUrl || "",
        developer: formData.developer || "",
        developerColor: formData.developerColor || "#000000",
        project: formData.project || "",
        units: formData.units || [],
      } as ModelHouseSeries

      if (isNewSeries) {
        addModelHouseSeries(seriesData)
      } else {
        updateModelHouseSeries(params.id, seriesData)
      }

      router.push("/admin/model-houses")
    } catch (error) {
      console.error("Error saving model house series:", error)
    } finally {
      setIsSubmitting(false)
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
        <h1 className="text-3xl font-bold ml-4">
          {isNewSeries ? "Add New Model House Series" : `Edit ${initialSeries?.name || "Series"}`}
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
                  disabled={!isNewSeries}
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
                <Label htmlFor="floorArea">Floor Area</Label>
                <Input
                  id="floorArea"
                  name="floorArea"
                  value={formData.floorArea || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., 72 sqm"
                  className={errors.floorArea ? "border-red-500" : ""}
                />
                {errors.floorArea && <p className="text-red-500 text-sm mt-1">{errors.floorArea}</p>}
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="loftReady" checked={formData.loftReady || false} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="loftReady">Loft Ready</Label>
              </div>

              <div>
                <Label htmlFor="description">Short Description</Label>
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
                <Label htmlFor="longDescription">Long Description</Label>
                <Textarea
                  id="longDescription"
                  name="longDescription"
                  value={formData.longDescription || ""}
                  onChange={handleInputChange}
                  rows={5}
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
              <CardTitle>Specifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="foundation">Foundation</Label>
                <Input
                  id="foundation"
                  name="foundation"
                  value={formData.specifications?.foundation || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="walls">Walls</Label>
                <Input
                  id="walls"
                  name="walls"
                  value={formData.specifications?.walls || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="roofing">Roofing</Label>
                <Input
                  id="roofing"
                  name="roofing"
                  value={formData.specifications?.roofing || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="ceiling">Ceiling</Label>
                <Input
                  id="ceiling"
                  name="ceiling"
                  value={formData.specifications?.ceiling || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="windows">Windows</Label>
                <Input
                  id="windows"
                  name="windows"
                  value={formData.specifications?.windows || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="doors">Doors</Label>
                <Input
                  id="doors"
                  name="doors"
                  value={formData.specifications?.doors || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="flooring">Flooring</Label>
                <Input
                  id="flooring"
                  name="flooring"
                  value={formData.specifications?.flooring || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="kitchen">Kitchen</Label>
                <Input
                  id="kitchen"
                  name="kitchen"
                  value={formData.specifications?.kitchen || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="bathroom">Bathroom</Label>
                <Input
                  id="bathroom"
                  name="bathroom"
                  value={formData.specifications?.bathroom || ""}
                  onChange={handleSpecificationChange}
                />
              </div>

              <div>
                <Label htmlFor="electrical">Electrical</Label>
                <Input
                  id="electrical"
                  name="electrical"
                  value={formData.specifications?.electrical || ""}
                  onChange={handleSpecificationChange}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="basePrice">Base Price</Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  value={formData.basePrice || 0}
                  onChange={handleInputChange}
                  className={errors.basePrice ? "border-red-500" : ""}
                />
                {errors.basePrice && <p className="text-red-500 text-sm mt-1">{errors.basePrice}</p>}
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
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input id="imageUrl" name="imageUrl" value={formData.imageUrl || ""} onChange={handleInputChange} />
              </div>

              <div>
                <Label htmlFor="developer">Developer</Label>
                <Input
                  id="developer"
                  name="developer"
                  value={formData.developer || ""}
                  onChange={handleInputChange}
                  className={errors.developer ? "border-red-500" : ""}
                />
                {errors.developer && <p className="text-red-500 text-sm mt-1">{errors.developer}</p>}
              </div>

              <div>
                <Label htmlFor="developerColor">Developer Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="developerColor"
                    name="developerColor"
                    value={formData.developerColor || "#000000"}
                    onChange={handleInputChange}
                  />
                  <div
                    className="w-10 h-10 rounded-md border"
                    style={{ backgroundColor: formData.developerColor || "#000000" }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="project">Project</Label>
                <Input
                  id="project"
                  name="project"
                  value={formData.project || ""}
                  onChange={handleInputChange}
                  className={errors.project ? "border-red-500" : ""}
                />
                {errors.project && <p className="text-red-500 text-sm mt-1">{errors.project}</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-end space-x-4">
          <Link href="/admin/model-houses">
            <Button variant="outline" type="button">
              Cancel
            </Button>
          </Link>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isNewSeries ? "Create Series" : "Update Series"}
          </Button>
        </div>
      </form>
    </div>
  )
}
