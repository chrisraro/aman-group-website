export interface Brokerage {
  id: string
  name: string
  agency: string
  department: string
  contactEmail?: string
  contactPhone?: string
  address?: string
  status?: "Active" | "Inactive"
}

export interface Agent {
  id: string
  name: string
  agencyId: string
  department: string
  email?: string
  phone?: string
  status?: "Active" | "Inactive"
}
