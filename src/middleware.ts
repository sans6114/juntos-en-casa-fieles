import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifySession } from "@/lib/session"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/admin")) {
    const sessionCookie = request.cookies.get("admin_session")?.value
    const secret = process.env.SESSION_SECRET || "fallback-secret-key-1234567890"

    const isValid = sessionCookie ? await verifySession(sessionCookie, secret) : null
    const isLoginPath = pathname === "/admin/login"

    if (!isValid && !isLoginPath) {
      const loginUrl = new URL("/admin/login", request.url)
      return NextResponse.redirect(loginUrl)
    }

    if (isValid && isLoginPath) {
      const dashboardUrl = new URL("/admin/inscripciones", request.url)
      return NextResponse.redirect(dashboardUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
