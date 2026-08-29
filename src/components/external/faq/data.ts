import { ubicacionInfo } from '@/components/external/ubicacion/data';

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
const dondeEs = ubicacionInfo.street
  ? `En el templo de la ${ubicacionInfo.venue}: ${ubicacionInfo.street}. ${ubicacionInfo.city}.`
  : `En el templo de la ${ubicacionInfo.venue}, en ${ubicacionInfo.city}. La dirección exacta está por confirmar.`

export const faqItems: readonly FaqItem[] = [
  {
    id: "1",
    question: "¿Qué es Juntos En Casa?",
    answer:
      "Juntos En Casa es la Conferencia de adolescentes y jóvenes de Iglesia Vida Sobrenatural. Fue creada para crecer en unidad, ir más profundo en Dios y ser equipados para el desarrollo de nuestro propósito. También disfrutaremos de juegos, dinámicas y mas. Esta actividad esta especialmente planificada por y para jóvenes.",
  },
  {
    id: "2",
    question: "¿La actividad es abierta?",
    answer:
      "La actividad es abierta a otras congregaciones que quieran sumarse y compartir un fin de semana de renovación y impulso.",
  },
  {
    id: "3",
    question: "¿Dónde es?",
    answer: dondeEs,
  },
  {
    id: "4",
    question: "¿Tiene un costo?",
    answer:
      "La entrada a la conferencia es libre y gratuita con previa inscripción.",
  },
]
