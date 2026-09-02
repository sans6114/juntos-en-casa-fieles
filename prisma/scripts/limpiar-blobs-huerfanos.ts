/**
 * Barrido de archivos huérfanos en Vercel Blob.
 *
 * `actualizarContenido` ya borra los que quedan sin referencia al guardar, pero
 * hay un caso que el servidor nunca ve: `upload()` manda el archivo a Blob en
 * el momento en que el admin lo elige, así que abandonar el formulario sin
 * guardar deja un blob que ninguna acción sabe que existe.
 *
 * Este script cierra ese hueco: lista todo el store, lo cruza contra la base y
 * reporta lo que sobra.
 *
 * Uso:
 *   npm run blobs:huerfanos            # solo reporta, no borra nada
 *   npm run blobs:huerfanos -- --borrar
 *   npm run blobs:huerfanos -- --horas 72
 *
 * Necesita `BLOB_READ_WRITE_TOKEN` y `DATABASE_URL` en el entorno. Apuntá el
 * DATABASE_URL a la MISMA base que el store de Blob que estás limpiando: correr
 * esto con una base local contra el Blob de producción borraría todo.
 */
import "dotenv/config"
import { del, list } from "@vercel/blob"
import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../../generated/client"

/**
 * Un blob recién subido puede pertenecer a un formulario que el admin todavía
 * está completando. Sin esta ventana, el barrido le borraría los archivos
 * mientras los está cargando.
 */
const HORAS_DE_GRACIA_POR_DEFECTO = 24

function leerArgumentos() {
  const args = process.argv.slice(2)
  const indiceHoras = args.indexOf("--horas")
  const horas =
    indiceHoras !== -1 ? Number(args[indiceHoras + 1]) : HORAS_DE_GRACIA_POR_DEFECTO

  if (!Number.isFinite(horas) || horas < 0) {
    throw new Error("--horas necesita un número de horas no negativo")
  }

  return { borrar: args.includes("--borrar"), horas }
}

async function urlsReferenciadas(prisma: PrismaClient): Promise<Set<string>> {
  const [archivos, miniaturas] = await Promise.all([
    prisma.contenidoArchivo.findMany({ select: { url: true } }),
    prisma.contenido.findMany({
      where: { imagenSrc: { not: null } },
      select: { imagenSrc: true },
    }),
  ])

  return new Set([
    ...archivos.map((archivo) => archivo.url),
    ...miniaturas.flatMap((fila) => (fila.imagenSrc ? [fila.imagenSrc] : [])),
  ])
}

async function main() {
  const { borrar, horas } = leerArgumentos()
  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
  })

  try {
    const referenciadas = await urlsReferenciadas(prisma)
    const corte = new Date(Date.now() - horas * 60 * 60 * 1000)

    const huerfanos: { url: string; pathname: string; size: number }[] = []
    let recientesIgnorados = 0
    let total = 0
    let cursor: string | undefined

    do {
      const pagina = await list({ cursor })
      for (const blob of pagina.blobs) {
        total += 1
        if (referenciadas.has(blob.url)) continue
        if (blob.uploadedAt > corte) {
          recientesIgnorados += 1
          continue
        }
        huerfanos.push({ url: blob.url, pathname: blob.pathname, size: blob.size })
      }
      cursor = pagina.hasMore ? pagina.cursor : undefined
    } while (cursor)

    const bytes = huerfanos.reduce((suma, blob) => suma + blob.size, 0)
    console.log(`Blobs en el store:        ${total}`)
    console.log(`Referenciados en la base: ${referenciadas.size}`)
    console.log(`Ignorados por recientes:  ${recientesIgnorados} (menos de ${horas} h)`)
    console.log(`Huérfanos:                ${huerfanos.length} (${(bytes / 1024 / 1024).toFixed(2)} MB)`)

    for (const blob of huerfanos) {
      console.log(`  ${blob.pathname}  ${(blob.size / 1024).toFixed(0)} KB`)
    }

    if (huerfanos.length === 0) return

    if (!borrar) {
      console.log("\nNada borrado. Volvé a correr con --borrar para eliminarlos.")
      return
    }

    await del(huerfanos.map((blob) => blob.url))
    console.log(`\nBorrados ${huerfanos.length} blobs.`)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
