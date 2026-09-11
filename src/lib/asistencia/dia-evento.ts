/**
 * Resolución del día de evento. Única fuente para el escáner de QR y para el
 * check manual de la puerta: si cada uno resolviera la fecha por su cuenta, las
 * dos copias se desvían y una acredita en un día que la otra rechaza.
 *
 * El evento acredita SOLO viernes y sábado. El domingo no hay acreditación.
 */

export type DiaEvento = 1 | 2

export type CampoAsistencia = "asistenciaDia1" | "asistenciaDia2"

export const DIAS_EVENTO: readonly DiaEvento[] = [1, 2]

export function campoAsistencia(dia: DiaEvento): CampoAsistencia {
  return dia === 1 ? "asistenciaDia1" : "asistenciaDia2"
}

/** Fecha de hoy en Argentina, en formato YYYY-MM-DD para comparar como string. */
export function fechaHoyArgentina(ahora: Date = new Date()): string {
  // `es-AR` devuelve DD/MM/YYYY; se reordena a ISO para que la comparación
  // contra las variables de entorno sea un `===` y no un parseo de fechas.
  const [dia, mes, anio] = ahora
    .toLocaleDateString("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
    .split("/")

  return `${anio}-${mes}-${dia}`
}

export class FechasEventoNoConfiguradas extends Error {
  constructor() {
    super("Faltan las variables de entorno EVENT_DAY_1 y/o EVENT_DAY_2")
    this.name = "FechasEventoNoConfiguradas"
  }
}

/**
 * Tirar cuando falta una variable es deliberado. Antes esto tenía defaults
 * hardcodeados (`process.env.EVENT_DAY_1 || "2026-09-18"`): si la variable no
 * estaba en producción, el sistema acreditaba contra una fecha escrita en el
 * código y nadie se enteraba hasta tener gente parada en la puerta.
 */
function fechasEvento(): Record<DiaEvento, string> {
  const dia1 = process.env.EVENT_DAY_1
  const dia2 = process.env.EVENT_DAY_2

  if (!dia1 || !dia2) throw new FechasEventoNoConfiguradas()

  return { 1: dia1, 2: dia2 }
}

/** `null` cuando hoy no es un día de acreditación. */
export function diaEventoDeHoy(ahora: Date = new Date()): DiaEvento | null {
  const hoy = fechaHoyArgentina(ahora)
  const fechas = fechasEvento()

  if (hoy === fechas[1]) return 1
  if (hoy === fechas[2]) return 2

  return null
}
