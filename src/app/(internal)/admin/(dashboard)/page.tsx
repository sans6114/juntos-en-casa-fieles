import { redirect } from "next/navigation"
import { requireSession } from "@/lib/auth-guards"

export default async function AdminPage() {
  const user = await requireSession()
  if (user.rol === "COLABORADOR") {
    redirect("/admin/inscripciones/grilla")
  }
  redirect("/admin/inscripciones")
}
