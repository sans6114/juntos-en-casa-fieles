import { AdminHeader } from "@/components/admin/admin-sidebar"
import { obtenerAsistencias } from "@/actions/inscripcion/obtener-asistencias"
import { requireSession } from "@/lib/auth-guards"
import { AsistenciasClient } from "./asistencias-client"

export const metadata = {
  title: "Asistencias | Juntos en Casa",
}

export default async function AsistenciasPage() {
  await requireSession()

  // Execute in parallel to avoid waterfalls
  const [dia1, dia2, dia3] = await Promise.all([
    obtenerAsistencias(1),
    obtenerAsistencias(2),
    obtenerAsistencias(3),
  ])

  return (
    <>
      <AdminHeader
        title="Asistencias"
        description="Listado de asistentes que confirmaron su llegada por día."
      />
      <div className="flex-1 p-4 md:p-6 lg:p-8">
        <AsistenciasClient dia1={dia1} dia2={dia2} dia3={dia3} />
      </div>
    </>
  )
}
