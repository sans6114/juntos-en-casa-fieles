/**
 * Resolución del día de evento. Única fuente para el escáner de QR y para el
 * check manual de la puerta: si cada uno resolviera la fecha por su cuenta, las
 * dos copias se desvían y una acredita en un día que la otra rechaza.
 *
 * El evento acredita SOLO viernes y sábado. El domingo no hay acreditación.
 */

import type { DiaEvento } from "@/interfaces/asistencia"

export type { DiaEvento }

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

/** Hora local de Argentina, para los avisos de "ya acreditado". */
export function formatearHoraArgentina(fecha: Date): string {
  return fecha.toLocaleTimeString("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    hour: "2-digit",
    minute: "2-digit",
    // 24 horas, igual que la grilla: "14:32" no se confunde con nada en la
    // puerta, y mantiene un solo formato de hora en toda la aplicacion.
    hour12: false,
  })
}

export class FechasEventoNoConfiguradas extends Error {
  constructor(detalle?: string) {
    super(detalle ?? "Faltan las variables de entorno EVENT_DAY_1 y/o EVENT_DAY_2")
    this.name = "FechasEventoNoConfiguradas"
  }
}

/**
 * Formato exacto, y no "algo que parezca una fecha".
 *
 * Todo este módulo compara fechas como STRINGS, y eso solo ordena bien en
 * `YYYY-MM-DD` con ceros a la izquierda. Una variable cargada como "18/09/2026"
 * no rompe nada visible: hace que `diaEventoDeHoy` nunca coincida —el escáner
 * rechaza todo el día del evento— mientras `diaYaOcurrio` la lee como pasada y
 * habilita la corrección manual. El equipo ve "puedo marcar a mano pero no
 * escanear" y se pone a buscar un bug en el escáner.
 *
 * Verificado: `"18/09/2026" <= "2026-09-14"` es `true`, porque compara "1"
 * contra "2". Y `"2026-9-18"` sin cero tampoco coincide nunca con la fecha de
 * hoy, así que el 18 la puerta no acreditaría a nadie.
 */
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/**
 * Tirar cuando falta una variable es deliberado. Antes esto tenía defaults
 * hardcodeados (`process.env.EVENT_DAY_1 || "2026-09-18"`): si la variable no
 * estaba en producción, el sistema acreditaba contra una fecha escrita en el
 * código y nadie se enteraba hasta tener gente parada en la puerta.
 */
function fechasEvento(): Record<DiaEvento, string> {
  const dia1 = leerFecha("EVENT_DAY_1")
  const dia2 = leerFecha("EVENT_DAY_2")

  return { 1: dia1, 2: dia2 }
}

/**
 * El valor va en el mensaje a propósito. Termina en `console.error` del
 * servidor, no en la pantalla del colaborador, y sin él el administrador lee
 * "configuración incompleta" y no sabe si la variable falta o está mal escrita.
 * No es un dato sensible: es una fecha.
 */
function leerFecha(nombre: "EVENT_DAY_1" | "EVENT_DAY_2"): string {
  const valor = process.env[nombre]

  if (!valor) throw new FechasEventoNoConfiguradas(`Falta la variable de entorno ${nombre}`)

  if (!FORMATO_FECHA.test(valor)) {
    throw new FechasEventoNoConfiguradas(
      `${nombre} tiene que ser YYYY-MM-DD y vino "${valor}"`
    )
  }

  return valor
}

/** La fecha configurada para ese día, en YYYY-MM-DD. */
export function fechaDelDia(dia: DiaEvento): string {
  return fechasEvento()[dia]
}

/**
 * ¿Ese día ya empezó? Comparación de strings, igual que `diaEventoDeHoy`: los
 * dos lados vienen en YYYY-MM-DD, así que `<=` ordena cronológicamente sin
 * parsear fechas ni arrastrar zonas horarias.
 *
 * Existe porque el ajuste manual necesita distinguir "corregir" de "adivinar":
 * un día que todavía no llegó no se puede corregir, no ocurrió nada que
 * corregir.
 */
export function diaYaOcurrio(dia: DiaEvento, ahora: Date = new Date()): boolean {
  return fechaDelDia(dia) <= fechaHoyArgentina(ahora)
}

/** `null` cuando hoy no es un día de acreditación. */
export function diaEventoDeHoy(ahora: Date = new Date()): DiaEvento | null {
  const hoy = fechaHoyArgentina(ahora)
  const fechas = fechasEvento()

  if (hoy === fechas[1]) return 1
  if (hoy === fechas[2]) return 2

  return null
}
