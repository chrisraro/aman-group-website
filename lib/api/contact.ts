import { getFormspreeFormId } from "@/lib/env"

export type ContactFormData = {
  name: string
  email: string
  phone?: string
  projectLocation: string
  propertyInterest: string
  modelHousesSeries?: string
  modelHousesUnit?: string
  message: string
  // Add broker information fields
  hasInteractedWithBroker?: boolean
  brokerName?: string
  brokerAgency?: string
  brokerDepartment?: string
  // Track if this came from a brokerage link
  fromBrokerageLink?: boolean
  // Additional metadata fields
  _subject?: string
  _source?: string
}

export async function submitContactForm(formData: FormData | ContactFormData) {
  try {
    // Get the Formspree form ID
    const formId = getFormspreeFormId()

    if (!formId) {
      throw new Error("Formspree form ID is not configured")
    }

    const formspreeEndpoint = `https://formspree.io/f/${formId}`

    // Convert FormData to plain object if needed
    const data = formData instanceof FormData ? Object.fromEntries(formData.entries()) : formData

    // Add additional metadata for tracking
    const enhancedData = {
      ...data,
      submittedAt: new Date().toISOString(),
      // Add brokerage referral tracking
      brokerageReferral: data.fromBrokerageLink ? "Yes" : "No",
      brokerageSource: data.brokerAgency || "None",
      brokerageDepartment: data.brokerDepartment || "None",
    }

    // Send data to Formspree
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(enhancedData),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Form submission failed")
    }

    return {
      success: true,
      message: "Thank you for your message! We will get back to you soon.",
    }
  } catch (error) {
    console.error("Error submitting form:", error)
    return {
      success: false,
      message: "There was an error submitting your message. Please try again later.",
    }
  }
}
