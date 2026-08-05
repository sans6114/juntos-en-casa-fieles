"use client";

import { useEffect, useState } from "react";
import { siteConfig } from "@/lib/seo/site";

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

function getTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { days, hours, minutes, seconds };
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function HeroCountdown() {
  const targetMs = new Date(siteConfig.eventStartsAt).getTime();
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetMs));
    const id = window.setInterval(() => {
      setTimeLeft(getTimeLeft(targetMs));
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetMs]);

  const units = timeLeft ?? { days: 0, hours: 0, minutes: 0, seconds: 0 };

  return (
    <div
      className="mt-8 w-full max-w-2xl md:mt-10"
      role="timer"
      aria-live="polite"
      aria-label="Cuenta regresiva al inicio del evento"
    >
      <div className="grid grid-cols-4 gap-2 sm:gap-4 md:gap-6">
        {(Object.keys(labels) as Array<keyof typeof labels>).map((key) => (
          <div key={key} className="flex flex-col items-center">
            <span className="jec-display text-4xl font-extrabold leading-none tracking-tight text-[var(--jec-bone)] tabular-nums sm:text-5xl md:text-7xl lg:text-8xl">
              {pad(units[key])}
            </span>
            <span className="jec-display mt-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[var(--jec-smoke)] sm:text-xs md:mt-3 md:text-sm">
              {labels[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
