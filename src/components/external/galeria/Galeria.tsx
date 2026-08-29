import Image from "next/image"
import {
  BRAND_NAME,
  BrandName,
  CtaButton,
  PlaceholderTag,
  SectionHeading,
} from "@/components/external/shared"
import { cn } from "@/lib/utils"

import { galeriaDriveUrl, galeriaEdition, galeriaFotos } from "./data"

export function Galeria() {
  const pendientes = galeriaFotos.filter((foto) => !foto.src).length

  return (
    <section
      id="galeria"
      aria-label={`Galería ${BRAND_NAME} ${galeriaEdition}`}
      className="campo-tinta jec-anchor px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-start md:justify-between md:gap-8">
          <SectionHeading
            eyebrow="Lo que ya pasó"
            title={
              <>
                Galería <BrandName>{BRAND_NAME}</BrandName> {galeriaEdition}
              </>
            }
            className="max-w-2xl"
          />
          {pendientes === 0 ? (
            <CtaButton
              href={galeriaDriveUrl}
              target="_blank"
              rel="noreferrer noopener"
              variant="pill"
              className="shrink-0"
            >
              Ver mas fotos
            </CtaButton>
          ) : null}
        </div>
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
        ) : (
          <div className="mt-16 border-t-[3px] border-[var(--regla)] pt-16">
            <SectionHeading
              eyebrow="Se viene"
              title={
                <>
                  <BrandName>Juntos En Casa</BrandName> 2026
                </>
              }
              className="mb-10 max-w-2xl"
            />
            <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <li
                  key={index}
                  className="jec-placeholder flex aspect-square items-end rounded-[6px] border border-[var(--linea)] p-3"
                >
                  <span className="jec-label text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--suave)]">
                    Próximamente 2026
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  )
}
