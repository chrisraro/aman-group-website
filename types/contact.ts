export interface ContactInquiry {
  id: string
  name: string
  email: string
  phone?: string | null
  projectLocation: string
  propertyInterest: string
  modelHousesSeries?: string | null
  modelHousesUnit?: string | null
  message: string
  status: "new" | "in-progress" | "completed"
  created_at: string
  updated_at?: string | null
  // Add scheduling fields
  scheduledViewingDate?: string | null
  scheduledViewingTime?: string | null
  scheduledViewingEventId?: string | null
}
