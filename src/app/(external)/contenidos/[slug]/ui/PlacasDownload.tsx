import Image from "next/image"
import { getDownloadUrl } from "@vercel/blob"

import { CtaButton, DownloadIcon, ImagesIcon, PlaceholderTag } from "@/components/external/shared"
import type { ContenidoPublicoDTO } from "@/interfaces/contenido"

type PlacasDownloadProps = {
  item: ContenidoPublicoDTO
}

/**
 * Panel de descarga de los archivos de un contenido. Solo aparece cuando hay
 * algo real que ofrecer; si no, el slot dice que todavía se están armando, así
 * nunca se ofrece una descarga que daría 404.
 *
 * `getDownloadUrl` y no el atributo `download`: la URL de Vercel Blob es
 * cross-origin, y el browser IGNORA `download` en un `<a>` cross-origin —
 * navega al archivo en vez de bajarlo. El helper agrega `?download=1`, que hace
 * que Blob responda con `Content-Disposition: attachment`.
 */
export function PlacasDownload({ item }: PlacasDownloadProps) {
  const { placas, placasCount } = item

  const documentos = placas.filter((archivo) => archivo.mime === "application/pdf")
  const imagenes = placas.filter((archivo) => archivo.mime !== "application/pdf")

  return (
    <div className="campo-tinta rounded-[6px] p-7">
      <div className="flex items-center gap-3">
        <ImagesIcon size={24} strokeWidth={1.8} className="shrink-0 text-[var(--acento-texto)]" />
        <h2 className="jec-label text-xl font-extrabold tracking-tight">Placas para compartir</h2>
      </div>

      {placasCount ? (
        <p className="mt-3 text-sm leading-relaxed text-[var(--suave)]">
          {placasCount} {placasCount === 1 ? "pieza lista" : "piezas listas"} para compartir.
        </p>
      ) : null}

      {placas.length === 0 ? (
        <div className="mt-5 flex flex-col items-start gap-2">
          <PlaceholderTag>Placas en preparación</PlaceholderTag>
          <span className="text-[13px] leading-relaxed text-[var(--suave)]">
            Todavía estamos armando las placas de esta charla. Cuando estén listas, el botón de
            descarga aparece acá.
          </span>
        </div>
      ) : null}

      {documentos.map((documento) => (
        <CtaButton
          key={documento.url}
          href={getDownloadUrl(documento.url)}
          className="mt-5 w-full px-6 py-3.5 text-sm"
        >
          <DownloadIcon size={18} className="mr-3" />
          Descargar placas
        </CtaButton>
      ))}

      {imagenes.length > 0 ? (
        <div className="mt-5">
          <p className="jec-label mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--suave)]">
            {imagenes.length === 1 ? "Imagen suelta" : `${imagenes.length} imágenes sueltas`}
          </p>
          <ul className="grid grid-cols-3 gap-2">
            {imagenes.map((imagen, indice) => (
              <li key={imagen.url}>
                <a
                  href={getDownloadUrl(imagen.url)}
                  className="group relative block aspect-square overflow-hidden rounded-[4px] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--foco)]"
                >
                  <Image
                    src={imagen.url}
                    alt={`Descargar imagen ${indice + 1}`}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform group-hover:scale-105 motion-reduce:transform-none"
                  />
                  <span className="absolute inset-0 flex items-center justify-center bg-[rgb(11_10_15/55%)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <DownloadIcon size={18} className="text-[var(--jec-bone)]" />
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
