import {
  campoAsistencia,
  diaEventoDeHoy,
  FechasEventoInvalidas,
  formatearHoraArgentina,
} from "./dia-evento"
import { revalidarVistasDeAsistencia } from "./revalidar-vistas"
import {
  etiquetaCongregacion,
  type EtiquetaCongregacion,
} from "@/lib/congregacion/etiqueta"
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

/**
 * Lo que el colaborador necesita ver para verificar que el QR es de quien lo
 * trae. Local a propósito: las actions consumen el retorno estructuralmente y
 * lo traducen a `AsistenciaActionResult` / `EscaneoResultado`, que SÍ viven en
 * `interfaces/` porque son las que llegan a la pantalla.
 */
type PersonaAcreditada = {
  nombre: string
  horaLlegada: string
  congregacion: EtiquetaCongregacion
}

type ResultadoAcreditacion =
  | ({ estado: "acreditado" } & PersonaAcreditada)
  | ({ estado: "ya-acreditado" } & PersonaAcreditada)
  | { estado: "no-encontrado" }
  | { estado: "fuera-de-fecha" }
  | { estado: "sin-configurar" }

/** Lo que hay que traer para armar el panel del escáner. */
const DATOS_DE_PERSONA = {
  nombre: true,
  sinCongregacion: true,
  congregacion: { select: { nombre: true, estado: true } },
} as const

export async function acreditarHoy(inscripcionId: string): Promise<ResultadoAcreditacion> {
  let dia
  try {
    dia = diaEventoDeHoy()
  } catch (error) {
    if (error instanceof FechasEventoInvalidas) {
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
    // consulta distingue los dos, y de paso trae los datos que la puerta
    // necesita ver para resolver el caso en el momento.
    // Se piden los dos días y se elige después, en vez de armar el `select` con
    // la clave dinámica: con `[campo]: true` TypeScript pierde el nombre de la
    // columna y el acceso de abajo queda sin tipo.
    const existente = await prisma.inscripcion.findUnique({
      where: { id: inscripcionId },
      select: { ...DATOS_DE_PERSONA, asistenciaDia1: true, asistenciaDia2: true },
    })

    if (!existente) return { estado: "no-encontrado" }

    return {
      estado: "ya-acreditado",
      nombre: existente.nombre,
      horaLlegada: formatearHoraArgentina(existente[campo] as Date),
      congregacion: etiquetaCongregacion(existente),
    }
  }

  const inscripcion = await prisma.inscripcion.findUniqueOrThrow({
    where: { id: inscripcionId },
    select: DATOS_DE_PERSONA,
  })

  revalidarVistasDeAsistencia()

  return {
    estado: "acreditado",
    nombre: inscripcion.nombre,
    horaLlegada: formatearHoraArgentina(ahora),
    congregacion: etiquetaCongregacion(inscripcion),
  }
}
