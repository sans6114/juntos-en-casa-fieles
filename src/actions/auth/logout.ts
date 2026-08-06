"use server"

import { signOut } from "@/auth.config"

export async function logoutAdmin() {
  await signOut({ redirectTo: "/admin/login" })
}
