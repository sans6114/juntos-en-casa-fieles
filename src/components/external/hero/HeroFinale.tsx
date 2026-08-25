"use client";

import {
  useEffect,
  useRef,
  useSyncExternalStore,
} from 'react';

import Image from 'next/image';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';

import { CtaButton } from '@/components/external/shared';
import { jecAssets } from '@/lib/jec-assets';
import { siteConfig } from '@/lib/seo/site';

import ScrollExpand from './ScrollExpand';

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

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

/** Frases del tema 2026, repetidas en la cinta de señalización sobre "Fieles". */
const tapePhrases = [
  "Anclados en la roca",
  "Permaneciendo en la palabra",
  "Viviendo en libertad",
  "Caminando en la verdad",
] as const;

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
 * Hero final: frame de fondo que se expande con el scroll (ScrollExpand) y
 * revela, ya en pantalla completa, el wordmark "Fieles" con la cinta de
 * señalización animada, la cuenta regresiva y el CTA de inscripción.
 */
export function HeroFinale({ onReplay }: { onReplay?: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useScrollExpandLock(containerRef);

  const targetMs = new Date(siteConfig.eventStartsAt).getTime();
  const snapshot = useSyncExternalStore(
    subscribe,
    () => timeLeftKey(targetMs),
    () => "0:0:0:0"
  );
  const units = parseTimeLeftKey(snapshot);

  const tapeRef = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(tapeRef.current, {
          xPercent: -50,
          duration: 22,
          ease: "none",
          repeat: -1,
        });
        return () => tween.kill();
      });
      return () => mm.revert();
    },
    { scope: tapeRef }
  );
  const tapeItems = [...tapePhrases, ...tapePhrases];

  return (
    <div ref={containerRef} className="bg-[var(--jec-ember)]">
      <h1 className="sr-only">Juntos en casa - Fieles 2026 — 18, 19 y 20 de septiembre</h1>

      <ScrollExpand
        src={jecAssets.background.pisada}
        alt="Fieles — conferencia de adolescentes y jóvenes 2026"
        mediaWidth={1920}
        mediaHeight={1081}
        scrollDistance={SCROLL_DISTANCE}
        useWindowScroll
      >
        <div className="relative flex h-full w-full flex-col justify-between overflow-hidden px-6 py-8 sm:px-10 sm:py-10 md:px-14 md:py-12">
          <Image
            src={jecAssets.recursos.huellas}
            alt=""
            aria-hidden
            width={220}
            height={220}
            className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 -rotate-6 opacity-80 sm:h-44 sm:w-44 md:h-56 md:w-56"
          />

          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <span className="jec-mono flex flex-col items-center rounded-2xl bg-[var(--jec-amber)] px-4 py-2 text-center text-[0.65rem] font-black uppercase leading-[1.05] text-[var(--jec-ink)] sm:px-5 sm:py-2.5 sm:text-xs">
              <span>Juntos</span>
              <span>en casa</span>
            </span>
            <p className="jec-label max-w-[14rem] text-xs font-bold uppercase leading-tight tracking-[0.08em] text-[var(--jec-bone)] sm:max-w-xs sm:text-sm">
              Conferencia de adolescentes y jóvenes 2026
            </p>
          </div>

          <div className="relative flex flex-1 flex-col justify-center py-6">
            <p className="jec-mono text-2xl font-black tracking-tight text-[var(--jec-amber)] sm:text-3xl md:text-4xl">
              18 · 19 · 20 SEPT
            </p>

            <div className="relative -mx-2 mt-1">
              <p aria-hidden className="jec-display select-none text-[clamp(3rem,15vw,9rem)] uppercase leading-[0.86] tracking-tight text-[var(--jec-bone)]">
                Fieles
                <span aria-hidden className="ml-2 inline-block align-middle text-[0.5em]">
                  🔥
                </span>
              </p>

              <div
                aria-hidden
                className="pointer-events-none absolute left-[-10%] top-1/2 w-[120%] -translate-y-1/2 -rotate-3 overflow-hidden border-y-2 border-[var(--jec-ink)] bg-[var(--jec-amber)] py-1.5"
              >
                <div ref={tapeRef} className="flex w-max items-center gap-6 whitespace-nowrap will-change-transform">
                  {tapeItems.map((phrase, index) => (
                    <span
                      key={`${phrase}-${index}`}
                      className="jec-mono flex items-center gap-6 text-[0.6rem] font-black uppercase tracking-[0.16em] text-[var(--jec-ink)] sm:text-xs md:text-sm"
                    >
                      {phrase}
                      <span className="text-[var(--jec-ember)]">•</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <span className="jec-label mt-4 inline-block w-fit bg-[var(--jec-amber)] px-3 py-1 text-xs font-black uppercase tracking-[0.1em] text-[var(--jec-ink)] sm:px-4 sm:py-1.5 sm:text-sm md:text-base">
              Permaneciendo en su amor
            </span>
          </div>

          <div className="flex flex-col items-center gap-6 sm:gap-8">
            {/* Estatico y sin region live: los digitos se refrescan cada 1000ms,
              * asi que `role="timer" aria-live="polite"` hacia que el lector
              * reanunciara la cuenta para siempre. El dato util es cuando
              * empieza, no cuantos segundos faltan. */}
            <p className="sr-only">
              Faltan {units.days} dias para el inicio: 18, 19 y 20 de septiembre de 2026.
            </p>

            <div aria-hidden className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
              {(Object.keys(labels) as Array<keyof typeof labels>).map((key, index) => (
                <div key={key} className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3">
                  <div
                    className="flex flex-col items-center justify-center bg-[var(--jec-amber)] px-2.5 py-1.5 sm:px-3.5 sm:py-2 md:px-4 md:py-2.5"
                    style={{
                      clipPath:
                        "polygon(0 0, calc(100% - 10px) 0, 100% 50%, calc(100% - 10px) 100%, 0 100%)",
                    }}
                  >
                    <span className="jec-label text-xl font-black leading-none tracking-tight text-[var(--jec-ink)] tabular-nums sm:text-2xl md:text-4xl lg:text-5xl">
                      {pad(units[key])}
                    </span>
                    <span className="jec-mono text-[0.5rem] font-bold uppercase tracking-[0.14em] text-[var(--jec-ink)]/70 sm:text-[0.6rem] md:text-xs">
                      {labels[key]}
                    </span>
                  </div>
                  {index < 3 ? (
                    <span aria-hidden className="jec-mono text-sm font-black text-[var(--jec-amber)] sm:text-base md:text-xl">
                      →
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
            <CtaButton href="/inscripcion" variant="pill">
              Inscribirme
            </CtaButton>

            {/* Vive en el overlay de ScrollExpand, que recién se hace visible
              * cuando el frame termina de abrirse (opacity con
              * smoothstep(0.68, 1, p)). Ahí sí se entiende qué animación
              * repite: la que el visitante acaba de terminar de ver. */}
            {onReplay ? (
              <button
                type="button"
                onClick={onReplay}
                className="jec-mono text-[0.6rem] font-bold uppercase tracking-[0.18em] text-[var(--jec-bone)]/60 underline underline-offset-4 transition-colors hover:text-[var(--jec-bone)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)] sm:text-xs"
              >
                Ver animación
              </button>
            ) : null}
          </div>
        </div>
      </ScrollExpand>
    </div>
  );
}
