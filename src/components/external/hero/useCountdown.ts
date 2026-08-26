"use client";

import { useSyncExternalStore } from "react";

export type TimeLeft = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

/** Etiquetas de cada unidad, en el orden en que se muestran. */
export const countdownLabels = {
  days: "Días",
  hours: "Horas",
  minutes: "Min",
  seconds: "Seg",
} as const;

export type CountdownUnit = keyof typeof countdownLabels;

export const countdownUnits = Object.keys(countdownLabels) as CountdownUnit[];

function getTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

/* El snapshot es un string y no el objeto: `useSyncExternalStore` compara por
 * identidad, y devolver un objeto nuevo en cada lectura dispara un loop de
 * renders. */
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

/** Dos dígitos, para que el ancho de los chips no salte entre segundos. */
export function padUnit(value: number) {
  return String(value).padStart(2, "0");
}

/**
 * Tiempo restante hasta `targetMs`, actualizado cada segundo. En el servidor
 * devuelve ceros para que el HTML de SSR sea estable y no haya mismatch de
 * hidratación.
 */
export function useCountdown(targetMs: number): TimeLeft {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => timeLeftKey(targetMs),
    () => "0:0:0:0"
  );
  return parseTimeLeftKey(snapshot);
}
