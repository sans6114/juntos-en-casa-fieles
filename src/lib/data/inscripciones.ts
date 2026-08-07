export type InscripcionMetricRow = {
  edad: number
  congregacionId: string | null
  congregacionNombre: string | null
}

/** Total de inscriptos del evento anterior (dato histórico real). */
export const inscripcionesEventoAnterior: number = 559

export type AgeRangeKey = "12-18" | "18-28" | "+28"

export function getAgeRange(edad: number): AgeRangeKey {
  if (edad >= 12 && edad < 18) return "12-18"
  if (edad >= 18 && edad <= 28) return "18-28"
  return "+28"
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
    { "12-18": 0, "18-28": 0, "+28": 0 } as Record<AgeRangeKey, number>
  )

  const congregacionMap = new Map<
    string,
    { id: string | null; nombre: string; total: number }
  >()

  let sinCongregacion = 0

  for (const item of data) {
    if (!item.congregacionId && !item.congregacionNombre) {
      sinCongregacion += 1
      continue
    }

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

  const congregacionesActivas = porCongregacion.filter((item) => item.total > 0).length

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
