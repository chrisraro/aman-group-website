import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// Simple admin credentials - in production, use a proper database
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "admin123", // In production, this should be hashed
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  return username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password
}

export async function createAdminSession() {
  const cookieStore = cookies()
  cookieStore.set("admin-session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  })
}

export async function getAdminSession() {
  try {
    const cookieStore = cookies()
    return cookieStore.get("admin-session")?.value === "authenticated"
  } catch (error) {
    console.error("Error getting admin session:", error)
    return false
  }
}

export async function clearAdminSession() {
  const cookieStore = cookies()
  cookieStore.set("admin-session", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 0,
    path: "/",
  })
}

export async function requireAdmin() {
  const isAuthenticated = await getAdminSession()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }
}
