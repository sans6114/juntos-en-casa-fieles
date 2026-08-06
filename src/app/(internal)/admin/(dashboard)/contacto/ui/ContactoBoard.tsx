"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  CheckCircle2,
  CircleDashed,
  MessageCircle,
  Phone,
  UserRound,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

export type ContactoRow = {
  id: string
  nombre: string
  email: string
  telefono: string | null
  edad: number
  createdAt: string
  contactado: boolean
  observacion: string | null
  contactadoAt: string | null
  colaboradorNombre: string | null
  colaboradorEmail: string | null
}

type Filter = "pendientes" | "contactados" | "todos"

function formatDate(date: string | null) {
  if (!date) return null
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date))
}

export function ContactoBoard({ rows }: { rows: ContactoRow[] }) {
  const [filter, setFilter] = useState<Filter>("pendientes")

  const counts = useMemo(() => {
    const pendientes = rows.filter((r) => !r.contactado).length
    const contactados = rows.filter((r) => r.contactado).length
    return { pendientes, contactados, todos: rows.length }
  }, [rows])

  const visible = useMemo(() => {
    if (filter === "pendientes") return rows.filter((r) => !r.contactado)
    if (filter === "contactados") return rows.filter((r) => r.contactado)
    return rows
  }, [filter, rows])

  return (
    <div className="contacto-board mx-auto w-full max-w-5xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <header className="space-y-4">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--contacto-accent)]">
          Seguimiento pastoral
        </p>
        <h1 className="font-[family-name:var(--font-contacto-display)] text-4xl font-semibold tracking-tight text-[var(--contacto-ink)] sm:text-5xl">
          Personas sin iglesia
        </h1>
        <p className="max-w-2xl text-lg leading-relaxed text-[var(--contacto-muted)] sm:text-xl">
          Acá ves a quienes se inscribieron sin congregación. Los colaboradores
          los contactan desde la grilla; vos controlás el avance y quién habló
          con cada uno.
        </p>
      </header>

      <section
        aria-label="Cómo funciona"
        className="rounded-2xl border border-[var(--contacto-border)] bg-[var(--contacto-surface)] p-5 sm:p-6"
      >
        <h2 className="mb-4 text-base font-semibold text-[var(--contacto-ink)] sm:text-lg">
          Cómo trabaja el equipo
        </h2>
        <ol className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Abrir la ficha",
              body: "En la grilla, tocá el nombre de alguien sin iglesia.",
            },
            {
              step: "2",
              title: "Escribir por WhatsApp",
              body: "Usá el botón verde en la ficha para abrir el chat.",
            },
            {
              step: "3",
              title: "Marcar y anotar",
              body: "Activá “Contactado” y dejá una observación breve.",
            },
          ].map((item) => (
            <li key={item.step} className="flex gap-3">
              <span
                className="flex size-9 shrink-0 items-center justify-center rounded-full bg-[var(--contacto-ink)] text-sm font-bold text-white"
                aria-hidden
              >
                {item.step}
              </span>
              <div>
                <p className="text-base font-semibold text-[var(--contacto-ink)]">
                  {item.title}
                </p>
                <p className="mt-1 text-base leading-snug text-[var(--contacto-muted)]">
                  {item.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filtrar por estado">
          {(
            [
              { id: "pendientes", label: "Pendientes", count: counts.pendientes },
              { id: "contactados", label: "Contactados", count: counts.contactados },
              { id: "todos", label: "Todos", count: counts.todos },
            ] as const
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={filter === tab.id}
              onClick={() => setFilter(tab.id)}
              className={cn(
                "rounded-full px-4 py-2 text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--contacto-accent)]",
                filter === tab.id
                  ? "bg-[var(--contacto-ink)] text-white"
                  : "bg-[var(--contacto-surface)] text-[var(--contacto-ink)] hover:bg-[var(--contacto-border)]"
              )}
            >
              {tab.label}
              <span className="ml-2 tabular-nums opacity-80">{tab.count}</span>
            </button>
          ))}
        </div>
        <p className="text-base text-[var(--contacto-muted)]">
          {visible.length} {visible.length === 1 ? "persona" : "personas"}
        </p>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--contacto-border)] px-6 py-16 text-center">
          <CheckCircle2 className="mx-auto size-10 text-[var(--contacto-done)]" />
          <p className="mt-4 font-[family-name:var(--font-contacto-display)] text-2xl text-[var(--contacto-ink)]">
            {filter === "pendientes"
              ? "No hay pendientes por contactar"
              : filter === "contactados"
                ? "Todavía nadie fue marcado como contactado"
                : "No hay inscripciones sin iglesia"}
          </p>
          <p className="mt-2 text-lg text-[var(--contacto-muted)]">
            {filter === "pendientes"
              ? "Cuando aparezca alguien nuevo sin congregación, va a listarse acá."
              : "Los colaboradores marcan el contacto desde cada ficha."}
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {visible.map((row) => (
            <li key={row.id}>
              <article
                className={cn(
                  "group relative overflow-hidden rounded-2xl border border-[var(--contacto-border)] bg-white shadow-sm transition-shadow hover:shadow-md",
                  "before:absolute before:inset-y-0 before:left-0 before:w-1.5",
                  row.contactado
                    ? "before:bg-[var(--contacto-done)]"
                    : "before:bg-[var(--contacto-accent)]"
                )}
              >
                <div className="flex flex-col gap-5 p-5 pl-6 sm:flex-row sm:items-start sm:justify-between sm:p-6 sm:pl-7">
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="font-[family-name:var(--font-contacto-display)] text-2xl font-semibold tracking-tight text-[var(--contacto-ink)] sm:text-3xl">
                        {row.nombre}
                      </h3>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold",
                          row.contactado
                            ? "bg-teal-50 text-[var(--contacto-done)]"
                            : "bg-amber-50 text-[var(--contacto-accent)]"
                        )}
                      >
                        {row.contactado ? (
                          <CheckCircle2 className="size-4" />
                        ) : (
                          <CircleDashed className="size-4" />
                        )}
                        {row.contactado ? "Contactado" : "Pendiente"}
                      </span>
                    </div>

                    <dl className="grid gap-2 text-base text-[var(--contacto-muted)] sm:grid-cols-2">
                      <div className="flex items-center gap-2">
                        <Phone className="size-4 shrink-0 opacity-70" aria-hidden />
                        <dt className="sr-only">Teléfono</dt>
                        <dd className="text-lg text-[var(--contacto-ink)]">
                          {row.telefono ?? "Sin teléfono cargado"}
                        </dd>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-1">
                        <dt className="sr-only">Email</dt>
                        <dd className="truncate text-lg">{row.email}</dd>
                      </div>
                      <div className="flex items-center gap-2 sm:col-span-2">
                        <UserRound className="size-4 shrink-0 opacity-70" aria-hidden />
                        <dt className="sr-only">Colaborador</dt>
                        <dd className="text-lg">
                          {row.colaboradorNombre ? (
                            <>
                              <span className="font-medium text-[var(--contacto-ink)]">
                                {row.colaboradorNombre}
                              </span>
                              {row.contactadoAt ? (
                                <span className="text-[var(--contacto-muted)]">
                                  {" "}
                                  · {formatDate(row.contactadoAt)}
                                </span>
                              ) : null}
                            </>
                          ) : (
                            <span className="text-[var(--contacto-muted)]">
                              Nadie contactó todavía
                            </span>
                          )}
                        </dd>
                      </div>
                    </dl>

                    {row.observacion ? (
                      <blockquote className="border-l-2 border-[var(--contacto-border)] pl-4 text-lg leading-relaxed text-[var(--contacto-ink)]">
                        “{row.observacion}”
                      </blockquote>
                    ) : null}
                  </div>

                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <Link
                      href={`/admin/inscripciones/${row.id}`}
                      className={cn(
                        buttonVariants({ size: "lg" }),
                        "h-11 gap-2 bg-[var(--contacto-ink)] px-5 text-base text-white hover:bg-[var(--contacto-ink)]/90"
                      )}
                    >
                      <MessageCircle className="size-5" />
                      Ver ficha
                    </Link>
                    <p className="text-sm text-[var(--contacto-muted)]">
                      {row.edad} años
                    </p>
                  </div>
                </div>
              </article>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
