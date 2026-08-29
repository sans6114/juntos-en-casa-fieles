/**
 * SVGO config aligned with Better SVG (midudev) defaults for standalone .svg files.
 *
 * For text-on-path exports (many shared CSS classes, e.g. pngs-transparente-15/16),
 * inlining classes can increase size. Re-run those without `inlineStyles` /
 * without removing `class` if a pass grows the file.
 */
export default {
  multipass: true,
  floatPrecision: 3,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          cleanupIds: false,
          removeUnknownsAndDefaults: true,
          inlineStyles: { onlyMatchedOnce: false },
        },
      },
    },
    "removeDoctype",
    "removeComments",
    {
      name: "removeAttrs",
      params: {
        attrs: ["xmlns:xlink", "xml:space", "class"],
      },
    },
  ],
};
