/** Las 4 frases de marca de la campaña "Fieles" — ticker infinito y ribbons. */
export const jecTaglines = [
  "Anclados en la roca",
  "Permaneciendo en la Palabra",
  "Caminando en la verdad",
  "Viviendo en libertad",
] as const;

/**
 * Frases del scroll reveal (frames discretos).
 * La 4ª tagline queda solo en el ticker, no en el reveal.
 */
export const jecRevealPhrases = jecTaglines.slice(0, 4);
