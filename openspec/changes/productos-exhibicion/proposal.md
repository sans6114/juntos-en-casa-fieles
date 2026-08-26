# Proposal: Productos Exhibición — the `/productos` surface, display-only

Fourth and last of the chained changes for the "Papel encendido" redesign.
Replaces the never-written `productos-presave`.

> **This document and its two siblings (`design.md`, `tasks.md`) are self-contained.**
> They carry every value, decision and gotcha needed to implement. Nothing here
> requires reading the design canvas, an earlier chat, or another change folder.

## Intent

`/productos` does not exist. The chain planned in `landing-tokens-b` ended with a
change called `productos-presave` whose flow was blocked: pre-save assumed the
visitor was already registered and therefore asked for no email, but the site has
no login, and the only identity mechanism available (`jec_inscripcion_uuid`, written
at `src/actions/inscripcion/crear-inscripcion.ts:64` with `maxAge: 600` and
`path: "/inscripcion"`) cannot identify a returning visitor.

**User decision, 2026-08-25: the pre-save is removed entirely.** `/productos` becomes
a display-only surface — it shows what will be sold at the conference. No purchase,
no reservation, no pre-save, no account.

That decision dissolves the blocker rather than solving it. Displaying products
identifies nobody, so the identity question is closed as "not applicable" and
`crear-inscripcion.ts` is not touched by this change.

## Scope

### In Scope

- NEW route `src/app/(external)/productos/page.tsx` — the product index
- NEW route `src/app/(external)/productos/[slug]/page.tsx` — the product detail,
  with `generateStaticParams` and `generateMetadata` mirroring
  `contenidos/[slug]/page.tsx`
- NEW `src/components/external/productos/data.ts` — two products (remera, sticker
  pack) as typed static data, with `findProducto(slug)` and `relatedProductos(slug)`
  helpers mirroring `contenidos/data.ts`
- NEW `ProductosGrid.tsx`, `ProductoCard.tsx`, `ProductoPieza.tsx`,
  `ProductosIntro.tsx`, `DondeConseguir.tsx`, `index.ts` barrel under
  `src/components/external/productos/`
- `ProductoPieza.tsx` implements the composition rule defined in `design.md` §3 —
  the drawn-not-photographed piece — and is the component that later accepts a real
  photo without any redesign
- `navigation.ts`: add `{ href: "/productos", label: "Productos" }` before the
  `Contenidos` entry
- Spec delta on a new `landing-productos` capability

### Out of Scope

- Any purchase, cart, reservation, stock or payment mechanism. The page states where
  the products are sold; it never transacts.
- Prisma: no model, no migration. Products are static data, as `contenidos` is.
- Product photography. None exists; see `design.md` §3 for what ships instead.
- `crear-inscripcion.ts` and the `jec_inscripcion_uuid` cookie — the pre-save removal
  makes them irrelevant here.
- Real prices, sizes and materials. They ship as marked placeholders (`design.md` §5).

## Capabilities

### New Capabilities

- `landing-productos`: which products the public surface displays, that each product
  has an index card and a detail route addressed by slug, that the surface offers no
  transactional affordance of any kind, that the single call to action is
  `/inscripcion`, that every unconfirmed commercial value renders through
  `PlaceholderTag` rather than as plain text, and that a product piece is rendered as
  a drawn composition on a `campo-*` field — never as a fabricated photograph.

### Modified Capabilities

- None.

## Approach

**Copy the `/contenidos` pair.** `/contenidos` and `/contenidos/[slug]` already solve
exactly this shape: a static catalog of items with a detail route, no photography, and
a marked-placeholder convention. This change reuses that anatomy rather than inventing
a second one. `design.md` records the exact values.

**Display is the whole product.** The page answers one question — what exists and where
to get it. The acquisition fact ("sold at the stand, three days, no online sale") is
stated once, prominently, in a `campo-fuego` band. The only action on the page is the
site's single primary action, `Inscribirme`.

