import { Hero } from '@/components/external/hero';
import { Cronograma } from '@/components/external/cronograma';
import { Invitados } from '@/components/external/invitados';
import { Ubicacion } from '@/components/external/ubicacion';
import { Faq } from '@/components/external/faq';
import { SiteHeader } from '@/components/external/shared';
// Montados por import directo (no barrel): el index.ts de shared/ está sucio con
// ediciones ajenas y no entra en el commit de esta fase.
import { SiteFooter } from '@/components/external/shared/SiteFooter';
import { StickyCta } from '@/components/external/shared/StickyCta';

export default function ExternalPage() {
  return (
    <>
      <Hero />
      <SiteHeader
        logo="dark"
        className="campo-papel sticky top-0 z-50 min-h-[var(--jec-header-h)] pb-6 md:pb-8"
      />
      <Cronograma />
      <Invitados />
      <Ubicacion />
      <Faq />
      <SiteFooter />
      <StickyCta />
    </>
  )
}
