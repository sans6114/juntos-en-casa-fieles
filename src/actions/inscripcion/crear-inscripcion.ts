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
import { resolverCongregacionDeInscripcion } from '@/lib/congregacion/resolver';
import { enviarQrYRegistrar } from '@/lib/inscripcion/enviar-qr';
import { prisma } from '@/lib/prisma';

import { Prisma } from '../../../generated/client';

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

  // La FK es la unica representacion de "a que congregacion pertenece": no hay
  // campo de texto paralelo. La decision completa —incluida la invariante de que
  // `sinCongregacion = true` implica `congregacionId = null`— vive en el
  // resolver, compartido con el alta manual del admin.
  const { congregacionId, sinCongregacion } = await resolverCongregacionDeInscripcion(parsed.data)

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

    // El email con el QR sale DESPUES de la respuesta: esperarlo solo dejaria al
    // visitante mirando el boton "Enviando…" mientras el SMTP responde, y la
    // inscripcion ya esta guardada pase lo que pase con el mail.
    //
    // Lo que SI cambio: `enviarQrYRegistrar` deja constancia de como salio. Antes
    // el envio se tragaba sus errores, asi que un fallo masivo era
    // indistinguible del exito y no habia forma de responder "a quien no le
    // llego" sin salir de la aplicacion.
    // `email` es nullable en la base para permitir las altas de puerta, pero acá
    // `CrearInscripcionSchema` lo exige, asi que siempre viene. El guard existe
    // para que el tipo lo refleje, no porque se espere el caso.
    const emailDestino = nuevaInscripcion.email
    if (emailDestino) {
      after(() =>
        enviarQrYRegistrar({
          id: nuevaInscripcion.id,
          email: emailDestino,
          nombre: nuevaInscripcion.nombre,
          qrToken: nuevaInscripcion.qrToken,
        })
      )
    }

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
