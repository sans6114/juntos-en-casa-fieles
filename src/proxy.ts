import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { auth } from "@/auth.config"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const session = await auth()
  const isLoggedIn = !!session?.user
  const isLoginPath = pathname === "/admin/login"
  const role = session?.user?.rol

  if (!isLoggedIn && !isLoginPath) {
    return NextResponse.redirect(new URL("/admin/login", request.url))
  }

  if (isLoggedIn && isLoginPath) {
    const dest =
      role === "COLABORADOR"
        ? "/admin/inscripciones/grilla"
        : "/admin/inscripciones"
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Colaborador: solo grilla + detalle de inscripción
  if (isLoggedIn && role === "COLABORADOR") {
    const allowed =
      pathname.startsWith("/admin/inscripciones/grilla") ||
      pathname.match(/^\/admin\/inscripciones\/[^/]+$/) !== null

    if (!allowed) {
      return NextResponse.redirect(
        new URL("/admin/inscripciones/grilla", request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
