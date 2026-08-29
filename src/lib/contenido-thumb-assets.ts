import { jecAssets } from "@/lib/jec-assets"

/**
 * Subconjunto curado de `jecAssets` habilitado como thumbnail de un
 * `Contenido`. Excluye: favicon, fondos (`background`, `hero.background`),
 * imágenes OG, las capas de composición del hero (`hero.wordmark`,
 * `hero.cinta`, `hero.logo`) y los íconos (`iconos.*`).
 *
 * También excluye por ahora `galeria.*`: esas rutas en `jec-assets.ts`
 * todavía apuntan a `.jpg` inexistentes (se corrigen a `.webp` recién en el
 * slice de galería) y no son el tipo de asset de marca que hoy usa
 * `contenidos/data.ts` como miniatura — ver el comentario de `ContenidoThumb`
 * ahí: "no hay miniaturas fotográficas... la miniatura es un bloque de color
 * de marca que puede llevar un asset real".
 *
 * Esta es la única fuente: alimenta tanto el enum de Zod `imagenSrc`
 * (`src/interfaces/contenido.ts`) como el `<Select>` del admin, para que no
 * puedan desincronizarse.
 */
export const CONTENIDO_THUMB_ASSETS = [
  { label: "Logos · JEC blanco", value: jecAssets.logos.jecWhiteSvg },
  { label: "Logos · JEC negro", value: jecAssets.logos.jecBlackPng },
  { label: "Logos · IVS blanco", value: jecAssets.logos.ivsWhite },
  { label: "Logos · IVS negro", value: jecAssets.logos.ivsBlack },
  { label: "Logos · wordmark blanco", value: jecAssets.logos.wordmarkWhite },
  { label: "Logos · wordmark negro", value: jecAssets.logos.wordmarkBlack },
  { label: "Personaje · llama", value: jecAssets.personaje.llama },
  { label: "Personaje · orando", value: jecAssets.personaje.orando },
  { label: "Personaje · festejando", value: jecAssets.personaje.festejando },
  { label: "Personaje · apuntando", value: jecAssets.personaje.apuntando },
  { label: "Hero · final", value: jecAssets.hero.finale },
  { label: "Frases · esquina", value: jecAssets.frases.esquina },
  { label: "Recursos · huellas", value: jecAssets.recursos.huellas },
  { label: "Recursos · fondo de colores", value: jecAssets.recursos.backgroundColores },
  { label: "Recursos · logo blanco", value: jecAssets.recursos.logoBlanco },
  { label: "Recursos · logo blanco (desc.)", value: jecAssets.recursos.logoBlancoDesc },
  { label: "Recursos · logo color", value: jecAssets.recursos.logoColor },
  { label: "Recursos · logo negro", value: jecAssets.recursos.logoNegro },
  { label: "Recursos · logo negro (desc.)", value: jecAssets.recursos.logoNegroDesc },
] as const
