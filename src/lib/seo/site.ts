import type { Metadata } from 'next';

import { jecAssets } from '@/lib/jec-assets';

/**
 * Absolute origin used for canonicals, `metadataBase` and OG image URLs.
 *
 * Only ever read while rendering metadata on the server, so the Vercel system
 * env vars are readable here. They matter: without them a deploy that forgets
 * `NEXT_PUBLIC_SITE_URL` would publish `http://localhost:3000` canonicals and
 * OG images, which no crawler or social scraper can fetch.
 */
function resolveSiteUrl() {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");

  const production = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (production) return `https://${production}`;

  const preview = process.env.VERCEL_URL;
  if (preview) return `https://${preview}`;

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Juntos En Casa",
  shortName: "JEC",
  year: 2026,
  /** Nombre de la edición 2026, el que aparece en toda la pieza gráfica. */
  edition: "Fieles",
  tagline: "Conferencia cristiana de adolescentes y jóvenes",
  description:
    "Sé parte de Fieles, la conferencia cristiana de adolescentes y jóvenes: 18, 19 y 20 de septiembre de 2026 en La Plata. Iglesia Vida Sobrenatural.",
  locale: "es_AR",
  url: resolveSiteUrl(),
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
  /* Solo la imagen por defecto tiene medidas conocidas. Declarar 1200x630
   * sobre una imagen custom haría que el scraper reserve un recuadro que la
   * imagen real no llena. */
  const ogImageSize =
    image === siteConfig.ogImage
      ? { width: jecAssets.og.width, height: jecAssets.og.height, type: "image/jpeg" }
      : {};

  return {
    metadataBase: new URL(siteConfig.url),
    /* Una página con `title` propio devuelve un string y deja que el template
     * del layout le agregue el sufijo, que es lo que hace `pageTitle` a mano
     * para OG/Twitter. Devolver siempre el objeto `{ default, template }` hacía
     * que TODAS las rutas públicas titularan "Juntos En Casa 2026": `template`
     * solo aplica a los segmentos hijos, nunca al propio. */
    title: title ?? {
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
          ...ogImageSize,
          alt: `${siteConfig.name} ${siteConfig.year} · ${siteConfig.edition}`,
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
