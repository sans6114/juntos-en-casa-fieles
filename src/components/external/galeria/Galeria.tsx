import Image from "next/image"
import { BRAND_NAME, BrandName, PlaceholderTag, SectionHeading } from "@/components/external/shared"
import { cn } from "@/lib/utils"

import { galeriaEdition, galeriaFotos } from "./data"

export function Galeria() {
  const pendientes = galeriaFotos.filter((foto) => !foto.src).length

  return (
    <section
      id="galeria"
      aria-label={`Galería ${BRAND_NAME} ${galeriaEdition}`}
      className="campo-tinta jec-anchor px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="Lo que ya pasó"
          title={
            <>
              Galería <BrandName>{BRAND_NAME}</BrandName> {galeriaEdition}
            </>
          }
          className="mb-6 max-w-2xl"
        />
        <p className="mb-12 max-w-2xl text-pretty text-base leading-relaxed text-[var(--suave)] md:mb-16 md:text-lg">
          Tres días, una casa llena. Las fotos de la edición pasada, por si querés buscarte en
          alguna — o mostrarle a alguien por qué tiene que venir este año.
        </p>

        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {galeriaFotos.map((foto) => (
            <li
              key={foto.id}
              className={cn(
                "relative overflow-hidden rounded-[6px] border border-[var(--linea)]",
                foto.span === "wide" ? "col-span-2 aspect-[2/1]" : "aspect-square"
              )}
            >
              {foto.src ? (
                <Image
                  src={foto.src}
                  alt={foto.alt ?? ""}
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="jec-placeholder flex h-full items-end p-3">
                  <span className="jec-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--suave)]">
                    Foto <BrandName>{BRAND_NAME}</BrandName> {galeriaEdition}
                  </span>
                </div>
              )}
            </li>
          ))}
        </ul>

        {pendientes > 0 ? (
          <p className="mt-6 flex flex-wrap items-center gap-3">
            <PlaceholderTag>Sin fotos reales todavía</PlaceholderTag>
            <span className="text-sm text-[var(--suave)]">
              Todavía estamos eligiendo las fotos de la edición pasada. Volvé en unos días y la
              galería va a estar completa.
            </span>
          </p>
        ) : null}
      </div>
    </section>
  )
}
