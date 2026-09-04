import Image from "next/image"
import { cn } from "@/lib/utils"

type ProductoFotoProps = {
  item: { imagenSrc: string; badge: string }
  className?: string
}

/**
 * Foto `object-cover` llenando el marco + overlay de badge. Reemplaza a
 * `ProductoPieza.tsx` (decisión Δ4/D12): ya no hay pieza dibujada, y el color
 * de fondo se sacó (la foto ocupa el 100% del marco, sin passepartout). El
 * badge sigue siendo obligatorio y lo usan tanto la card como el detalle, así
 * que vive en un único componente y no se pega en los dos.
 */
export function ProductoFoto({ item, className }: ProductoFotoProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden",
        className
      )}
    >
      <Image
        src={item.imagenSrc}
        alt=""
        fill
        sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
        className="object-cover"
      />

      <span className="jec-label absolute left-3 top-3 rounded-[6px] bg-[var(--dato)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sup)]">
        {item.badge}
      </span>
    </div>
  )
}
