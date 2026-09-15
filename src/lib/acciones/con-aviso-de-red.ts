"use client"

import { toast } from "sonner"

/**
 * Se distingue del error de negocio a propósito. Una action que devuelve
 * `{ ok: false, message }` SÍ llegó al servidor y sabe qué pasó; esto es el otro
 * caso, el que no tiene mensaje porque nunca hubo con quién hablar.
 */
const MENSAJE_SIN_CONEXION = "Sin conexión: se perdió el intento. Probá de nuevo."

/**
 * Ejecuta una server action y avisa cuando NI SIQUIERA LLEGA al servidor.
 *
 * Sin esto, una promesa rechazada dentro de una transición sube al router de
 * Next y se lleva la página entera por delante: pantalla de error y a recargar.
 * Verificado en el navegador simulando la red caída — no es defensa teórica.
 *
 * Y el día del evento no es un caso raro: el 4G de un salón lleno se cae solo, y
 * quien está acreditando en la puerta no puede perder la grilla ni su lugar en
 * la lista porque un request no salió.
 *
 * Devuelve `null` cuando la llamada no llegó. Por eso sirve únicamente para
 * actions que SIEMPRE devuelven un objeto: si una pudiera devolver `null` por
 * derecho propio, los dos casos se confundirían.
 *
 * Que la action haya fallado NO quiere decir que no se haya ejecutado: puede
 * haber corrido en el servidor y haberse cortado la respuesta. Por eso el
 * mensaje pide reintentar y no afirma que no pasó nada.
 */
export async function conAvisoDeRed<T extends object>(
  accion: () => Promise<T>
): Promise<T | null> {
  try {
    return await accion()
  } catch (error) {
    console.error("La server action no llegó al servidor:", error)
    toast.error(MENSAJE_SIN_CONEXION)
    return null
  }
}
