import type { Metadata } from "next";
import { cayento, helveticaNeue, helveticaNeueCondensed } from "@/config/fonts";
import { createPageMetadata, siteConfig } from "@/lib/seo/site";

/* Sin `icons` explicito: favicon.ico / icon.png / apple-icon.png en src/app/
 * son file-convention de Next y se sirven solos. Un `icons.icon` manual aca
 * los pisaria. */
export const metadata: Metadata = {
  ...createPageMetadata({ path: "/" }),
  keywords: [
    "Juntos En Casa",
    "conferencia",
    "jóvenes",
    "adolescentes",
    "Iglesia Vida Sobrenatural",
    "La Plata",
    String(siteConfig.year),
  ],
};

export default function ExternalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`jec-landing ${cayento.variable} ${helveticaNeue.variable} ${helveticaNeueCondensed.variable} min-h-dvh`}
    >
      {/*
        Primer hijo enfocable de las cinco rutas publicas: cada pagina expone un
        <main id="contenido">. Usa los tokens de marca crudos y no los de campo
        (--dato/--sup), porque el enlace vive fuera de cualquier campo y ahi esos
        tokens no estan definidos.

        En `/` el scroll queda bloqueado mientras corre la secuencia del hero, asi
        que durante esos segundos el foco se mueve pero la pagina puede no
        acompanar. En las otras cuatro rutas funciona sin reservas.
      */}
      <a
        href="#contenido"
        className="jec-label sr-only rounded-[6px] bg-[var(--jec-ink)] px-4 py-3 text-sm font-bold uppercase tracking-[0.14em] text-[var(--jec-bone)] focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:outline-2 focus:outline-offset-2 focus:outline-[var(--jec-bone)]"
      >
        Saltar al contenido
      </a>
      {children}
    </div>
  );
}
