import { jecAssets } from "@/lib/jec-assets"

/**
 * Mapa simulado: grilla urbana abstracta dibujada con tokens de campo.
 * Decorativo por diseño — no es un mapa real ni a escala y no anuncia
 * nada a tecnología asistida; la información real vive en el <address>
 * y en el enlace "Cómo llegar" de Ubicacion.
 */
export function MapaSimulado() {
  return (
    <figure className="m-0">
      <svg
        role="presentation"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 400 280"
        className="h-auto w-full"
      >
        {/* Calles secundarias */}
        <g stroke="var(--linea)" strokeWidth="3">
          <line x1="0" y1="60" x2="400" y2="60" />
          <line x1="0" y1="140" x2="400" y2="140" />
          <line x1="0" y1="220" x2="400" y2="220" />
          <line x1="80" y1="0" x2="80" y2="280" />
          <line x1="180" y1="0" x2="180" y2="280" />
          <line x1="290" y1="0" x2="290" y2="280" />
        </g>
        {/* Avenida principal */}
        <line
          x1="40"
          y1="260"
          x2="360"
          y2="20"
          stroke="var(--regla)"
          strokeWidth="7"
          strokeLinecap="round"
        />
        {/* Ancla como pin, sobre el cruce con la avenida */}
        <image href={jecAssets.iconos.ancla} x="176" y="116" width="48" height="48" />
      </svg>
      <figcaption className="jec-label mt-3 text-sm text-[var(--suave)]">
        Ilustración de referencia — no es un mapa a escala.
      </figcaption>
    </figure>
  )
}
