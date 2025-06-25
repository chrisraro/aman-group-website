"use server"

import { verifyAdmin, createAdminSession, clearAdminSession } from "@/lib/auth"
import { redirect } from "next/navigation"

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string
  const password = formData.get("password") as string

  if (!username || !password) {
    return { error: "Username and password are required" }
  }

  const isValid = await verifyAdmin(username, password)

  if (!isValid) {
    return { error: "Invalid credentials" }
  }

  await createAdminSession()
  redirect("/admin")
}

export async function logoutAction() {
  await clearAdminSession()
  redirect("/admin/login")
}
