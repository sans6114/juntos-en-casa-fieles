import { requireAdmin } from "@/lib/auth-guards"

export default async function CongregacionesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return children
}
