import type { Metadata } from 'next';

import { jecAssets } from '@/lib/jec-assets';

const fallbackUrl = "http://localhost:3000";

export const siteConfig = {
  name: "Juntos En Casa",
  shortName: "JEC",
  year: 2026,
  tagline: "Conferencia cristiana de adolescentes y jóvenes",
  description:
    "Se parte de nuestra conferencia cristiana de jóvenes y adolescentes: adoración, palabra, unidad y más. Iglesia cristiana Vida Sobrenatural · La Plata.",
  locale: "es_AR",
  url: process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || fallbackUrl,
  org: "Iglesia cristiana Vida Sobrenatural",
  city: "La Plata, Buenos Aires",
  ogImage: jecAssets.og.default,
  twitterHandle: undefined as string | undefined,
  /** Inicio del evento: primer día de 3 (18, 19 y 20 de septiembre 2026). */
  eventStartsAt: "2026-09-18T19:00:00-03:00",
} as const;

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
};

function absoluteUrl(path = "/") {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${siteConfig.url}${normalized === "/" ? "" : normalized}`;
}

function absoluteImage(image: string) {
  if (image.startsWith("http://") || image.startsWith("https://")) {
    return image;
  }
  return absoluteUrl(image);
}

/** Metadata reutilizable para rutas públicas; override por página cuando haga falta. */
export function createPageMetadata({
  title,
  description = siteConfig.description,
  path = "/",
  image = siteConfig.ogImage,
  noIndex = false,
}: PageMetadataInput = {}): Metadata {
  const pageTitle = title
    ? `${title} · ${siteConfig.name}`
    : `${siteConfig.name} ${siteConfig.year}`;
  const canonical = absoluteUrl(path);
  const ogImage = absoluteImage(image);

  return {
    metadataBase: new URL(siteConfig.url),
    title: {
      default: `${siteConfig.name} ${siteConfig.year}`,
      template: `%s · ${siteConfig.name}`,
    },
    description,
    applicationName: siteConfig.name,
    authors: [{ name: siteConfig.org }],
    creator: siteConfig.org,
    publisher: siteConfig.org,
    formatDetection: {
      email: false,
      address: false,
      telephone: false,
    },
    alternates: {
      canonical,
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
    openGraph: {
      type: "website",
      locale: siteConfig.locale,
      url: canonical,
      siteName: siteConfig.name,
      title: pageTitle,
      description,
      images: [
        {
          url: ogImage,
          alt: `${siteConfig.name} ${siteConfig.year}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      images: [ogImage],
      ...(siteConfig.twitterHandle
        ? { creator: siteConfig.twitterHandle }
        : {}),
    },
  };
}
