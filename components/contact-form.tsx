"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { submitContactForm, type ContactFormData } from "@/app/actions/contact"
import { getModelHouseSeriesById, getModelHousesByProject } from "@/data/model-houses"
import { getBrokerageFromParams } from "@/lib/brokerage-links"
import { getStoredBrokerageInfo, getReferralExpirationDate, getDaysUntilExpiration } from "@/lib/storage-utils"
import { Calendar } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { PROJECT_LOCATIONS, PROPERTY_INTEREST_TYPES } from "@/lib/constants"

// Form validation schema
const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  projectLocation: z.string(),
  propertyInterest: z.string(),
  modelHousesSeries: z.string().optional(),
  modelHousesUnit: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters"),
  // Brokerage fields
  hasInteractedWithBroker: z.boolean().optional(),
  brokerName: z.string().optional(),
  brokerAgency: z.string().optional(),
  brokerDepartment: z.string().optional(),
  // Track if this came from a brokerage link
  fromBrokerageLink: z.boolean().optional(),
  // Referral expiration
  referralExpirationDate: z.string().optional(),
  // Agent information
  agentId: z.string().optional(),
  agentName: z.string().optional(),
  agentClassification: z.enum(["Broker", "Salesperson"]).optional(),
})

interface BrokerageInfo {
  id: string
  name: string
  agency: string
  department: string
  hash: string
  agentId?: string
  agentName?: string
  agentClassification?: "Broker" | "Salesperson"
  expirationDate?: string
}

interface ContactFormProps {
  brokerageInfo?: BrokerageInfo | null
}

