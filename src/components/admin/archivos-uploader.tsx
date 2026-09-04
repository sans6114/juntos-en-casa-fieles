"use client"

import { useState } from "react"
import { upload } from "@vercel/blob/client"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MIMES_ARCHIVO, type ContenidoArchivoDTO } from "@/interfaces/contenido"

type ArchivosUploaderProps = {
  id: string
  label: string
  archivos: ContenidoArchivoDTO[]
  onChange: (archivos: ContenidoArchivoDTO[]) => void
  /** Se avisa al padre para que bloquee su submit mientras hay subidas en vuelo. */
  onUploadingChange: (subiendo: boolean) => void
  disabled?: boolean
  error?: string
}

/**
 * `orden` es la posición en la lista, no un número que alguien elija. Se
 * recalcula después de cada agregado, quitado o movimiento para que nunca
 * queden huecos ni empates — el servidor vuelve a hacer lo mismo al guardar.
 */
function reordenar(archivos: ContenidoArchivoDTO[]): ContenidoArchivoDTO[] {
  return archivos.map((archivo, indice) => ({ ...archivo, orden: indice }))
}

/** Nombre legible de un archivo subido: el último tramo de la URL de Blob. */
function nombreDeArchivo(url: string): string {
  return decodeURIComponent(url.split("/").pop() ?? url)
}

/**
 * Carga de los archivos descargables de un RECURSOS. Vive en su propio
 * componente porque lo usan dos lugares: el form de contenido y el diálogo que
 * crea un recurso sin salir del form de una prédica. Duplicar el flujo de
 * subida en los dos sería la clase de divergencia que este repo evita.
 */
export function ArchivosUploader({
  id,
  label,
  archivos,
  onChange,
  onUploadingChange,
  disabled = false,
  error,
}: ArchivosUploaderProps) {
  const [subiendo, setSubiendo] = useState(false)

  const setSubiendoAmbos = (valor: boolean) => {
    setSubiendo(valor)
    onUploadingChange(valor)
  }

  /**
   * Sube N archivos y los AGREGA a los que ya estaban — el admin puede cargar
   * el PDF en una tanda y los fondos de pantalla en otra.
   *
   * Cada archivo se maneja por separado: uno que falla no se lleva puestos a
   * los que ya subieron. Por eso el `try` está adentro del loop y no afuera.
   *
   * Las páginas se cuentan solo para PDF, en el browser y ANTES de subir, para
   * que un archivo corrupto avise antes del paso de red lento. Un conteo
   * fallido NO bloquea la subida: `reglasPorTipo` exige que haya archivos, no
   * que sepamos cuántas páginas tienen.
   */
  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setSubiendoAmbos(true)
    const subidos: ContenidoArchivoDTO[] = []

    for (const file of Array.from(files)) {
      if (!(MIMES_ARCHIVO as readonly string[]).includes(file.type)) {
        toast.error(`"${file.name}" no es un PDF ni una imagen`)
        continue
      }
      const mime = file.type as ContenidoArchivoDTO["mime"]

      try {
        let paginas: number | undefined
        if (mime === "application/pdf") {
          try {
            const bytes = await file.arrayBuffer()
            const { PDFDocument } = await import("pdf-lib")
            const doc = await PDFDocument.load(bytes, { ignoreEncryption: true })
            paginas = doc.getPageCount()
          } catch {
            toast.error(`No pudimos leer la cantidad de páginas de "${file.name}"`)
          }
        }

        const { url } = await upload(file.name, file, {
          access: "public",
          handleUploadUrl: "/api/contenido/placas-upload",
        })

        // `orden` se reasigna al final contra la lista completa.
        subidos.push({ url, mime, orden: 0, paginas })
      } catch (uploadError) {
        toast.error(
          uploadError instanceof Error
            ? `"${file.name}": ${uploadError.message}`
            : `No se pudo subir "${file.name}"`
        )
      }
    }

    setSubiendoAmbos(false)
    if (subidos.length === 0) return

    onChange(reordenar([...archivos, ...subidos]))
    toast.success(subidos.length === 1 ? "Archivo cargado" : `${subidos.length} archivos cargados`)
  }

  const quitar = (indice: number) => {
    onChange(reordenar(archivos.filter((_, i) => i !== indice)))
  }

  const mover = (indice: number, direccion: -1 | 1) => {
    const destino = indice + direccion
    if (destino < 0 || destino >= archivos.length) return
    const siguiente = [...archivos]
    const [movido] = siguiente.splice(indice, 1)
    siguiente.splice(destino, 0, movido)
    onChange(reordenar(siguiente))
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="file"
        multiple
        accept={MIMES_ARCHIVO.join(",")}
        onChange={(e) => {
          void handleFiles(e.target.files)
          // El input se limpia para que volver a elegir el mismo archivo
          // dispare `change` de nuevo: sin esto, quitarlo de la lista y
          // re-agregarlo no funcionaría.
          e.target.value = ""
        }}
        disabled={disabled || subiendo}
      />

      {subiendo ? (
        <p className="text-sm text-muted-foreground">Subiendo archivos...</p>
      ) : (
        <p className="text-sm text-muted-foreground">
          PDF de placas e imágenes sueltas (fondos de pantalla). Se suben sin recomprimir.
        </p>
      )}

      {archivos.length > 0 ? (
        <ul className="divide-y rounded-md border">
          {archivos.map((archivo, indice) => (
            <li key={archivo.url} className="flex items-center gap-3 px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-sm" title={archivo.url}>
                {nombreDeArchivo(archivo.url)}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {archivo.paginas ? `${archivo.paginas} pág.` : "imagen"}
              </span>
              <div className="flex shrink-0 items-center gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Subir ${nombreDeArchivo(archivo.url)} un lugar`}
                  onClick={() => mover(indice, -1)}
                  disabled={disabled || indice === 0}
                >
                  ↑
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Bajar ${nombreDeArchivo(archivo.url)} un lugar`}
                  onClick={() => mover(indice, 1)}
                  disabled={disabled || indice === archivos.length - 1}
                >
                  ↓
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  aria-label={`Quitar ${nombreDeArchivo(archivo.url)}`}
                  onClick={() => quitar(indice)}
                  disabled={disabled}
                >
                  Quitar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  )
}
