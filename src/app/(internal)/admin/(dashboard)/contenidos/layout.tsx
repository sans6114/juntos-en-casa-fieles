import { requireAdmin } from "@/lib/auth-guards"

export default async function ContenidosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireAdmin()
  return children
}
