"use client";

import { useState } from "react";

import Image from "next/image";

import { jecRevealPhrases } from "@/components/external/shared";
import { jecAssets } from "@/lib/jec-assets";
import { cn } from "@/lib/utils";

const PHRASE_COUNT = jecRevealPhrases.length;

/**
 * Recuadro de 80% del viewport (sección de 100vh) con las 3 frases,
 * avanzadas a mano con "Tocá para seguir" — sin trabar el scroll: es una
 * sección más de la página, el visitante puede seguir bajando en cualquier
 * momento. Al llegar a la última frase el botón desaparece, no hay nada más
 * que avanzar.
 */
export function Frases() {
  const [active, setActive] = useState(0);
  const isLast = active === PHRASE_COUNT - 1;

  return (
    <section
      id="frases"
      aria-label="Frases"
      className="campo-papel flex h-dvh w-full items-center justify-center px-6 md:px-10 lg:px-16"
    >
      <div className="relative flex h-[80vh] w-[80vw] max-w-3xl flex-col items-center justify-center gap-8 rounded-[2rem] border-4 border-[var(--acento)] bg-[var(--jec-ember)] px-6 text-center sm:px-12">
        <div className="relative w-full flex-1">
          {jecRevealPhrases.map((phrase, index) => (
            <p
              key={phrase}
              aria-hidden={index !== active}
              className={cn(
                "jec-display absolute inset-x-4 top-1/2 -translate-y-1/2 text-balance text-[clamp(1.5rem,6vw,3.5rem)] uppercase leading-[0.95] tracking-tight text-[var(--jec-bone)] transition-opacity duration-500 motion-reduce:transition-none",
                index === active ? "opacity-100" : "opacity-0"
              )}
            >
              {phrase}
            </p>
          ))}
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2" aria-hidden>
            {jecRevealPhrases.map((_, index) => (
              <span
                key={index}
                className={cn(
                  "block h-2 w-2 rounded-full border border-[var(--jec-bone)]/40 transition-colors",
                  index <= active ? "bg-[var(--jec-bone)]" : "bg-transparent"
                )}
              />
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActive((current) => Math.max(current - 1, 0))}
              aria-label="Frase anterior"
              aria-hidden={active === 0}
              tabIndex={active === 0 ? -1 : 0}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--jec-bone)] transition-all duration-300 ease-out hover:bg-[var(--jec-bone)]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-bone)] motion-reduce:transition-none",
                active === 0 ? "pointer-events-none scale-75 opacity-0" : "scale-100 opacity-100"
              )}
            >
              <span
                aria-hidden
                className="ml-0.5 block h-2.5 w-2.5 -rotate-[135deg] border-r-2 border-t-2 border-[var(--jec-bone)]"
              />
            </button>
            <button
              type="button"
              onClick={() => setActive((current) => Math.min(current + 1, PHRASE_COUNT - 1))}
              aria-label="Frase siguiente"
              aria-hidden={isLast}
              tabIndex={isLast ? -1 : 0}
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full border-2 border-[var(--jec-bone)] transition-all duration-300 ease-out hover:bg-[var(--jec-bone)]/10 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--jec-bone)] motion-reduce:transition-none",
                isLast ? "pointer-events-none scale-75 opacity-0" : "scale-100 opacity-100"
              )}
            >
              <span
                aria-hidden
                className="-ml-0.5 block h-2.5 w-2.5 rotate-45 border-r-2 border-t-2 border-[var(--jec-bone)]"
              />
            </button>
          </div>
        </div>

        {/* Ancla decorativa sobre la esquina inferior derecha del recuadro:
          * anclada exacto al vértice y corrida el 50% de su propio ancho/alto
          * hacia afuera (valores explícitos, no fracciones de Tailwind), así
          * queda mitad adentro y mitad afuera del borde. */}
        <Image
          src={jecAssets.frases.esquina}
          alt=""
          aria-hidden
          width={672}
          height={673}
          className="pointer-events-none absolute bottom-0 right-0 z-20 w-20 translate-x-[50%] translate-y-[50%] sm:w-32"
        />
      </div>
    </section>
  );
}
