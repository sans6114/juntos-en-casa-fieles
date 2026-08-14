import { jecAssets } from "@/lib/jec-assets"

export type Invitado = {
  id: string
  name: string
  imageSrc: string
  accent: "ember" | "amber"
}

export const invitados: Invitado[] = [
  {
    id: "flor-mraida",
    name: "Flor Mraida",
    imageSrc: jecAssets.oradores.florMraida,
    accent: "ember",
  },
  {
    id: "ezequiel-mangonnet",
    name: "Ezequiel Mangonnet",
    imageSrc: jecAssets.oradores.ezequielMangonnet,
    accent: "amber",
  },
  {
    id: "josias-garcia",
    name: "Josías García",
    imageSrc: jecAssets.oradores.josiasGarcia,
    accent: "ember",
  },
  {
    id: "natalia-spetale",
    name: "Natalia Spetale",
    imageSrc: jecAssets.oradores.nataliaSpetale,
    accent: "amber",
  },
  {
    id: "ezequiel-rossini",
    name: "Ezequiel Rossini",
    imageSrc: jecAssets.oradores.ezequielRossini,
    accent: "ember",
  },
  {
    id: "juan-pablo-sosa",
    name: "Juan Pablo Sosa",
    imageSrc: jecAssets.oradores.juanPabloSosa,
    accent: "amber",
  },
]
