import { AdminHeader } from "@/components/admin/admin-sidebar"
import { InscripcionesTable } from "@/components/admin/inscripciones-table"
import { obtenerInscripciones } from "@/actions"

export default async function InscripcionesGrillaPage() {
  const inscripciones = await obtenerInscripciones()

  return (
    <>
      <AdminHeader
        title="Grilla de inscripciones"
        description="Listado paginado de todas las inscripciones registradas"
      />
      <div className="flex flex-1 flex-col p-6">
        <InscripcionesTable data={inscripciones} />
      </div>
    </>
  )
}
