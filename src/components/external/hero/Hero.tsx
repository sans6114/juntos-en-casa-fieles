import { HeroFinale } from "./HeroFinale";
import { HeroSequence } from "./HeroSequence";

export function Hero() {
  return (
    <>
      <section className="relative flex min-h-dvh flex-col overflow-hidden bg-[var(--jec-ember)]">
        <HeroSequence />
      </section>

      {/* Fuera del overflow-hidden: ScrollExpand depende de position: sticky,
       * que un ancestro con overflow no-visible rompe. */}
      <HeroFinale />
    </>
  );
}
