export type FaqItem = {
  id: string
  question: string
  answer: string
}

/**
 * La respuesta de "¿Dónde es?" se compone desde `ubicacionInfo`, la misma fuente
 * que alimenta la sección Ubicación. Antes esta dirección estaba escrita a mano
 * acá y decía una cosa mientras Ubicación decía otra; leyéndola vuelve imposible
 * que las dos se contradigan.
 */

export const faqItems: readonly FaqItem[] = [
  {
    id: "1",
    question: "¿Qué es Juntos En Casa?",
    answer:
      "Juntos en Casa es la Conferencia de adolescentes y jóvenes de Iglesia Vida Sobrenatural. Fue creada para crecer en unidad, ir más profundo en Dios, ser equipados para el desarrollo de nuestro propósito y divertirnos juntos. Es una Conferencia especialmente planificada por y para adolescentes y jóvenes.",
  },
  {
    id: "2",
    question: "¿Quienes pueden ir?",
    answer:
      "¡Pueden ser parte todos los adolescentes y jóvenes que quieran! La actividad está abierta a otras congregaciones que quieran sumarse a compartir un fin de semana de renovación e impulso.",
  },
  {
    id: "3",
    question: "¿Dónde es?",
    answer: "En el auditorio de la Iglesia Cristiana Vida Sobrenatural: Calle 23 Nº1665 entre 66 y 67 — Zona Parque Castelli. La Plata, Buenos Aires. ARG"
  },
  {
    id: "4",
    question: "¿Tiene un costo?",
    answer:
      "La entrada a la conferencia es libre y gratuita con previa inscripción.",
  },
]
