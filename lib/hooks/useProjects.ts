import useSWR from "swr"
import { API_ENDPOINTS } from "@/lib/constants"

export interface Project {
  id: string
  name: string
  description: string
  location: string
  propertyType: string
  lotArea: string
  status: string
  longDescription: string
  amenities: string[]
  features: string[]
  imageUrl: string
  salesMapCanvaUrl: string
  brochureCanvaUrl: string
  developer: string
  developerColor: string
}

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then((res) => res.json())

// Custom hook for fetching all projects
export function useProjects() {
  const { data, error, isLoading, mutate } = useSWR<Project[]>(API_ENDPOINTS.projects, fetcher)

  return {
    projects: data || [],
    isLoading,
    isError: error,
    mutate,
  }
}

// Custom hook for fetching a specific project by ID
export function useProjectById(id: string | null) {
  const { data, error, isLoading } = useSWR<Project>(id ? `${API_ENDPOINTS.projects}/${id}` : null, fetcher)

  return {
    project: data,
    isLoading,
    isError: error,
  }
}

// Custom hook for fetching projects by developer
export function useProjectsByDeveloper(developer: string | null) {
  const { data, error, isLoading } = useSWR<Project[]>(
    developer ? `${API_ENDPOINTS.projects}?developer=${developer}` : null,
    fetcher,
  )

  return {
    projects: data || [],
    isLoading,
    isError: error,
  }
}
