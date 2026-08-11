import localFont from "next/font/local";

export const cayento = localFont({
  src: [
    {
      path: "../../fonts/cayento/Cayento_PERSONAL_USE_ONLY.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/cayento/CayentoItalic_PERSONAL_USE_ONLY.otf",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-cayento",
  display: "swap",
});

export const cayentoWide = localFont({
  src: "../../fonts/cayento/CayentoWide_PERSONAL_USE_ONLY.otf",
  variable: "--font-cayento-wide",
  display: "swap",
});

export const cayentoNarrow = localFont({
  src: "../../fonts/cayento/CayentoNarrow_PERSONAL_USE_ONLY.otf",
  variable: "--font-cayento-narrow",
  display: "swap",
});
