import type { Prisma } from "../../../generated/client"

export type InscripcionPastoralShape = {
  congregacionId: string | null
  congregacionTexto: string | null
  sinCongregacion: boolean
}

// Predicado unico para "es candidato a contacto pastoral". No duplicar esta
// condicion inline: una inscripcion entra al circuito de contacto cuando (a)
// nunca declaro ninguna congregacion (ni FK ni texto libre), o (b) su
// congregacion fue rechazada por un admin (`sinCongregacion = true`, que por
// invariante ya implica `congregacionId = null`).
export function esCandidatoPastoral(inscripcion: InscripcionPastoralShape): boolean {
  return (
    (inscripcion.congregacionId === null && inscripcion.congregacionTexto === null) ||
    inscripcion.sinCongregacion === true
  )
}

// Mismo predicado expresado como filtro Prisma, para queries donde no
// conviene traer todo a memoria para filtrar en JS (ver obtener-contactos.ts).
export const PASTORAL_WHERE: Prisma.InscripcionWhereInput = {
  OR: [{ congregacionId: null, congregacionTexto: null }, { sinCongregacion: true }],
}
