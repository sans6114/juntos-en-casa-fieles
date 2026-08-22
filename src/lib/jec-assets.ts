/** Paths estáticos bajo `public/jec/` (año 2025 → prototipo 2026). */

export const jecAssets = {
  favicon: "/jec/favicon.svg",
  background: {
    pisada: "/jec/background/background.webp",
  },
  logos: {
    jecWhiteSvg: "/jec/logos/logoblanco.svg",
    jecBlackPng: "/jec/logos/logonegro.png",
    ivsWhite: "/jec/logos/logoVSblanco.png",
    ivsBlack: "/jec/logos/logoVSnegro.png",
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
  iconos: {
    ancla: "/jec/iconos/ancla.png",
    pisada: "/jec/iconos/pisada.png",
  },
  recursos: {
    huellas: "/jec/recursos/huellas.svg",
    backgroundColores: "/jec/recursos/background-colores.svg",
    logoBlanco: "/jec/recursos/logo-blanco.svg",
    logoBlancoDesc: "/jec/recursos/logo-blanco-desc.svg",
    logoColor: "/jec/recursos/logo-color.svg",
    logoNegro: "/jec/recursos/logo-negro.svg",
    logoNegroDesc: "/jec/recursos/logo-negro-desc.svg",
  },
  og: {
    default: "/jec/og/og-jec-2026.jpg",
  },
} as const;
