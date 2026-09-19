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

/**
 * Snapshot de "el evento ya arrancó".
 *
 * Es un valor centinela y no `"0:0:0:0"` a propósito: en cero se llega por dos
 * caminos distintos —el servidor, que no sabe qué hora es, y el cliente, que
 * midió y ya pasó— y hay que poder distinguirlos. Ver `useCountdown`.
 */
const YA_EMPEZO = "fin";

/** Lo que devuelve el servidor: "todavía no sé". Nunca significa "terminó". */
const SNAPSHOT_SERVIDOR = "0:0:0:0";

/* El snapshot es un string y no el objeto: `useSyncExternalStore` compara por
 * identidad, y devolver un objeto nuevo en cada lectura dispara un loop de
 * renders. */
function timeLeftKey(targetMs: number) {
  if (targetMs - Date.now() <= 0) return YA_EMPEZO;

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

export type EstadoCuenta = {
  units: TimeLeft;
  /**
   * `true` solo cuando el CLIENTE midió y la fecha ya pasó. En el servidor es
   * siempre `false`, y eso no es una limitación: es la respuesta correcta.
   */
  yaEmpezo: boolean;
};

/**
 * Tiempo restante hasta `targetMs`, actualizado cada segundo, y si el evento ya
 * arrancó.
 *
 * En el servidor devuelve ceros para que el HTML de SSR sea estable y no haya
 * mismatch de hidratación. Pero ese cero NO puede leerse como "ya empezó": el
 * servidor no tiene forma de saberlo —y menos acá, donde `/` se prerenderiza en
 * el build, así que su "ahora" es el día que se compiló—. Por eso `yaEmpezo`
 * arranca en `false` y solo el cliente lo puede poner en `true`.
 *
 * La consecuencia práctica: antes del evento, el HTML servido trae la cuenta
 * (en cero, como ya venía) y el cliente la completa. Después del evento, el
 * servidor la sigue trayendo y el cliente la saca al hidratar. Nunca al revés,
 * que sería mostrar una cuenta muerta a quien tenga JS lento.
 */
export function useCountdown(targetMs: number): EstadoCuenta {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => timeLeftKey(targetMs),
    () => SNAPSHOT_SERVIDOR
  );

  if (snapshot === YA_EMPEZO) {
    return { units: { days: 0, hours: 0, minutes: 0, seconds: 0 }, yaEmpezo: true };
  }

  return { units: parseTimeLeftKey(snapshot), yaEmpezo: false };
}
