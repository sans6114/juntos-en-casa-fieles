export type Usuario = {
  id: string
  nombre: string
  email: string
  rol: "colaborador"
  createdAt: string
}

export const usuarios: Usuario[] = [
  {
    id: "usr_1",
    nombre: "María González",
    email: "maria.gonzalez@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-01-15T10:00:00.000Z",
  },
  {
    id: "usr_2",
    nombre: "Carlos Ruiz",
    email: "carlos.ruiz@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-01-20T14:30:00.000Z",
  },
  {
    id: "usr_3",
    nombre: "Ana Martínez",
    email: "ana.martinez@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-02-03T09:15:00.000Z",
  },
  {
    id: "usr_4",
    nombre: "Diego Fernández",
    email: "diego.fernandez@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-02-10T11:45:00.000Z",
  },
  {
    id: "usr_5",
    nombre: "Lucía Herrera",
    email: "lucia.herrera@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-02-18T16:00:00.000Z",
  },
  {
    id: "usr_6",
    nombre: "Pablo Sánchez",
    email: "pablo.sanchez@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-03-01T08:30:00.000Z",
  },
  {
    id: "usr_7",
    nombre: "Valentina López",
    email: "valentina.lopez@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-03-12T13:20:00.000Z",
  },
  {
    id: "usr_8",
    nombre: "Martín Díaz",
    email: "martin.diaz@juntosencasa.org",
    rol: "colaborador",
    createdAt: "2026-03-25T17:10:00.000Z",
  },
]
