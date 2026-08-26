import { ContenidoThumb, type ContenidoItem } from "@/components/external/contenidos"
import { PlaceholderTag } from "@/components/external/shared"

type VideoEmbedProps = {
  item: ContenidoItem
}

/**
 * YouTube embed. Server Component, no client JavaScript:
 * - `youtube-nocookie.com` so a visitor is not tracked before pressing play.
 * - `loading="lazy"` so the iframe never competes with the page's LCP.
 *
 * With no `youtubeId` the frame falls back to the item's own thumbnail plus a
 * visible marker, rather than an embed pointing at a video that does not exist.
 */
export function VideoEmbed({ item }: VideoEmbedProps) {
  if (!item.youtubeId) {
    return (
      <div>
        <ContenidoThumb item={item} className="rounded-[6px]" />
        <p className="mt-3 flex flex-wrap items-center gap-3">
          <PlaceholderTag>Video pendiente</PlaceholderTag>
          <span className="text-[13px] text-[var(--suave)]">
            El video de esta charla todavía no está publicado. Cuando lo subamos, se reproduce
            desde acá.
          </span>
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="aspect-video overflow-hidden rounded-[6px] bg-[var(--jec-ink)]">
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}`}
          title={`${item.title} — video`}
          loading="lazy"
          allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          className="h-full w-full border-0"
        />
      </div>
      <p className="mt-3 text-[13px] text-[var(--suave)]">
        Reproducido desde YouTube — el video no se aloja en el sitio.
      </p>
    </div>
  )
}
