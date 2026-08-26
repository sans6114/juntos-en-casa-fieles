# Design: Productos Exhibición

The visual contract for `/productos` and `/productos/[slug]`. Every value here was
lifted from the existing implementation, not invented. **Implementing from this file
alone is the intended path** — the design canvas is a picture of exactly this.

---

## 1. Fields

Do not hardcode `bg-[var(--jec-*)]` or `text-[var(--jec-*)]`. Every surface sets its
colour by adding a `campo-*` class; everything inside then reads semantic tokens.
Values below are the ones already defined in `src/app/globals.css` — repeated here for
reference only, never to be redefined.

| Token | `campo-papel` | `campo-tinta` | `campo-fuego` |
|---|---|---|---|
| `--sup` (surface) | `#f4efe8` | `#0b0a0f` | `#ff5a00` |
| `--dato` (text) | `#0b0a0f` | `#f4efe8` | `#0b0a0f` |
| `--suave` (muted) | `#57504a` | `#a89f96` | `#0b0a0f` |
| `--acento` (block) | `#ff5a00` | `#c0f700` | `#0b0a0f` |
| `--acento-texto` | `#a83800` | `#c0f700` | `#0b0a0f` |
| `--linea` | `rgb(11 10 15 / 12%)` | `rgb(244 239 232 / 12%)` | `rgb(11 10 15 / 20%)` |
| `--regla` | `#0b0a0f` | `#f4efe8` | `#0b0a0f` |
| `--cta-bg` / `--cta-fg` | ink / bone | bone / ink | ink / bone |

**`--acento` vs `--acento-texto`.** `--acento` is the decorative brand block (the
eyebrow rule, the disclosure chevron). `--acento-texto` is its legible twin, for text
and borders: pure ember on paper is 2.73:1 and fails WCAG, `#a83800` is 5.68:1. Card
kickers and icons use `--acento-texto`. Never colour body text with `--acento`.

**Field assignment for this surface:**

| Section | Field |
|---|---|
| Header, intro, grid, detail body | `campo-papel` |
| The remera piece frame, the "Más piezas" strip, the footer | `campo-tinta` |
| The sticker piece frame, the acquisition band, the detail's `JEC 2026` aside block | `campo-fuego` |

---

## 2. Typography

Three classes, already defined: `.jec-display` (Cayento), `.jec-label` (Helvetica Neue),
`.jec-mono` (Helvetica Neue Condensed).

**Hard rule — no digits in `.jec-display`.** The personal-use Cayento build maps all ten
digits to the same watermark glyph. This is documented at
`src/app/(external)/contenidos/[slug]/page.tsx:120` and is not a preference. Prices,
dates, counts and years use `.jec-mono` or `.jec-label`. `.jec-display` is also reserved
for >=34px (landing-tokens-b D9).

On this surface `.jec-display` is used exactly once: the index `<h1>Productos</h1>`.
Everything else — including the detail `<h1>` — is `.jec-label` at `font-extrabold`.

| Role | Classes |
|---|---|
| Eyebrow | `jec-label jec-eyebrow mb-3 text-xs font-bold uppercase tracking-[0.28em] md:mb-4 md:text-sm` |
| Index h1 | `jec-display text-4xl leading-[0.92] tracking-tight sm:text-5xl md:text-7xl lg:text-8xl` |
| Detail h1 | `jec-label mt-6 max-w-4xl text-pretty text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl md:text-5xl lg:text-6xl` |
| Section h2 | use `SectionHeading` |
| Card title | `jec-label text-2xl font-extrabold leading-tight tracking-tight` |
| Card kicker | `jec-label text-xs font-bold uppercase tracking-[0.28em] text-[var(--acento-texto)]` |
| Body (card) | `text-sm leading-relaxed text-[var(--suave)]` |
| Body (detail) | `text-pretty text-base leading-[1.75] text-[var(--suave)] md:text-lg` |
| Meta / numeric | `jec-mono text-[13px] uppercase tracking-[0.14em] text-[var(--suave)]` |

---

## 3. The composition rule — the piece is drawn, never photographed

**The constraint.** There is not one product photograph in `public/jec/`, and
`PRODUCT.md` states: use the real assets, do not invent placeholders, do not fabricate
evidence. So the product is represented, never simulated.

**The rule.** A product piece is a flat vector silhouette, centred on a `campo-*` field,
carrying one real brand asset as its print. It is visibly an illustration. It never
imitates photography — no shadows, no perspective, no fabric texture, no mockup render.

