import Image from "next/image"
import { CAMPO_A_CLASE, type CampoThumb } from "@/interfaces/contenido"
import { cn } from "@/lib/utils"

type ProductoFotoProps = {
  item: { imagenSrc: string; campo: CampoThumb; badge: string }
  className?: string
}

/**
 * Marco `campo-*` + foto `object-contain` + overlay de badge. Reemplaza a
 * `ProductoPieza.tsx` (decisión Δ4/D12): ya no hay pieza dibujada, pero el
 * marco y el badge siguen siendo obligatorios y los usan tanto la card como
 * el detalle, así que viven en un único componente y no se pegan en los dos.
 */
export function ProductoFoto({ item, className }: ProductoFotoProps) {
  return (
    <div
      className={cn(
        "relative flex aspect-[4/3] items-center justify-center overflow-hidden",
        CAMPO_A_CLASE[item.campo],
        className
      )}
    >
      {/* El passepartout: sin este wrapper, `fill` resuelve a inset-0 contra el
          marco y una foto 4/3 lo taparía entero — que es justo el bug que la
          decisión Δ5 viene a arreglar. El inset en % escala con el marco: la
          card chica y el hero de detalle muestran el mismo margen relativo. Es
          chico a proposito — el color es un borde, la foto es lo principal. */}
      <div className="absolute inset-[3%]">
        <Image
          src={item.imagenSrc}
          alt=""
          fill
          sizes="(min-width: 1024px) 384px, (min-width: 768px) 50vw, 100vw"
          className="object-contain"
        />
      </div>

      <span className="jec-label absolute left-3 top-3 rounded-[6px] bg-[var(--dato)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sup)]">
        {item.badge}
      </span>
    </div>
  )
}
