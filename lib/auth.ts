import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import bcrypt from "bcryptjs"

// Simple admin credentials - in production, use a proper database
const ADMIN_CREDENTIALS = {
  username: "admin",
  password: "$2a$12$LQv3c1yqBwEHXE.9oHOB4.K8mBuNIWED9IpOObQA8VTOAIppbdXSa", // 'admin123'
}

export async function verifyAdmin(username: string, password: string): Promise<boolean> {
  if (username !== ADMIN_CREDENTIALS.username) {
    return false
  }

  return await bcrypt.compare(password, ADMIN_CREDENTIALS.password)
}

export async function createAdminSession() {
  const cookieStore = cookies()
  cookieStore.set("admin-session", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })
}

export async function getAdminSession() {
  const cookieStore = cookies()
  return cookieStore.get("admin-session")?.value === "authenticated"
}

export async function clearAdminSession() {
  const cookieStore = cookies()
  cookieStore.delete("admin-session")
}

export async function requireAdmin() {
  const isAuthenticated = await getAdminSession()
  if (!isAuthenticated) {
    redirect("/admin/login")
  }
}
