import localFont from "next/font/local";

/* Solo se declaran las caras que algun selector pide de verdad.
 *
 * `next/font/local` emite un `<link rel="preload" as="font">` por CADA cara
 * declarada, y esos preloads salen ARRIBA de los `<link rel="stylesheet">` en el
 * head: se bajan a maxima prioridad, delante de la imagen del LCP. Una cara que
 * no pinta nadie no es peso muerto en disco, es ancho de banda robado al hero.
 *
 * Las que se sacaron y por que:
 * - `Lt` (300): ni la utilidad de Tailwind para el peso 300 ni un peso numerico
 *   aparecen en `src/components/external` ni en `src/app/(external)`.
 *   (Escrito asi a proposito: Tailwind escanea ESTE archivo en busca de
 *   candidatos a clase, y nombrar la utilidad textualmente la hacia emitir 115
 *   bytes de CSS para una clase que justamente no usa nadie.)
 * - `It`, `BdIt`, `BlkIt` (italicas): la landing no tiene una sola clase
 *   `italic` —el unico match es `not-italic`—, `.jec-brand` fuerza
 *   `font-style: normal` y no hay `prose` ni `dangerouslySetInnerHTML` por donde
 *   pueda entrar un `<em>` del CMS.
 * - `MdCn` (500 condensada): todo `jec-mono` es `font-bold` o `font-black`, o
 *   hereda el 400 de `Cn`. El 500 condensado no lo pide nadie.
 *
 * `Md` (500) y `Cn` (400 condensada) SE QUEDAN: no las usa `/`, pero si
 * `/productos` y `/contenidos` (`font-medium`, y `jec-mono` sin clase de peso).
 *
 * Verificado en el navegador contra el build de produccion: `document.fonts`
 * reporta seis caras con status `loaded` en `/` —Cayento 400, Helvetica Neue
 * 400/700/900 y Condensed 700/900— sobre catorce que se precargaban. */
export const helveticaNeue = localFont({
  src: [
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Md.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Bd.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Blk.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue",
  display: "swap",
});

export const helveticaNeueCondensed = localFont({
  src: [
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Cn.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BdCn.woff2",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BlkCn.woff2",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue-condensed",
  display: "swap",
});
