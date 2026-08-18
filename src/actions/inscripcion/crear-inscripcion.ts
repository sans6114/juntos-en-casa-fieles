"use server"

import { z } from "zod"
import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { Prisma } from "../../../generated/client"
import {
  CrearInscripcionSchema,
  type CrearInscripcionDTO,
  type InscripcionActionState,
} from "@/interfaces/inscripcion"

export async function crearInscripcion(
  _prevState: InscripcionActionState,
  formData: FormData
): Promise<InscripcionActionState> {
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

  try {
    await prisma.inscripcion.create({
      data: {
        nombre: parsed.data.nombre,
        email: parsed.data.email,
        telefono: parsed.data.telefono,
        edad: parsed.data.edad,
        congregacionId: parsed.data.congregacionId || null,
      },
    })

    // Revalidar las rutas del dashboard admin para que los datos nuevos aparezcan al instante
    revalidatePath("/admin/inscripciones", "layout")

    const cookieStore = await cookies()
    cookieStore.set("jec_inscripcion_ok", "1", {
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
    return { ok: false, message: "No se pudo procesar la inscripción. Verifica los datos enviados." }
  }
}
