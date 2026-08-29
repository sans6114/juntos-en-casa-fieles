"use client";

import { useRef, useState } from 'react';

import gsap from 'gsap';
import Image from 'next/image';

import { jecAssets } from '@/lib/jec-assets';
import { useGSAP } from '@gsap/react';

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

const LOADER_FRAMES = [
  jecAssets.personaje.orando,
  jecAssets.personaje.festejando,
  jecAssets.personaje.apuntando,
];

const FRAME_INTERVAL_MS = 420;
const LOAD_DURATION_S = 3;
const FADE_DURATION_S = 0.45;

/**
 * Loader fullscreen que da paso directo al hero final (`ScrollExpand`). Sin
 * navbar: el hero final trae su propio logo/CTA (ver HeroFinale).
 *
 * Quien llega con hash (`/#cronograma` desde el navbar de otra página) pidió
 * una sección concreta, no la intro: el loader ni siquiera llega a mostrarse,
 * `onIntroDone` se llama de una para revelar el hero y dejar que el scroll al
 * ancla se resuelva ahí.
 */
export function HeroSequence({ onIntroDone }: { onIntroDone: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const [frame, setFrame] = useState(0);

  useGSAP(
    () => {
      if (window.location.hash) {
        onIntroDone();
        return;
      }

      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(loaderRef.current, { autoAlpha: 0 });
        onIntroDone();
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const frameId = window.setInterval(() => {
          setFrame((current) => (current + 1) % LOADER_FRAMES.length);
        }, FRAME_INTERVAL_MS);

        const progress = { value: 0 };
        const intro = gsap.timeline();

        intro.to(progress, {
          value: 100,
          duration: LOAD_DURATION_S,
          ease: "power1.inOut",
          onUpdate: () => {
            const pct = Math.round(progress.value);
            if (fillRef.current) {
              fillRef.current.style.transform = `scaleX(${pct / 100})`;
            }
            if (percentRef.current) {
              percentRef.current.textContent = `${pct}%`;
            }
            /* `aria-valuenow` en el progressbar en vez de texto en una region
             * live: el lector lo consulta cuando el usuario pregunta, no lo
             * grita en cada frame. */
            if (progressRef.current) {
              progressRef.current.setAttribute("aria-valuenow", String(pct));
            }
          },
          onComplete: () => window.clearInterval(frameId),
        });

        intro.to(loaderRef.current, {
          autoAlpha: 0,
          duration: FADE_DURATION_S,
          onComplete: onIntroDone,
        });

        return () => window.clearInterval(frameId);
      });

      return () => mm.revert();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="relative min-h-dvh w-full overflow-hidden bg-[var(--jec-ember)]"
    >
      <div
        ref={loaderRef}
        className="fixed inset-0 z-[100] flex touch-none flex-col items-center justify-center overscroll-none bg-[var(--jec-ember)] px-6"
        aria-busy="true"
      >
        <div className="relative flex flex-col items-center">
          <Image
            src={jecAssets.logos.jecWhiteSvg}
            alt=""
            width={90}
            height={90}
            priority
            className="mb-4 h-48 w-auto md:mb-6 md:h-[min(18dvh,9rem)]"
          />
          <Image
            src={LOADER_FRAMES[frame]}
            alt=""
            width={320}
            height={320}
            priority
            className="h-auto w-[min(70vw,18rem)] md:h-[min(44dvh,22rem)] md:w-auto"
          />
          <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-3 md:mt-8 md:w-80 md:max-w-none">
            <span
              ref={progressRef}
              className="block h-4 w-full overflow-hidden rounded-full border-2 border-[var(--jec-bone)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={0}
              aria-label="Cargando"
            >
              <span
                ref={fillRef}
                className="block h-full w-full origin-left rounded-full bg-[var(--jec-bone)]"
                style={{ transform: "scaleX(0)" }}
              />
            </span>
            <span
              ref={percentRef}
              aria-hidden="true"
              className="jec-mono text-sm font-bold tabular-nums text-[var(--jec-bone)]"
            >
              0%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
