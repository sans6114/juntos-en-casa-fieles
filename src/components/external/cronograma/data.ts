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

/** Mock schedule — placeholder content for landing UI only. */
export const cronogramaDias: CronogramaDia[] = [
  {
    id: "dia-1",
    dayLabel: "Viernes 12",
    title: "Apertura",
    items: [
      { time: "18:00", label: "Bienvenida y registro" },
      { time: "19:30", label: "Culto de apertura" },
      { time: "21:00", label: "Tiempo de comunión" },
    ],
  },
  {
    id: "dia-2",
    dayLabel: "Sábado 13",
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
    dayLabel: "Domingo 14",
    title: "Cierre",
    items: [
      { time: "10:00", label: "Celebración final" },
      { time: "12:30", label: "Envío y despedida" },
    ],
  },
]
