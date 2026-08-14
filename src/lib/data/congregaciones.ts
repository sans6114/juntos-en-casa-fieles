interface Congregacion {
  id: string
  nombre: string
}

/** Referencia de sedes usada por seed / utilidades. Las métricas agrupan desde la DB. */
export const congregaciones: Congregacion[] = [
  { id: "cg_1", nombre: "Central" },
  { id: "cg_2", nombre: "Norte" },
  { id: "cg_3", nombre: "Sur" },
  { id: "cg_4", nombre: "Este" },
  { id: "cg_5", nombre: "Oeste" },
  { id: "cg_6", nombre: "Villa Nueva" },
]
