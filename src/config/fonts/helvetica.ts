import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Lt.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Roman.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-It.woff2",
      weight: "400",
      style: "italic",
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
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BdIt.woff2",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Blk.woff2",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BlkIt.woff2",
      weight: "900",
      style: "italic",
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
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-MdCn.woff2",
      weight: "500",
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
