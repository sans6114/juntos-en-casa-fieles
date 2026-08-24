/**
 * Mapa simulado: la traza urbana de La Plata — grilla ortogonal con avenidas
 * diagonales a 45°. No es un mapa a escala, pero tampoco es una figura
 * arbitraria: la ciudad realmente está trazada así.
 *
 * Todo se dibuja con tokens de campo, incluido el pin. La versión anterior
 * metía `/jec/iconos/ancla.png` con `<image href>`: un raster de 48×48 estirado
 * a ancho completo que no hereda `currentColor` ni ningún token, y quedaba como
 * el único elemento de la figura que no respondía al campo.
 *
 * Los trazos toman `--regla` con opacidad propia en vez de `--linea`, que en
 * `campo-papel` es ink al 12% y deja las calles prácticamente invisibles.
 *
 * Decorativo por diseño: no anuncia nada a tecnología asistida. La información
 * real vive en el <address> y en el enlace "Cómo llegar" de Ubicacion.
 */
export function MapaSimulado() {
  return (
    <figure className="m-0 overflow-hidden rounded-[6px] border border-[var(--linea)] border-t-[3px] border-t-[var(--regla)]">
      <svg
        role="presentation"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 660 460"
        className="block h-auto w-full"
      >
        {/* Manzanas */}
        <g fill="var(--regla)" fillOpacity="0.05">
          <rect x="50" y="60" width="90" height="85" />
          <rect x="230" y="145" width="90" height="85" />
          <rect x="410" y="230" width="90" height="85" />
          <rect x="140" y="315" width="90" height="85" />
          <rect x="500" y="60" width="90" height="85" />
          <rect x="320" y="315" width="90" height="85" />
        </g>

        {/* Calles */}
        <g stroke="var(--regla)" strokeOpacity="0.16" strokeWidth="2">
          <line x1="0" y1="60" x2="660" y2="60" />
          <line x1="0" y1="145" x2="660" y2="145" />
          <line x1="0" y1="230" x2="660" y2="230" />
          <line x1="0" y1="315" x2="660" y2="315" />
          <line x1="0" y1="400" x2="660" y2="400" />
          <line x1="50" y1="0" x2="50" y2="460" />
          <line x1="140" y1="0" x2="140" y2="460" />
          <line x1="230" y1="0" x2="230" y2="460" />
          <line x1="320" y1="0" x2="320" y2="460" />
          <line x1="410" y1="0" x2="410" y2="460" />
          <line x1="500" y1="0" x2="500" y2="460" />
          <line x1="590" y1="0" x2="590" y2="460" />
        </g>

        {/* Ejes principales y diagonal secundaria */}
        <g stroke="var(--regla)" strokeOpacity="0.32" strokeWidth="5" strokeLinecap="round">
          <line x1="0" y1="230" x2="660" y2="230" />
          <line x1="320" y1="0" x2="320" y2="460" />
          <line x1="160" y1="20" x2="600" y2="460" />
        </g>

        {/* Avenida principal: la brasa entra como bloque de color, nunca como texto */}
        <line
          x1="40"
          y1="440"
          x2="460"
          y2="20"
          stroke="var(--acento)"
          strokeWidth="9"
          strokeLinecap="round"
        />

        {/* Pin sobre el cruce de las dos diagonales */}
        <g transform="translate(310 170)">
          <circle r="30" fill="var(--sup)" />
          <circle r="30" fill="none" stroke="var(--regla)" strokeWidth="3" />
          <circle r="21" fill="var(--acento)" />
          <g
            fill="none"
            stroke="var(--regla)"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="0" cy="-11" r="3.4" />
            <line x1="0" y1="-7.6" x2="0" y2="12" />
            <line x1="-7" y1="-2.5" x2="7" y2="-2.5" />
            <path d="M -10 4 C -10 12, -5 13.5, 0 12 C 5 13.5, 10 12, 10 4" />
          </g>
        </g>
      </svg>

      <figcaption className="border-t border-[var(--linea)] px-5 py-4 text-[13px] leading-relaxed text-[var(--suave)]">
        Ilustración de referencia — la grilla y las diagonales son las de La Plata, pero no es un
        mapa a escala.
      </figcaption>
    </figure>
  )
}
