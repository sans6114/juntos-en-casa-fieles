import { redirect } from "next/navigation"
import { ADMIN_PATHS } from "@/lib/admin-access"
import { requireAdmin } from "@/lib/auth-guards"

export default async function AdminPage() {
  await requireAdmin()
  redirect(ADMIN_PATHS.adminHome)
}
