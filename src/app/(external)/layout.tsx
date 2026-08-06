import type { Metadata } from "next";
import { Figtree, Syne } from "next/font/google";
import { createPageMetadata, siteConfig } from "@/lib/seo/site";
import { jecAssets } from "@/lib/jec-assets";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-jec-display",
  display: "swap",
  weight: ["500", "700", "800"],
});

const figtree = Figtree({
  subsets: ["latin"],
  variable: "--font-jec-body",
  display: "swap",
  weight: ["400", "500", "600"],
});

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
      className={`jec-landing ${syne.variable} ${figtree.variable} min-h-dvh`}
    >
      {children}
    </div>
  );
}
