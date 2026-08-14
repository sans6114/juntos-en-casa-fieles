import { SectionHeading } from "@/components/external/shared"

import { InvitadoCard } from "./InvitadoCard"
import { invitados } from "./data"

export function Invitados() {
  return (
    <section
      id="invitados"
      aria-label="Invitados"
      className="bg-[var(--jec-ink)] px-6 py-20 md:px-10 md:py-28 lg:px-16"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          eyebrow="¿Quiénes vienen?"
          title="Invitados"
          className="mb-12 md:mb-16"
        />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-6 lg:gap-5">
          {invitados.map((invitado) => (
            <li key={invitado.id}>
              <InvitadoCard invitado={invitado} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
