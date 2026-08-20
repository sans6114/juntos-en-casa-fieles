"use client";

import {
  useRef,
  useState,
} from 'react';

import gsap from 'gsap';
import Image from 'next/image';

import { jecRevealPhrases } from '@/components/external/shared';
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
const LOAD_DURATION_S = 7;
const FADE_DURATION_S = 0.45;
/** Frases del reveal, avanzadas por botón en vez de scroll: con scroll (aun
 * con freno de velocidad) un gesto rápido terminaba saltando frases y el
 * usuario nunca llegaba a ver el reveal completo. */
const REVEAL_FRAME_COUNT = jecRevealPhrases.length;

/**
 * Loader fullscreen → frases reveladas una por click en el botón (scroll
 * bloqueado) → hero final con ScrollExpand (scroll nativo). Sin navbar: el
 * hero final trae su propio logo/CTA (ver HeroFinale). El scroll queda
 * bloqueado desde el loader hasta que se revela la última frase; el único
 * modo de avanzar durante el reveal es el botón.
 */
export function HeroSequence() {
  const rootRef = useRef<HTMLDivElement>(null);
  const loaderRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const percentRef = useRef<HTMLSpanElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLButtonElement>(null);
  const phraseRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const [frame, setFrame] = useState(0);
  const activeFrameRef = useRef(-1);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      const showFrame = (index: number) => {
        if (activeFrameRef.current === index) return;
        activeFrameRef.current = index;

        phraseRefs.current.forEach((el, i) => {
          if (!el) return;
          gsap.to(el, {
            autoAlpha: i === index ? 1 : 0,
            duration: FADE_DURATION_S,
            ease: "power2.inOut",
            overwrite: "auto",
          });
        });
      };

      const setHintVisible = (visible: boolean) => {
        if (hintRef.current) {
          gsap.to(hintRef.current, {
            autoAlpha: visible ? 1 : 0,
            duration: 0.3,
            overwrite: "auto",
          });
        }
      };

      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(loaderRef.current, { autoAlpha: 0 });
        phraseRefs.current.forEach((el) => {
          if (el) gsap.set(el, { autoAlpha: 0 });
        });
        if (hintRef.current) gsap.set(hintRef.current, { autoAlpha: 0 });
        activeFrameRef.current = REVEAL_FRAME_COUNT - 1;
      });

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const previousOverflow = document.documentElement.style.overflow;
        const previousBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";

        const blockScrollEvent = (event: Event) => {
          event.preventDefault();
        };
        window.addEventListener("wheel", blockScrollEvent, { passive: false });
        window.addEventListener("touchmove", blockScrollEvent, { passive: false });

        const unlockScroll = () => {
          document.documentElement.style.overflow = previousOverflow;
          document.body.style.overflow = previousBodyOverflow;
          window.removeEventListener("wheel", blockScrollEvent);
          window.removeEventListener("touchmove", blockScrollEvent);
        };

        phraseRefs.current.forEach((el) => {
          if (el) gsap.set(el, { autoAlpha: 0 });
        });
        if (hintRef.current) gsap.set(hintRef.current, { autoAlpha: 0 });

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
          },
          onComplete: () => window.clearInterval(frameId),
        });

        let advancingLock = false;
        let revealDone = false;

        const finishReveal = () => {
          if (revealDone) return;
          revealDone = true;
          setHintVisible(false);
          detachRevealListeners();
          unlockScroll();
        };

        const advance = () => {
          if (revealDone || advancingLock) return;
          const next = activeFrameRef.current + 1;
          if (next < REVEAL_FRAME_COUNT) {
            advancingLock = true;
            showFrame(next);
            window.setTimeout(() => {
              advancingLock = false;
            }, FADE_DURATION_S * 1000);
          } else {
            finishReveal();
          }
        };

        const onHintActivate = () => advance();

        const attachRevealListeners = () => {
          hintRef.current?.addEventListener("click", onHintActivate);
        };

        const detachRevealListeners = () => {
          hintRef.current?.removeEventListener("click", onHintActivate);
        };

        intro.to(
          loaderRef.current,
          {
            autoAlpha: 0,
            duration: 0.45,
            onComplete: () => {
              showFrame(0);
              setHintVisible(true);
              attachRevealListeners();
            },
          },
          "+=0.15"
        );

        if (hintRef.current) {
          gsap.to(hintRef.current.querySelector("[data-next-chevron]"), {
            y: 8,
            duration: 0.7,
            ease: "power1.inOut",
            yoyo: true,
            repeat: -1,
          });
        }

        return () => {
          window.clearInterval(frameId);
          detachRevealListeners();
          unlockScroll();
        };
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
        aria-live="polite"
      >
        <div className="relative flex flex-col items-center">
        <Image
          src={jecAssets.logos.jecWhitePng}
          alt=""
          width={90}
          height={90}
          priority
          className="mb-4 h-48 w-auto"
        />
        <Image
          src={LOADER_FRAMES[frame]}
          alt=""
          width={320}
          height={320}
          priority
          className="h-auto w-[min(70vw,18rem)] md:w-[min(50vw,22rem)]"
        />
          <div className="mt-10 flex w-full max-w-xs flex-col items-center gap-3 md:max-w-sm">
            <span
              className="block h-4 w-full overflow-hidden rounded-full border-2 border-[var(--jec-bone)]"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
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
              className="jec-mono text-sm font-bold tabular-nums text-[var(--jec-bone)]"
            >
              0%
            </span>
          </div>
        </div>
        </div>

        <div
          ref={stageRef}
          className="relative z-10 flex min-h-dvh w-full items-center justify-center overflow-hidden text-center"
        >
          {jecRevealPhrases.map((phrase, index) => (
            <p
              key={phrase}
              ref={(el) => {
                phraseRefs.current[index] = el;
              }}
              className="jec-display invisible absolute inset-x-4 top-1/2 -translate-y-1/2 text-center text-[clamp(2.25rem,9vw,5.5rem)] uppercase leading-[0.95] tracking-tight text-balance text-[var(--jec-bone)] opacity-0 sm:inset-x-8"
            >
              {phrase}
            </p>
          ))}

          <button
            ref={hintRef}
            type="button"
            className="invisible absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 opacity-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-amber)]"
          >
            <span className="jec-mono text-[0.65rem] font-bold uppercase tracking-[0.28em] text-[var(--jec-bone)]/90">
              Seguir
            </span>
            <span
              data-next-chevron
              className="block h-2.5 w-2.5 rotate-45 border-b-2 border-r-2 border-[var(--jec-bone)]"
              aria-hidden
            />
          </button>
        </div>
      </div>
  );
}
