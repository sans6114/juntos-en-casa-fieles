import type { Invitado } from "./data"

type InvitadoCardProps = {
  invitado: Invitado
}

export function InvitadoCard({ invitado }: InvitadoCardProps) {
  return (
    <article className="flex aspect-[3/4] w-full flex-col items-center justify-center gap-4 border border-[var(--linea)] px-4 py-6 text-center">
      <span aria-hidden className="jec-display text-7xl leading-none text-[var(--acento)] md:text-8xl">
        ?
      </span>
      <p className="jec-label text-sm md:text-base">{invitado.name}</p>
    </article>
  )
}
