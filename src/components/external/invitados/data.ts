// TODO(landing-home-secciones): fotos reales de oradores pendientes; ver src/lib/jec-assets.ts (oradores eliminado, archivos borrados).
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
    imageSrc: "/jec/oradores/flormraida.webp",
    accent: "ember",
  },
  {
    id: "ezequiel-mangonnet",
    name: "Ezequiel Mangonnet",
    imageSrc: "/jec/oradores/ezequielmango.webp",
    accent: "amber",
  },
  {
    id: "josias-garcia",
    name: "Josías García",
    imageSrc: "/jec/oradores/josias.webp",
    accent: "ember",
  },
  {
    id: "natalia-spetale",
    name: "Natalia Spetale",
    imageSrc: "/jec/oradores/nati.webp",
    accent: "amber",
  },
  {
    id: "ezequiel-rossini",
    name: "Ezequiel Rossini",
    imageSrc: "/jec/oradores/eze.webp",
    accent: "ember",
  },
  {
    id: "juan-pablo-sosa",
    name: "Juan Pablo Sosa",
    imageSrc: "/jec/oradores/juan.webp",
    accent: "amber",
  },
]
