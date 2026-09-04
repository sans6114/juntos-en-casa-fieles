import { requireCatalogo } from "@/lib/auth-guards"

export default async function ContenidosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireCatalogo()
  return children
}
