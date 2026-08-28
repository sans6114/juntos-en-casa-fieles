import Image from "next/image"
import { BRAND_NAME, BrandName } from "@/components/external/shared"
import { jecAssets } from "@/lib/jec-assets"
import { cn } from "@/lib/utils"

import type { ProductoItem, ProductoVariante } from "./data"

type ProductoPiezaProps = {
  item: ProductoItem
  /**
   * Renders the piece on a specific colour variant's field instead of
   * `item.field` — used only by the detail page's colour-variant row.
   */
  variante?: ProductoVariante
  /** "hero" (58%) is the detail page's lead frame; "card" (62%, default) is everywhere else. */
  size?: "card" | "hero"
  className?: string
}

/**
 * The drawn-piece frame. There is no product photography in `public/jec/`,
 * so a product is represented as a flat vector silhouette on a `campo-*`
 * field — visibly an illustration, never a fabricated photo. See
 * design.md §3. Server Component: no state, no external request.
 */
export function ProductoPieza({ item, variante, size = "card", className }: ProductoPiezaProps) {
  const field = variante?.field ?? item.field
  const pieceWidthClass = item.pieza === "remera" && size === "hero" ? "w-[58%]" : "w-[62%]"

  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden",
        field,
        className
      )}
    >
      {item.foto ? (
        <Image
          src={item.foto}
          alt=""
          fill
          sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      ) : item.pieza === "remera" ? (
        <RemeraPieza item={item} variante={variante} widthClassName={pieceWidthClass} />
      ) : (
        <StickersPieza widthClassName={pieceWidthClass} />
      )}

      <span className="jec-label absolute left-3 top-3 rounded-[6px] bg-[var(--dato)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sup)]">
        {item.badge}
      </span>
    </div>
  )
}

type RemeraPiezaProps = {
  item: ProductoItem
  variante?: ProductoVariante
  widthClassName: string
}

function RemeraPieza({ item, variante, widthClassName }: RemeraPiezaProps) {
  const resolved = variante ?? item.variantes?.find((v) => v.field === item.field)
  const prendaFill = resolved?.prendaFill ?? "#f4efe8"
  const prendaStroke = resolved?.prendaStroke ?? "#0b0a0f"
  const wordmark = resolved?.wordmark ?? jecAssets.logos.wordmarkBlack

  return (
    <div className={cn("relative", widthClassName)}>
      <svg viewBox="0 0 200 200" className="h-auto w-full" aria-hidden="true" focusable="false">
        <path
          d="M62 34 L44 42 L26 76 L52 92 L60 76 L60 168 L140 168 L140 76 L148 92 L174 76 L156 42 L138 34 C132 48 118 55 100 55 C82 55 68 48 62 34 Z"
          fill={prendaFill}
          stroke={prendaStroke}
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path
          d="M62 34 C68 48 82 55 100 55 C118 55 132 48 138 34"
          fill="none"
          stroke={prendaStroke}
          strokeWidth={3}
        />
      </svg>

      <div className="absolute left-1/2 top-[52%] w-[34%] -translate-x-1/2 -translate-y-1/2">
        <Image src={wordmark} alt="" width={96} height={96} className="h-auto w-full" />
      </div>
    </div>
  )
}

function StickersPieza({ widthClassName }: { widthClassName: string }) {
  return (
    <div className={cn("relative aspect-square", widthClassName)}>
      <div className="absolute left-[2%] top-[14%] flex aspect-square w-[44%] rotate-[-9deg] items-center justify-center rounded-full bg-[#f4efe8] shadow-[0_0_0_5px_#f4efe8]">
        <div className="relative aspect-square w-[66%]">
          <Image
            src={jecAssets.logos.wordmarkBlack}
            alt=""
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="absolute right-0 top-0 flex aspect-square w-[38%] rotate-[7deg] items-center justify-center rounded-[6px] bg-[#0b0a0f] shadow-[0_0_0_5px_#f4efe8]">
        <div className="relative aspect-square w-[52%]">
          <Image
            src={jecAssets.personaje.llama}
            alt=""
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="absolute bottom-[2%] right-[8%] flex aspect-square w-[34%] rotate-[-4deg] items-center justify-center rounded-full bg-[#c0f700] shadow-[0_0_0_5px_#f4efe8]">
        <div className="relative aspect-square w-[56%]">
          <Image
            src={jecAssets.iconos.ancla}
            alt=""
            fill
            sizes="120px"
            className="object-contain"
          />
        </div>
      </div>

      <div className="jec-mono absolute bottom-[6%] left-[6%] w-[36%] rotate-[5deg] rounded-[6px] bg-[#f4efe8] px-3 py-2 text-center text-[11px] font-bold uppercase tracking-[0.14em] text-[#0b0a0f] shadow-[0_0_0_5px_#f4efe8]">
        <BrandName>{BRAND_NAME}</BrandName> 2026
      </div>
    </div>
  )
}
