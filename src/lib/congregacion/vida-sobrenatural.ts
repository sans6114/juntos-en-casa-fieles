import { normalizarNombreCongregacion } from "./normalizar"

/**
 * Identidad de la congregacion propia del evento, en un solo lugar.
 *
 * El nombre real de la fila lo edita un admin desde el panel y ya paso por
 * varias formas ("Vida Sobre Natural", "Vida Sobrenatural", "Vidasobrenatural").
 * Por eso el reconocimiento NO compara el nombre literal: normaliza y ademas
 * saca los espacios, de modo que las tres son la misma congregacion.
 */
export const VIDA_SOBRENATURAL_NOMBRE = "Vida Sobrenatural"

const VIDA_SOBRENATURAL_CLAVE = "vidasobrenatural"

export function esVidaSobrenatural(nombre: string): boolean {
  return normalizarNombreCongregacion(nombre).replace(/\s/g, "") === VIDA_SOBRENATURAL_CLAVE
}
