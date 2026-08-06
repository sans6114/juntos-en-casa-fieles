import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import type { Role } from "../generated/client"

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

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

        if (!user || !user.activo) return null

        const valid = await bcrypt.compare(parsed.data.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          rol: user.rol,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.data = {
          id: user.id,
          email: user.email,
          nombre: (user as SessionUser).nombre,
          rol: (user as SessionUser).rol,
        } satisfies SessionUser
      }
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
