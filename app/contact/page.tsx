"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Home, Mail, MapPin, Phone, Building } from "lucide-react"
import { Checkbox } from "@/components/ui/checkbox"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitContactForm } from "@/app/actions/contact"
import { getAllModelHouseSeries, getModelHouseSeriesById } from "@/data/model-houses"
import { getBrokerageFromParams } from "@/lib/brokerage-links"
import { getStoredBrokerageInfo, getDaysUntilExpiration } from "@/lib/storage-utils"

// Define interfaces for dynamic broker and agent data
interface Brokerage {
  id: string
  name: string
  agency: string
  department: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  status: "Active" | "Inactive"
}

interface Agent {
  id: string
  name: string
  agencyId: string
  classification: "Broker" | "Salesperson"
  team: "Alpha" | "Mavericks" | "Titans"
  email?: string
  phone?: string
  status: "Active" | "Inactive"
}

export default function ContactPage() {
  const searchParams = useSearchParams()
  const [brokerageInfo, setBrokerageInfo] = useState<{
    id: string
    name: string
    agency: string
    department: string
    hash: string
    expirationDate?: string
    agentId?: string
    agentName?: string
    agentClassification?: "Broker" | "Salesperson"
  } | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)

  const [accreditedBrokers, setAccreditedBrokers] = useState<Brokerage[]>([])
  const [agents, setAgents] = useState<Agent[]>([])
  const [loadingBrokers, setLoadingBrokers] = useState(true)

  useEffect(() => {
    const loadBrokerageData = async () => {
      try {
        const [brokersResponse, agentsResponse] = await Promise.all([fetch("/api/brokerages"), fetch("/api/agents")])

        if (brokersResponse.ok) {
          const brokersData = await brokersResponse.json()
          // Filter only active brokers and sort by agency name
          const activeBrokers = brokersData
            .filter((b: Brokerage) => b.status === "Active")
            .sort((a: Brokerage, b: Brokerage) => a.agency.localeCompare(b.agency))
          setAccreditedBrokers(activeBrokers)
        }

        if (agentsResponse.ok) {
          const agentsData = await agentsResponse.json()
          // Filter only active agents
          const activeAgents = agentsData.filter((a: Agent) => a.status === "Active")
          setAgents(activeAgents)
        }
      } catch (error) {
        console.error("Error loading brokerage data:", error)
        // Fallback to empty arrays if API fails
        setAccreditedBrokers([])
        setAgents([])
      } finally {
        setLoadingBrokers(false)
      }
    }

    loadBrokerageData()
  }, [])

  // Check for brokerage link parameters or localStorage
  useEffect(() => {
    const loadBrokerageInfo = async () => {
      // First check URL parameters
      const brokerageFromParams = await getBrokerageFromParams(searchParams)
      if (brokerageFromParams) {
        setBrokerageInfo(brokerageFromParams)
        return
      }

      // If not in URL, check localStorage
      const storedBrokerage = getStoredBrokerageInfo()
      if (storedBrokerage) {
        setBrokerageInfo({
          id: storedBrokerage.id,
          name: storedBrokerage.name,
          agency: storedBrokerage.agency,
          department: storedBrokerage.department,
          hash: storedBrokerage.hash,
          expirationDate: storedBrokerage.expirationDate,
          agentId: storedBrokerage.agentId,
          agentName: storedBrokerage.agentName,
          agentClassification: storedBrokerage.agentClassification,
        })

        // Calculate days remaining
        const days = getDaysUntilExpiration()
        setDaysRemaining(days)
      }
    }

    loadBrokerageInfo()
  }, [searchParams])

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Breadcrumb */}
      <div className="flex items-center text-sm mb-8">
        <Link href="/" className="text-muted-foreground hover:text-primary">
          <Home className="h-4 w-4 inline mr-1" />
          Home
        </Link>
        <span className="mx-2 text-muted-foreground">/</span>
        <span className="font-medium">Contact Us</span>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-10 md:mb-12 px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 md:mb-4">Contact Us</h1>
        <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
          Have questions about our properties or services? Get in touch with our team and we'll be happy to assist you.
        </p>

        {/* Show brokerage referral info if present */}
        {brokerageInfo && (
          <div className="bg-primary/10 border-l-4 border-primary p-4 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Building className="h-5 w-5 text-primary" />
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-primary">Brokerage Referral Active</h3>
                <div className="mt-1 text-sm text-primary/80">
                  <p>
                    <strong>Agency:</strong> {brokerageInfo.agency}
                  </p>
                  <p>
                    <strong>Contact:</strong> {brokerageInfo.name}
                  </p>
                  {brokerageInfo.agentName && (
                    <p>
                      <strong>Agent:</strong> {brokerageInfo.agentName} ({brokerageInfo.agentClassification})
                    </p>
                  )}
                  <p>
                    <strong>Team:</strong>{" "}
                    {brokerageInfo.department === "Marketing"
                      ? "Alpha"
                      : brokerageInfo.department === "Sales"
                        ? "Mavericks"
                        : "Titans"}
                  </p>
                  {daysRemaining > 0 && (
                    <p>
                      <strong>Expires in:</strong> {daysRemaining} day{daysRemaining !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {/* Contact Form */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
            <ContactForm brokerageInfo={brokerageInfo} accreditedBrokers={accreditedBrokers} />
          </CardContent>
        </Card>

        {/* Contact Information */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Address</h3>
                    <p className="text-muted-foreground">
                      Aman Corporate Center, Zone 6, San Felipe, Naga City, Camarines Sur, Philippines
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Phone className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Phone</h3>
                    <p className="text-muted-foreground">(054) 884-5188</p>
                    <p className="text-muted-foreground">(Smart) 09296083744</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="h-5 w-5 mr-3 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-semibold">Email</h3>
                    <p className="text-muted-foreground">frontdesk@enjoyrealty.com</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-bold mb-6">Office Hours</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="font-medium">Monday - Saturday</span>
                  <span className="text-muted-foreground">8:00 AM - 5:00 PM</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Sunday</span>
                  <span className="text-muted-foreground">Closed</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Map Section */}
      <div className="mt-12 max-w-5xl mx-auto">
        <Card>
          <CardContent className="p-0">
            <div className="aspect-video w-full">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3877.2258079023504!2d123.20358251146946!3d13.6440236997227!2m3!1f0!2f3!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33a1f323b02da27d%3A0xc0e5b304d52de86b!2sAMAN%20CORPORATE%20CENTER!5e0!3m2!1sen!2sph!4v1742621264762!5m2!1sen!2sph"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Aman Group Office Location"
              ></iframe>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// Define props interface for ContactForm
interface ContactFormProps {
  brokerageInfo: {
    id: string
    name: string
    agency: string
    department: string
    hash: string
    expirationDate?: string
    agentId?: string
    agentName?: string
    agentClassification?: "Broker" | "Salesperson"
  } | null
  accreditedBrokers: Brokerage[]
}

function ContactForm({ brokerageInfo, accreditedBrokers }: ContactFormProps) {
  // Get query parameters from URL
  const searchParams = useSearchParams()
  const queryPropertyInterest = searchParams.get("propertyInterest")
  const queryModelHousesSeries = searchParams.get("modelHousesSeries")
  const queryProjectLocation = searchParams.get("projectLocation")
  const queryUnitId = searchParams.get("unitId")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{ success?: boolean; message?: string } | null>(null)
  const [propertyInterest, setPropertyInterest] = useState<string>(queryPropertyInterest || "Model House")
  const [projectLocation, setProjectLocation] = useState<string>(queryProjectLocation || "Palm Village")
  const [modelHousesSeries, setModelHousesSeries] = useState<string>(queryModelHousesSeries || "")
  const [modelHousesUnit, setModelHousesUnit] = useState<string>(queryUnitId || "")
  const [showModelSeries, setShowModelSeries] = useState(
    queryPropertyInterest === "Model House" ||
      queryPropertyInterest === "Ready for Occupancy" ||
      !queryPropertyInterest,
  )
  const [showModelUnit, setShowModelUnit] = useState(false)
  const [availableSeries, setAvailableSeries] = useState<any[]>([])
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  const [initialValuesSet, setInitialValuesSet] = useState(false)

  // Add these state variables after other state variables
  const [hasInteractedWithBroker, setHasInteractedWithBroker] = useState<boolean>(!!brokerageInfo)
  const [selectedBroker, setSelectedBroker] = useState<string>("")
  const [otherBrokerName, setOtherBrokerName] = useState<string>("")
  const [brokerDepartment, setBrokerDepartment] = useState<string>("All")

  // Set broker information from brokerageInfo prop
  useEffect(() => {
    if (brokerageInfo) {
      setSelectedBroker(`${brokerageInfo.id}|${brokerageInfo.name}|${brokerageInfo.agency}|${brokerageInfo.department}`)
    }
  }, [brokerageInfo])

  // Load model house series data
  useEffect(() => {
    const allSeries = getAllModelHouseSeries()
    setAvailableSeries(allSeries)

    // Initialize with query parameters if available
    if (!initialValuesSet && allSeries.length > 0) {
      if (queryModelHousesSeries) {
        const selectedSeries = getModelHouseSeriesById(queryModelHousesSeries)
        if (selectedSeries) {
          // If property interest is RFO, filter only RFO units
          if (queryPropertyInterest === "Ready for Occupancy") {
            const rfoUnits = selectedSeries.units.filter((unit) => unit.isRFO)
            setAvailableUnits(rfoUnits)
          } else {
            setAvailableUnits(selectedSeries.units)
          }

          setShowModelUnit(true)

          // If there's a unit ID, check if it exists in the series
          if (queryUnitId) {
            const unitExists = selectedSeries.units.some((unit) => unit.id === queryUnitId)
            if (unitExists) {
              setModelHousesUnit(queryUnitId)
            }
          }
        }
      }

      setInitialValuesSet(true)
    }
  }, [queryPropertyInterest, queryModelHousesSeries, queryUnitId, initialValuesSet])

  // Handle property interest change
  useEffect(() => {
    setShowModelSeries(propertyInterest === "Model House" || propertyInterest === "Ready for Occupancy")

    if (!showModelSeries) {
      setModelHousesSeries("")
      setModelHousesUnit("")
      setShowModelUnit(false)
    }
  }, [propertyInterest, showModelSeries])

  // Handle model series change
  useEffect(() => {
    if (modelHousesSeries) {
      const selectedSeries = getModelHouseSeriesById(modelHousesSeries)

      if (selectedSeries) {
        // If property interest is RFO, filter only RFO units
        if (propertyInterest === "Ready for Occupancy") {
          const rfoUnits = selectedSeries.units.filter((unit) => unit.isRFO)
          setAvailableUnits(rfoUnits)
        } else {
          setAvailableUnits(selectedSeries.units)
        }

        setShowModelUnit(true)
      } else {
        setShowModelUnit(false)
        setModelHousesUnit("")
      }
    } else {
      setShowModelUnit(false)
      setModelHousesUnit("")
    }
  }, [modelHousesSeries, propertyInterest])

  // Modify the handleSubmit function to include broker information
  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true)
    setFormStatus(null)

    try {
      // Add the property interest and other fields to the form data
      formData.append("propertyInterest", propertyInterest)
      formData.append("projectLocation", projectLocation)

      if (modelHousesSeries && showModelSeries) {
        formData.append("modelHousesSeries", modelHousesSeries)
      }

      if (modelHousesUnit && showModelUnit) {
        formData.append("modelHousesUnit", modelHousesUnit)
      }

      // Add broker information if applicable
      if (hasInteractedWithBroker) {
        formData.append("hasInteractedWithBroker", "true")

        if (selectedBroker === "other") {
          formData.append("brokerName", otherBrokerName)
          formData.append("brokerAgency", "Other")
        } else {
          const [brokerId, brokerName, brokerAgency, brokerDepartment] = selectedBroker.split("|")
          formData.append("brokerName", brokerName)
          formData.append("brokerAgency", brokerAgency)
          formData.append("brokerTeam", brokerDepartment)
        }
      }

      // Add flag if this came from a brokerage link
      if (brokerageInfo) {
        formData.append("fromBrokerageLink", "true")
      }

      // Create subject line based on property interest and model series
      let subject = `Inquiry about ${propertyInterest} at ${projectLocation}`

      if (modelHousesSeries && showModelSeries) {
        const selectedSeries = getModelHouseSeriesById(modelHousesSeries)
        if (selectedSeries) {
          subject += ` - ${selectedSeries.name}`

          if (modelHousesUnit && showModelUnit) {
            const selectedUnit = selectedSeries.units.find((unit) => unit.id === modelHousesUnit)
            if (selectedUnit) {
              subject += ` (${selectedUnit.name})`
            }
          }
        }
      }

      // Add form metadata
      formData.append("_subject", subject)
      formData.append("_source", brokerageInfo ? "Brokerage Referral Link" : "Website Contact Page")

      const result = await submitContactForm(formData)
      setFormStatus(result)

      // Reset form if successful
      if (result.success) {
        const form = document.getElementById("contact-form") as HTMLFormElement
        if (form) form.reset()
        setPropertyInterest("Model House")
        setProjectLocation("Palm Village")
        setModelHousesSeries("")
        setModelHousesUnit("")
        setHasInteractedWithBroker(brokerageInfo ? true : false) // Keep broker info if from referral link
        setSelectedBroker(
          brokerageInfo && brokerageInfo.id
            ? `${brokerageInfo.id}|${brokerageInfo.name}|${brokerageInfo.agency}|${brokerageInfo.department}`
            : "",
        )
        setOtherBrokerName("")
        setBrokerDepartment(brokerageInfo ? brokerageInfo.department : "All")
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      setFormStatus({
        success: false,
        message: "An error occurred. Please try again later.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form id="contact-form" action={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Name *</Label>
        <Input id="name" name="name" required />
      </div>
      <div>
        <Label htmlFor="email">Email *</Label>
        <Input id="email" name="email" type="email" required />
      </div>
      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" name="phone" />
      </div>

      {/* Project Location */}
      <div>
        <Label htmlFor="project-location">Project Location *</Label>
        <Select value={projectLocation} onValueChange={setProjectLocation}>
          <SelectTrigger id="project-location">
            <SelectValue placeholder="Select a project location" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Palm Village">Palm Village</SelectItem>
            <SelectItem value="Parkview Naga Urban Residences">Parkview Naga Urban Residences</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Property Interest */}
      <div>
        <Label htmlFor="property-interest">Property Interest *</Label>
        <Select value={propertyInterest} onValueChange={setPropertyInterest}>
          <SelectTrigger id="property-interest">
            <SelectValue placeholder="Select a property type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Model House">Model House</SelectItem>
            <SelectItem value="Ready for Occupancy">Ready for Occupancy</SelectItem>
            <SelectItem value="Lot Only">Lot Only</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Model Houses Series - Conditional */}
      {showModelSeries && (
        <div>
          <Label htmlFor="model-series">Model Houses Series *</Label>
          <Select value={modelHousesSeries} onValueChange={setModelHousesSeries}>
            <SelectTrigger id="model-series">
              <SelectValue placeholder="Select a series" />
            </SelectTrigger>
            <SelectContent>
              {availableSeries.map((series) => (
                <SelectItem key={series.id} value={series.id}>
                  {series.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Model Houses Unit - Conditional */}
      {showModelUnit && (
        <div>
          <Label htmlFor="model-unit">Model Houses Unit *</Label>
          <Select value={modelHousesUnit} onValueChange={setModelHousesUnit}>
            <SelectTrigger id="model-unit">
              <SelectValue placeholder="Select a unit" />
            </SelectTrigger>
            <SelectContent>
              {availableUnits.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Broker Selection */}
      <div className="space-y-2">
        <Label htmlFor="broker">
          Have you interacted with any of our accredited brokers?{" "}
          {!brokerageInfo && <span className="text-red-500">*</span>}
        </Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="no-broker"
              name="hasInteractedWithBroker"
              value="false"
              checked={!hasInteractedWithBroker}
              onChange={() => setHasInteractedWithBroker(false)}
              disabled={!!brokerageInfo}
            />
            <Label htmlFor="no-broker" className="text-sm font-normal">
              No, I haven't interacted with any broker
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="yes-broker"
              name="hasInteractedWithBroker"
              value="true"
              checked={hasInteractedWithBroker}
              onChange={() => setHasInteractedWithBroker(true)}
              disabled={!!brokerageInfo}
            />
            <Label htmlFor="yes-broker" className="text-sm font-normal">
              Yes, I have interacted with a broker
            </Label>
          </div>
        </div>

        {/* Broker Selection Dropdown */}
        <div className="mt-4">
          <Label htmlFor="brokerSelect">Select Broker/Agency</Label>
          <Select
            name="brokerSelect"
            disabled={!!brokerageInfo || !accreditedBrokers.length}
            defaultValue={
              brokerageInfo
                ? `${brokerageInfo.id}|${brokerageInfo.name}|${brokerageInfo.agency}|${brokerageInfo.department}`
                : ""
            }
            onValueChange={setSelectedBroker}
          >
            <SelectTrigger>
              <SelectValue
                placeholder={
                  !accreditedBrokers.length
                    ? "Loading brokers..."
                    : brokerageInfo
                      ? `${brokerageInfo.agency} - ${brokerageInfo.name}`
                      : "Select a broker/agency"
                }
              />
            </SelectTrigger>
            <SelectContent className="max-h-60">
              {accreditedBrokers.map((broker) => (
                <SelectItem key={broker.id} value={`${broker.id}|${broker.name}|${broker.agency}|${broker.department}`}>
                  <div className="flex flex-col">
                    <span className="font-medium">{broker.agency}</span>
                    <span className="text-sm text-muted-foreground">
                      {broker.name} - Team{" "}
                      {broker.department === "Marketing"
                        ? "Alpha"
                        : broker.department === "Sales"
                          ? "Mavericks"
                          : "Titans"}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {brokerageInfo && (
            <p className="text-sm text-muted-foreground mt-1">
              This field is pre-filled based on your referral link and cannot be changed.
            </p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="message">Message *</Label>
        <Textarea id="message" name="message" rows={5} required />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {formStatus && (
        <div
          className={`mt-4 p-3 rounded-md ${
            formStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}
        >
          {formStatus.message}
        </div>
      )}
    </form>
  )
}
