import {
  esVidaSobrenatural,
  VIDA_SOBRENATURAL_NOMBRE,
} from "@/lib/congregacion/vida-sobrenatural"

export type InscripcionMetricRow = {
  edad: number
  congregacionId: string | null
  congregacionNombre: string | null
  congregacionEstado: "PENDIENTE" | "APROBADA" | null
  sinCongregacion: boolean
  /** Hora de acreditación de cada día, o `null` si esa persona no vino. */
  asistenciaDia1: string | null
  asistenciaDia2: string | null
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

/**
 * Los tres grupos de asistencia, en ORDEN FIJO —nunca ordenados por tamaño—.
 *
 * Las tarjetas se leen por POSICIÓN: durante el evento alguien mira la pantalla
 * cada media hora, y si se reordenaran solas cuando un grupo pasa a otro, esa
 * persona leería la tarjeta equivocada sin enterarse.
 */
export const GRUPOS_ASISTENCIA = [
  "vidaSobrenatural",
  "otraCongregacion",
  "sinCongregacion",
] as const

export type GrupoAsistencia = (typeof GRUPOS_ASISTENCIA)[number]

/**
 * El nombre de la iglesia propia sale de `VIDA_SOBRENATURAL_NOMBRE` y no de un
 * literal acá: el reconocimiento y el texto que se muestra tienen que venir del
 * MISMO archivo. Si no, un admin renombra la fila y la tarjeta pasa a titular
 * una cosa mientras clasifica por otra.
 */
export const ETIQUETA_GRUPO: Record<GrupoAsistencia, string> = {
  vidaSobrenatural: VIDA_SOBRENATURAL_NOMBRE,
  otraCongregacion: "Otra congregación",
  // Mismo vocabulario que la barra del chart de congregaciones.
  sinCongregacion: "Sin congregación",
}

export type AsistenciaDeGrupo = {
  grupo: GrupoAsistencia
  etiqueta: string
  inscriptos: number
  /** Qué parte de la base TOTAL de inscriptos representa este grupo. */
  participacion: number
  dia1: { total: number; porcentaje: number }
  dia2: { total: number; porcentaje: number }
}

/**
 * A qué grupo pertenece la fila, o `null` cuando NO hay congregación que
 * atribuir: alguien que declaró iglesia y se quedó sin FK porque un admin se la
 * rechazó.
 *
 * Ese `null` no es "sin congregación" y no se fusiona con ese grupo —esa fusión
 * ya fue un bug real: metía en la barra de nuevos a gente que sí declaró
 * iglesia—, ni se reparte entre los otros dos. Se cuenta aparte y la UI lo dice
 * cuando es mayor que cero.
 *
 * El orden de los chequeos sigue la invariante del esquema (`sinCongregacion`
 * en true implica `congregacionId` en null), así que mirar el flag primero no
 * puede tapar una FK real.
 *
 * Reconoce a la iglesia propia por NOMBRE y no por id, igual que el resto del
 * proyecto: el id cambia si un admin rehace la fila, el nombre normalizado no.
 */
function grupoDeAsistencia(item: InscripcionMetricRow): GrupoAsistencia | null {
  if (item.sinCongregacion) return "sinCongregacion"
  if (!item.congregacionId) return null

  // `?? ""` y no una rama aparte: una FK con nombre nulo sigue siendo una
  // congregación —el chart la pinta como "Sin nombre"—, solo que no es la propia.
  return esVidaSobrenatural(item.congregacionNombre ?? "")
    ? "vidaSobrenatural"
    : "otraCongregacion"
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

  // Cuenta el dato AFIRMADO por el visitante ("Soy nuevo"), no la ausencia de
  // FK. Antes se infería con `!congregacionId && !congregacionNombre`, y esa
  // heuristica metia en la barra "Sin congregacion" a gente que si declaro
  // iglesia pero se quedo sin FK porque un admin se la rechazo.
  const conteoPorGrupo: Record<
    GrupoAsistencia,
    { inscriptos: number; dia1: number; dia2: number }
  > = {
    vidaSobrenatural: { inscriptos: 0, dia1: 0, dia2: 0 },
    otraCongregacion: { inscriptos: 0, dia1: 0, dia2: 0 },
    sinCongregacion: { inscriptos: 0, dia1: 0, dia2: 0 },
  }

  /** Filas sin congregación atribuible. Ver `grupoDeAsistencia`. */
  let sinDatoDeCongregacion = 0

  for (const item of data) {
    const grupo = grupoDeAsistencia(item)

    if (grupo === null) {
      sinDatoDeCongregacion += 1
    } else {
      const conteo = conteoPorGrupo[grupo]
      conteo.inscriptos += 1
      // Los dos días se cuentan en el recorrido que YA existía: tres grupos por
      // dos días serían seis `filter` más sobre las mismas quinientas filas.
      if (item.asistenciaDia1) conteo.dia1 += 1
      if (item.asistenciaDia2) conteo.dia2 += 1
    }

    // Desde acá, el mapa de congregaciones del chart, sin cambios. Se mantienen
    // estos dos guards en vez de reusar `grupo`: son los que le estrechan el
    // tipo a `congregacionId` y evitan un `!` más abajo.
    if (item.sinCongregacion) continue

    // Sin FK no hay congregacion que atribuir: es una fila sin dato (nadie marco
    // nada, o el admin le rechazo la congregacion). No suma a ninguna barra ni a
    // "Sin congregacion", que significa algo distinto y mas fuerte.
    if (!item.congregacionId) continue

    const existing = congregacionMap.get(item.congregacionId)

    if (existing) {
      existing.total += 1
    } else {
      congregacionMap.set(item.congregacionId, {
        id: item.congregacionId,
        nombre: item.congregacionNombre ?? "Sin nombre",
        total: 1,
        estado: item.congregacionEstado,
      })
    }
  }

  const porCongregacion = Array.from(congregacionMap.values()).sort(
    (a, b) => b.total - a.total
  )

  /**
   * Cuánta de la gente que se anotó efectivamente vino, por día.
   *
   * El denominador es el TOTAL de inscriptos —no los que vinieron el día 1—
   * porque esa es la pregunta que se hace quien supervisa: de los que se
   * anotaron, cuántos aparecieron. Comparar el día 2 contra el día 1 responde
   * otra cosa (cuántos volvieron), y para eso están los dos porcentajes juntos:
   * la diferencia entre ambos se lee sola.
   */
  /**
   * Porcentaje entero, y 0 cuando no hay base.
   *
   * Es el mismo guard que ya tenía la asistencia general, generalizado para que
   * sirva también por grupo: un grupo sin inscriptos daría 0/0 = NaN, y un
   * "NaN%" en la pantalla no se distingue de un bug de datos.
   */
  const porcentaje = (parte: number, base: number) =>
    base === 0 ? 0 : Math.round((parte / base) * 100)

  const vinieronDia1 = data.filter((item) => item.asistenciaDia1).length
  const vinieronDia2 = data.filter((item) => item.asistenciaDia2).length

  const asistencia = {
    dia1: { total: vinieronDia1, porcentaje: porcentaje(vinieronDia1, total) },
    dia2: { total: vinieronDia2, porcentaje: porcentaje(vinieronDia2, total) },
  }

  /**
   * La misma asistencia, abierta por grupo.
   *
   * El denominador de cada día es el PROPIO grupo —no el total del evento, no
   * los que vinieron—: la pregunta es "de los de VS que se anotaron, cuántos
   * aparecieron", y comparar 372 contra 61 en crudo no responde nada.
   *
   * `participacion` es la otra lectura, la que el porcentaje grande no da: qué
   * parte de la base total es el grupo. Va al detalle y no al titular, porque
   * son dos denominadores distintos y dos porcentajes grandes uno al lado del
   * otro se confunden.
   */
  const asistenciaPorGrupo: AsistenciaDeGrupo[] = GRUPOS_ASISTENCIA.map((grupo) => {
    const { inscriptos, dia1, dia2 } = conteoPorGrupo[grupo]

    return {
      grupo,
      etiqueta: ETIQUETA_GRUPO[grupo],
      inscriptos,
      participacion: porcentaje(inscriptos, total),
      dia1: { total: dia1, porcentaje: porcentaje(dia1, inscriptos) },
      dia2: { total: dia2, porcentaje: porcentaje(dia2, inscriptos) },
    }
  })

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
    // Derivado del mismo conteo que alimenta las tarjetas, y no de un contador
    // suelto: dos contadores sobre el MISMO predicado es exactamente como se
    // desincronizan con el tiempo.
    sinCongregacion: conteoPorGrupo.sinCongregacion.inscriptos,
    crecimiento,
    asistencia,
    asistenciaPorGrupo,
    sinDatoDeCongregacion,
    congregacionesActivas,
    eventoAnterior: inscripcionesEventoAnterior,
  }
}

export const historialInscripciones = [
  { evento: "Evento anterior", total: inscripcionesEventoAnterior },
]