export function ContactForm({ brokerageInfo }: ContactFormProps) {
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formStatus, setFormStatus] = useState<{ success?: boolean; message?: string } | null>(null)
  const [showModelSeries, setShowModelSeries] = useState(false)
  const [showModelUnit, setShowModelUnit] = useState(false)
  const [availableSeries, setAvailableSeries] = useState<any[]>([])
  const [availableUnits, setAvailableUnits] = useState<any[]>([])
  const [initialValuesSet, setInitialValuesSet] = useState(false)
  const [brokerageLink, setBrokerageLink] = useState<BrokerageInfo | null>(null)
  const [daysRemaining, setDaysRemaining] = useState<number>(0)

  // Get query parameters
  const queryPropertyInterest = searchParams.get("propertyInterest")
  const queryModelHousesSeries = searchParams.get("modelHousesSeries")
  const queryProjectLocation = searchParams.get("projectLocation")
  const queryUnitId = searchParams.get("unitId")

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyInterest: "Model House",
      projectLocation: PROJECT_LOCATIONS[0],
      hasInteractedWithBroker: false,
      fromBrokerageLink: false,
    },
  })

  const propertyInterest = watch("propertyInterest")
  const modelHousesSeries = watch("modelHousesSeries")
  const projectLocation = watch("projectLocation")
  const hasInteractedWithBroker = watch("hasInteractedWithBroker")

  // Initialize brokerage information
  useEffect(() => {
    initializeBrokerageInfo()
  }, [searchParams, brokerageInfo])

  // Load model house series data based on selected project
  useEffect(() => {
    if (projectLocation) {
      const seriesForProject = getModelHousesByProject(projectLocation)
      setAvailableSeries(seriesForProject)
    } else {
      setAvailableSeries([])
    }
  }, [projectLocation])

  // Set initial values from query parameters
  useEffect(() => {
    if (!initialValuesSet) {
      setInitialFormValues()
    }
  }, [queryPropertyInterest, queryModelHousesSeries, queryProjectLocation, queryUnitId, initialValuesSet])

  // Handle property interest change
  useEffect(() => {
    setShowModelSeries(propertyInterest === "Model House" || propertyInterest === "Ready for Occupancy")

    if (!showModelSeries) {
      setValue("modelHousesSeries", "")
      setValue("modelHousesUnit", "")
      setShowModelUnit(false)
    }
  }, [propertyInterest, setValue, showModelSeries])

  // Handle model series change
  useEffect(() => {
    updateAvailableUnits()
  }, [modelHousesSeries, propertyInterest])

  /**
   * Initialize brokerage information from various sources
   */
  const initializeBrokerageInfo = () => {
    // First check if brokerageInfo prop is provided (from URL parameters)
    if (brokerageInfo) {
      setBrokerageLink(brokerageInfo)
      setBrokerageFields(brokerageInfo)
      return
    }

    // If not in props, check URL parameters directly
    const brokerage = getBrokerageFromParams(searchParams)
    if (brokerage) {
      setBrokerageLink(brokerage)
      setBrokerageFields(brokerage)
      return
    }

    // If not in URL, check localStorage
    const storedBrokerage = getStoredBrokerageInfo()
    if (storedBrokerage) {
      setBrokerageLink({
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
      setBrokerageFields(storedBrokerage)

      // Set days remaining
      setDaysRemaining(getDaysUntilExpiration())
    }
  }

  /**
   * Set brokerage fields in the form
   */
  const setBrokerageFields = (brokerage: {
    agency: string
    department: string
    agentId?: string
    agentName?: string
    agentClassification?: "Broker" | "Salesperson"
  }) => {
    setValue("hasInteractedWithBroker", true)
    setValue("brokerAgency", brokerage.agency)
    setValue("brokerDepartment", brokerage.department || "") // Ensure department is set even if empty
    setValue("fromBrokerageLink", true)

    // Set agent information if available
    if (brokerage.agentId) {
      setValue("agentId", brokerage.agentId)
      setValue("agentName", brokerage.agentName || "")
      setValue("agentClassification", brokerage.agentClassification || "")
    }

    // Set referral expiration date
    const expirationDate = getReferralExpirationDate()
    if (expirationDate && expirationDate !== "Expired") {
      setValue("referralExpirationDate", expirationDate)
    }
  }

  /**
   * Set initial form values from query parameters
   */
  const setInitialFormValues = () => {
    if (queryPropertyInterest) {
      setValue("propertyInterest", queryPropertyInterest)
    }

    if (queryProjectLocation) {
      setValue("projectLocation", queryProjectLocation)
    }

    if (queryModelHousesSeries) {
      setValue("modelHousesSeries", queryModelHousesSeries)

      // If there's a unit ID, set it after the series is loaded
      if (queryUnitId) {
        const series = getModelHouseSeriesById(queryModelHousesSeries)
        if (series) {
          const unitExists = series.units.some((unit) => unit.id === queryUnitId)
          if (unitExists) {
            setValue("modelHousesUnit", queryUnitId)
          }
        }
      }
    }

    setInitialValuesSet(true)
  }

  /**
   * Update available units based on selected series and property interest
   */
  const updateAvailableUnits = () => {
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
        setValue("modelHousesUnit", "")
      }
    } else {
      setShowModelUnit(false)
      setValue("modelHousesUnit", "")
    }
  }

  /**
   * Handle form submission
   */
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    setFormStatus(null)

    try {
      // Create subject line based on property interest and model series
      let subject = `Inquiry about ${data.propertyInterest} at ${data.projectLocation}`

      if (data.modelHousesSeries && showModelSeries) {
        const selectedSeries = getModelHouseSeriesById(data.modelHousesSeries)
        if (selectedSeries) {
          subject += ` - ${selectedSeries.name}`

          if (data.modelHousesUnit && showModelUnit) {
            const selectedUnit = selectedSeries.units.find((unit) => unit.id === data.modelHousesUnit)
            if (selectedUnit) {
              subject += ` (${selectedUnit.name})`
            }
          }
        }
      }

      // Add brokerage information to the subject if applicable
      if (data.hasInteractedWithBroker && data.brokerAgency) {
        subject += ` via ${data.brokerAgency}`
        if (data.brokerName) {
          subject += ` (${data.brokerName})`
        }
      }

      // Ensure referral expiration date is included if available
      const formDataWithMetadata = {
        ...data,
        _subject: subject,
        _source: data.fromBrokerageLink ? "Brokerage Referral Link" : "Website Contact Form Component",
      }

      // Make sure these fields are never undefined or empty strings
      if (!formDataWithMetadata.brokerDepartment) {
        formDataWithMetadata.brokerDepartment = data.brokerAgency ? "Unknown Department" : "No Broker"
      }

      if (!formDataWithMetadata.referralExpirationDate && data.fromBrokerageLink) {
        formDataWithMetadata.referralExpirationDate = getReferralExpirationDate() || "No Expiration Date Set"
      }

      const result = await submitContactForm(formDataWithMetadata)
      setFormStatus(result)

      if (result.success) {
        reset()
        // Preserve brokerage information if it came from a link
        if (brokerageLink) {
          setValue("hasInteractedWithBroker", true)
          setValue("brokerAgency", brokerageLink.agency)
          setValue("brokerDepartment", brokerageLink.department || "Unknown Department")
          setValue("fromBrokerageLink", true)
          setValue("referralExpirationDate", getReferralExpirationDate() || "No Expiration Date Set")
        }
      }
    } catch (error) {
      setFormStatus({
        success: false,
        message: "There was an error sending your message. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Brokerage Referral Information (if applicable) */}
      {brokerageLink && (
        <Alert className="bg-green-50 border-green-200">
          <Calendar className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <span className="font-medium">Referral from {brokerageLink.agency}</span>
            {brokerageLink.agentName && (
              <span className="block text-sm">
                Agent: {brokerageLink.agentName} ({brokerageLink.agentClassification})
              </span>
            )}
            <div className="text-sm mt-1">
              Referral valid until: <span className="font-medium">{getReferralExpirationDate()}</span>
              {daysRemaining > 0 && <span className="ml-1 text-xs">({daysRemaining} days remaining)</span>}
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        {/* Personal Information */}
        <div>
          <Label htmlFor="name">
            Name <span className="text-red-500">*</span>
          </Label>
          <Input id="name" {...register("name")} />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input id="email" type="email" {...register("email")} />
          {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone (Optional)</Label>
          <Input id="phone" {...register("phone")} />
        </div>

        {/* Property Information */}
        <div>
          <Label htmlFor="projectLocation">
            Project Location <span className="text-red-500">*</span>
          </Label>
          <select
            id="projectLocation"
            {...register("projectLocation")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {PROJECT_LOCATIONS.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>

        <div>
          <Label htmlFor="propertyInterest">
            Property Interest <span className="text-red-500">*</span>
          </Label>
          <select
            id="propertyInterest"
            {...register("propertyInterest")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {PROPERTY_INTEREST_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        {/* Model Houses Series (conditional) */}
        {showModelSeries && (
          <div>
            <Label htmlFor="modelHousesSeries">
              Model Houses Series <span className="text-red-500">*</span>
            </Label>
            <select
              id="modelHousesSeries"
              {...register("modelHousesSeries")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a Series</option>
              {availableSeries.map((series) => (
                <option key={series.id} value={series.id}>
                  {series.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Model Houses Unit (conditional) */}
        {showModelUnit && (
          <div>
            <Label htmlFor="modelHousesUnit">
              Model Houses Unit <span className="text-red-500">*</span>
            </Label>
            <select
              id="modelHousesUnit"
              {...register("modelHousesUnit")}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a Unit</option>
              {availableUnits.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Brokerage Information Section */}
        <div className="space-y-4 border-t pt-4 mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="hasInteractedWithBroker"
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              checked={hasInteractedWithBroker || !!brokerageLink}
              disabled={!!brokerageLink} // Disable if from brokerage link
              onChange={(e) => setValue("hasInteractedWithBroker", e.target.checked)}
            />
            <Label htmlFor="hasInteractedWithBroker" className="ml-2">
              I have interacted with a broker/agent
            </Label>
          </div>

          {hasInteractedWithBroker && (
            <div className="space-y-4 pl-6">
              <div>
                <Label htmlFor="brokerAgency">Brokerage/Agency</Label>
                <Input
                  id="brokerAgency"
                  {...register("brokerAgency")}
                  disabled={!!brokerageLink} // Disable if from brokerage link
                  className={brokerageLink ? "bg-gray-100" : ""}
                />
                {brokerageLink && (
                  <p className="text-xs text-muted-foreground mt-1">
                    This field is pre-filled based on your referral link.
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="brokerName">Broker/Agent's Name</Label>
                <Input
                  id="brokerName"
                  {...register("brokerName")}
                  placeholder="Enter the name of your broker or agent"
                />
              </div>

              {/* Hidden field for broker department */}
              <input type="hidden" {...register("brokerDepartment")} />

              {/* Hidden field for referral expiration date */}
              <input type="hidden" {...register("referralExpirationDate")} />

              {/* Hidden fields for agent information */}
              <input type="hidden" {...register("agentId")} />
              <input type="hidden" {...register("agentName")} />
              <input type="hidden" {...register("agentClassification")} />
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="message">
            Message <span className="text-red-500">*</span>
          </Label>
          <Textarea id="message" rows={5} {...register("message")} />
          {errors.message && <p className="text-sm text-red-500 mt-1">{errors.message.message}</p>}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Sending..." : "Send Message"}
      </Button>

      {formStatus && (
        <div
          className={`p-4 rounded-md ${formStatus.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {formStatus.message}
        </div>
      )}
    </form>
  )
}
