"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useLotOnlyContext } from "@/lib/context/LotOnlyContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Save, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { v4 as uuidv4 } from "uuid"
import type { LotOnlyProperty } from "@/data/lot-only-properties"

export default function LotOnlyPropertyPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { toast } = useToast()
  const { getPropertyById, addProperty, updateProperty, deleteProperty, getAllProjects } = useLotOnlyContext()

  const isNew = params.id === "new"
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [property, setProperty] = useState<LotOnlyProperty>({
    id: "",
    name: "",
    description: "",
    price: 0,
    location: "",
    project: "",
    developer: "",
    developerColor: "#000000",
    status: "Available",
    lotArea: "",
    features: [],
    imageUrl: "",
    propertyType: "Lot Only",
  })
  const [featuresInput, setFeaturesInput] = useState("")
  const [utilitiesInput, setUtilitiesInput] = useState("")
  const [amenitiesInput, setAmenitiesInput] = useState("")

  useEffect(() => {
    if (isNew) {
      setProperty({
        ...property,
        id: uuidv4(),
      })
      setIsLoading(false)
      return
    }

    const existingProperty = getPropertyById(params.id)
    if (existingProperty) {
      setProperty(existingProperty)
      setFeaturesInput(existingProperty.features.join(", "))
      setUtilitiesInput(existingProperty.utilities?.join(", ") || "")
      setAmenitiesInput(existingProperty.nearbyAmenities?.join(", ") || "")
    }
    setIsLoading(false)
  }, [isNew, params.id, getPropertyById])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProperty((prev) => ({
      ...prev,
      [name]: name === "price" ? Number.parseFloat(value) || 0 : value,
    }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setProperty((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Process comma-separated inputs into arrays
      const updatedProperty = {
        ...property,
        features: featuresInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        utilities: utilitiesInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        nearbyAmenities: amenitiesInput
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
      }

      if (isNew) {
        await addProperty(updatedProperty)
        toast({
          title: "Success",
          description: "Property added successfully",
        })
      } else {
        await updateProperty(params.id, updatedProperty)
        toast({
          title: "Success",
          description: "Property updated successfully",
        })
      }
      router.push("/admin/lot-only")
    } catch (error) {
      console.error("Error saving property:", error)
      toast({
        title: "Error",
        description: "There was a problem saving the property. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (isNew) return

    setIsDeleting(true)
    try {
      await deleteProperty(params.id)
      toast({
        title: "Success",
        description: "Property deleted successfully",
      })
      router.push("/admin/lot-only")
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error",
        description: "There was a problem deleting the property. Please try again.",
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
          <h2 className="text-xl font-semibold">Loading property data...</h2>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" onClick={() => router.push("/admin/lot-only")} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-3xl font-bold">{isNew ? "Add New Property" : "Edit Property"}</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Enter the basic details of the property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Property Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={property.name}
                  onChange={handleChange}
                  placeholder="Enter property name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={property.description}
                  onChange={handleChange}
                  placeholder="Enter property description"
                  rows={4}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₱)</Label>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={property.price}
                    onChange={handleChange}
                    placeholder="Enter price"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lotArea">Lot Area</Label>
                  <Input
                    id="lotArea"
                    name="lotArea"
                    value={property.lotArea}
                    onChange={handleChange}
                    placeholder="e.g., 100 sqm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  name="location"
                  value={property.location}
                  onChange={handleChange}
                  placeholder="Enter property location"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Project & Developer</CardTitle>
              <CardDescription>Select the project and developer for this property</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="project">Project</Label>
                <Select
                  value={property.project}
                  onValueChange={(value) => handleSelectChange("project", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Parkview Naga Urban Residence">Parkview Naga Urban Residence</SelectItem>
                    <SelectItem value="Palm Village">Palm Village</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="developer">Developer</Label>
                <Select
                  value={property.developer}
                  onValueChange={(value) => handleSelectChange("developer", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a developer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Aman Engineering">Aman Engineering</SelectItem>
                    <SelectItem value="Enjoy Realty">Enjoy Realty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="developerColor">Developer Color</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="developerColor"
                    name="developerColor"
                    type="color"
                    value={property.developerColor}
                    onChange={handleChange}
                    className="w-12 h-10 p-1"
                  />
                  <Input
                    name="developerColor"
                    value={property.developerColor}
                    onChange={handleChange}
                    placeholder="#000000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={property.status} onValueChange={(value) => handleSelectChange("status", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Available">Available</SelectItem>
                    <SelectItem value="Reserved">Reserved</SelectItem>
                    <SelectItem value="Sold">Sold</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features & Amenities</CardTitle>
              <CardDescription>Enter features and nearby amenities (comma-separated)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="features">Features</Label>
                <Textarea
                  id="features"
                  value={featuresInput}
                  onChange={(e) => setFeaturesInput(e.target.value)}
                  placeholder="Enter features separated by commas"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="utilities">Utilities</Label>
                <Textarea
                  id="utilities"
                  value={utilitiesInput}
                  onChange={(e) => setUtilitiesInput(e.target.value)}
                  placeholder="Enter utilities separated by commas"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amenities">Nearby Amenities</Label>
                <Textarea
                  id="amenities"
                  value={amenitiesInput}
                  onChange={(e) => setAmenitiesInput(e.target.value)}
                  placeholder="Enter nearby amenities separated by commas"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Financing & Media</CardTitle>
              <CardDescription>Enter financing details and media URLs</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reservationFee">Reservation Fee (₱)</Label>
                  <Input
                    id="reservationFee"
                    name="reservationFee"
                    type="number"
                    value={property.reservationFee || ""}
                    onChange={handleChange}
                    placeholder="Enter reservation fee"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="downPaymentPercentage">Down Payment (%)</Label>
                  <Input
                    id="downPaymentPercentage"
                    name="downPaymentPercentage"
                    type="number"
                    value={property.downPaymentPercentage || ""}
                    onChange={handleChange}
                    placeholder="e.g., 20"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="financingOptions">Financing Options</Label>
                <Input
                  id="financingOptions"
                  name="financingOptions"
                  value={property.financingOptions || ""}
                  onChange={handleChange}
                  placeholder="e.g., Bank/Pag-Ibig Financing"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="downPaymentTerms">Down Payment Terms</Label>
                <Input
                  id="downPaymentTerms"
                  name="downPaymentTerms"
                  value={property.downPaymentTerms || ""}
                  onChange={handleChange}
                  placeholder="e.g., payable in 2 years with 0% interest"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  value={property.imageUrl}
                  onChange={handleChange}
                  placeholder="Enter image URL or leave blank for placeholder"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-6 flex justify-between">
          <Button type="button" variant="destructive" onClick={handleDelete} disabled={isNew || isDeleting}>
            {isDeleting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
            Delete Property
          </Button>
          <Button type="submit" disabled={isSaving}>
            {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {isNew ? "Add Property" : "Update Property"}
          </Button>
        </div>
      </form>
    </div>
  )
}
