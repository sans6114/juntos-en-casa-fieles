"use client";

import type { CSSProperties } from "react";

import Image from "next/image";

import { CtaButton, jecTaglines } from "@/components/external/shared";
import { jecAssets } from "@/lib/jec-assets";
import { siteConfig } from "@/lib/seo/site";

import ScrollExpand from "./ScrollExpand";
import "./HeroFinale.css";
import {
  countdownLabels,
  countdownUnits,
  padUnit,
  useCountdown,
  type TimeLeft,
} from "./useCountdown";

/** Debe coincidir con el `scrollDistance` pasado a `ScrollExpand`: define el
 * tramo (en alturas de viewport) durante el cual la imagen se expande. */
const SCROLL_DISTANCE = 1.2;

/** Dimensiones intrínsecas de `background.pisada`. Sin ellas el navegador no
 * puede reservar la caja antes de decodificar y el hero produce CLS. */
const BACKGROUND_WIDTH = 1920;
const BACKGROUND_HEIGHT = 1081;

/** `siteConfig.city` es "La Plata, Buenos Aires"; en el hero entra la ciudad
 * sola, que es lo que contesta "¿dónde es?" sin gastar una línea entera. */
const EVENT_CITY = siteConfig.city.split(",")[0];

/* El CTA de la pieza es lima con texto negro, al revés del default del botón
 * (tinta sobre hueso). Se resuelve por los custom properties que el propio
 * `CtaButton` expone, en vez de pelearle especificidad con clases. `--foco`
 * viaja con ellos: el default es tinta, que sobre la foto del frame queda
 * invisible. */
const CTA_COLORS = {
  "--cta-bg": "var(--jec-amber)",
  "--cta-fg": "var(--jec-ink)",
  "--foco": "var(--jec-bone)",
} as CSSProperties;

/**
 * Chips del countdown. Las etiquetas van en hueso y no en lima: dentro del hero
 * el lima quedó reservado al CTA, que es lo único que el visitante tiene que
 * accionar.
 */
