"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import Image from 'next/image';

import { CtaButton } from '@/components/external/shared';
import { jecAssets } from '@/lib/jec-assets';
import { siteConfig } from '@/lib/seo/site';

import ScrollExpand from './ScrollExpand';

type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

const labels = {
  days: "Días",
  hours: "Horas",
  minutes: "Min",
  seconds: "Seg",
} as const;

/** Debe coincidir con el `scrollDistance` pasado a `ScrollExpand`: define el
 * tramo (en alturas de viewport) durante el cual la imagen se expande. */
const SCROLL_DISTANCE = 1.2;
/** Máximo avance de scroll (px) permitido por evento mientras la expansión
 * está en curso, para que no se pueda "saltear" la animación de un tirón. */
const MAX_SCROLL_STEP_PX = 48;

function getTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function timeLeftKey(targetMs: number) {
  const { days, hours, minutes, seconds } = getTimeLeft(targetMs);
  return `${days}:${hours}:${minutes}:${seconds}`;
}

function parseTimeLeftKey(key: string): TimeLeft {
  const [days, hours, minutes, seconds] = key.split(":").map(Number);
  return { days, hours, minutes, seconds };
}

function subscribe(onStoreChange: () => void) {
  const id = window.setInterval(onStoreChange, 1000);
  return () => window.clearInterval(id);
}

/**
 * Frena la velocidad de scroll nativo mientras el frame de `ScrollExpand` se
 * está expandiendo (progreso 0→1), para que un scroll rápido no "salte" la
 * animación y haga desaparecer el hero antes de tiempo.
 */
function useScrollExpandLock(containerRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let lastY = window.scrollY;
    let correcting = false;

    const getZone = () => {
      const top = container.getBoundingClientRect().top + window.scrollY;
      return { start: top, end: top + window.innerHeight * SCROLL_DISTANCE };
    };

    const onScroll = () => {
      if (correcting) {
        correcting = false;
        lastY = window.scrollY;
        return;
      }

      const y = window.scrollY;
      const { start, end } = getZone();
      const insideOpeningZone = y > start && y < end;
      const advancingTooFast = y - lastY > MAX_SCROLL_STEP_PX;

      if (insideOpeningZone && advancingTooFast) {
        correcting = true;
        window.scrollTo(0, lastY + MAX_SCROLL_STEP_PX);
      }

      lastY = window.scrollY;
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [containerRef]);
}

/**
 * Hero final: frame de `background-pisada.png` que se expande con el scroll
 * (ScrollExpand) y revela, ya en pantalla completa, el logo, el CTA de
 * inscripción y la cuenta regresiva.
 */
export function HeroFinale() {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollExpandLock(containerRef);

  const targetMs = new Date(siteConfig.eventStartsAt).getTime();
  const snapshot = useSyncExternalStore(
    subscribe,
    () => timeLeftKey(targetMs),
    () => "0:0:0:0"
  );
  const units = parseTimeLeftKey(snapshot);

  return (
    <div ref={containerRef} className="bg-[var(--jec-ember)]">
      <h1 className="sr-only">Juntos en casa - Fieles 2026 — 18, 19 y 20 de septiembre</h1>

      <ScrollExpand
        src={jecAssets.background.pisada}
        alt="Fieles — conferencia de adolescentes y jóvenes 2026"
        scrollDistance={SCROLL_DISTANCE}
        useWindowScroll
      >
        <div className="flex h-full w-full flex-col items-center justify-between">
          <Image
            src={jecAssets.logos.jecWhiteSvg}
            alt={siteConfig.name}
            width={100}
            height={148}
            className="h-96 w-auto"
          />

          <div className="flex flex-col items-center gap-6 sm:gap-8">
            <div
              className="grid grid-cols-4 gap-3 sm:gap-6 md:gap-10"
              role="timer"
              aria-live="polite"
              aria-label="Cuenta regresiva al inicio del evento"
            >
              {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
                <div key={key} className="flex flex-col items-center">
                  <span className="jec-label text-4xl font-extrabold leading-none tracking-tight text-[var(--jec-bone)] tabular-nums sm:text-5xl md:text-7xl lg:text-8xl">
                    {pad(units[key])}
                  </span>
                  <span className="jec-label mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--jec-smoke)] sm:text-xs md:mt-3 md:text-sm">
                    {labels[key]}
                  </span>
                </div>
              ))}
            </div>
            <CtaButton href="/#inscripcion" variant="pill">
              Inscribirme
            </CtaButton>
          </div>
        </div>
      </ScrollExpand>
    </div>
  );
}
