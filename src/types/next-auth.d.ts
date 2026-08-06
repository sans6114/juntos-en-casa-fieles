import type { Role } from "../../generated/client"
import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email: string
      nombre: string
      rol: Role
    } & DefaultSession["user"]
  }

  interface User {
    id: string
    email: string
    nombre: string
    rol: Role
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    data?: {
      id: string
      email: string
      nombre: string
      rol: Role
    }
  }
}
