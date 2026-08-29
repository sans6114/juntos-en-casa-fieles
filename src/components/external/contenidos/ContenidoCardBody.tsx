import {
  ArrowRightIcon,
  BrandName,
  DownloadIcon,
  PlaceholderTag,
} from "@/components/external/shared"
import type { ContenidoVista } from "@/interfaces/contenido"

import { ContenidoThumb } from "./ContenidoThumb"

type ContenidoCardBodyProps = {
  item: ContenidoVista
}

/**
 * Contenido presentacional de la card: thumb + título + kind + sesión/orador,
 * sin `Link`. La comparte el catálogo público (`ContenidoCard`, envolviendo
 * esto en un `<Link>`) y la vista previa en vivo del admin (design §B6) —
 * por eso opera sobre `ContenidoVista`, el supertipo presentacional que
 * `ContenidoPublicoDTO` extiende, y no sobre un tipo propio de ninguno de
 * los dos consumidores.
 */
export function ContenidoCardBody({ item }: ContenidoCardBodyProps) {
  const isRecursos = item.kind === "recursos"

  return (
    <>
      <ContenidoThumb item={item} />

      <div className="flex flex-grow flex-col gap-3 p-6">
        <p className="jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]">
          {item.session ?? (item.kind === "video" ? "Video" : "Descargable")}
        </p>

        <h3 className="jec-label text-2xl font-extrabold leading-tight tracking-tight">
          <BrandName>{item.title}</BrandName>
        </h3>

        <p className="text-sm leading-relaxed text-[var(--suave)]">
          <BrandName>{item.description}</BrandName>
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 border-t border-[var(--linea)] pt-4">
          {item.speaker ? (
            <span className="jec-mono text-[13px] uppercase tracking-[0.14em] text-[var(--suave)]">
              {item.speaker}
            </span>
          ) : item.kind === "predica" ? (
            <PlaceholderTag>Orador a confirmar</PlaceholderTag>
          ) : (
            <span className="jec-mono text-[13px] uppercase tracking-[0.14em] text-[var(--suave)]">
              {isRecursos ? "Descargar pack" : "Ver episodio"}
            </span>
          )}

          {isRecursos ? (
            <DownloadIcon className="shrink-0 text-[var(--acento-texto)]" />
          ) : (
            <ArrowRightIcon className="shrink-0 text-[var(--acento-texto)]" />
          )}
        </div>
      </div>
    </>
  )
}
