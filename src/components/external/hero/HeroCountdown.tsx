"use client";

import { siteConfig } from "@/lib/seo/site";

import { countdownLabels, countdownUnits, padUnit, useCountdown } from "./useCountdown";

export function HeroCountdown() {
  const units = useCountdown(new Date(siteConfig.eventStartsAt).getTime());

  return (
    <div
      className="mt-8 w-full max-w-2xl md:mt-10"
      role="timer"
      aria-live="polite"
      aria-label="Cuenta regresiva al inicio del evento"
    >
      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {countdownUnits.map((key) => (
          <div key={key} className="flex flex-col items-center">
            {/* `jec-mono`, nunca `jec-display`: Cayento personal-use mapea los diez
                dígitos al mismo glifo de marca de agua. */}
            <span className="jec-mono text-4xl font-black leading-none tracking-tight text-[var(--jec-bone)] tabular-nums sm:text-5xl md:text-7xl lg:text-8xl">
              {padUnit(units[key])}
            </span>
            <span className="jec-label mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--jec-smoke)] sm:text-xs md:mt-3 md:text-sm">
              {countdownLabels[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
