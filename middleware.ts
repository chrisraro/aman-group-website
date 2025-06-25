import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip middleware for login page and its assets
  if (pathname === "/admin/login" || pathname.startsWith("/admin/login/")) {
    return NextResponse.next()
  }

  // Only apply middleware to admin routes (except login)
  if (pathname.startsWith("/admin")) {
    const adminSession = request.cookies.get("admin-session")?.value

    if (!adminSession || adminSession !== "authenticated") {
      return NextResponse.redirect(new URL("/admin/login", request.url))
    }
  }

  // Add CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()
    response.headers.set("Access-Control-Allow-Origin", "*")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization")
    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}
