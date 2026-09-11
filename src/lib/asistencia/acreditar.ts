import {
  campoAsistencia,
  diaEventoDeHoy,
  FechasEventoNoConfiguradas,
  formatearHoraArgentina,
} from "./dia-evento"
import { revalidarVistasDeAsistencia } from "./revalidar-vistas"
import { prisma } from "@/lib/prisma"

/**
 * Acreditar a alguien en el día de hoy. Núcleo único para los DOS caminos que
 * existen en la puerta: escanear el QR (`processQrScan`) y el check manual
 * (`marcarAsistenciaHoy`). Los dos hacen exactamente lo mismo contra la base;
 * lo único que cambia es cómo le hablan al colaborador, así que la redacción
 * queda en cada action y el algoritmo vive una sola vez acá.
 *
 * No decide autorización: eso es responsabilidad de quien lo llama.
 */

export type ResultadoAcreditacion =
  | { estado: "acreditado"; nombre: string; horaLlegada: string }
  | { estado: "ya-acreditado"; nombre: string; horaLlegada: string }
  | { estado: "no-encontrado" }
  | { estado: "fuera-de-fecha" }
  | { estado: "sin-configurar" }

export async function acreditarHoy(inscripcionId: string): Promise<ResultadoAcreditacion> {
  let dia
  try {
    dia = diaEventoDeHoy()
  } catch (error) {
    if (error instanceof FechasEventoNoConfiguradas) {
      console.error(error)
      return { estado: "sin-configurar" }
    }
    throw error
  }

  if (!dia) return { estado: "fuera-de-fecha" }

  const campo = campoAsistencia(dia)
  const ahora = new Date()

  // Escritura condicional en UNA sola operacion, en vez de leer -> chequear ->
  // escribir. Con dos personas acreditando a la vez, la version anterior dejaba
  // que ambas pasaran el chequeo y la segunda pisaba la hora de la primera sin
  // avisar: el segundo escaneo decia "confirmada" en lugar de "ya acreditado".
  const { count } = await prisma.inscripcion.updateMany({
    where: { id: inscripcionId, [campo]: null },
    data: { [campo]: ahora },
  })

  if (count === 0) {
    // count 0 significa "no existe la fila" O "ya estaba acreditada". Una sola
    // consulta distingue los dos, y de paso trae el nombre que la puerta
    // necesita ver para resolver el caso en el momento.
    const existente = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      select: { nombre: true, [campo]: true },
    })

    if (!existente) return { estado: "no-encontrado" }

    return {
      estado: "ya-acreditado",
      nombre: existente.nombre,
      horaLlegada: formatearHoraArgentina(existente[campo] as Date),
    }
  }

  const inscripcion = await prisma.inscripcion.findUnique({
    where: { id: inscripcionId },
    select: { nombre: true },
  })

  revalidarVistasDeAsistencia()

  return {
    estado: "acreditado",
    nombre: inscripcion?.nombre ?? "",
    horaLlegada: formatearHoraArgentina(ahora),
  }
}
