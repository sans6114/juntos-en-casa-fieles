/**
 * MIGRACIÓN ÚNICA — rescata los seis items del catálogo estático legado
 * (`src/components/external/contenidos/data.ts`, ya eliminado) hacia la base
 * de datos, con la taxonomía remapeada (decisión 11). Idempotente: se puede
 * correr más de una vez sin duplicar filas (`upsert` por `slug`, `update: {}`
 * — nunca pisa una edición que ya hiciste desde el admin).
 *
 * ESTE SCRIPT NO TRAE EL CONTENIDO REAL. Por decisión 11 el mecanismo lo
 * entrega el cambio; el contenido de cada item lo completás vos, a mano,
 * reemplazando cada marca "TODO" de abajo o, más simple, editando el item
 * directamente desde /admin/contenidos una vez migrado.
 *
 * PRERREQUISITOS
 * 1. `DATABASE_URL` configurada.
 * 2. La migración `add_contenido_model` ya aplicada (`npx prisma migrate dev`).
 *
 * MAPEO DE TAXONOMÍA (por slug, tal como estaba en el catálogo estático)
 * | slug                          | kind viejo | tipo nuevo | edición |
 * |-------------------------------|------------|------------|---------|
 * | anclados-en-la-roca           | predica    | PREDICA    | 2025    |
 * | permaneciendo-en-la-palabra   | predica    | PREDICA    | 2025    |
 * | caminando-en-la-verdad        | predica    | PREDICA    | 2025    |
 * | podcast-juntos-en-casa        | podcast    | VIDEO      | 2026    |
 * | previa-al-encuentro           | podcast    | VIDEO      | 2026    |
 * | placas-para-compartir         | recurso    | RECURSOS   | 2025    |
 *
 * RENOMBRE DE CAMPOS (data.ts viejo -> Contenido)
 * title -> titulo · description -> descripcion · kind -> tipo ·
 * edition -> edicion · session -> sesion · speaker -> orador ·
 * durationLabel -> duracion · thumb.field ("campo-papel"|"campo-tinta"|
 * "campo-fuego") -> campo (CAMPO_PAPEL|CAMPO_TINTA|CAMPO_FUEGO) ·
 * thumb.src -> imagenSrc · thumb.fit === "cover" -> imagenCover: true ·
 * thumb.dim -> imagenAtenuada. `slug`/`youtubeId`/`archivos`
 * no cambian. El `id` NO se traslada — Prisma genera un cuid nuevo; el `slug`
 * es la identidad de la fila (y la clave del `upsert`).
 *
 * LA COLISIÓN DECISIÓN 11 <-> DECISIÓN 13 (design §OQ-A)
 * Ninguno de los seis items originales tiene el campo que su tipo exige bajo
 * `CrearContenidoSchema` (PREDICA necesita `orador`, VIDEO necesita
 * `youtubeId`, RECURSOS necesita archivos). Por eso este script escribe
 * directo a Prisma —sin pasar por Zod— e inserta los seis con
 * `publicado: false`. Después de correrlo, entrá a /admin/contenidos,
 * completá el campo que le falte a cada uno (Zod lo va a exigir ahí
 * correctamente) y publicalo. Es esperable que justo después de correr este
 * script /contenidos muestre MENOS items que antes: es una migración en
 * curso, no una pérdida de datos.
 *
 * CÓMO COMPLETAR LOS SEIS ITEMS
 * Reemplazá cada "TODO" de abajo por el contenido real, siguiendo la tabla de
 * renombre de campos. No cambies `slug`: es la identidad de la fila para el
 * `upsert`. `campo`/`imagenCover`/`imagenAtenuada` quedan con un valor neutro
 * de arranque — ajustalos si el thumbnail real pide otro.
 *
 * CORRER
 *   npm run migrar:contenidos
 * VERIFICAR
 *   npx prisma studio  ->  6 filas en Contenido
 */

import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

import { PrismaClient } from "../../generated/client"
import type { ContenidoSeed } from "../data/contenidos"

