import type { ContenidoPublicoDTO } from "@/interfaces/contenido"

type VideoEmbedProps = {
  item: ContenidoPublicoDTO
}

/**
 * YouTube embed. Server Component, no client JavaScript:
 * - `youtube-nocookie.com` so a visitor is not tracked before pressing play.
 * - `loading="lazy"` so the iframe never competes with the page's LCP.
 *
 * With no `youtubeId` nothing renders at all — no thumbnail, no marker. A
 * content item without a video simply has no video section.
 */
export function VideoEmbed({ item }: VideoEmbedProps) {
  if (!item.youtubeId) return null

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
