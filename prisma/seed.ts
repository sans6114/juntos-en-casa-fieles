import 'dotenv/config'
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando el seeding de la base de datos...")

  const congregaciones = [
    { id: "cg_1", nombre: "Central" },
    { id: "cg_2", nombre: "Norte" },
    { id: "cg_3", nombre: "Sur" },
    { id: "cg_4", nombre: "Este" },
    { id: "cg_5", nombre: "Oeste" },
    { id: "cg_6", nombre: "Villa Nueva" },
  ]

  for (const cg of congregaciones) {
    await prisma.congregacion.upsert({
      where: { id: cg.id },
      update: {},
      create: {
        id: cg.id,
        nombre: cg.nombre,
      },
    })
  }

  console.log(`✅ Se insertaron/verificaron ${congregaciones.length} congregaciones.`)

  // inscripciones de prueba
  const countInscripciones = await prisma.inscripcion.count()
  if (countInscripciones === 0) {
    console.log("📝 Creando inscripciones de prueba...")
    const inscripciones = [
      { nombre: "Juan Pérez", email: "juan@test.com", edad: 20, congregacionId: "cg_1" },
      { nombre: "Ana Gómez", email: "ana@test.com", edad: 16, congregacionId: "cg_2" },
      { nombre: "Carlos López", email: "carlos@test.com", edad: 35, congregacionId: null },
      { nombre: "María Silva", email: "maria@test.com", edad: 22, congregacionId: "cg_1" },
      { nombre: "Lucas Torres", email: "lucas@test.com", edad: 15, congregacionId: "cg_3" },
      { nombre: "Sofía Ruiz", email: "sofia@test.com", edad: 28, congregacionId: "cg_6" },
      { nombre: "Martín Díaz", email: "martin@test.com", edad: 19, congregacionId: "cg_4" },
    ]

    for (const ins of inscripciones) {
      await prisma.inscripcion.create({
        data: ins,
      })
    }
    console.log(`✅ Se insertaron ${inscripciones.length} inscripciones de prueba.`)
  }

  console.log("🎉 Seeding finalizado.")
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
