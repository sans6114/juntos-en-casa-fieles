"use client";

import { useEffect, useState } from "react";

import { HeroFinale } from "./HeroFinale";
import { HeroSequence } from "./HeroSequence";

export function Hero() {
  /** Al terminar la intro se desmonta la sección entera —no se oculta— para
   * que se vaya su `min-h-dvh` y `HeroFinale` quede en scroll 0 con la
   * expansión de `ScrollExpand` intacta. */
  const [introDone, setIntroDone] = useState(false);

  /* Quien llega con hash pidió una sección concreta, y `HeroSequence` avisa de
   * eso terminando la intro sola. Reposicionar es obligatorio: el navegador (o
   * el router) ya scrolleó al ancla con el hero presente, y al desmontarlo la
   * página se corre 100dvh hacia arriba. `scrollIntoView` respeta el
   * `scroll-margin-top` de `.jec-anchor`, así el título no queda bajo el
   * header sticky. */
  useEffect(() => {
    if (!introDone) return;
    const { hash } = window.location;
    if (!hash) return;
    document.querySelector(hash)?.scrollIntoView();
  }, [introDone]);

  return (
    <>
      {!introDone && (
        <section className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--jec-ember)]">
          <HeroSequence onIntroDone={() => setIntroDone(true)} />
        </section>
      )}

      {/* Fuera del overflow-hidden: ScrollExpand depende de position: sticky,
       * que un ancestro con overflow no-visible rompe. */}
      <HeroFinale />
    </>
  );
}
