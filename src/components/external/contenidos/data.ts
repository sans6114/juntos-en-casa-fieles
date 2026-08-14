/** Extensible content kinds for the public /contenidos mock. */
export type ContenidoKind = "podcast" | "evento"

export type ContenidoItem = {
  id: string
  title: string
  description: string
  kind: ContenidoKind
}

/** Mock catalog — placeholder content for the public UI only. */
export const contenidos: ContenidoItem[] = [
  {
    id: "podcast-juntos",
    title: "Podcast Juntos En Casa",
    description:
      "Conversaciones con el equipo y los invitados sobre fe, comunidad y lo que se viene en la conferencia.",
    kind: "podcast",
  },
  {
    id: "evento-jec-2026",
    title: "El evento — JEC 2026",
    description:
      "La conferencia de adolescentes y jóvenes en Iglesia Vida Sobrenatural, La Plata.",
    kind: "evento",
  },
  {
    id: "podcast-previa",
    title: "Previa al encuentro",
    description:
      "Episodios cortos para prepararte: qué esperar, cómo llegar y cómo vivir el fin de semana juntos.",
    kind: "podcast",
  },
]
