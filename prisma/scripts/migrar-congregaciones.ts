import 'dotenv/config'
import { PrismaClient } from '../../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import congregacionesSeed from '../data/congregaciones.json'
import { normalizarNombreCongregacion } from '../../src/lib/congregacion/normalizar'

const adapter = new PrismaPg({ connectionString: process.env.NEON_DATABASE_URL || process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando migración solo de congregaciones...")

  const congregaciones = congregacionesSeed

  for (const cg of congregaciones) {
    await prisma.congregacion.upsert({
      where: { id: cg.id },
      update: {},
      create: {
        id: cg.id,
        nombre: cg.nombre,
        nombreNormalizado: normalizarNombreCongregacion(cg.nombre),
        estado: "APROBADA",
      },
    })
  }

  console.log(`✅ Se insertaron/verificaron ${congregaciones.length} congregaciones.`)
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
