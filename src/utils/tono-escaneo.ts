/**
 * Señal sonora para el escáner de la puerta.
 *
 * Con fila, el colaborador necesita poder acreditar mirando a la gente y no a
 * la pantalla. Tres tonos distinguibles alcanzan para eso sin que tenga que
 * leer nada.
 *
 * Se genera con Web Audio: sin archivos, sin dependencias y sin una descarga
 * que pueda fallar justo el día del evento.
 *
 * NUNCA lanza. El sonido es una ayuda; si el navegador no lo permite, la
 * acreditación tiene que seguir funcionando igual.
 */

export type TonoEscaneo = "ok" | "aviso" | "error"

const TONOS: Record<TonoEscaneo, { frecuencia: number; duracion: number; repeticiones: number }> = {
  /** Agudo y corto: "pasá". */
  ok: { frecuencia: 880, duracion: 0.12, repeticiones: 1 },
  /** Dos pulsos medios: "ya había pasado", no es un error. */
  aviso: { frecuencia: 520, duracion: 0.09, repeticiones: 2 },
  /** Grave y largo: algo salió mal, hay que mirar la pantalla. */
  error: { frecuencia: 200, duracion: 0.28, repeticiones: 1 },
}

const SEPARACION = 0.07
const VOLUMEN = 0.25

let contexto: AudioContext | null = null

function obtenerContexto(): AudioContext | null {
  if (typeof window === "undefined") return null

  if (!contexto) {
    const Constructor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Constructor) return null

    try {
      contexto = new Constructor()
    } catch {
      return null
    }
  }

  return contexto
}

/**
 * Safari arranca el contexto de audio suspendido hasta que hay un gesto real
 * del usuario. Conviene llamar a esto en el primer toque sobre la pantalla del
 * escáner: sin eso, en iPhone el primer escaneo suele salir mudo.
 */
export function desbloquearAudio() {
  const ctx = obtenerContexto()
  if (ctx && ctx.state === "suspended") void ctx.resume().catch(() => {})
}

export function reproducirTono(tipo: TonoEscaneo) {
  try {
    const ctx = obtenerContexto()
    if (!ctx) return

    if (ctx.state === "suspended") void ctx.resume().catch(() => {})

    const { frecuencia, duracion, repeticiones } = TONOS[tipo]

    for (let i = 0; i < repeticiones; i++) {
      const inicio = ctx.currentTime + i * (duracion + SEPARACION)
      const oscilador = ctx.createOscillator()
      const ganancia = ctx.createGain()

      oscilador.type = "sine"
      oscilador.frequency.value = frecuencia

      // Envolvente corta en los extremos: cortar la onda de golpe suena como un
      // "click" seco, que en un salón ruidoso se confunde con otra cosa.
      ganancia.gain.setValueAtTime(0, inicio)
      ganancia.gain.linearRampToValueAtTime(VOLUMEN, inicio + 0.01)
      ganancia.gain.setValueAtTime(VOLUMEN, inicio + duracion - 0.02)
      ganancia.gain.linearRampToValueAtTime(0, inicio + duracion)

      oscilador.connect(ganancia)
      ganancia.connect(ctx.destination)

      oscilador.start(inicio)
      oscilador.stop(inicio + duracion)
    }
  } catch {
    // Silencio: que no suene nunca puede romper una acreditación.
  }
}