This is the same criterion `src/components/external/contenidos/ContenidoThumb.tsx`
already applies ("There are no photographic thumbnails in the repo, so the frame is a
brand-colour field that may carry one real asset — never an invented photo").

**`ProductoPieza.tsx` shape.** A `relative` frame with `aspect-[4/3]`, the field class,
`overflow-hidden`, centring its content, plus the corner badge. It takes the product and
renders one of two variants:

*Remera* — this exact SVG, at `w-[62%]` (`w-[58%]` on the detail hero):

```
viewBox="0 0 200 200"
<path d="M62 34 L44 42 L26 76 L52 92 L60 76 L60 168 L140 168 L140 76 L148 92 L174 76 L156 42 L138 34 C132 48 118 55 100 55 C82 55 68 48 62 34 Z"
      fill="{prendaFill}" stroke="{prendaStroke}" stroke-width="3" stroke-linejoin="round" />
<path d="M62 34 C68 48 82 55 100 55 C118 55 132 48 138 34"
      fill="none" stroke="{prendaStroke}" stroke-width="3" />
```

with the wordmark absolutely centred at `top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2`.
Fill/stroke per colour variant:

| Variant | Garment fill | Stroke | Wordmark |
|---|---|---|---|
| Tinta (on `campo-tinta`) | `#f4efe8` | `#0b0a0f` | `logos.wordmarkBlack` |
| Hueso (on `campo-papel`) | `#0b0a0f` | `#0b0a0f` | `logos.wordmarkWhite` |
| Fuego (on `campo-fuego`) | `#f4efe8` | `#0b0a0f` | `logos.wordmarkBlack` |

The brand ember is always the *ground*, never the garment.

*Stickers* — a `relative` square at `w-[62%]`, holding four die-cut shapes. Each carries
`shadow-[0_0_0_5px_#f4efe8]` as its die-cut edge and a short rotation; they are never
aligned:

| Shape | Position | Size | Style | Content |
|---|---|---|---|---|
| Circle | `left-[2%] top-[14%]` | `w-[44%] aspect-square` | bone, `rounded-full`, `rotate-[-9deg]` | `wordmarkBlack` at 66% |
| Square | `right-0 top-0` | `w-[38%] aspect-square` | ink, `rounded-[6px]`, `rotate-[7deg]` | `personaje.llama` at 52% |
| Circle | `right-[8%] bottom-[2%]` | `w-[34%] aspect-square` | lime `#c0f700`, `rounded-full`, `rotate-[-4deg]` | `iconos.ancla` at 56% |
| Tag | `left-[6%] bottom-[6%]` | `w-[36%]` | bone, `rounded-[6px]`, `rotate-[5deg]` | `jec-mono` "JEC 2026" |

**The badge**, on every piece frame, copied from `ContenidoThumb`:
`jec-label absolute left-3 top-3 rounded-[6px] bg-[var(--dato)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--sup)]`

**Future-proofing.** `data.ts` carries an optional `foto?: string`. When real photography
arrives, `ProductoPieza` renders the image in the same frame instead of the drawing, and
nothing else changes. Build the branch now, leave `foto` undefined.

Assets used, all already registered in `src/lib/jec-assets.ts`:
`logos.wordmarkBlack`, `logos.wordmarkWhite`, `personaje.llama`, `iconos.ancla`,
`personaje.festejando` (the intro figure).

---

## 4. Component anatomy

**`ProductoCard`** — copy `ContenidoCard.tsx` structurally. `<article className="h-full">`
wrapping a `<Link href={/productos/${slug}}>` with:

```
flex h-full flex-col overflow-hidden rounded-[6px] border border-[var(--linea)]
transition-transform hover:-translate-y-0.5 hover:shadow-[3px_3px_0_0_var(--regla)]
focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--foco)]
motion-reduce:transform-none
```

Then `<ProductoPieza />`, then a body: `flex flex-grow flex-col gap-3 p-6` holding the
kicker, the `<h3>` title, the description, and a footer row
`mt-auto flex items-center justify-between gap-3 border-t border-[var(--linea)] pt-4`
carrying the `PlaceholderTag` price on the left and `ArrowRightIcon` (already exported
from `shared`) on the right, `className="shrink-0 text-[var(--acento-texto)]"`.

**Note — `CtaButton` has no resting shadow.** `3px 3px 0 0 var(--regla)` is a `hover:`
state only. Do not add it to the resting state anywhere.

**Detail layout** — copy `contenidos/[slug]/page.tsx`:
`mx-auto grid max-w-6xl items-start gap-10 lg:grid-cols-[minmax(0,1fr)_368px]`.

Left column (`flex min-w-0 flex-col gap-10`):
1. The hero piece frame, `aspect-[4/3]`, `rounded-[6px]`
2. The colour-variant row: label + `grid grid-cols-3 gap-5`, each cell an
   `aspect-square` piece frame with `border border-[var(--linea)]` and a `jec-mono`
   caption below (`Tinta` / `Hueso` / `Fuego`). Static, non-interactive — this is an
   exhibition, not a picker.
3. `border-t-[3px] border-[var(--regla)] pt-10` + eyebrow "Sobre la pieza" + body copy

Right aside (`flex min-w-0 flex-col gap-5`):
1. A "Ficha" card: `rounded-[6px] border border-[var(--linea)] p-7`, a
   `tracking-[0.28em]` column label, then rows separated by
   `border-t border-[var(--linea)] pt-3.5 mt-3.5` — `jec-mono` term on the left, value on
   the right (`PlaceholderTag` for Talles and Material; plain `jec-label` for Estampa and
   Dónde)
2. The `campo-fuego rounded-[6px] p-7` block, **copied verbatim** from
   `contenidos/[slug]/page.tsx:118-131`: `jec-label` "JEC 2026", the date line, and
   `<CtaButton href="/inscripcion" className="mt-5 w-full px-6 py-3.5 text-sm">`

**Related strip** — `campo-tinta px-6 py-20 md:px-10 md:py-24 lg:px-16`, a
`SectionHeading` with eyebrow "Seguí mirando" and title "Más piezas", then
`grid gap-5 md:grid-cols-2 lg:grid-cols-3` holding the other product's card.

---

## 5. Placeholder convention

Every commercial value that is not confirmed renders through the existing
`PlaceholderTag` primitive (`src/components/external/shared/PlaceholderTag.tsx`), whose
hatched fill plus outline reads as unfinished at a glance on any field.

Unconfirmed as of this change: **price** (both products), **sizes**, **material**.
They render as `Precio a confirmar` / `A confirmar`. Never as plain text, never as an
invented number, never as an em dash.

Confirmed and therefore plain: the event dates (18/19/20 September 2026, from
`siteConfig.eventStartsAt`), the city (La Plata), the sale channel (the event stand),
and the fact that there is no online sale.

Product descriptions in `data.ts` are drafted structural copy, marked with a
`// TODO(productos-exhibicion): confirmar con el usuario` comment at the top of the
array. They are plausible, so they must be flagged in code even though they are not
tagged in the UI.

---

## 6. Page composition

**`/productos`**, in order:

1. `<SiteHeader logo="dark" className="campo-papel pb-6 md:pb-8" />`
2. `<main id="contenido" tabIndex={-1}>` — the skip link at
   `(external)/layout.tsx` targets this on every public route
3. `ProductosIntro` — `campo-papel px-6 pb-12 pt-10 md:px-10 md:pb-12 md:pt-16 lg:px-16`.
   Eyebrow "Llevate el fuego", the display `<h1>Productos</h1>`, a lede, and
   `jecAssets.personaje.festejando` at `width={190}` `className="hidden ... lg:block"` —
   mirroring `ContenidosIntro.tsx` exactly.
4. `ProductosGrid` — `campo-papel px-6 pb-24 md:px-10 md:pb-28 lg:px-16`,
   `mx-auto max-w-6xl`, an `sr-only` `<h2>` for the heading level, then
   `grid gap-5 md:grid-cols-2`. **Two columns, not three** — the real inventory is two
   items and a three-column grid would read as a catalog with a hole in it.
5. `DondeConseguir` — `campo-fuego px-6 py-20 md:px-10 md:py-24 lg:px-16`. Eyebrow
   "Cómo conseguirlas", an `h2`, the no-online-sale statement, the date/place in
   `jec-mono`, and one `<CtaButton href="/inscripcion">`. **This band is the piece that
   replaces the deleted pre-save**: it answers "how do I get one" honestly instead of
   offering a control that cannot work.
6. `<SiteFooter />`

**`/productos/[slug]`**, in order: header, back link ("Volver a productos", with
`ArrowLeftIcon`, styled exactly as the one at `contenidos/[slug]/page.tsx:79-87`), the
title block with kicker + `PlaceholderTag` price + sale-channel meta, the two-column
body, the related strip, the footer.

**Copy.** The one action on both pages is `Inscribirme` → `/inscripcion`. There is no
second competing button anywhere.

---

## 7. Data shape

```ts
export type ProductoKind = "indumentaria" | "papeleria"

export type ProductoVariante = {
  id: string
  label: string          // "Tinta" | "Hueso" | "Fuego"
  field: string          // "campo-tinta" | "campo-papel" | "campo-fuego"
  prendaFill: string
  prendaStroke: string
  wordmark: string       // a jecAssets.logos.* path
}

export type ProductoItem = {
  id: string
  slug: string
  kind: ProductoKind
  title: string
  kicker: string         // "Indumentaria · JEC 2026"
  badge: string          // "Remera" | "Stickers"
  description: string    // card copy
  detalle: string        // detail-page copy
  pieza: "remera" | "stickers"
  field: string          // the field its piece frame sits on
  variantes?: readonly ProductoVariante[]
  ficha: readonly { term: string; value: string; placeholder?: boolean }[]
  /** Undefined until real photography exists; see design.md §3. */
  foto?: string
}
```

Two entries: `remera-jec-2026` and `pack-stickers`. Helpers `findProducto(slug)` and
`relatedProductos(slug)` mirror `contenidos/data.ts`.

---

## 8. Responsive

Verified at 390px in the canvas: the grid collapses to one column, the intro figure is
hidden below `lg`, the detail's two-column grid stacks, the acquisition band's CTA goes
full width, and the footer's three columns stack. Nothing scrolls horizontally.
The mobile header is the existing `:target` panel — no new mobile chrome.
