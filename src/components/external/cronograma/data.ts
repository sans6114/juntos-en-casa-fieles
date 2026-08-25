export type CronogramaItem = {
  time: string
  label: string
}

export type CronogramaDia = {
  id: string
  dayLabel: string
  title: string
  items: CronogramaItem[]
}

/**
 * Placeholder schedule. `Cronograma` renders a `PlaceholderTag` above the grid so the
 * provisional state is visible to the visitor, not only to whoever reads this file.
 * Drop the tag in `Cronograma.tsx` once these times are confirmed.
 */
// Fuente de verdad: siteConfig.eventStartsAt
export const cronogramaDias: CronogramaDia[] = [
  {
    id: "dia-1",
    dayLabel: "Viernes 18",
    title: "Apertura",
    items: [
      { time: "18:00", label: "Bienvenida y registro" },
      { time: "19:30", label: "Culto de apertura" },
      { time: "21:00", label: "Tiempo de comunión" },
    ],
  },
  {
    id: "dia-2",
    dayLabel: "Sábado 19",
    title: "Jornada plena",
    items: [
      { time: "09:00", label: "Desayuno compartido" },
      { time: "10:30", label: "Talleres por grupos" },
      { time: "16:00", label: "Espacio creativo" },
      { time: "20:00", label: "Noche de alabanza" },
    ],
  },
  {
    id: "dia-3",
    dayLabel: "Domingo 20",
    title: "Cierre",
    items: [
      { time: "10:00", label: "Celebración final" },
      { time: "12:30", label: "Envío y despedida" },
    ],
  },
]
