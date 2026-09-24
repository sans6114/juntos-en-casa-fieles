"use client"

import { useMemo, useState } from "react"

import { MessageCircle, Search, Sparkles } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type { NoAsistenteDTO } from "@/interfaces/inscripcion"

/**
 * Los tres grupos.
 *
 * `nunca` no es una solapa más: es un SUBCONJUNTO de las otras dos, porque
 * quien no vino ningún día falta al día 1 y al día 2 a la vez. Va primero y
 * separado justamente por eso — mezclarlo con "faltó el viernes" esconde la
 * diferencia entre alguien que no pisó el evento y alguien que estuvo el
 * sábado, que son dos conversaciones distintas.
 */
type Grupo = "nunca" | "dia1" | "dia2"

const ETIQUETA_GRUPO: Record<Grupo, string> = {
  nunca: "No vino ningún día",
  dia1: "Faltó el día 1",
  dia2: "Faltó el día 2",
}

function perteneceA(grupo: Grupo, item: NoAsistenteDTO): boolean {
  if (grupo === "nunca") return !item.asistenciaDia1 && !item.asistenciaDia2
  if (grupo === "dia1") return !item.asistenciaDia1
  return !item.asistenciaDia2
}

/**
 * Qué SÍ hizo la persona. Es lo que evita el papelón de escribirle "no pudiste
 * venir" a alguien que estuvo un día entero.
 */
function loQueHizo(item: NoAsistenteDTO): string | null {
  if (!item.asistenciaDia1 && !item.asistenciaDia2) return null
  return item.asistenciaDia1 ? "Vino el día 1" : "Vino el día 2"
}

type NoAsistentesClientProps = {
  data: NoAsistenteDTO[]
}

export function NoAsistentesClient({ data }: NoAsistentesClientProps) {
  const [query, setQuery] = useState("")
  const [soloNuevos, setSoloNuevos] = useState(false)

  const conteos = useMemo(
    () => ({
      nunca: data.filter((i) => perteneceA("nunca", i)).length,
      dia1: data.filter((i) => perteneceA("dia1", i)).length,
      dia2: data.filter((i) => perteneceA("dia2", i)).length,
    }),
    [data]
  )

  /**
   * Los que declararon "soy nuevo" y no aparecieron. Es el subconjunto que más
   * pesa de esta pantalla: alguien sin iglesia que dio el paso de anotarse y no
   * llegó a entrar. El filtro solo se dibuja si hay alguno.
   */
  const nuevosQueNoVinieron = useMemo(
    () => data.filter((i) => i.sinCongregacion && perteneceA("nunca", i)).length,
    [data]
  )

  const filtrar = useMemo(() => {
    const normalizada = query.trim().toLowerCase()

    return (grupo: Grupo) =>
      data.filter((item) => {
        if (!perteneceA(grupo, item)) return false
        if (soloNuevos && !item.sinCongregacion) return false
        if (!normalizada) return true

        return (
          item.nombre.toLowerCase().includes(normalizada) ||
          (item.email?.toLowerCase().includes(normalizada) ?? false) ||
          (item.telefono?.toLowerCase().includes(normalizada) ?? false) ||
          (item.congregacionNombre?.toLowerCase().includes(normalizada) ?? false)
        )
      })
  }, [data, query, soloNuevos])

  const renderTabla = (grupo: Grupo) => {
    const filas = filtrar(grupo)

    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Mostrando {filas.length} de {conteos[grupo]} personas
        </p>

        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Congregación</TableHead>
                <TableHead>Edad</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead className="text-right">Contactar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filas.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                    {conteos[grupo] === 0
                      ? "Nadie en este grupo."
                      : "Ninguna persona coincide con la búsqueda."}
                  </TableCell>
                </TableRow>
              ) : (
                filas.map((item) => {
                  const hizo = loQueHizo(item)

                  return (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.nombre}</TableCell>
                      <TableCell>
                        {/* Se dice lo que la persona SÍ hizo, no lo que le falto.
                            En la solapa "faltó el día 1" hay gente que estuvo el
                            sábado, y escribirle como si no hubiera venido es el
                            error que esta columna existe para evitar. */}
                        {hizo ? (
                          <Badge variant="secondary">{hizo}</Badge>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            No vino ningún día
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {item.sinCongregacion ? (
                          <Badge className="gap-1">
                            <Sparkles className="size-3" />
                            Es nuevo
                          </Badge>
                        ) : item.congregacionNombre ? (
                          <span className="text-sm">{item.congregacionNombre}</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="tabular-nums">{item.edad}</TableCell>
                      <TableCell className="text-sm">{item.email ?? "—"}</TableCell>
                      <TableCell className="text-sm tabular-nums">
                        {item.telefono ?? "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.whatsappUrl ? (
                          <a
                            href={item.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Abrir WhatsApp con ${item.nombre}`}
                            className={cn(
                              buttonVariants({ variant: "ghost", size: "icon-sm" }),
                              "text-[#128C7E] hover:text-[#0e7368]"
                            )}
                          >
                            <MessageCircle className="size-4" />
                            <span className="sr-only">
                              Abrir WhatsApp con {item.nombre}
                            </span>
                          </a>
                        ) : (
                          <span
                            className="text-xs text-muted-foreground"
                            title="El teléfono no se puede convertir a un número de WhatsApp válido"
                          >
                            sin WhatsApp
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre, email o congregación..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
          />
        </div>

        {nuevosQueNoVinieron > 0 ? (
          <button
            type="button"
            onClick={() => setSoloNuevos((previo) => !previo)}
            className={cn(
              buttonVariants({ variant: soloNuevos ? "default" : "outline" }),
              "gap-2"
            )}
          >
            <Sparkles className="size-4" />
            Solo los nuevos ({nuevosQueNoVinieron})
          </button>
        ) : null}
      </div>

      <Tabs defaultValue="nunca" className="w-full">
        <TabsList>
          {/* "No vino ningún día" primero: es el grupo al que de verdad hay que
              escribirle, y los otros dos lo contienen. */}
          <TabsTrigger value="nunca">
            {ETIQUETA_GRUPO.nunca} ({conteos.nunca})
          </TabsTrigger>
          <TabsTrigger value="dia1">
            {ETIQUETA_GRUPO.dia1} ({conteos.dia1})
          </TabsTrigger>
          <TabsTrigger value="dia2">
            {ETIQUETA_GRUPO.dia2} ({conteos.dia2})
          </TabsTrigger>
        </TabsList>

        {/* Los tres números NO suman: quien no vino ningún día está contado en
            las tres solapas. Decirlo acá evita que alguien los sume y crea que
            faltaron más personas de las que se inscribieron. */}
        <p className="mt-3 text-xs text-muted-foreground">
          Los grupos se superponen: quien no vino ningún día aparece en las tres
          solapas. No los sumes.
        </p>

        <div className="mt-4">
          <TabsContent value="nunca">{renderTabla("nunca")}</TabsContent>
          <TabsContent value="dia1">{renderTabla("dia1")}</TabsContent>
          <TabsContent value="dia2">{renderTabla("dia2")}</TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
