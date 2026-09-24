import type { Metadata } from "next"
import Link from "next/link"

import {
  ACCION_POST_EVENTO,
  BrandName,
  CtaButton,
  SiteFooter,
  SiteHeader,
} from "@/components/external/shared"
import { createPageMetadata } from "@/lib/seo/site"

export const metadata: Metadata = createPageMetadata({
  title: "Las inscripciones cerraron",
  path: "/inscripcion",
  // Fuera del índice mientras no haya nada que inscribir: una página de
  // "cerrado" posicionando para "inscripción Juntos En Casa" es peor que no
  // aparecer, porque se lleva el clic y no da nada.
  noIndex: true,
})

/**
 * La ruta sigue viva, pero sin formulario.
 *
 * Se sacaron los links a esta página de todo el sitio, y aun así la ruta NO se
 * borra: quedó en mails, en WhatsApps y en cualquier captura o link compartido.
 * Un 404 le diría a esa persona que se equivocó, cuando lo que pasó es que el
 * evento terminó.
 *
 * Y sobre todo: mientras el formulario siguiera acá, alguien con el link podía
 * anotarse a un evento que ya pasó. Esa fila entraba en el total de inscriptos
 * y aparecía como "no asistió" en el panel, ensuciando justamente los números
 * que se usan para el seguimiento.
 *
 * Para reabrir el año que viene: volver a montar `InscripcionForm` con
 * `obtenerCongregaciones()`, que es de donde salió este archivo.
 */
export default function InscripcionCerradaPage() {
  return (
    <>
      <SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />

      <main id="contenido" tabIndex={-1}>
        <section className="campo-papel px-6 pb-24 pt-6 md:px-10 md:pb-28 lg:px-16">
          <div className="mx-auto flex max-w-2xl flex-col items-start gap-6">
            <p className="jec-mono text-sm font-bold uppercase tracking-[0.18em] text-[var(--jec-ember)]">
              18, 19 y 20 de septiembre de 2026
            </p>

            <h1 className="jec-display text-4xl leading-[0.95] tracking-tight md:text-6xl">
              Las inscripciones cerraron
            </h1>

            <p className="text-pretty text-base font-medium leading-relaxed md:text-lg">
              <BrandName>Juntos En Casa</BrandName> · Fieles 2026 ya pasó. Gracias a
              cada persona que vino: fueron tres días que no nos vamos a olvidar.
            </p>

            <p className="text-pretty text-base leading-relaxed text-[var(--jec-ink)]/75">
              Las prédicas y los videos van subiendo al sitio, así que lo que se
              vivió esos días queda disponible para volver a verlo.
            </p>

            <CtaButton href={ACCION_POST_EVENTO.href} className="mt-2">
              {ACCION_POST_EVENTO.label}
            </CtaButton>

            {/* El link a /mi-qr se mantiene SOLO acá: es el único lugar del sitio
              * donde alguien que llegó buscando su inscripción puede querer
              * recuperar su registro. Del nav salió, porque el QR ya no abre
              * ninguna puerta. */}
            <p className="text-sm text-[var(--jec-ink)]/60">
              ¿Te inscribiste y querés ver tu registro?{" "}
              <Link
                href="/mi-qr"
                className="font-semibold underline underline-offset-4 hover:text-[var(--jec-ember)]"
              >
                Buscá tu QR acá
              </Link>
              .
            </p>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  )
}
