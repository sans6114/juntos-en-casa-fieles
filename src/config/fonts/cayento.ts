import localFont from "next/font/local";

export const cayento = localFont({
  src: [
    {
      path: "../../fonts/cayento/Cayento_PERSONAL_USE_ONLY.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/cayento/CayentoItalic_PERSONAL_USE_ONLY.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-cayento",
  display: "swap",
});

/* `cayentoWide` y `cayentoNarrow` vivian aca y no los usaba nadie, pero
 * `next/font/local` precarga TODA fuente que instancia en un modulo importado, y
 * `(external)/layout.tsx` importa el barril entero: eran 252,7 KB bajados en cada
 * visita a una ruta publica para nada. Los OTF siguen en `src/fonts/cayento/`
 * por si hacen falta; lo que se saco es la instanciacion. */
