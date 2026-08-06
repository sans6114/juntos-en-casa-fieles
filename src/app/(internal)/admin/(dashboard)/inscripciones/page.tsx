import { Building2, TrendingUp, UserRound, Users } from "lucide-react"
import { AdminHeader } from "@/components/admin/admin-sidebar"
import { AgeRangesChart } from "@/components/admin/age-ranges-chart"
import { CongregationsChart } from "@/components/admin/congregations-chart"
import { GrowthMetric } from "@/components/admin/growth-metric"
import { StatCard } from "@/components/admin/stat-card"
import {
  getInscripcionesMetrics,
  historialInscripciones,
} from "@/lib/mock-data/inscripciones"
import { obtenerInscripciones } from "@/actions"

export default async function InscripcionesGeneralPage() {
  const data = await obtenerInscripciones()
  // Adaptamos el helper para usar data real en las métricas, manteniendo el historial como mock para demostración
  const metrics = getInscripcionesMetrics(data as any)

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
          />
          <StatCard
            title="Edad promedio"
            value={`${metrics.edadPromedio} años`}
            description="Promedio de edad de los inscriptos"
            icon={UserRound}
          />
          <StatCard
            title="Crecimiento"
            value={`${metrics.crecimiento >= 0 ? "+" : ""}${metrics.crecimiento}%`}
            description={`Comparado con ${metrics.eventoAnterior} del evento anterior`}
            icon={TrendingUp}
            trend={{
              value: metrics.crecimiento,
              label: "vs evento anterior",
              positive: metrics.crecimiento >= 0,
            }}
          />
          <StatCard
            title="Congregaciones activas"
            value={metrics.congregacionesActivas}
            description="Sedes con al menos una inscripción"
            icon={Building2}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AgeRangesChart data={metrics.ageRanges} />
          <CongregationsChart
            data={metrics.porCongregacion}
            sinCongregacion={metrics.sinCongregacion}
          />
        </div>

        <GrowthMetric
          totalActual={metrics.total}
          totalAnterior={metrics.eventoAnterior}
          crecimiento={metrics.crecimiento}
          historial={historialInscripciones}
        />
      </div>
    </>
  )
}
