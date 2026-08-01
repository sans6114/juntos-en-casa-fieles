import { AdminHeader } from "@/components/admin/admin-sidebar"
import { InscripcionesTable } from "@/components/admin/inscripciones-table"
import { inscripciones } from "@/lib/mock-data/inscripciones"

export default function InscripcionesGrillaPage() {
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
