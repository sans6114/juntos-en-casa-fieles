import type { ReactNode } from "react"

type InscripcionCardProps = {
  titulo: string
  subtitulo: string
  children: ReactNode
}

/**
 * El marco del formulario de inscripción. Lo comparten /inscripcion y /mi-qr:
 * es exactamente la parte que se desincroniza cuando se copia y pega, porque
 * son clases sueltas sin nada que avise si una de las dos se va corriendo.
 *
 * El formulario no lo incluye a propósito: así cada página pone su propio
 * encabezado sin que el componente necesite un slot ni una variante.
 */
export function InscripcionCard({ titulo, subtitulo, children }: InscripcionCardProps) {
  return (
    <div className="min-w-0 rounded-[6px] border border-[var(--linea)] border-t-[3px] border-t-[var(--regla)] p-6 sm:p-10">
      <h2 className="jec-label text-2xl font-extrabold tracking-tight">{titulo}</h2>
      <p className="mt-2 text-[15px] text-[var(--suave)]">{subtitulo}</p>

      <div className="mt-8">{children}</div>

      <p className="mt-6 text-center text-[13px] leading-relaxed text-[var(--suave)]">
        Usamos tus datos solo para organizar la conferencia y contactarte.
      </p>
    </div>
  )
}
