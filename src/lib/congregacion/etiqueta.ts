/**
 * Cómo se le nombra la congregación de alguien al colaborador que lo acredita.
 *
 * Vive acá y no inline en el escáner porque el equipo usa este cartel para
 * recibir distinto a quien llega por primera vez: si "Es nuevo" apareciera en un
 * caso que no lo es, el cartel mentiría justo donde se toma una decisión.
 */

import type {
  EstadoCongregacion,
  EtiquetaCongregacion,
} from "@/interfaces/congregacion"

// Se re-exportan para que quien ya importaba desde acá no tenga que cambiar el
// import, igual que `dia-evento.ts` con `DiaEvento`. La DEFINICIÓN vive en
// `interfaces/`, que es lo que importa: la forma la pinta la UI.
export type { EstadoCongregacion, EtiquetaCongregacion }

type EntradaEtiqueta = {
  sinCongregacion: boolean
  congregacion: { nombre: string; estado: EstadoCongregacion } | null
}

export function etiquetaCongregacion(inscripcion: EntradaEtiqueta): EtiquetaCongregacion {
  // Dato AFIRMADO por la persona al inscribirse, no una ausencia de FK.
  if (inscripcion.sinCongregacion) return { texto: "Es nuevo", pendiente: false }

  if (inscripcion.congregacion) {
    return {
      texto: `Pertenece a ${inscripcion.congregacion.nombre}`,
      pendiente: inscripcion.congregacion.estado === "PENDIENTE",
    }
  }

  // Sin FK y sin declaración: ni "es nuevo" ni una congregación que nombrar.
  // Hoy no hay filas asi; se cae acá por defecto, sin tratamiento especial.
  return { texto: "Sin congregación", pendiente: false }
}
