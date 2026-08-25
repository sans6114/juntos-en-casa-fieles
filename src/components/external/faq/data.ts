export type FaqItem = {
  id: string
  question: string
  answer: string
}

export const faqItems: readonly FaqItem[] = [
  {
    id: "1",
    question: "¿Qué es Juntos en Casa?",
    answer:
      "Juntos en Casa es la Conferencia de adolescentes y jóvenes de Iglesia Vida Sobrenatural. Fue creada para crecer en unidad, ir más profundo en Dios y ser equipados para el desarrollo de nuestro propósito. También disfrutaremos de juegos, dinámicas y talleres especialmente planificados por y para adolescentes y jóvenes.",
  },
  {
    id: "2",
    question: "¿La actividad es abierta?",
    answer:
      "La actividad es abierta a otras congregaciones que quieran sumarse y compartir un fin de semana de renovación Juntos en Casa.",
  },
  {
    id: "3",
    question: "¿Dónde es?",
    answer:
      "En el templo de Vida Sobrenatural: Calle 23, 1665 entre 66 y 67 (La Plata, Bs As). Zona Parque Castelli",
  },
  {
    id: "4",
    question: "¿Tiene un costo?",
    answer:
      "La entrada a la conferencia es libre y gratuita con previa inscripción.",
  },
]
