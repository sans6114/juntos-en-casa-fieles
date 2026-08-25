import { Hero } from '@/components/external/hero';
import { Cronograma } from '@/components/external/cronograma';
import { Invitados } from '@/components/external/invitados';
import { Ubicacion } from '@/components/external/ubicacion';
import { Faq } from '@/components/external/faq';
import { SiteFooter, SiteHeader, StickyCta } from '@/components/external/shared';

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