**Two products, two columns.** The real inventory is two items. The index uses a
two-column grid rather than the three-column `/contenidos` grid, so the page does not
look like a catalog with missing rows.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/(external)/productos/page.tsx` | New | Index route |
| `src/app/(external)/productos/[slug]/page.tsx` | New | Detail route |
| `.../productos/data.ts` | New | Two typed products + lookup helpers |
| `.../productos/ProductosIntro.tsx` | New | Eyebrow + display h1 + lede |
| `.../productos/ProductosGrid.tsx` | New | Two-column grid |
| `.../productos/ProductoCard.tsx` | New | Index card |
| `.../productos/ProductoPieza.tsx` | New | The drawn-piece frame (composition rule) |
| `.../productos/DondeConseguir.tsx` | New | `campo-fuego` acquisition band |
| `.../productos/index.ts` | New | Barrel |
| `.../shared/navigation.ts` | Modified | Adds the `Productos` nav entry |
| `openspec/specs/landing-productos/` | New | Spec delta |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| The `Productos` nav entry appears on three surfaces at once | Certain, accepted | `navItems` is shared by `SiteHeader` (on `/` and `/contenidos`) and `SiteFooter`. This is intended — the route must be reachable. Verify `/` and `/contenidos` still render their nav correctly. |
| Placeholder prices ship to production looking real | Low | Every unconfirmed value renders through `PlaceholderTag`, whose hatched fill reads as unfinished at a glance. Never plain text. |
| A drawn piece is mistaken for a real product photo | Low | The pieces are flat vector silhouettes on brand-colour fields, visibly illustrations. `design.md` §3 forbids photographic treatment. |
| A number lands in `.jec-display` | Med | The personal-use Cayento build maps all ten digits to the same watermark glyph (see `design.md` §2). Prices and dates MUST use `.jec-mono` or `.jec-label`. Grep for `jec-display` in the new files before finishing. |
| Someone later adds a "comprar" button | Med | The capability spec states the no-transaction rule explicitly, so it is a spec violation rather than a taste disagreement. |

## Rollback Plan

Every file is new except `navigation.ts`. Rollback is deleting the two route folders
and the component folder, and reverting the single nav entry. No persisted state, no
migration.

## Dependencies

- `landing-tokens-b` (archived) — supplies the field classes, `CtaButton`,
  `SectionHeading`, `PlaceholderTag` and `navigation.ts`.
- `landing-home-secciones` — supplies `SiteHeader`'s `logo` prop and `SiteFooter`.
- Real product copy (prices, sizes, material, colours) from the user, post-ship, as a
  hand-edit of `data.ts`. Not a blocker.

## Verification

No test runner exists (`openspec/config.yaml` `testing.test_runner.available: false`).

- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run build` passes
- Browser `/productos`: both cards render; every unconfirmed value is visibly hatched;
  the acquisition band states the no-online-sale fact; the only action is `Inscribirme`;
  at 390px the grid is one column and nothing overflows horizontally
- Browser `/productos/remera-jec-2026` and `/productos/pack-stickers`: detail renders,
  "Volver a productos" works, the related strip shows the other product
- Browser `/` and `/contenidos`: the new nav entry renders legibly on both fields
- `rg 'jec-display' src/components/external/productos src/app/\(external\)/productos`
  returns no line containing a digit

## Success Criteria

- [ ] `/productos` and `/productos/[slug]` render, both statically generated
- [ ] Zero transactional affordances: no cart, no price form, no reserve/buy control
- [ ] Every unconfirmed commercial value renders through `PlaceholderTag`
- [ ] No `.jec-display` carries a digit
- [ ] No `bg-[var(--jec-*)]` / `text-[var(--jec-*)]` literal — surfaces set colour via
      a `campo-*` class and its tokens
- [ ] `ProductoPieza` renders with no external network request and no fabricated photo
- [ ] `navItems` has one new entry; `/` and `/contenidos` are unregressed
- [ ] `npx tsc --noEmit`, `npm run lint` and `npm run build` pass

## Session Context

**Design canvas** (reference only — `design.md` carries every value, so the canvas does
not need to be opened to implement): https://claude.ai/code/artifact/3ddfa5fb-3d6e-48ea-8359-e7359673fcd5
Four artboards: index desktop, detail desktop, index at 390px, and the composition-rule
sheet.

**Why this replaces `productos-presave`.** That change was named in the
`landing-tokens-b` chain but never written — no folder, no spec, no route. Its pre-save
premise is void as of the 2026-08-25 user decision. This proposal supersedes it under a
name that describes what the surface actually does.
