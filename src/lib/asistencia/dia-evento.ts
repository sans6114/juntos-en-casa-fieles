/**
 * Resolución del día de evento. Única fuente para el escáner de QR y para el
 * check manual de la puerta: si cada uno resolviera la fecha por su cuenta, las
 * dos copias se desvían y una acredita en un día que la otra rechaza.
 *
 * El evento acredita SOLO viernes y sábado. El domingo no hay acreditación.
 */

import type { DiaEvento } from "@/interfaces/asistencia"
import { siteConfig } from "@/lib/seo/site"

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

export class FechasEventoInvalidas extends Error {
  constructor(detalle: string) {
    super(detalle)
    this.name = "FechasEventoInvalidas"
  }
}

/**
 * Las fechas en que se acredita. Literales, no variables de entorno.
 *
 * Estuvieron en `EVENT_DAY_1`/`EVENT_DAY_2` y se trajeron acá por una razón
 * medida: NO son secretos —están publicadas en el sitio— y lo único que ganaba
 * tenerlas en el entorno era la posibilidad de escribirlas mal sin que nadie las
 * revise. Un "18/09/2026" cargado en el panel hacía que el escáner rechazara
 * todo el día del evento mientras la corrección manual se habilitaba, y eso no
 * se descubría hasta tener gente en la puerta. Acá pasan por el PR, por el
 * typecheck y por la misma revisión que el resto del código, y valen lo mismo
 * en todos los entornos sin que nadie tenga que acordarse de sincronizarlos.
 *
 * Además las fechas del evento YA eran literales: `siteConfig.eventStartsAt` y
 * `cronogramaDias`. Las de acreditación eran la excepción rara.
 *
 * El evento dura TRES días. Acá van solo los dos que se acredita: el domingo no
 * hay acreditación.
 */
const FECHAS_ACREDITACION: Record<DiaEvento, string> = {
  1: "2026-09-18",
  2: "2026-09-19",
}

/**
 * Formato exacto, y no "algo que parezca una fecha".
 *
 * Todo este módulo compara fechas como STRINGS, y eso solo ordena bien en
 * `YYYY-MM-DD` con ceros a la izquierda. Un "18/09/2026" no rompe nada visible:
 * hace que `diaEventoDeHoy` nunca coincida —el escáner rechaza todo el día del
 * evento— mientras `diaYaOcurrio` la lee como pasada y habilita la corrección
 * manual. El equipo ve "puedo marcar a mano pero no escanear" y se pone a
 * buscar un bug en el escáner. Pasó de verdad, con la variable de entorno.
 *
 * Verificado: `"18/09/2026" <= "2026-09-14"` es `true`, porque compara "1"
 * contra "2". Y `"2026-9-18"` sin cero tampoco coincide nunca con la fecha de
 * hoy, así que el 18 la puerta no acreditaría a nadie.
 */
const FORMATO_FECHA = /^\d{4}-\d{2}-\d{2}$/

/**
 * Valida y devuelve las fechas. Con literales la validación no protege de un
 * panel mal cargado sino de un typo que entre por el código, que es el único
 * camino que queda. Sigue siendo barata y los dos errores tienen tratamiento en
 * pantalla: el escáner dice "configuración incompleta" y la grilla pinta el
 * cartel rojo, en vez de portarse raro sin explicar por qué.
 *
 * El detalle va al `console.error` del servidor, no a la pantalla del
 * colaborador. Una fecha no es dato sensible, y sin él quien mira los logs no
 * sabe cuál de las dos está mal.
 */
function fechasEvento(): Record<DiaEvento, string> {
  for (const dia of DIAS_EVENTO) {
    const valor = FECHAS_ACREDITACION[dia]
    if (!FORMATO_FECHA.test(valor)) {
      throw new FechasEventoInvalidas(
        `La fecha del día ${dia} tiene que ser YYYY-MM-DD y es "${valor}"`
      )
    }
  }

  // El día 1 de acreditación y el inicio publicado del evento son la MISMA
  // fecha por definición: la acreditación es lo primero que pasa. Están en dos
  // archivos porque cada uno sirve a algo distinto —uno al SEO y al countdown,
  // otro a la puerta— y este chequeo existe para que mover uno sin el otro se
  // note acá y no el 18 con el sitio anunciando un día y la puerta acreditando
  // otro.
  const inicioPublicado = siteConfig.eventStartsAt.slice(0, 10)
  if (FECHAS_ACREDITACION[1] !== inicioPublicado) {
    throw new FechasEventoInvalidas(
      `El día 1 de acreditación (${FECHAS_ACREDITACION[1]}) no coincide con siteConfig.eventStartsAt (${inicioPublicado})`
    )
  }

  return FECHAS_ACREDITACION
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
