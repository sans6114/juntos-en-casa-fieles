"use server"

import { prisma } from "@/lib/prisma"

export async function obtenerInscripciones() {
  try {
    const inscripciones = await prisma.inscripcion.findMany({
      include: {
        congregacion: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })
    
    // Mapeamos para que coincida con la interfaz que espera la tabla en el frontend
    return inscripciones.map((ins) => ({
      id: ins.id,
      nombre: ins.nombre,
      email: ins.email,
      edad: ins.edad,
      congregacionId: ins.congregacionId,
      congregacionNombre: ins.congregacion?.nombre || null,
      createdAt: ins.createdAt.toISOString(),
    }))
  } catch (error) {
    console.error("Error obteniendo inscripciones:", error)
    return []
  }
}
