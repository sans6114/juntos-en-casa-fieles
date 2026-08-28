import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/client';
import { normalizarNombreCongregacion } from './src/lib/congregacion/normalizar';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const nuevasCongregaciones = [
  "Amor y Restauración",
  "Casa de Avivamiento",
  "Centro Cristiano de la Unión",
  "Centro de Vida Cristiana",
  "CERAV",
  "Conexión de Vida",
  "Crossroads Church",
  "El Buen Samaritano",
  "El Rey Jesús La Franja",
  "Fuente de Vida",
  "Hillsong",
  "IBZO",
  "Iglesia Bautista Pueblo Nuevo",
  "Iglesia Cristo Viene",
  "Iglesia Cristiana de La Plata",
  "Iglesia del Centro",
  "Iglesia Evangélica Filadelfia - Lobos",
  "Iglesia Ríos de Vida",
  "La Vid",
  "Primera Iglesia Bautista de Ensenada",
  "Puertas del Cielo",
  "Rey de Salvación",
  "Rumbo Norte",
  "Pueblo de Dios",
  "UNIDA Pentecostal de Abasto",
  "Verdades Bíblicas",
  "Vida Sobre Natural"
];

async function main() {
  console.log("Desvinculando inscripciones de congregaciones actuales...");
  await prisma.inscripcion.updateMany({
    data: { congregacionId: null },
  });

  console.log("Eliminando congregaciones actuales de prueba...");
  await prisma.congregacion.deleteMany();

  console.log("Insertando nuevas congregaciones...");
  for (const nombre of nuevasCongregaciones) {
    await prisma.congregacion.create({
      data: {
        nombre,
        nombreNormalizado: normalizarNombreCongregacion(nombre),
        estado: "APROBADA",
      },
    });
  }

  console.log("¡Proceso completado exitosamente!");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
