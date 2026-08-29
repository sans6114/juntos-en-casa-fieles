import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { siteConfig } from "@/lib/seo/site";
import "./globals.css";

/* Geist vive en el layout de admin, no aca. Cargarlo en la raiz lo bajaba en
 * TODAS las rutas, incluidas las publicas, que lo pisan entero: la landing pinta
 * con Cayento/Helvetica via `.jec-landing` y no usa una sola utilidad
 * `font-sans`/`font-mono`/`font-heading`. Admin es el unico consumidor real,
 * a traves de --font-sans/--font-mono en `globals.css`. */

/* Fallback para cualquier ruta que no declare metadata propia. Sale de
 * `siteConfig` para no mantener dos descripciones distintas del mismo evento:
 * admin la pisa entera y las publicas pasan por `createPageMetadata`. */
export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} ${siteConfig.year}`,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
};

export const viewport: Viewport = {
  colorScheme: "only light",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <TooltipProvider>
          {children}
          <Toaster />
        </TooltipProvider>
      </body>
    </html>
  );
}
