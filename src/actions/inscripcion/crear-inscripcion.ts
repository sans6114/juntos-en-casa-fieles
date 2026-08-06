"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { CrearInscripcionSchema, CrearInscripcionDTO } from "@/interfaces/inscripcion"

export async function crearInscripcion(data: CrearInscripcionDTO) {
  try {
    const validData = CrearInscripcionSchema.parse(data)

    const newInscripcion = await prisma.inscripcion.create({
      data: {
        nombre: validData.nombre,
        email: validData.email,
        telefono: validData.telefono,
        edad: validData.edad,
        congregacionId: validData.congregacionId || null,
      },
    })

    // Revalidar las rutas del dashboard admin para que los datos nuevos aparezcan al instante
    revalidatePath("/admin/inscripciones", "layout")

    return { ok: true, data: newInscripcion }
  } catch (error) {
    console.error("Error creando inscripción:", error)
    return { ok: false, message: "No se pudo procesar la inscripción. Verifica los datos enviados." }
  }
}
