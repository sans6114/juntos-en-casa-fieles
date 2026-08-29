import type { Prisma } from "../../../generated/client"

export type InscripcionPastoralShape = {
  sinCongregacion: boolean
}

// Predicado unico para "es candidato a contacto pastoral". No duplicar esta
// condicion inline.
//
// Una sola senal, explicita: la persona declaro que no tiene congregacion
// marcando "Soy nuevo" en el formulario. Antes el predicado tambien inferia el
// caso por ausencia de datos, una heuristica heredada del formulario viejo de un
// solo campo de texto libre. Esa inferencia atrapaba por accidente a quien no
// marcaba nada y a quien quedaba sin FK porque un admin le rechazo la
// congregacion. Con el checkbox obligatorio no hay nada que adivinar.
export function esCandidatoPastoral(inscripcion: InscripcionPastoralShape): boolean {
  return inscripcion.sinCongregacion === true
}

// Mismo predicado expresado como filtro Prisma, para queries donde no
// conviene traer todo a memoria para filtrar en JS (ver obtener-contactos.ts).
export const PASTORAL_WHERE: Prisma.InscripcionWhereInput = {
  sinCongregacion: true,
}
