import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import type { Role } from "../generated/client"

const SESSION_MAX_AGE = 60 * 60 * 8 // 8 horas
const SESSION_UPDATE_AGE = 60 * 60 // 1 hora

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

class AccountDisabledError extends CredentialsSignin {
  code = "account_disabled"
}

export type SessionUser = {
  id: string
  email: string
  nombre: string
  rol: Role
}

type SessionTokenData = SessionUser & {
  passwordChangedAt: number
}

const userSessionSelect = {
  id: true,
  email: true,
  nombre: true,
  rol: true,
  activo: true,
  passwordChangedAt: true,
} as const

function toSessionTokenData(user: {
  id: string
  email: string
  nombre: string
  rol: Role
  passwordChangedAt: Date
}): SessionTokenData {
  return {
    id: user.id,
    email: user.email,
    nombre: user.nombre,
    rol: user.rol,
    passwordChangedAt: user.passwordChangedAt.getTime(),
  }
}

function isSessionInvalidated(
  tokenPasswordChangedAt: number | undefined,
  dbPasswordChangedAt: Date,
  tokenIssuedAt: number | undefined
) {
  const dbTime = dbPasswordChangedAt.getTime()
  if (tokenPasswordChangedAt !== undefined) {
    return dbTime > tokenPasswordChangedAt
  }
  if (tokenIssuedAt !== undefined) {
    return dbTime > tokenIssuedAt * 1000
  }
  return false
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
        })

        if (!user) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        if (!user.activo) throw new AccountDisabledError()

        return {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
        }
      },
    }),
    Google({ allowDangerousEmailAccountLinking: false }),
  ],
  session: {
    strategy: "jwt",
    maxAge: SESSION_MAX_AGE,
    updateAge: SESSION_UPDATE_AGE,
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account?.provider === "google") {
        if (!user.email || profile?.email_verified !== true) {
          return "/admin/login?error=AccessDenied"
        }
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { activo: true },
        })
        if (!dbUser) {
          return "/admin/login?error=AccessDenied"
        }
        if (!dbUser.activo) {
          return "/admin/login?error=AccessDenied&reason=inactive"
        }
        return true
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const candidate = user as Partial<SessionUser>
        if (candidate.id && candidate.rol) {
          const dbUser = await prisma.user.findUnique({
            where: { id: candidate.id },
            select: userSessionSelect,
          })
          if (!dbUser || !dbUser.activo) {
            delete token.data
            return token
          }
          token.data = toSessionTokenData(dbUser)
          return token
        }

        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: userSessionSelect,
          })
          if (dbUser && dbUser.activo) {
            token.data = toSessionTokenData(dbUser)
          }
        }
        return token
      }

      const data = token.data as SessionTokenData | undefined
      if (!data?.id) return token

      const dbUser = await prisma.user.findUnique({
        where: { id: data.id },
        select: userSessionSelect,
      })

      if (!dbUser || !dbUser.activo) {
        delete token.data
        return token
      }

      if (isSessionInvalidated(data.passwordChangedAt, dbUser.passwordChangedAt, token.iat)) {
        delete token.data
        return token
      }

      token.data = toSessionTokenData(dbUser)

      return token
    },
    session({ session, token }) {
      if (token.data) {
        const data = token.data as SessionTokenData
        session.user.id = data.id
        session.user.email = data.email
        session.user.nombre = data.nombre
        session.user.rol = data.rol
      }
      return session
    },
  },
  trustHost: true,
})
