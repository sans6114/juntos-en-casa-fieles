import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    /**
     * Las miniaturas de contenido dejaron de ser assets de `public/` y pasaron
     * a subirse a Vercel Blob desde el panel de admin. Sin esta entrada,
     * `<Image>` en `ContenidoThumb` tira "hostname is not configured" con la
     * primera URL subida. El host real es
     * `https://<storeId>.public.blob.vercel-storage.com/...`.
     */
    remotePatterns: [
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
