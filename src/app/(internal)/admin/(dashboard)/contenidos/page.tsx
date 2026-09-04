import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ContenidosPanel } from "@/components/admin/contenidos-panel"
import { obtenerContenidos } from "@/actions"
import { requireCatalogo } from "@/lib/auth-guards"

export default async function ContenidosPage() {
  await requireCatalogo()
  const contenidos = await obtenerContenidos()

  return (
    <>
      <AdminHeader
        title="Contenidos"
        description="Prédicas, videos y recursos publicados en el catálogo público"
      />
      <div className="flex flex-1 flex-col p-6">
        <ContenidosPanel data={contenidos} />
      </div>
    </>
  )
}
