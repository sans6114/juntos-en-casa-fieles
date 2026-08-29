"use server"

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { after } from 'next/server';
import { z } from 'zod';

import {
  type CrearInscripcionDTO,
  CrearInscripcionSchema,
  type InscripcionActionState,
} from '@/interfaces/inscripcion';
import { normalizarNombreCongregacion } from '@/lib/congregacion/normalizar';
import {
  esVidaSobrenatural,
  VIDA_SOBRENATURAL_NOMBRE,
} from '@/lib/congregacion/vida-sobrenatural';
import { sendQrEmail } from '@/lib/email/send-qr-email';
import { prisma } from '@/lib/prisma';

import { Prisma } from '../../../generated/client';

// Resuelve el texto libre del combobox a un FK de Congregacion, upserteando por
// `nombreNormalizado`. Tiene su propio try/catch de P2002, aislado del catch de
// email mas abajo: sin esto, una carrera sobre `nombreNormalizado` terminaria
// mostrandole al visitante el mensaje de "email duplicado".
async function resolverCongregacionId(query?: string | null): Promise<string | null> {
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
async function resolverVidaSobrenaturalId(): Promise<string | null> {
  const congregaciones = await prisma.congregacion.findMany({
    select: { id: true, nombre: true },
  })

  const propia = congregaciones.find((c) => esVidaSobrenatural(c.nombre))
  if (propia) return propia.id

  return resolverCongregacionId(VIDA_SOBRENATURAL_NOMBRE)
}

export async function crearInscripcion(
  _prevState: InscripcionActionState,
  formData: FormData
): Promise<InscripcionActionState> {
  //validar con zod la data del formulario
  const parsed = CrearInscripcionSchema.safeParse(Object.fromEntries(formData))

  if (!parsed.success) {
    const flattened = z.flattenError(parsed.error)
    const fieldErrors: Partial<Record<keyof CrearInscripcionDTO, string>> = {}
    for (const key of Object.keys(flattened.fieldErrors) as (keyof CrearInscripcionDTO)[]) {
      const messages = flattened.fieldErrors[key]
      if (messages?.[0]) fieldErrors[key] = messages[0]
    }
    return { ok: false, message: "Revisá los datos ingresados.", fieldErrors }
  }

  // "Soy nuevo" es una declaracion explicita del visitante, no una ausencia de
  // dato: no hay nada que resolver ni que normalizar. Se persiste como
  // `sinCongregacion = true`, sosteniendo la invariante documentada en el schema
  // (`sinCongregacion = true` implica `congregacionId = null`) aunque el cliente
  // mande basura en `congregacionId`.
  const sinCongregacion = parsed.data.tipoCongregacion === "nuevo"

  // Para el resto: si eligio de la lista manda la FK tal cual. Si no, se resuelve
  // el texto libre a un FK (upsert por nombreNormalizado, estado PENDIENTE) y la
  // normalizacion real queda en manos del admin, que la fusiona con una existente
  // o la renombra desde /admin/congregaciones. La FK es la unica representacion
  // de "a que congregacion pertenece": no hay campo de texto paralelo.
  let congregacionId: string | null = null
  if (parsed.data.tipoCongregacion === "vsn") {
    congregacionId = await resolverVidaSobrenaturalId()
  } else if (!sinCongregacion) {
    congregacionId =
      parsed.data.congregacionId || (await resolverCongregacionId(parsed.data.congregacionQuery))
  }

  try {
    const nuevaInscripcion = await prisma.inscripcion.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        edad: parsed.data.edad,
        congregacionId,
        sinCongregacion,
      },
    })

    // El email con el QR sale DESPUES de la respuesta. `sendQrEmail` se traga sus
    // propios errores y nunca lanza, asi que esperarlo no garantizaba nada: solo
    // dejaba al visitante mirando el boton "Enviando…" mientras Resend respondia.
    after(() =>
      sendQrEmail({
        to: nuevaInscripcion.email,
        nombre: nuevaInscripcion.nombre,
        uuid: nuevaInscripcion.id,
      })
    )

    // Revalidar las rutas del dashboard admin para que los datos nuevos aparezcan al instante
    revalidatePath("/admin/inscripciones", "layout")
    revalidatePath("/admin/congregaciones")

    const cookieStore = await cookies()
    cookieStore.set("jec_inscripcion_ok", "1", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/inscripcion",
    })

    cookieStore.set("jec_inscripcion_uuid", nuevaInscripcion.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 600,
      path: "/inscripcion",
    })

    return { ok: true }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "Ya existe una inscripción con ese email.",
        fieldErrors: { email: "Ese email ya está registrado." },
      }
    }

    console.error("Error creando inscripción:", error)
    return { ok: false, message: "No se pudo procesar la inscripción. Verificá los datos enviados." }
  }
}
