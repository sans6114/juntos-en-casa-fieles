import 'dotenv/config'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '../generated/client'
import { PrismaPg } from '@prisma/adapter-pg'
import congregacionesSeed from './data/congregaciones.json'
import { contenidosSeed } from './data/contenidos'
import { normalizarNombreCongregacion } from '../src/lib/congregacion/normalizar'

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Iniciando el seeding de la base de datos...")

  const adminEmail = process.env.ADMIN_EMAIL
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminEmail || !adminPassword) {
    throw new Error("ADMIN_EMAIL y ADMIN_PASSWORD son requeridos para el seed del admin.")
  }

  const hashedPassword = await bcrypt.hash(adminPassword, 10)

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      nombre: "Administrador",
      password: hashedPassword,
      rol: "ADMIN",
      activo: true,
      passwordChangedAt: new Date(),
    },
    create: {
      nombre: "Administrador",
      email: adminEmail,
      password: hashedPassword,
      rol: "ADMIN",
      activo: true,
    },
  })
  console.log(`✅ Admin upserted: ${adminEmail}`)

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

  for (const c of contenidosSeed) {
    await prisma.contenido.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    })
  }

  console.log(`✅ Se insertaron/verificaron ${contenidosSeed.length} contenidos.`)

  const countInscripciones = await prisma.inscripcion.count()
  if (countInscripciones === 0) {
    console.log("📝 Creando inscripciones de prueba...")
    const inscripciones = [
      { nombre: "Juan Pérez", email: "juan@test.com", telefono: "1123456789", edad: 20, congregacionId: "cg_1" },
      { nombre: "Ana Gómez", email: "ana@test.com", telefono: "1198765432", edad: 16, congregacionId: "cg_2" },
      { nombre: "Carlos López", email: "carlos@test.com", telefono: "1144556677", edad: 35, congregacionId: null },
      { nombre: "María Silva", email: "maria@test.com", telefono: "1133445566", edad: 22, congregacionId: "cg_1" },
      { nombre: "Lucas Torres", email: "lucas@test.com", telefono: "1177889900", edad: 15, congregacionId: "cg_3" },
      { nombre: "Sofía Ruiz", email: "sofia@test.com", telefono: "1166778899", edad: 28, congregacionId: "cg_6" },
      { nombre: "Martín Díaz", email: "martin@test.com", telefono: null, edad: 19, congregacionId: null },
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
