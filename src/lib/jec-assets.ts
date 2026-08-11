/** Paths estáticos bajo `public/jec/` (año 2025 → prototipo 2026). */

export const jecAssets = {
  favicon: "/jec/favicon.svg",
  background: {
    hero: "/jec/background/fondo1.webp",
    secondary: "/jec/background/fondo2.webp",
    tertiary: "/jec/background/fondo3.webp",
    pisada: "/jec/background/background-pisada.png",
  },
  logos: {
    jecWhiteSvg: "/jec/logos/logoblanco.svg",
    jecWhitePng: "/jec/logos/logoblanco.png",
    jecBlackPng: "/jec/logos/logonegro.png",
    ivsWhite: "/jec/logos/logoVSblanco.png",
    ivsBlack: "/jec/logos/logoVSnegro.png",
  },
  oradores: {
    florMraida: "/jec/oradores/flormraida.webp",
    ezequielMangonnet: "/jec/oradores/ezequielmango.webp",
    josiasGarcia: "/jec/oradores/josias.webp",
    nataliaSpetale: "/jec/oradores/nati.webp",
    ezequielRossini: "/jec/oradores/eze.webp",
    juanPabloSosa: "/jec/oradores/juan.webp",
  },
  personaje: {
    llama: "/jec/personaje/llama.svg",
    orando: "/jec/personaje/fuegoorando.svg",
    festejando: "/jec/personaje/fuegofestejando.png",
    apuntando: "/jec/personaje/fuegoapuntandoizq.png",
  },
  hero: {
    finale: "/jec/hero/hero.png",
  },
} as const;
