"use client"

import { useState } from "react"
import { API_ENDPOINTS } from "@/lib/constants"

export interface ContactFormData {
  name: string
  email: string
  phone?: string
  projectLocation: string
  propertyInterest: string
  modelHousesSeries?: string
  modelHousesUnit?: string
  message: string
  hasInteractedWithBroker?: boolean
  brokerName?: string
  brokerAgency?: string
  brokerDepartment?: string
  fromBrokerageLink?: boolean
}

export interface ContactResponse {
  success: boolean
  message: string
}

export function useContact() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [response, setResponse] = useState<ContactResponse | null>(null)

  const submitContactForm = async (formData: ContactFormData): Promise<ContactResponse> => {
    setIsSubmitting(true)
    setResponse(null)

    try {
      const res = await fetch(API_ENDPOINTS.contact, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await res.json()
      setResponse(data)
      return data
    } catch (error) {
      const errorResponse = {
        success: false,
        message: "An error occurred. Please try again later.",
      }
      setResponse(errorResponse)
      return errorResponse
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    submitContactForm,
    isSubmitting,
    response,
  }
}
