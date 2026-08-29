/** Paths estáticos bajo `public/jec/` (año 2025 → prototipo 2026). */

export const jecAssets = {
  favicon: "/jec/favicon.svg",
  background: {
    pisada: "/jec/background/background.webp",
    /** Mismo fondo en tres anchos. El de 1920 es `pisada`; los otros dos existen
     *  para que un telefono no baje 314 KB pudiendo bajar 119. */
    pisadaSrcSet:
      "/jec/background/background-960.webp 960w, /jec/background/background-1280.webp 1280w, /jec/background/background.webp 1920w",
  },
  logos: {
    jecWhiteSvg: "/jec/logos/logoblanco.svg",
    jecBlackPng: "/jec/logos/logonegro.png",
    ivsWhite: "/jec/logos/logoVSblanco.png",
    ivsBlack: "/jec/logos/logoVSnegro.png",
    wordmarkWhite: "/jec/recursos/logo-blanco.svg",
    wordmarkBlack: "/jec/recursos/logo-negro.svg",
  },
  personaje: {
    llama: "/jec/personaje/llama.svg",
    alegre: "/jec/personaje/fueguin-alegre.svg",
    handsUp: "/jec/personaje/fueguin-hands-up.svg",
    saludo: "/jec/personaje/fueguin-saludo.svg",
    señalando: "/jec/personaje/fueguin-señalando.svg",
    sorpresa: "/jec/personaje/fueguin-sorpresa.svg",
  },
  hero: {
    finale: "/jec/hero/hero.png",
    /** Foto de fondo del frame que se expande. */
    background: "/jec/hero/hero-mobile-bg.webp",
    /** Capas sueltas con las que se compone el hero en todos los anchos. */
    wordmark: "/jec/hero/01.svg",
    cinta: "/jec/hero/cinta-frases.webp",
    logo: "/jec/hero/logo-juntos-en-casa.webp",
  },
  iconos: {
    pisada: "/jec/iconos/pisada.png",
    ancla: "/jec/iconos/ancla.png",
  },
  frases: {
    esquina: "/jec/frases/esquina.png",
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
    /** 1200x630 derived from `/jec/hero/hero-desktop.webp`. The filename carries
     *  the edition on purpose: social platforms cache previews by URL, so a new
     *  edition needs a new path to be refetched. */
    default: "/jec/og/og-jec-2026-fieles.jpg",
    width: 1200,
    height: 630,
  },
  galeria: {
    foto1: "/jec/galeria/foto-1.webp",
    foto2: "/jec/galeria/foto-2.webp",
    foto3: "/jec/galeria/foto-3-v2.webp",
    foto4: "/jec/galeria/foto-4.webp",
    foto5: "/jec/galeria/foto-5.webp",
    foto6: "/jec/galeria/foto-6.webp",
  },
} as const;
