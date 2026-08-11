"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { jecTaglines } from "./taglines";

if (typeof window !== "undefined") {
  gsap.registerPlugin(useGSAP);
}

/** Cinta infinita con las 4 frases de marca; se detiene si el usuario prefiere menos movimiento. */
export function TickerTape() {
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tween = gsap.to(trackRef.current, {
          xPercent: -50,
          duration: 32,
          ease: "none",
          repeat: -1,
        });
        return () => tween.kill();
      });

      return () => mm.revert();
    },
    { scope: trackRef }
  );

  const items = [...jecTaglines, ...jecTaglines];

  return (
    <div
      className="overflow-hidden border-y border-[var(--jec-bone)]/10 bg-[var(--jec-ink-soft)] py-3"
      role="presentation"
    >
      <div ref={trackRef} className="flex w-max items-center gap-8 whitespace-nowrap will-change-transform">
        {items.map((phrase, index) => (
          <span
            key={`${phrase}-${index}`}
            className="jec-mono flex items-center gap-8 text-xs font-bold uppercase tracking-[0.2em] text-[var(--jec-bone)]"
            aria-hidden={index >= jecTaglines.length}
          >
            {phrase}
            <span aria-hidden className="text-[var(--jec-amber)]">
              |
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}
