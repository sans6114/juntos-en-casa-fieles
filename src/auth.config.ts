import NextAuth, { CredentialsSignin } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import Google from "next-auth/providers/google"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import type { Role } from "../generated/client"

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
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email },
          select: { activo: true },
        })
        return Boolean(dbUser?.activo)
      }
      return true
    },
    async jwt({ token, user }) {
      if (user) {
        const candidate = user as Partial<SessionUser>
        if (candidate.id && candidate.rol) {
          token.data = {
            id: candidate.id,
            email: user.email as string,
            nombre: candidate.nombre as string,
            rol: candidate.rol,
          } satisfies SessionUser
          return token
        }

        if (user.email) {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { id: true, email: true, nombre: true, rol: true, activo: true },
          })
          if (dbUser && dbUser.activo) {
            token.data = {
              id: dbUser.id,
              email: dbUser.email,
              nombre: dbUser.nombre,
              rol: dbUser.rol,
            } satisfies SessionUser
          }
        }
        return token
      }

      const data = token.data as SessionUser | undefined
      if (!data?.id) return token

      const dbUser = await prisma.user.findUnique({
        where: { id: data.id },
        select: { id: true, email: true, nombre: true, rol: true, activo: true },
      })

      if (!dbUser || !dbUser.activo) {
        delete token.data
        return token
      }

      token.data = {
        id: dbUser.id,
        email: dbUser.email,
        nombre: dbUser.nombre,
        rol: dbUser.rol,
      } satisfies SessionUser

      return token
    },
    session({ session, token }) {
      if (token.data) {
        const data = token.data as SessionUser
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
