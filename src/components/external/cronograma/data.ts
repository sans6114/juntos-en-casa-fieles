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
      { time: "19:00", label: "Adoración" },
      { time: "20:00", label: "Sesión 1" },
    ],
  },
  {
    id: "dia-2",
    dayLabel: "Sábado 19",
    title: "Jornada plena",
    items: [
      { time: "14:00", label: "Lorem ipsum dolor sit amet" },
      { time: "14:45", label: "Adoración" },
      { time: "15:30", label: "Sesión 2" },
      { time: "16:30", label: "Consectetur adipiscing elit" },
      { time: "17:00", label: "Sesión 3" },
      { time: "18:00", label: "Sed do eiusmod tempor" },
      { time: "19:00", label: "Incididunt ut labore" },
      { time: "20:00", label: "Adoración" },
      { time: "20:45", label: "Sesión 4" },
      { time: "22:00", label: "Magna aliqua ut enim" },
    ],
  },
  {
    id: "dia-3",
    dayLabel: "Domingo 20",
    title: "Cierre",
    items: [
      { time: "10:30", label: "Adoración" },
      { time: "11:30", label: "Sesión 5" },
    ],
  },
]
