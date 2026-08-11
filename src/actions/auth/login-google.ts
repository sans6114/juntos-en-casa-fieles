"use server"

import { signIn } from "@/auth.config"

export async function loginAdminGoogle() {
  await signIn("google", { redirectTo: "/admin" })
}
