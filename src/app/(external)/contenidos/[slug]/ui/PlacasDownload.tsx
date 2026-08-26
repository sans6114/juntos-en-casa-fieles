import type { ContenidoItem } from "@/components/external/contenidos"
import { CtaButton, DownloadIcon, ImagesIcon, PlaceholderTag } from "@/components/external/shared"

type PlacasDownloadProps = {
  item: ContenidoItem
}

/**
 * Download panel for an item's shareable graphics. The button only renders when
 * `placasUrl` points somewhere real; otherwise the slot states that the archive
 * is still being prepared, so nothing offers a download that would 404.
 */
export function PlacasDownload({ item }: PlacasDownloadProps) {
  const { placasUrl, placasCount } = item

  return (
    <div className="campo-tinta rounded-[6px] p-7">
      <div className="flex items-center gap-3">
        <ImagesIcon size={24} strokeWidth={1.8} className="shrink-0 text-[var(--acento-texto)]" />
        <h2 className="jec-label text-xl font-extrabold tracking-tight">Placas para compartir</h2>
      </div>

      {placasCount ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--suave)]">
          {placasCount} frases en formato historia y post, listas para compartir.
        </p>
      ) : null}

      {placasUrl ? (
        <CtaButton href={placasUrl} download className="mt-5 w-full px-6 py-3.5 text-sm">
          <DownloadIcon size={18} className="mr-3" />
          Descargar placas
        </CtaButton>
      ) : (
        <div className="mt-5 flex flex-col items-start gap-2">
          <PlaceholderTag>Placas en preparación</PlaceholderTag>
          <span className="text-[13px] leading-relaxed text-[var(--suave)]">
            Todavía estamos armando las placas de esta charla. Cuando estén listas, el botón de
            descarga aparece acá.
          </span>
        </div>
      )}
    </div>
  )
}
