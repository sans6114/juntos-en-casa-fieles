import Image from "next/image"
import { ImagesIcon, PlayIcon } from "@/components/external/shared"
import { cn } from "@/lib/utils"

import { kindLabel, type ContenidoItem } from "./data"

type ContenidoThumbProps = {
  item: ContenidoItem
  /** Diameter of the play badge; the related-content strip uses a smaller one. */
  playSize?: "sm" | "md"
  className?: string
}

/**
 * 16:9 thumbnail. There are no photographic thumbnails in the repo, so the frame
 * is a brand-colour field that may carry one real asset — never an invented photo.
 */
export function ContenidoThumb({ item, playSize = "md", className }: ContenidoThumbProps) {
  const { thumb, kind, durationLabel, placasCount } = item
  const isPlayable = kind !== "recurso"

  return (
    <div
      className={cn(
        "relative flex aspect-video items-center justify-center overflow-hidden",
        thumb.field,
        className
      )}
    >
      {thumb.src ? (
        <Image
          src={thumb.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
          className={cn(
            thumb.fit === "cover" ? "object-cover" : "object-contain p-4",
            thumb.dim && "opacity-55"
          )}
        />
      ) : null}

      {kind === "recurso" && placasCount ? (
        <div className="relative flex flex-col items-center gap-2 text-[var(--dato)]">
          <ImagesIcon size={48} strokeWidth={1.6} />
          <p className="jec-mono text-[13px] font-bold uppercase tracking-[0.28em]">
            {placasCount} placas
          </p>
        </div>
      ) : null}

      <span className="jec-label absolute left-3 top-3 rounded-[6px] bg-[var(--dato)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sup)]">
        {kindLabel(kind)}
      </span>

      {isPlayable ? (
        <span
          className={cn(
            "absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--jec-bone)] text-[var(--jec-ink)] shadow-[3px_3px_0_0_rgb(11_10_15/55%)]",
            playSize === "md" ? "size-14" : "size-12"
          )}
        >
          <PlayIcon size={playSize === "md" ? 20 : 18} />
        </span>
      ) : null}

      {durationLabel ? (
        <span className="jec-mono absolute bottom-3 right-3 rounded-[6px] bg-[rgb(11_10_15/82%)] px-2 py-1 text-xs font-bold tracking-[0.08em] text-[var(--jec-bone)]">
          {durationLabel}
        </span>
      ) : null}
    </div>
  )
}
