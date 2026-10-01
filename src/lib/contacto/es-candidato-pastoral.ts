import type { Prisma } from "../../../generated/client"

export type InscripcionPastoralShape = {
  sinCongregacion: boolean
  /**
   * `Date` cuando viene de Prisma, `string` cuando ya pasó por un DTO. Solo se
   * mira si es nulo o no, así que el tipo exacto da igual.
   */
  asistenciaDia1: Date | string | null
  asistenciaDia2: Date | string | null
}

/**
 * Predicado único para "es candidato a contacto pastoral". No duplicar esta
 * condición inline.
 *
 * Son DOS señales, y las dos tienen que darse:
 *
 * 1. La persona declaró que no tiene congregación marcando "Soy nuevo". Es un
 *    dato afirmado, no inferido: antes el predicado también adivinaba el caso
 *    por ausencia de datos, y esa heurística atrapaba a quien no marcaba nada y
 *    a quien quedaba sin FK porque un admin le rechazó la congregación.
 *
 * 2. Vino al evento, aunque sea un día.
 *
 * La segunda condición se agregó después del evento, y es la que le da sentido
 * a la pantalla. Un seguimiento pastoral es "te conocimos, charlemos": a quien
 * se anotó y nunca apareció no se lo puede contactar como si lo hubiéramos
 * conocido, porque no pasó. Esa conversación es otra —"te extrañamos"— y tiene
 * su propio lugar en `/admin/no-asistentes`, con su filtro "solo los nuevos".
 *
 * Medido al aplicar el cambio: de 65 personas que declararon no tener iglesia,
 * 39 vinieron y 26 no. Ninguna de esas 26 tenía trabajo de contacto registrado,
 * así que el cambio no escondió nada ya hecho.
 *
 * "Al menos un día" y no "los dos": con haber estado una vez alcanza para que
 * haya habido encuentro, que es lo que el seguimiento continúa.
 */
export function esCandidatoPastoral(inscripcion: InscripcionPastoralShape): boolean {
  if (!inscripcion.sinCongregacion) return false

  return inscripcion.asistenciaDia1 !== null || inscripcion.asistenciaDia2 !== null
}

/**
 * El MISMO predicado expresado como filtro Prisma, para queries donde no
 * conviene traer todo a memoria para filtrar en JS (ver `obtener-contactos.ts`).
 *
 * Las dos expresiones tienen que decir exactamente lo mismo. Si una cambia y la
 * otra no, la grilla y el tablero de contacto empiezan a mostrar conjuntos
 * distintos de gente y nada falla ruidosamente.
 */
export const PASTORAL_WHERE: Prisma.InscripcionWhereInput = {
  sinCongregacion: true,
  OR: [{ asistenciaDia1: { not: null } }, { asistenciaDia2: { not: null } }],
}
