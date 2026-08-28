import { Fragment } from "react"

import { cn } from "@/lib/utils"

/**
 * Forma canonica del nombre publico de la conferencia. `siteConfig.name` guarda
 * el mismo string para la metadata; esta constante es la que lee la UI.
 */
export const BRAND_NAME = "Juntos En Casa"

/* El grupo de captura es a proposito: `String.prototype.split` solo conserva el
 * separador en el array de salida cuando el patron lo captura, y eso es lo que
 * deja cada coincidencia en un indice impar mas abajo. Sin flag `g`: `split`
 * parte por todas las ocurrencias igual, y una regex global arrastraria
 * `lastIndex` entre llamadas. */
const BRAND_PATTERN = /(juntos\s+en\s+casa)/i

type BrandNameProps = {
  children: string
  className?: string
}

/**
 * Aplica el tratamiento tipografico de marca a cada mencion del nombre de la
 * conferencia dentro de `children`.
 *
 * Recibe un string plano en lugar de JSX porque la mayor parte de este copy
 * vive en los modulos `data.ts`, donde los mismos strings tambien alimentan
 * `generateMetadata` y atributos `alt`/`aria-label` que tienen que seguir
 * siendo texto sin estilo. Manteniendo los datos como strings, los dos
 * consumidores comparten una unica fuente.
 */
export function BrandName({ children, className }: BrandNameProps) {
  const parts = children.split(BRAND_PATTERN)

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className={cn("jec-brand", className)}>
            {part}
          </span>
        ) : (
          <Fragment key={index}>{part}</Fragment>
        )
      )}
    </>
  )
}
