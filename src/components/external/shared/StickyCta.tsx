import { CtaButton } from "./CtaButton"

/**
 * Barra CTA persistente solo móvil (D5/D6 de landing-home-secciones).
 *
 * `sticky bottom-0`, no `fixed`: va como último hijo del contenedor post-hero
 * de `/`, así que mientras el hero está en pantalla la barra todavía no entró
 * en el viewport. Eso resuelve dos choques que `fixed` provocaba sobre el hero:
 * `HeroFinale` ya tiene su propio CTA "Inscribirme", y su fondo es
 * `--jec-ember`, con lo cual una barra `campo-fuego` quedaba ember sobre ember.
 * Al final de la página la barra aterriza en su lugar de flujo, debajo del
 * footer, así que en reposo no tapa nada — sigue siendo CSS puro, cero
 * JavaScript y Server Component.
 *
 * Lleva `campo-fuego` — no el footer. El spec pide que exactamente una de las
 * dos superficies use ese campo, y la brasa rinde más como bloque de color
 * detrás de la acción que como fondo de una tira de enlaces. Sobre ember,
 * `--cta-bg`/`--cta-fg` dan ink sobre hueso: 17,25:1.
 */
export function StickyCta() {
  return (
    <div className="campo-fuego sticky bottom-0 z-40 flex min-h-[var(--jec-cta-h)] items-center justify-center border-t-[3px] border-[var(--regla)] px-6 pb-[env(safe-area-inset-bottom,0px)] md:hidden">
      <CtaButton href="/inscripcion">Inscribirme</CtaButton>
    </div>
  )
}
