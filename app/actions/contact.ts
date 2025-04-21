"use server"

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
  // Add agent information
  agentId?: string
  agentName?: string
  agentClassification?: string
  // Track if this came from a brokerage link
  fromBrokerageLink?: boolean
  // Add referral expiration date
  referralExpirationDate?: string
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

    // Process brokerage information
    const brokerageReferral = data.fromBrokerageLink ? "Yes" : "No"
    const brokerageSource = data.brokerAgency || "None"

    // Ensure department is never N/A
    let brokerageDepartment = "None"
    if (data.brokerDepartment && data.brokerDepartment !== "N/A") {
      brokerageDepartment = data.brokerDepartment
    } else if (data.brokerAgency) {
      brokerageDepartment = "Unknown Department"
    }

    // Process agent information
    const agentReferral = data.agentId ? "Yes" : "No"
    const agentName = data.agentName || "None"
    const agentClassification = data.agentClassification || "None"

    // Ensure referral expiration date is never N/A and is an actual date
    let referralExpirationDate = "No Referral"
    if (data.referralExpirationDate && data.referralExpirationDate !== "N/A") {
      referralExpirationDate = data.referralExpirationDate
    } else if (data.fromBrokerageLink) {
      // Calculate actual date 15 days from now
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + 15)
      referralExpirationDate = expirationDate.toLocaleDateString("en-PH", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    }

    // Add additional metadata for tracking
    const enhancedData = {
      ...data,
      submittedAt: new Date().toISOString(),
      // Add brokerage referral tracking with improved values
      brokerageReferral,
      brokerageSource,
      brokerageDepartment,
      // Add agent referral tracking
      agentReferral,
      agentName,
      agentClassification,
      // Add referral expiration date with improved value
      referralExpirationDate,
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
