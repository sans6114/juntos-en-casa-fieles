"use client"

import { useState } from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import type { ProductoPublicoDTO } from "@/interfaces/producto"

import { ProductoFoto } from "./ProductoFoto"

type ProductoVisorProps = {
  item: ProductoPublicoDTO
  className?: string
}

type Vista = {
  src: string
  /** Solo lo lee un lector de pantalla: la miniatura ya se explica sola. */
  etiqueta: string
}

/**
 * Foto grande + tira de miniaturas para alternar entre frente y dorso. Vive
 * SOLO en el detalle: `ProductoFoto` la comparten también la card del catálogo
 * y la vista previa del admin, donde una segunda foto no va.
 *
 * Es el único `"use client"` de la página de producto, y a propósito queda en
 * la hoja del árbol: el resto del detalle —header, descripción, aside,
 * relacionados— se sigue renderizando entero en el servidor.
 *
 * `page.tsx` solo lo monta cuando el producto tiene dorso; un producto de una
 * sola foto sigue usando `ProductoFoto` directo y no carga este chunk.
 */
export function ProductoVisor({ item, className }: ProductoVisorProps) {
  const vistas: Vista[] = [
    { src: item.imagenSrc, etiqueta: "Frente" },
    ...(item.imagenDorsoSrc ? [{ src: item.imagenDorsoSrc, etiqueta: "Dorso" }] : []),
  ]

  const [seleccionada, setSeleccionada] = useState(0)
  // Acotado y no crudo: navegar de un producto con dorso a uno sin dorso puede
  // reusar la instancia con el índice 1 todavía en el estado.
  const activa = Math.min(seleccionada, vistas.length - 1)

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <ProductoFoto
        item={{ imagenSrc: vistas[activa].src, badge: item.badge }}
        className="rounded-[6px]"
      />

      {vistas.length > 1 ? (
        <div role="group" aria-label="Vistas del producto" className="flex gap-3">
          {vistas.map((vista, indice) => (
            <button
              key={vista.src}
              type="button"
              onClick={() => setSeleccionada(indice)}
              aria-pressed={indice === activa}
              className={cn(
                "relative aspect-[4/3] w-20 shrink-0 overflow-hidden rounded-[4px] border-2 transition-opacity focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)] md:w-24",
                indice === activa
                  ? "border-[var(--dato)]"
                  : "border-transparent opacity-60 hover:opacity-100"
              )}
            >
              <Image src={vista.src} alt="" fill sizes="96px" className="object-cover" />
              <span className="sr-only">{vista.etiqueta}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
