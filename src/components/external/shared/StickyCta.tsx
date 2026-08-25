import { CtaButton } from "./CtaButton"

/**
 * Barra CTA persistente solo móvil (D5/D6 de landing-home-secciones):
 * `fixed` abajo, campo tinta con regla superior de 3px, un único CTA a /inscripcion.
 * El min-h y la reserva del footer consumen la misma --jec-cta-h, así los dos
 * números no pueden divergir. Componente de servidor: CSS puro, cero JavaScript.
 */
export function StickyCta() {
  return (
    <div className="campo-tinta fixed inset-x-0 bottom-0 z-40 flex min-h-[var(--jec-cta-h)] items-center justify-center border-t-[3px] border-[var(--regla)] px-6 pb-[env(safe-area-inset-bottom,0px)] md:hidden">
      <CtaButton href="/inscripcion">Inscribirme</CtaButton>
    </div>
  )
}