function Countdown({ units }: { units: TimeLeft }) {
  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-2.5"
      role="timer"
      aria-live="polite"
      aria-label="Cuenta regresiva al inicio del evento"
    >
      {countdownUnits.map((key) => (
        <div
          key={key}
          className="flex flex-col items-center justify-center rounded-[6px] bg-[var(--jec-ink)] px-3 py-2.5 sm:px-5 sm:py-3"
        >
          <span
            /* `jec-mono` (Helvetica Neue Condensed) y nunca `jec-display`: la
             * build personal-use de Cayento mapea los diez dígitos al mismo
             * glifo de marca de agua. De paso es la analogía correcta de la
             * Oswald de la pieza, que también es una condensada. */
            className="jec-mono text-[2rem] font-black leading-none tabular-nums text-[var(--jec-bone)] sm:text-[2.5rem]"
          >
            {padUnit(units[key])}
          </span>
          <span className="jec-mono mt-1 text-[0.625rem] font-bold uppercase tracking-[0.16em] text-[var(--jec-bone)]/60 sm:text-[0.6875rem]">
            {countdownLabels[key]}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Una sola composición por capas para todos los anchos: desktop recibe más aire
 * y tipografía más grande, no un diseño distinto. Reemplaza a la pieza aplanada
 * de desktop, que al tener aspecto fijo se letterboxeaba en cualquier viewport
 * bajo y además repetía en ráster la fecha y las cuatro frases que el DOM ya
 * imprimía debajo.
 */
function HeroComposition({ units }: { units: TimeLeft }) {
  return (
    <div className="hero-finale__stage relative flex h-full w-full flex-col">
      <div className="relative z-[2] flex-none">
        {/* Solapa con el logo, colgada del borde superior. Hueso y no el
          * gradiente naranja→lima original: ese gradiente inventaba dos tonos
          * intermedios que no existen en la paleta de dos colores. */}
        {/* Los `min(..., Nvh)` de acá abajo son lo que reemplaza al letterboxing
          * de la pieza aplanada: en un viewport bajo la identidad se achica en vez
          * de empujar el bloque de decisión debajo del fold. */}
        <div className="ml-5 flex w-[min(132px,16vh)] items-center justify-center rounded-b-[26px] bg-[var(--jec-bone)] px-3 py-3 sm:ml-8 sm:w-[min(168px,18vh)] sm:px-4 sm:py-4 lg:ml-12 lg:w-[min(196px,20vh)] lg:py-5">
          <Image
            src={jecAssets.hero.logo}
            alt=""
            aria-hidden
            width={1200}
            height={592}
            sizes="196px"
            className="w-full"
          />
        </div>

        {/* Pieza definitiva de identidad: ancla, "Anclados en Jesus" y la cinta
          * de frases vienen ya compuestos en el archivo, así que acá no se apila
          * nada.
          *
          * El margen izquierdo es negativo a propósito: la cinta entra sangrando
          * por el borde y la corta `.scroll-expand__stage`, que ya es
          * `overflow: hidden`. Con margen positivo la cinta terminaba en el aire
          * y se leía como un recorte.
          *
          * El ancho se topea contra la altura del viewport —y no solo en px—
          * para que el bloque de decisión de abajo no quede empujado debajo del
          * fold: con aspecto 2.125 el alto es el ancho sobre 2.125.
          *
          * En `lg` el tope es afín y no proporcional. El bloque de decisión no
          * mide lo mismo en todos lados —sus `gap` y `padding` ya son `min(rem,
          * vh)`— así que su altura es `c0 + k·vh`, y un tope en `Nvh` puro se
          * pasaba abajo y desperdiciaba altura arriba. Los dos coeficientes
          * salen de medir el bloque a 600, 719 y 945 px de alto. */}
        <div className="relative -ml-[6%] mt-[min(2rem,4vh)] w-[104%] max-w-[min(900px,62vh)] sm:w-full lg:-ml-[7%] lg:mt-4 lg:w-[102%] lg:max-w-[min(1180px,calc(100vh*1.755-740px))]">
          {/* Reserva el alto del flujo. La imagen no lo hace porque está fuera
            * del flujo: se ancla abajo y crece hacia arriba para que la cinta
            * salga por el borde superior en vez de terminar cortada en el aire.
            * El excedente son los `21.25vh + 125px` de más que lleva la imagen:
            * 2.125 (el aspecto) por la altura de la solapa del logo, que mide
            * `0.1·vh + 40px`, más ~20px de aire.
            *
            * Debajo de `lg` esa cuenta no sirve: con aspecto 2.125, sangrar
            * 88px hacia arriba obliga a 688px de ancho en una pantalla de 375 y
            * deja el 85% de la pieza fuera. Subir el bloque hasta el tope del
            * stage tampoco: ahí la cinta le pasa por encima a la solapa del
            * logo. Así que debajo de `lg` la pieza arranca por debajo de la
            * solapa y la cinta se corta arriba; el excedente queda en 34px, que
            * es aire, no sangrado. */}
          <div className="aspect-[2.125]" aria-hidden />
          <Image
            src={jecAssets.hero.piezaFinale}
            alt=""
            aria-hidden
            priority
            width={5655}
            height={2661}
            sizes="(min-width: 1024px) 1250px, (min-width: 640px) 1000px, 190vw"
            className="absolute bottom-0 right-0 h-auto w-[calc(100%+34px)] max-w-none lg:left-0 lg:right-auto lg:w-[calc(100%+21.25vh+125px)]"
          />
        </div>
      </div>

      <div className="relative z-[3] mt-auto flex flex-col gap-[min(1.25rem,2.5vh)] px-5 pb-6 pt-[min(4rem,8vh)] sm:px-8 sm:pb-8 lg:px-12 lg:pb-10">
        <div className="flex flex-col gap-1.5">
          <span className="jec-label text-[0.8125rem] uppercase tracking-[0.14em] text-[var(--jec-bone)]/80 sm:text-sm">
            Conferencia de
          </span>
          <span className="jec-label text-[1.5rem] font-bold uppercase leading-[1.05] text-[var(--jec-bone)] sm:text-[2rem] lg:text-[2.5rem]">
            Adolescentes y jóvenes 2026
          </span>
        </div>

        {/* Solo el lugar: la fecha ya viene horneada en la pieza de identidad y
          * repetirla acá la imprimía dos veces en la misma pantalla. Sigue
          * disponible para lectores de pantalla en el `h1` de abajo. */}
        <p className="jec-mono m-0 text-[1.125rem] font-black uppercase leading-none tracking-tight text-[var(--jec-bone)] sm:text-2xl lg:text-[1.75rem]">
          {EVENT_CITY}
        </p>

        {/* Countdown y CTA juntos y no en extremos opuestos de la fila: son las
          * dos mitades de la misma decisión ("cuándo" y "anotarme"), y separarlas
          * 900px era el error de agrupación de la versión anterior. */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-8">
          <div className="flex flex-col gap-2">
            <span className="jec-mono text-[0.6875rem] font-bold uppercase tracking-[0.26em] text-[var(--jec-bone)]/70">
              Comienza en
            </span>
            <Countdown units={units} />
          </div>

          <CtaButton href="/inscripcion" style={CTA_COLORS} className="w-full lg:w-auto">
            Inscribirme
          </CtaButton>
        </div>
      </div>
    </div>
  );
}

/**
 * Hero final: frame de fondo que se expande con el scroll (`ScrollExpand`) y
 * revela, ya en pantalla completa, la composición de Fieles 2026 con la cuenta
 * regresiva y el CTA de inscripción.
 */
export function HeroFinale() {
  const units = useCountdown(new Date(siteConfig.eventStartsAt).getTime());

  return (
    <div className="bg-[var(--jec-ember)]">
      {/* Fuera de `ScrollExpand` a propósito: su overlay arranca `inert`, así que
        * todo lo que viva adentro desaparece del árbol de accesibilidad hasta que
        * el reveal pasa el 68%. El h1 tiene que estar disponible desde el
        * principio, y con él las cuatro frases de la cinta, que sólo existen
        * como ráster. */}
      <h1 className="sr-only">
        Juntos En Casa - Fieles 2026 — conferencia de adolescentes y jóvenes, 18, 19 y 20 de
        septiembre, {EVENT_CITY}. {jecTaglines.join(". ")}.
      </h1>

      <ScrollExpand
        src={jecAssets.background.pisada}
        mediaSrcSet={jecAssets.background.pisadaSrcSet}
        mediaSizes="100vw"
        /* Decorativa: es una textura de halftone que no contiene ni el nombre de
         * la conferencia ni la fecha. El h1 de arriba ya dice todo eso. */
        alt=""
        mediaWidth={BACKGROUND_WIDTH}
        mediaHeight={BACKGROUND_HEIGHT}
        className="scroll-expand--flush"
        scrollDistance={SCROLL_DISTANCE}
        /* La composición trae su propio degradado a tinta en el tercio inferior;
         * un scrim uniforme encima sólo apagaría la brasa de la foto. */
        overlayScrim={0}
        scrollHint="Scrolleá para entrar"
        useWindowScroll
      >
        <HeroComposition units={units} />
      </ScrollExpand>
    </div>
  );
}
