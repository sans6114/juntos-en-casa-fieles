import { requireCatalogo } from "@/lib/auth-guards"

export default async function ProductosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireCatalogo()
  return children
}
