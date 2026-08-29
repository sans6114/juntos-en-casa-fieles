import { AdminHeader } from "@/components/admin/admin-sidebar"
import { ContenidoForm } from "@/components/admin/contenido-form"

export default function NuevoContenidoPage() {
  return (
    <>
      <AdminHeader
        title="Nuevo contenido"
        description="Cargá una prédica, un video o un recurso para el catálogo público"
      />
      <div className="flex flex-1 flex-col p-6">
        <ContenidoForm />
      </div>
    </>
  )
}
