import { z } from "zod"

import type { EtiquetaCongregacion } from "./congregacion"

/**
 * Los dos días de acreditación. El enum vive acá y el resto del dominio lo
 * consume desde `src/lib/asistencia/dia-evento.ts`, que es quien sabe a qué
 * fecha corresponde cada uno.
 */
export const DiaEventoSchema = z.union([z.literal(1), z.literal(2)], {
  error: "Día de evento inválido.",
})

/**
 * El tipo vive acá y no en `src/lib/asistencia/dia-evento.ts` para que los
 * client components puedan usarlo sin importar un módulo que lee `process.env`.
 */
export type DiaEvento = z.infer<typeof DiaEventoSchema>

export const AjustarAsistenciaSchema = z.object({
  inscripcionId: z.string().min(1, "Falta la inscripción."),
  dia: DiaEventoSchema,
  presente: z.boolean(),
})

export type AjustarAsistenciaDTO = z.infer<typeof AjustarAsistenciaSchema>

/**
 * Resultado de acreditar. `nombre` y `horaLlegada` viajan incluso en el caso
 * fallido de "ya estaba acreditado": quien está en la puerta necesita saber de
 * quién se trata para resolverlo ahí mismo, no solo que falló.
 */
export type AsistenciaActionResult =
  | { ok: true; nombre: string; horaLlegada: string }
  | { ok: false; message: string; nombre?: string; horaLlegada?: string }

/**
 * Resultado de un escaneo, para el panel del colaborador.
 *
 * Devuelve datos y no una frase armada porque la pantalla del escáner tiene que
 * mostrar el nombre EN GRANDE: es lo único que le permite al colaborador
 * verificar que el QR corresponde a quien se lo está presentando. El nombre sale
 * de la base, no de la pantalla del visitante, que es texto que el visitante
 * controla y por lo tanto no verifica nada.
 */
export type EscaneoResultado = {
  ok: boolean
  /** Qué pasó. Es lo único que hay cuando no se pudo identificar a nadie. */
  message: string
  persona?: {
    nombre: string
    horaLlegada: string
    congregacion: EtiquetaCongregacion
  }
  /** "Ya estaba acreditado" no es un error del operador: se pinta distinto. */
  yaAcreditado?: boolean
}

/** Estado de acreditación de una persona, para pintar la grilla. */
export type AsistenciaEstado = {
  dia1: string | null
  dia2: string | null
}
