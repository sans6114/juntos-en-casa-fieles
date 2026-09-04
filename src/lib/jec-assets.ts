/** Paths estáticos bajo `public/jec/` (año 2025 → prototipo 2026). */

export const jecAssets = {
  background: {
    pisada: "/jec/background/background.webp",
    /** Mismo fondo en tres anchos. El de 1920 es `pisada`; los otros dos existen
     *  para que un telefono no baje 314 KB pudiendo bajar 119. */
    pisadaSrcSet:
      "/jec/background/background-960.webp 960w, /jec/background/background-1280.webp 1280w, /jec/background/background.webp 1920w",
    /** El mismo fondo en AVIF, generado DESDE `background.webp` (1920) con
     *  `resize(lanczos3)` y `quality: 72` — nunca desde los WebP chicos, que ya
     *  son una encodeada con perdida y apilarian una segunda encima.
     *
     *  No es solo mas liviano: es mas FIEL. Midiendo el error medio por canal
     *  contra el master de 1920 reescalado, el WebP de 960 que se servia daba
     *  4,13 y este AVIF da 1,95, a 40% del peso (187 KB -> 75 KB). El WebP
     *  chico estaba mal encodeado, no es que AVIF degrade menos de lo esperado.
     *
     *  Se queda como `<source>`: el WebP sigue siendo el fallback del `<img>`. */
    pisadaAvifSrcSet:
      "/jec/background/background-960.avif 960w, /jec/background/background-1280.avif 1280w, /jec/background/background.avif 1920w",
  },
  logos: {
    /** Ver la nota de `personaje`: era un SVG de 151 KB con un PNG adentro. */
    jecWhite: "/jec/logos/logoblanco.webp",
    jecBlackPng: "/jec/logos/logonegro.png",
    ivsWhite: "/jec/logos/logoVSblanco.png",
    ivsBlack: "/jec/logos/logoVSnegro.png",
    wordmarkWhite: "/jec/recursos/logo-blanco.svg",
    wordmarkBlack: "/jec/recursos/logo-negro.svg",
  },
  /** Los cinco fueguines eran `.svg` de 453 a 1136 KB: no eran vectores, eran
   *  PNG de 1080x1080 embebidos en base64 dentro de un `viewBox`. Pesaban
   *  4,6 MB entre los seis archivos de esta seccion mas el logo.
   *
   *  El problema no era solo el peso en disco: **`next/image` no optimiza SVG**,
   *  los pasa crudos. Asi que el loader del hero, que cicla los cinco frames,
   *  bajaba los cinco archivos enteros — y Lighthouse marcaba el fueguin como
   *  elemento del LCP con 76% de render delay.
   *
   *  Ahora son WebP rasterizados a la resolucion NATIVA del PNG que tenian
   *  adentro (1080x1920, el viewBox), asi que no se pierde un pixel de
   *  resolucion: 4,6 MB -> 378 KB. Error medio por canal contra el render sin
   *  perdida del SVG: 0,53. En el canal alfa: 0,000 exacto.
   *
   *  Los `.svg` SIGUEN en `public/`: el selector de assets del admin ya no
   *  existe, pero las filas creadas cuando existia guardaron estos paths en
   *  la DB, asi que tienen que poder seguir resolviendo su `.svg`. */
  personaje: {
    /** Vector de verdad (900 bytes), no se toca. */
    llama: "/jec/personaje/llama.svg",
    alegre: "/jec/personaje/fueguin-alegre.webp",
    handsUp: "/jec/personaje/fueguin-hands-up.webp",
    saludo: "/jec/personaje/fueguin-saludo.webp",
    señalando: "/jec/personaje/fueguin-señalando.webp",
    sorpresa: "/jec/personaje/fueguin-sorpresa.webp",
  },
  hero: {
    /** Foto de fondo del frame que se expande. */
    background: "/jec/hero/hero-mobile-bg.webp",
    /** Capas sueltas con las que se compone el hero en todos los anchos. */
    wordmark: "/jec/hero/01.svg",
    cinta: "/jec/hero/cinta-frases.webp",
    logo: "/jec/hero/logo-juntos-en-casa.webp",
    /** Pieza definitiva del finale: ancla + "Anclados en Jesus" + fecha, ya
     *  compuesta y con transparencia. Reemplaza al wordmark y al ancla sueltos. */
    piezaFinale: "/jec/hero/logo-hero.webp",
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
