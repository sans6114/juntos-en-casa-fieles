import Image from 'next/image';

import { BrandName } from '@/components/external/shared';
import { jecAssets } from '@/lib/jec-assets';
import { siteConfig } from '@/lib/seo/site';

/** The three facts a visitor checks before filling anything in. */
const DATOS = [
  {
    dt: "Cuándo",
    dd: "18, 19 y 20 de septiembre 2026",
    detalle: "Arranca viernes 19:00",
  },
  {
    dt: "Dónde",
    dd: siteConfig.org,
    detalle: siteConfig.city,
  },
  {
    dt: "Para quién",
    dd: "Adolescentes y jóvenes",
    detalle: "Desde 12 años",
  },
]

/**
 * Steps after submit. Not filler — each one is implemented:
 * the QR email is sent by `src/lib/email/send-qr-email.ts`.
 */
const PASOS = [
  {
    titulo: "Completás el formulario",
    detalle: "Cinco campos. La congregación es opcional — si no vas a ninguna, dejalo vacío.",
  },
  {
    titulo: "Te llega un email con tu QR",
    detalle: "Ese código es tu entrada. Guardalo en el celular, no hace falta imprimirlo.",
  },
  {
    titulo: "Nos vemos el 18",
    detalle: "Mostrás el QR en la puerta y entrás. Así de simple.",
  },
]

export function InscripcionAside() {
  return (
    <div className="flex min-w-0 flex-col gap-11">
      <div>
        <p className="jec-label jec-eyebrow mb-3 text-xs font-bold uppercase tracking-[0.28em] md:mb-4 md:text-sm">
          Inscripción · <BrandName>{siteConfig.name}</BrandName> {siteConfig.year}
        </p>
        <h1 className="jec-display text-pretty text-4xl leading-[0.94] tracking-tight sm:text-5xl lg:text-7xl">
          Sumate a la conferencia
        </h1>
        <p className="mt-6 max-w-lg text-pretty text-base leading-relaxed text-[var(--suave)] md:text-lg">
        Tres días para disfrutar y crecer juntos en la presencia de Dios. Completá tus datos para reservar tu lugar.
        </p>
      </div>

      <dl className="border-t-[3px] border-[var(--regla)]">
        {DATOS.map((dato) => (
          <div
            key={dato.dt}
            className="flex flex-col gap-1 border-b border-[var(--linea)] py-4 last:border-b-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-6"
          >
            <dt className="jec-label text-xs font-bold uppercase tracking-[0.18em] text-[var(--suave)]">
              {dato.dt}
            </dt>
            <dd className="m-0 sm:text-right">
              <span className="block text-lg font-bold tracking-tight">{dato.dd}</span>
              <span className="block text-[15px] text-[var(--suave)]">{dato.detalle}</span>
            </dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-col gap-6">
        <h2 className="jec-label text-sm font-bold uppercase tracking-[0.18em] text-[var(--suave)]">
          Qué pasa después
        </h2>
        <ol className="flex flex-col gap-6">
          {PASOS.map((paso, index) => (
            <li key={paso.titulo} className="flex items-start gap-4">
              <span
                aria-hidden="true"
                className="jec-label flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--dato)] text-sm font-extrabold text-[var(--sup)]"
              >
                {index + 1}
              </span>
              <div className="min-w-0">
                <h3 className="jec-label text-base font-extrabold tracking-tight">{paso.titulo}</h3>
                <p className="mt-1 text-sm leading-relaxed text-[var(--suave)]">{paso.detalle}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <Image
        src={jecAssets.personaje.saludo}
        alt=""
        width={200}
        height={267}
        className="hidden w-[200px] self-start lg:block"
      />
    </div>
  )
}
