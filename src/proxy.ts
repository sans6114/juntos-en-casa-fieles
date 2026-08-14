import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { auth } from '@/auth.config';
import {
  ADMIN_PATHS,
  canAccessAdminPath,
  defaultHomeForRole,
  isPublicAdminAuthPath,
} from '@/lib/admin-access';

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  //evaluamos solo si la ruta es de admin
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next()
  }

  const session = await auth()
  const isLoggedIn = !!session?.user
  const role = session?.user?.rol

  if (!isLoggedIn && !isPublicAdminAuthPath(pathname)) {
    //si no esta logueado y no es una ruta de auth pública, redireccionamos a login
    return NextResponse.redirect(new URL(ADMIN_PATHS.login, request.url))
  }

  if (isLoggedIn && isPublicAdminAuthPath(pathname) && role) {
    if (pathname === ADMIN_PATHS.login && request.nextUrl.searchParams.has("error")) {
      return NextResponse.next()
    }

    const dest = defaultHomeForRole(role)
    return NextResponse.redirect(new URL(dest, request.url))
  }

  // Colaborador: solo grilla + detalle de inscripción
  if (isLoggedIn && role && !canAccessAdminPath(role, pathname)) {
    // si esta logueado, tiene un rol y no tiene acceso a la ruta de admin, redireccionamos a la ruta de colaborador
    return NextResponse.redirect(
      new URL(ADMIN_PATHS.colaboradorHome, request.url)
    )
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
