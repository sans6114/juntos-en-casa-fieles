import Image from "next/image";
import Link from "next/link";
import { jecAssets } from "@/lib/jec-assets";
import { siteConfig } from "@/lib/seo/site";
import { HeroCountdown } from "./HeroCountdown";

export function HeroPrototype() {
  return (
    <section className="relative flex min-h-dvh flex-col overflow-hidden">
      <Image
        src={jecAssets.background.hero}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-center"
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[var(--jec-ink)] via-[var(--jec-ink)]/75 to-[var(--jec-ink)]/40"
        aria-hidden
      />

      <header className="relative z-10 flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
        <Link href="/" className="inline-flex items-center" aria-label="Inicio">
          <Image
            src={jecAssets.logos.ivsWhite}
            alt="Iglesia Vida Sobrenatural"
            width={40}
            height={40}
            className="h-8 w-auto md:h-10"
          />
        </Link>
        <Link
          href="#inscripcion"
          className="jec-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--jec-bone)] transition-colors hover:text-[var(--jec-amber)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)]"
        >
          Inscribirme
        </Link>
      </header>

      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-16 pt-10 text-center md:px-10">
        <p className="jec-display mb-4 text-xs font-bold uppercase tracking-[0.28em] text-[var(--jec-amber)] md:text-sm">
          {siteConfig.year}
        </p>

        <h1 className="sr-only">
          {siteConfig.name} {siteConfig.year}
        </h1>
        <Image
          src={jecAssets.logos.jecWhiteSvg}
          alt={siteConfig.name}
          width={560}
          height={200}
          priority
          className="h-auto w-[min(88vw,28rem)] md:w-[min(70vw,34rem)]"
          unoptimized
        />

        <HeroCountdown />

        <blockquote className="mt-8 max-w-3xl md:mt-12">
          <p className="jec-display text-2xl font-extrabold leading-snug tracking-tight text-[var(--jec-bone)] sm:text-3xl md:text-4xl md:leading-tight lg:text-5xl">
            Por eso les digo: dejen que el Espíritu Santo los guíe en la vida
          </p>
          <cite className="jec-display mt-4 block text-sm font-bold not-italic uppercase tracking-[0.22em] text-[var(--jec-amber)] md:mt-5 md:text-base">
            Gálatas 5:25
          </cite>
        </blockquote>

        <Link
          href="#inscripcion"
          className="jec-display mt-10 inline-flex items-center justify-center bg-[var(--jec-ember)] px-8 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-[var(--jec-bone)] transition-colors hover:bg-[var(--jec-amber)] hover:text-[var(--jec-ink)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)] md:mt-12 md:px-10 md:py-4 md:text-base"
        >
          Inscribirme
        </Link>
      </div>

      {/* Ancla placeholder para el CTA; la inscripción llega en una fase siguiente */}
      <div id="inscripcion" className="sr-only" aria-hidden />
    </section>
  );
}
