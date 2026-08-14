import { Building2, UserRound, Users } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-sidebar"
import { CongregationsChart } from "@/components/admin/congregations-chart"
import { GrowthStatCard } from "@/components/admin/growth-stat-card"
import { StatCard } from "@/components/admin/stat-card"
import { getInscripcionesMetrics } from "@/lib/data/inscripciones"
import { obtenerInscripciones } from "@/actions"
import { requireAdmin } from "@/lib/auth-guards"

export default async function InscripcionesGeneralPage() {
  await requireAdmin()
  const data = await obtenerInscripciones()
  const metrics = getInscripcionesMetrics(data)

  return (
    <>
      <AdminHeader
        title="Vista general"
        description="Resumen de inscripciones del evento actual"
      />
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title="Total inscriptos"
            value={metrics.total}
            description="Personas registradas en el evento"
            icon={Users}
            accent="red"
          />
          <StatCard
            title="Edad promedio"
            value={`${metrics.edadPromedio} años`}
            description="Promedio de edad de los inscriptos"
            icon={UserRound}
          />
          <GrowthStatCard
            totalActual={metrics.total}
            totalAnterior={metrics.eventoAnterior}
            crecimiento={metrics.crecimiento}
          />
          <StatCard
            title="Congregaciones activas"
            value={metrics.congregacionesActivas}
            description="Sedes con al menos una inscripción"
            icon={Building2}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <StatCard
            title="12–18 años"
            value={metrics.ageRanges["12-18"]}
            description="Inscriptos en el rango adolescente"
            icon={Users}
            accent="red"
          />
          <StatCard
            title="18–28 años"
            value={metrics.ageRanges["18-28"]}
            description="Inscriptos en el rango joven"
            icon={Users}
          />
          <StatCard
            title="+28 años"
            value={metrics.ageRanges["+28"]}
            description="Inscriptos mayores de 28"
            icon={Users}
          />
        </div>

        <CongregationsChart
          data={metrics.porCongregacion}
          sinCongregacion={metrics.sinCongregacion}
        />
      </div>
    </>
  )
}
