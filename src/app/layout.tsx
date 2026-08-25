import type { Metadata, Viewport } from "next";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

/* Geist vive en el layout de admin, no aca. Cargarlo en la raiz lo bajaba en
 * TODAS las rutas, incluidas las publicas, que lo pisan entero: la landing pinta
 * con Cayento/Helvetica via `.jec-landing` y no usa una sola utilidad
 * `font-sans`/`font-mono`/`font-heading`. Admin es el unico consumidor real,
 * a traves de --font-sans/--font-mono en `globals.css`. */

export const metadata: Metadata = {
  title: {
    default: "Juntos En Casa",
    template: "%s · Juntos En Casa",
  },
  description:
    "Conferencia de adolescentes y jóvenes · Iglesia Vida Sobrenatural",
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
