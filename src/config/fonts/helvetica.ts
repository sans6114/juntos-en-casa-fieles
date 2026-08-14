import localFont from "next/font/local";

export const helveticaNeue = localFont({
  src: [
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Lt.otf",
      weight: "300",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Roman.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-It.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Md.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Bd.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BdIt.otf",
      weight: "700",
      style: "italic",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Blk.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BlkIt.otf",
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
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-Cn.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-MdCn.otf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BdCn.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../fonts/Helvetica/HelveticaNeueLTStd-BlkCn.otf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-helvetica-neue-condensed",
  display: "swap",
});
