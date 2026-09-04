import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ContenidoForm } from "@/components/admin/contenido-form"
import { obtenerRecursosVinculables } from "@/actions"

export default async function NuevoContenidoPage() {
  const recursos = await obtenerRecursosVinculables()

  return (
    <>
      <AdminHeader
        title="Nuevo contenido"
        description="Cargá una prédica, un video o un recurso para el catálogo público"
      />
      <div className="flex flex-1 flex-col p-6">
        <ContenidoForm recursos={recursos} />
      </div>
    </>
  )
}
