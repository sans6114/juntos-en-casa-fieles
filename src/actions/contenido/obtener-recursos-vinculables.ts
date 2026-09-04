"use server"

import { prisma } from "@/lib/prisma"
import { requireCatalogo } from "@/lib/auth-guards"

export type RecursoVinculable = {
  id: string
  titulo: string
  slug: string
  publicado: boolean
}

/**
 * Los RECURSOS que una prédica puede apuntar, para el `<Select>` del panel.
 *
 * Incluye los despublicados a propósito: el admin puede estar cargando la
 * prédica y el recurso en la misma sesión, y bloquear los borradores lo
 * obligaría a publicar el recurso antes de poder vincularlo.
 *
 * `select` acotado y no la fila entera: el panel solo necesita el rótulo.
 */
export async function obtenerRecursosVinculables(): Promise<RecursoVinculable[]> {
  await requireCatalogo()

  return prisma.contenido.findMany({
    where: { tipo: "RECURSOS" },
    select: { id: true, titulo: true, slug: true, publicado: true },
    orderBy: { createdAt: "desc" },
  })
}
