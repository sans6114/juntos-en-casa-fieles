export type InscripcionMetricRow = {
  edad: number
  congregacionId: string | null
  congregacionNombre: string | null
  congregacionEstado: "PENDIENTE" | "APROBADA" | null
}

/** Total de inscriptos del evento anterior (dato histórico real). */
export const inscripcionesEventoAnterior: number = 559
export enum AgeRangeKeys {
  adolescentes = "12-18",
  jovenes = "18-28",
  masDe28 = "+28",
}


export function getAgeRange(edad: number): AgeRangeKeys { 
  let range: AgeRangeKeys =  AgeRangeKeys.adolescentes;
  if (edad >= 18 && edad <= 28) range = AgeRangeKeys.jovenes;
  if (edad > 28) range = AgeRangeKeys.masDe28;
  return range;
}

export function getInscripcionesMetrics(data: InscripcionMetricRow[]) {
  const total = data.length
  const edadPromedio =
    total === 0 ? 0 : Math.round(data.reduce((sum, item) => sum + item.edad, 0) / total)

  const ageRanges = data.reduce(
    (acc, item) => {
      const range = getAgeRange(item.edad)
      acc[range] += 1
      return acc
    },
    { [AgeRangeKeys.adolescentes]: 0, [AgeRangeKeys.jovenes]: 0, [AgeRangeKeys.masDe28]: 0 } as Record<AgeRangeKeys, number>
  )

  const congregacionMap = new Map<
    string,
    { id: string | null; nombre: string; total: number; estado: "PENDIENTE" | "APROBADA" | null }
  >()

  let sinCongregacion = 0

  for (const item of data) {
    if (!item.congregacionId && !item.congregacionNombre) {
      sinCongregacion += 1
      continue
    }

    // Agrupar primero por FK (fuente de verdad); solo cae al string legacy de
    // congregacionNombre para filas anteriores a la normalizacion, que no
    // tienen FK. Esas filas legacy quedan con estado: null (no cuentan en el KPI).
    const key = item.congregacionId ?? item.congregacionNombre ?? "unknown"
    const nombre = item.congregacionNombre ?? "Sin nombre"
    const existing = congregacionMap.get(key)

    if (existing) {
      existing.total += 1
    } else {
      congregacionMap.set(key, {
        id: item.congregacionId,
        nombre,
        total: 1,
        estado: item.congregacionId ? item.congregacionEstado : null,
      })
    }
  }

  const porCongregacion = Array.from(congregacionMap.values()).sort(
    (a, b) => b.total - a.total
  )

  const crecimiento =
    inscripcionesEventoAnterior === 0
      ? 0
      : Math.round(
          ((total - inscripcionesEventoAnterior) / inscripcionesEventoAnterior) * 100
        )

  // PENDIENTE y las filas legacy (estado: null) siguen renderizando como barra
  // en el chart admin, pero no suman al KPI de congregaciones activas.
  const congregacionesActivas = porCongregacion.filter((item) => item.estado === "APROBADA").length

  return {
    total,
    edadPromedio,
    ageRanges,
    porCongregacion,
    sinCongregacion,
    crecimiento,
    congregacionesActivas,
    eventoAnterior: inscripcionesEventoAnterior,
  }
}

export const historialInscripciones = [
  { evento: "Evento anterior", total: inscripcionesEventoAnterior },
]