const pool = new Pool({ connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

/**
 * Fechas escalonadas (D15): con `orderBy: { createdAt: "desc" }` en las
 * lecturas públicas, el item más antiguo de esta lista necesita el
 * `createdAt` más reciente para aparecer primero una vez publicado —
 * preservando el orden manual que tenía el catálogo estático.
 */
const contenidosIniciales: ContenidoSeed[] = [
  {
    slug: "anclados-en-la-roca",
    titulo: "TODO: título real",
    descripcion: "TODO: descripción real",
    tipo: "PREDICA",
    edicion: 2025,
    sesion: undefined, // TODO: ej. "Apertura · Viernes"
    orador: undefined, // TODO: falta para publicar (PREDICA requiere orador)
    duracion: undefined,
    campo: "CAMPO_PAPEL",
    imagenCover: false,
    imagenAtenuada: false,
    publicado: false,
    createdAt: new Date("2025-01-01T00:06:00Z"),
  },
  {
    slug: "permaneciendo-en-la-palabra",
    titulo: "TODO: título real",
    descripcion: "TODO: descripción real",
    tipo: "PREDICA",
    edicion: 2025,
    sesion: undefined,
    orador: undefined, // TODO: falta para publicar (PREDICA requiere orador)
    duracion: undefined,
    campo: "CAMPO_PAPEL",
    imagenCover: false,
    imagenAtenuada: false,
    publicado: false,
    createdAt: new Date("2025-01-01T00:05:00Z"),
  },
  {
    slug: "caminando-en-la-verdad",
    titulo: "TODO: título real",
    descripcion: "TODO: descripción real",
    tipo: "PREDICA",
    edicion: 2025,
    sesion: undefined,
    orador: undefined, // TODO: falta para publicar (PREDICA requiere orador)
    duracion: undefined,
    campo: "CAMPO_PAPEL",
    imagenCover: false,
    imagenAtenuada: false,
    publicado: false,
    createdAt: new Date("2025-01-01T00:04:00Z"),
  },
  {
    slug: "podcast-juntos-en-casa",
    titulo: "TODO: título real",
    descripcion: "TODO: descripción real",
    tipo: "VIDEO",
    edicion: 2026,
    duracion: undefined,
    youtubeId: undefined, // TODO: falta para publicar (VIDEO requiere youtubeId)
    campo: "CAMPO_PAPEL",
    imagenCover: false,
    imagenAtenuada: false,
    publicado: false,
    createdAt: new Date("2025-01-01T00:03:00Z"),
  },
  {
    slug: "previa-al-encuentro",
    titulo: "TODO: título real",
    descripcion: "TODO: descripción real",
    tipo: "VIDEO",
    edicion: 2026,
    duracion: undefined,
    youtubeId: undefined, // TODO: falta para publicar (VIDEO requiere youtubeId)
    campo: "CAMPO_PAPEL",
    imagenCover: false,
    imagenAtenuada: false,
    publicado: false,
    createdAt: new Date("2025-01-01T00:02:00Z"),
  },
  {
    slug: "placas-para-compartir",
    titulo: "TODO: título real",
    descripcion: "TODO: descripción real",
    tipo: "RECURSOS",
    edicion: 2025,
    // TODO: falta para publicar. Un RECURSOS necesita al menos un archivo, y
    // los archivos se suben desde el form: no se pueden sembrar desde acá
    // porque tienen que existir primero en Vercel Blob.
    campo: "CAMPO_PAPEL",
    imagenCover: false,
    imagenAtenuada: false,
    publicado: false,
    createdAt: new Date("2025-01-01T00:01:00Z"),
  },
]

async function main() {
  for (const contenido of contenidosIniciales) {
    await prisma.contenido.upsert({
      where: { slug: contenido.slug },
      update: {},
      create: contenido,
    })
  }
}

main()
  .then(() => {
    console.log(
      `Listo: ${contenidosIniciales.length} contenidos migrados (o ya existentes). Completalos desde /admin/contenidos.`
    )
  })
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
