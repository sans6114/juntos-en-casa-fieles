import { cronogramaDias } from "@/components/external/cronograma/data"
import { ubicacionInfo } from "@/components/external/ubicacion/data"
import { siteConfig } from "@/lib/seo/site"
import { buildWhatsAppUrl } from "@/utils/whatsapp"

/**
 * El mensaje de WhatsApp que el colaborador le manda a cada inscripto.
 *
 * Se arma en el SERVIDOR y viaja armado en el DTO, por la misma razón que
 * `qrUrl`: el cliente no tiene por qué conocer las fechas del evento ni la
 * dirección, ni rearmarlas.
 *
 * Los tres datos salen de las fuentes que ya existen y que usa el sitio público
 * —cronograma, ubicación y `siteConfig`—, no de literales. Si se corre una fecha
 * o cambia la dirección, cambia acá también sin que nadie se acuerde de venir.
 *
 * Sí, esto importa desde `components/`, que es la dirección equivocada para un
 * módulo de `lib/`. Es a propósito: `ubicacion/data.ts` se declara a sí mismo
 * como la ÚNICA fuente de la dirección, y duplicar la calle acá para respetar
 * una capa es exactamente el error que ese archivo existe para impedir.
 */

/**
 * OJO: los días del EVENTO no son los días de ACREDITACIÓN.
 *
 * El evento es viernes, sábado y domingo. La acreditación —`EVENT_DAY_1` y
 * `EVENT_DAY_2`— es solo viernes y sábado, porque el domingo no se acredita.
 * Armar este mensaje con las variables de acreditación le diría a la gente que
 * el evento termina el sábado, que es falso y se descubre el domingo con la
 * gente que no vino.
 */
function diasDelEvento(): string {
  const etiquetas = cronogramaDias.map((dia) => dia.dayLabel.toLowerCase())

  if (etiquetas.length === 0) return ""

  // El mes va una sola vez, al final. Las etiquetas del cronograma son
  // "Viernes 18", sin mes: sin esto el mensaje dice "domingo 20" y el que lo
  // recibe tiene que adivinar de cuándo le están hablando.
  const cuando =
    etiquetas.length === 1
      ? etiquetas[0]
      : `${etiquetas.slice(0, -1).join(", ")} y ${etiquetas.at(-1)}`

  return `${cuando} de ${mesDelEvento()}`
}

function mesDelEvento(): string {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(siteConfig.eventStartsAt))
}

function horaDeInicio(): string {
  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    // 24 horas y zona explícita, igual que en el resto del proyecto: sin
    // `timeZone` el servidor formatea en UTC y anuncia las 22:00.
    hour12: false,
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(new Date(siteConfig.eventStartsAt))
}

function donde(): string {
  // `street` es `null` mientras no haya dirección confirmada. En ese caso el
  // mensaje dice el lugar y la ciudad y no inventa una calle.
  return ubicacionInfo.street
    ? `${ubicacionInfo.street}, ${ubicacionInfo.city}`
    : `${ubicacionInfo.venue}, ${ubicacionInfo.city}`
}

/**
 * El texto del recordatorio.
 *
 * Arranca identificando quién escribe porque eso es lo único que se lee en la
 * notificación, y el 20% de los inscriptos no tiene agendado el número de la
 * iglesia. Un "Hola Ana" sin remitente, viniendo de un número desconocido, se
 * descarta antes de abrirse.
 */
export function mensajeRecordatorio(nombre: string, qrUrl: string): string {
  const primerDia = cronogramaDias[0]?.dayLabel.split(" ")[0]?.toLowerCase()

  return [
    `Hola ${nombre}! Te escribimos de ${siteConfig.name} — ${siteConfig.org}.`,
    "",
    `Te esperamos el ${diasDelEvento()} en ${donde()}.` +
      (primerDia ? ` Arrancamos el ${primerDia} a las ${horaDeInicio()}.` : ""),
    "",
    `Este es tu QR para entrar, mostralo en la puerta: ${qrUrl}`,
  ].join("\n")
}

/**
 * El link de WhatsApp listo para usar, o `null` si el teléfono no sirve.
 *
 * `wa.me` solo admite TEXTO: no se puede adjuntar el QR como imagen, así que lo
 * que viaja es el link a `/mi-qr/<token>`, que lo abre de un toque.
 */
export function urlDeRecordatorio(
  telefono: string | null,
  nombre: string,
  qrUrl: string
): string | null {
  return buildWhatsAppUrl(telefono, mensajeRecordatorio(nombre, qrUrl))
}
