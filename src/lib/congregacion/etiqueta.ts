/**
 * Cómo se le nombra la congregación de alguien al colaborador que lo acredita.
 *
 * Vive acá y no inline en el escáner porque el equipo usa este cartel para
 * recibir distinto a quien llega por primera vez: si "Es nuevo" apareciera en un
 * caso que no lo es, el cartel mentiría justo donde se toma una decisión.
 */

export type EstadoCongregacion = "PENDIENTE" | "APROBADA"

type EntradaEtiqueta = {
  sinCongregacion: boolean
  congregacion: { nombre: string; estado: EstadoCongregacion } | null
}

export type EtiquetaCongregacion = {
  texto: string
  /**
   * La congregación existe pero todavía no fue aprobada: alguien la escribió a
   * mano al inscribirse. El colaborador lo ve y avisa al admin, que la aprueba o
   * la rechaza desde /admin/congregaciones.
   */
  pendiente: boolean
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
