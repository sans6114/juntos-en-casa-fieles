import Image from "next/image"

import { jecAssets } from "@/lib/jec-assets"

/**
 * Mapa simulado: la traza urbana de La Plata — grilla ortogonal con avenidas
 * diagonales a 45°. No es un mapa a escala, pero tampoco es una figura
 * arbitraria: la ciudad realmente está trazada así.
 *
 * Todo el trazo toma tokens de campo. Como Ubicacion vive en campo-tinta,
 * `--regla` es hueso y `--acento` es lima: el mismo dibujo que en campo-papel
 * se leía como calles oscuras sobre hueso, acá se lee como calles claras
 * sobre tinta y una avenida que brilla — el mapa no cambió, cambió el campo.
 *
 * El pin es el ancla real de `jecAssets.iconos.ancla` (no un trazo propio):
 * va superpuesto en HTML sobre el cruce de las diagonales, con dos anillos
 * que laten alrededor. La versión anterior metía ese mismo PNG con
 * `<image href>` dentro del SVG y salía estirado a ancho completo, sin
 * respetar su proporción; acá entra como `next/image` a tamaño fijo 1:1,
 * así no repite ese problema.
 */
export function MapaSimulado() {
  return (
    <figure className="m-0 overflow-hidden rounded-[6px] border border-[var(--linea)] border-t-[3px] border-t-[var(--regla)]">
      <div className="relative">
        <svg
          role="presentation"
          aria-hidden="true"
          focusable="false"
          viewBox="0 0 660 460"
          className="block h-auto w-full"
        >
          {/* Manzanas */}
          <g fill="var(--regla)" fillOpacity="0.05">
            <rect x="50" y="60" width="90" height="85" />
            <rect x="230" y="145" width="90" height="85" />
            <rect x="410" y="230" width="90" height="85" />
            <rect x="140" y="315" width="90" height="85" />
            <rect x="500" y="60" width="90" height="85" />
            <rect x="320" y="315" width="90" height="85" />
          </g>

          {/* Calles */}
          <g stroke="var(--regla)" strokeOpacity="0.16" strokeWidth="2">
            <line x1="0" y1="60" x2="660" y2="60" />
            <line x1="0" y1="145" x2="660" y2="145" />
            <line x1="0" y1="230" x2="660" y2="230" />
            <line x1="0" y1="315" x2="660" y2="315" />
            <line x1="0" y1="400" x2="660" y2="400" />
            <line x1="50" y1="0" x2="50" y2="460" />
            <line x1="140" y1="0" x2="140" y2="460" />
            <line x1="230" y1="0" x2="230" y2="460" />
            <line x1="320" y1="0" x2="320" y2="460" />
            <line x1="410" y1="0" x2="410" y2="460" />
            <line x1="500" y1="0" x2="500" y2="460" />
            <line x1="590" y1="0" x2="590" y2="460" />
          </g>

          {/* Ejes principales y diagonal secundaria */}
          <g stroke="var(--regla)" strokeOpacity="0.32" strokeWidth="5" strokeLinecap="round">
            <line x1="0" y1="230" x2="660" y2="230" />
            <line x1="320" y1="0" x2="320" y2="460" />
            <line x1="160" y1="20" x2="600" y2="460" />
          </g>

          {/* Avenida principal: el acento del campo entra como bloque de color, nunca como texto */}
          <line
            x1="40"
            y1="440"
            x2="460"
            y2="20"
            stroke="var(--acento)"
            strokeWidth="9"
            strokeLinecap="round"
          />
        </svg>

        {/* Pin sobre el cruce de las dos diagonales: mismo punto (310, 170) del viewBox 660x460 */}
        <div
          aria-hidden="true"
          className="absolute left-[47%] top-[37%] flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
        >
          <span className="jec-baliza-ring absolute size-14 rounded-full border-2 border-[var(--acento)] md:size-16" />
          <span
            className="jec-baliza-ring absolute size-14 rounded-full border-2 border-[var(--acento)] md:size-16"
            style={{ animationDelay: "1.4s" }}
          />
          <Image
            src={jecAssets.iconos.ancla}
            alt=""
            width={64}
            height={64}
            className="relative h-12 w-12 md:h-14 md:w-14"
          />
        </div>
      </div>

      <figcaption className="border-t border-[var(--linea)] px-5 py-4 text-[13px] leading-relaxed text-[var(--suave)]">
        Ilustración de referencia — la grilla y las diagonales son las de La Plata, pero no es un
        mapa a escala.
      </figcaption>
    </figure>
  )
}
