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
    title: "Fieles en la búsqueda",
    items: [
      { time: "19:00", label: "Acreditación" },
      { time: "19:30", label: "Sesión 1" },
    ],
  },
  {
    id: "dia-2",
    dayLabel: "Sábado 19",
    title: "Fieles en la administración",
    items: [
      { time: "14:00", label: "Sesión 2" },
      { time: "16:00", label: "Break" },
      { time: "16:30", label: "Sesión 3" },
      { time: "18:00", label: "Break" },
      { time: "18:30", label: "Sesión 4" },
    ],
  },
  {
    id: "dia-3",
    dayLabel: "Domingo 20",
    title: "Fieles en el propósito",
    items: [
      { time: "10:30", label: "Sesión 5" },
    ],
  },
]
