export type FaqItem = {
  id: string
  question: string
  answer: string
}

// Contenido placeholder: cada string lleva su marca visible en el texto
// renderizado. Reemplazar por las preguntas y respuestas reales cuando
// estén confirmadas.
export const faqItems: readonly FaqItem[] = [
  {
    id: "faq-1",
    question: "Pregunta de ejemplo — reemplazar",
    answer: "Respuesta de ejemplo — reemplazar",
  },
  {
    id: "faq-2",
    question: "Pregunta de ejemplo — reemplazar",
    answer: "Respuesta de ejemplo — reemplazar",
  },
  {
    id: "faq-3",
    question: "Pregunta de ejemplo — reemplazar",
    answer: "Respuesta de ejemplo — reemplazar",
  },
  {
    id: "faq-4",
    question: "Pregunta de ejemplo — reemplazar",
    answer: "Respuesta de ejemplo — reemplazar",
  },
]
