import type { Metadata } from "next";
import { cayento, helveticaNeue, helveticaNeueCondensed } from "@/config/fonts";
import { createPageMetadata, siteConfig } from "@/lib/seo/site";
import { jecAssets } from "@/lib/jec-assets";

export const metadata: Metadata = {
  ...createPageMetadata({ path: "/" }),
  icons: {
    icon: jecAssets.favicon,
  },
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
      {children}
    </div>
  );
}
