import { congregaciones } from "./congregaciones"

export type Inscripcion = {
  id: string
  nombre: string
  email: string
  telefono?: string | null
  edad: number
  congregacionId: string | null
  congregacionNombre: string | null
  createdAt: string
  contactado?: boolean
  contactoUsuarioNombre?: string | null
}

export const inscripcionesEventoAnterior = 48 as number

const nombres = [
  "Sofía", "Mateo", "Emma", "Santiago", "Valentina", "Benjamín", "Isabella", "Lucas",
  "Camila", "Tomás", "Martina", "Joaquín", "Lucía", "Agustín", "Florencia", "Nicolás",
  "Catalina", "Franco", "Julieta", "Facundo", "Renata", "Ignacio", "Antonella", "Bruno",
  "Mía", "Thiago", "Emilia", "Maximiliano", "Agustina", "Lautaro", "Bianca", "Ramiro",
  "Delfina", "Gonzalo", "Constanza", "Ezequiel", "Victoria", "Matías", "Paula", "Sebastián",
  "Carolina", "Alejandro", "Daniela", "Rodrigo", "Gabriela", "Federico", "Natalia", "Marcos",
  "Andrea", "Leandro", "Silvia", "Hernán", "Claudia", "Oscar", "Patricia", "Ricardo",
  "Elena", "Jorge", "Monica", "Alberto", "Laura",
]

const apellidos = [
  "García", "Rodríguez", "Martínez", "López", "González", "Pérez", "Sánchez", "Romero",
  "Torres", "Díaz", "Álvarez", "Ruiz", "Fernández", "Moreno", "Muñoz", "Jiménez",
  "Herrera", "Castro", "Vargas", "Ramos", "Mendoza", "Silva", "Acosta", "Medina",
  "Suárez", "Gutiérrez", "Ortiz", "Navarro", "Reyes", "Campos",
]

const edades = [
  14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33,
  34, 35, 36, 37, 38, 39, 40, 41, 42, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
  24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
]

function buildInscripciones(): Inscripcion[] {
  return Array.from({ length: 60 }, (_, index) => {
    const nombre = nombres[index % nombres.length]
    const apellido = apellidos[index % apellidos.length]
    const congregacion = congregaciones[index % congregaciones.length]
    const edad = edades[index % edades.length]
    const day = (index % 28) + 1

    return {
      id: `ins_${index + 1}`,
      nombre: `${nombre} ${apellido}`,
      email: `${nombre.toLowerCase()}.${apellido.toLowerCase()}${index + 1}@email.com`,
      edad,
      congregacionId: index % 7 === 0 ? null : congregacion.id,
      congregacionNombre: index % 7 === 0 ? null : congregacion.nombre,
      createdAt: `2026-07-${String(day).padStart(2, "0")}T${String(9 + (index % 10)).padStart(2, "0")}:00:00.000Z`,
    }
  })
}

export const inscripciones: Inscripcion[] = buildInscripciones()

export type AgeRangeKey = "12-18" | "18-28" | "+28"

export function getAgeRange(edad: number): AgeRangeKey {
  if (edad >= 12 && edad < 18) return "12-18"
  if (edad >= 18 && edad <= 28) return "18-28"
  return "+28"
}

export function getInscripcionesMetrics(data: Inscripcion[] = inscripciones) {
  const total = data.length
  const edadPromedio =
    total === 0 ? 0 : Math.round(data.reduce((sum, item) => sum + item.edad, 0) / total)

  const ageRanges = data.reduce(
    (acc, item) => {
      const range = getAgeRange(item.edad)
      acc[range] += 1
      return acc
    },
    { "12-18": 0, "18-28": 0, "+28": 0 } as Record<AgeRangeKey, number>
  )

  const porCongregacion = congregaciones.map((congregacion) => ({
    id: congregacion.id,
    nombre: congregacion.nombre,
    total: data.filter((item) => item.congregacionId === congregacion.id).length,
  }))

  const sinCongregacion = data.filter((item) => !item.congregacionId).length
  const crecimiento =
    inscripcionesEventoAnterior === 0
      ? 0
      : Math.round(((total - inscripcionesEventoAnterior) / inscripcionesEventoAnterior) * 100)

  const congregacionesActivas = porCongregacion.filter((item) => item.total > 0).length

  return {
    total,
    edadPromedio,
    ageRanges,
    porCongregacion,
    sinCongregacion,
    crecimiento,
    congregacionesActivas,
    eventoAnterior: inscripcionesEventoAnterior,
  }
}

export const historialInscripciones = [
  { evento: "Mar 2025", total: 32 },
  { evento: "Jun 2025", total: 41 },
  { evento: "Sep 2025", total: 48 },
  { evento: "Jul 2026", total: inscripciones.length },
]
