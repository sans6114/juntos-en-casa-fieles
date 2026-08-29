import localFont from "next/font/local";

export const cayento = localFont({
  src: [
    {
      path: "../../fonts/cayento/Cayento_PERSONAL_USE_ONLY.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-cayento",
  display: "swap",
});

/* `cayentoWide` y `cayentoNarrow` vivian aca y no los usaba nadie, pero
 * `next/font/local` precarga TODA fuente que instancia en un modulo importado, y
 * `(external)/layout.tsx` importa el barril entero: eran 252,7 KB bajados en cada
 * visita a una ruta publica para nada. Los OTF siguen en `src/fonts/cayento/`
 * por si hacen falta; lo que se saco es la instanciacion.
 *
 * Por el mismo motivo se saco la itálica: `.jec-display` es el unico consumidor
 * de Cayento y no declara `font-style`, asi que la cara italica se precargaba
 * (36,9 KB) sin que ningun selector la pidiera nunca. Verificado en el navegador
 * con `document.fonts`: en `/` la unica cara de Cayento con status `loaded` es
 * la de 400 normal. */
