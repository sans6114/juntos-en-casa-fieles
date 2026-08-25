"use client";

import { useCallback, useEffect, useState } from "react";

import { HeroFinale } from "./HeroFinale";
import { HeroSequence } from "./HeroSequence";

export function Hero() {
  /** Al saltear se desmonta la sección entera —no se oculta— para que se vayan
   * sus `min-h-dvh` y `HeroFinale` quede en scroll 0 con la expansión de
   * `ScrollExpand` intacta. */
  const [skipped, setSkipped] = useState(false);
  /** Cambia de valor en cada "Ver animación": remonta `HeroSequence` desde cero. */
  const [runId, setRunId] = useState(0);

  /* Se dispara desde el overlay de HeroFinale, así que hay que cubrir los dos
   * estados posibles: la sección puede seguir montada (el visitante vio la
   * secuencia entera) o haber sido desmontada por "Saltar animación". De ahí el
   * `setSkipped(false)`. El reposicionamiento al tope lo hace `HeroSequence` al
   * montar, no acá: si scrolleáramos antes de reinsertar la sección, el anclaje
   * de scroll del navegador nos correría los 100dvh que acaban de aparecer. */
  const handleReplay = useCallback(() => {
    setSkipped(false);
    setRunId((current) => current + 1);
  }, []);

  /* Quien llega con hash pidió una sección concreta, y `HeroSequence` avisa de
   * eso salteándose sola. Reposicionar es obligatorio: el navegador (o el
   * router) ya scrolleó al ancla con el hero presente, y al desmontarlo la
   * página se corre 100dvh hacia arriba. `scrollIntoView` respeta el
   * `scroll-margin-top` de `.jec-anchor`, así el título no queda bajo el
   * header sticky. */
  useEffect(() => {
    if (!skipped) return;
    const { hash } = window.location;
    if (!hash) return;
    document.querySelector(hash)?.scrollIntoView();
  }, [skipped]);

  return (
    <>
      {!skipped && (
        <section
          key={runId}
          className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--jec-ember)]"
        >
          <HeroSequence onSkip={() => setSkipped(true)} />
        </section>
      )}

      {/* Fuera del overflow-hidden: ScrollExpand depende de position: sticky,
       * que un ancestro con overflow no-visible rompe. */}
      <HeroFinale onReplay={handleReplay} />
    </>
  );
}
