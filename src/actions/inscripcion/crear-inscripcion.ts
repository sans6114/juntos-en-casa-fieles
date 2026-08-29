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

  // Si eligio de la lista manda la FK tal cual. Si no, se resuelve el texto
  // libre a un FK (upsert por nombreNormalizado): `congregacionTexto` ya no se
  // escribe en altas nuevas, queda frozen para lectura de filas legacy.
  const congregacionId = parsed.data.congregacionId || (await resolverCongregacionId(parsed.data.congregacionQuery))

  try {
    const nuevaInscripcion = await prisma.inscripcion.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        edad: parsed.data.edad,
        congregacionId,
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
