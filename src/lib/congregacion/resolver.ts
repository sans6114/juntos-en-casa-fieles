import { normalizarNombreCongregacion } from "./normalizar"
import { esVidaSobrenatural, VIDA_SOBRENATURAL_NOMBRE } from "./vida-sobrenatural"
import { prisma } from "@/lib/prisma"
import type { TipoCongregacion } from "@/interfaces/inscripcion"

import { Prisma } from "../../../generated/client"

// Resuelve el texto libre del combobox a un FK de Congregacion, upserteando por
// `nombreNormalizado`. Tiene su propio try/catch de P2002, aislado del catch de
// email de las actions: sin esto, una carrera sobre `nombreNormalizado`
// terminaria mostrandole al visitante el mensaje de "email duplicado".
export async function resolverCongregacionId(query?: string | null): Promise<string | null> {
  const nombre = query?.trim() ?? ""
  const nombreNormalizado = normalizarNombreCongregacion(nombre)
  if (!nombreNormalizado) return null

  try {
    const congregacion = await prisma.congregacion.upsert({
      where: { nombreNormalizado },
      update: {}, // nunca pisar un nombre curado por un admin con lo que tipeo un visitante despues
      create: { nombre, nombreNormalizado }, // estado por default: PENDIENTE
    })
    return congregacion.id
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const existente = await prisma.congregacion.findUnique({ where: { nombreNormalizado } })
      if (existente) return existente.id // gano la creacion concurrente: adoptamos ese id
    }
    throw error
  }
}

// La FK de la congregacion propia del evento se resuelve ACA, no en el cliente.
// El checkbox "Soy de Vida Sobrenatural" solia depender de que el nombre exacto
// apareciera en la lista de congregaciones aprobadas que se manda al formulario;
// cuando un admin la renombraba, o mientras estaba PENDIENTE, el checkbox mandaba
// la FK vacia y la persona quedaba anotada a ninguna congregacion, en silencio.
//
// La tabla tiene decenas de filas, no miles: un findMany y un match en memoria
// es correcto y barato, y ademas tolera cualquier grafia. Si la fila todavia no
// existe se crea, para que la inscripcion nunca se quede sin FK.
export async function resolverVidaSobrenaturalId(): Promise<string | null> {
  const congregaciones = await prisma.congregacion.findMany({
    select: { id: true, nombre: true },
  })

  const propia = congregaciones.find((c) => esVidaSobrenatural(c.nombre))
  if (propia) return propia.id

  return resolverCongregacionId(VIDA_SOBRENATURAL_NOMBRE)
}

type EntradaCongregacion = {
  tipoCongregacion: TipoCongregacion
  congregacionId?: string | null
  congregacionQuery?: string
}

/**
 * La decision completa de a que congregacion pertenece una inscripcion nueva.
 *
 * Vive acá entera —y no como dos helpers sueltos— porque la invariante
 * documentada en el schema (`sinCongregacion = true` implica
 * `congregacionId = null`) solo se sostiene si las dos salidas se deciden
 * juntas. La consumen el formulario publico y el alta manual del admin; si cada
 * uno la rearmara por su cuenta, alcanzaria con que una rama se olvidara para
 * que una persona quedara anotada a ninguna congregacion, en silencio.
 */
export async function resolverCongregacionDeInscripcion(
  data: EntradaCongregacion
): Promise<{ congregacionId: string | null; sinCongregacion: boolean }> {
  // "Soy nuevo" es una declaracion explicita, no una ausencia de dato: no hay
  // nada que resolver ni que normalizar, y se ignora lo que venga en
  // `congregacionId` aunque el cliente mande basura.
  const sinCongregacion = data.tipoCongregacion === "nuevo"
  if (sinCongregacion) return { congregacionId: null, sinCongregacion: true }

  if (data.tipoCongregacion === "vsn") {
    return { congregacionId: await resolverVidaSobrenaturalId(), sinCongregacion: false }
  }

  // Si eligio de la lista manda la FK tal cual. Si no, se resuelve el texto
  // libre a un FK (upsert por `nombreNormalizado`, estado PENDIENTE) y la
  // normalizacion real queda en manos del admin, que la fusiona con una
  // existente o la renombra desde /admin/congregaciones.
  const congregacionId =
    data.congregacionId || (await resolverCongregacionId(data.congregacionQuery))

  return { congregacionId, sinCongregacion: false }
}
