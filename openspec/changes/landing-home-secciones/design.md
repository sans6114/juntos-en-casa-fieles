# Design: Landing Home Secciones — compose `/` on the direction B field system

## Technical Approach

Composition only. Every colour, primitive and motion rule already exists from `landing-tokens-b`; this change mounts sections, wires anchors and deletes the `--jec-*` literals that bypass the field system. Two sticky positions (header at `top-0`, CTA bar `fixed` at the bottom) replace what would otherwise be scroll listeners — **no `"use client"` is added anywhere, and one is removed** (`InvitadoCard`). Layer responsibilities per `nextjs-monolith-architecture`: `components/external/<area>/` holds the sections and their static `data.ts`; `shared/` holds chrome; `globals.css` gains two custom properties and one class. No action, store, interface or Prisma surface is touched.

Structural invariant carried through every decision: **a measurement is declared once as a custom property and consumed everywhere else.** Header height, anchor clearance and the CTA reserve are three consumers of two variables, so they cannot drift.

## Architecture Decisions

### D1 — Stacking: the header outranks `HeroFinale`, which is left untouched

Measured, not assumed. `ScrollExpand.css:24-30` — `.scroll-expand__stage { position: sticky; top: 0; overflow: hidden }` with **no `z-index`**. `.scroll-expand` is `position: relative` (auto), `HeroFinale`'s root `<div>` and `Hero.tsx:7`'s `<section>` are unpositioned/auto. Nothing in the hero raises itself.

| Option | Tradeoff | Decision |
|---|---|---|
| Give `.scroll-expand__stage` a `z-index` | Edits the hero's animation CSS to fix a header problem; hero is out of scope | Rejected |
| Rely on DOM order alone (both `z-index: auto`) | Correct today — the header follows the whole hero, so it already paints last — but silent: any future `z-index` inside the hero flips it | Rejected |
| Header takes an explicit `sticky top-0 z-50` at the call site | One class string, no hero edit, ordering is stated rather than inherited | **Chosen** |

The two sticky elements meet at one scroll offset, not over a range: `track` height is `stageH × (1 + 1.2 + 0.35)` = **2.55× the viewport height** (255vh; `scrollDistance` 1.2 from `HeroFinale.tsx:47`, `holdDistance` 0.35 default, `ScrollExpand.tsx:173`). The stage releases at 1.55× and clears the viewport top at 2.55× — exactly where the header, the next element in flow, arrives. `z-50` makes the handoff deterministic under sub-pixel rounding and iOS rubber-band instead of accidental.

**Sticky is safe here** (re-verified): no `overflow` rule exists anywhere in `globals.css`, `(external)/layout.tsx` is a plain `div`, and `Hero.tsx:7`'s `overflow-hidden` is on a *sibling* section. The header's containing block is the `.jec-landing` div, which spans the whole page — so it stays pinned through the footer. **The header must not be wrapped** in any element that ends before the footer; that is what forces D6's `fixed`.

### D2 — Anchor clearance: one variable, one class

```css
.jec-landing { --jec-header-h: 80px; }                       /* pt-6 24 + logo h-8 32 + pb-6 24 */
@media (min-width: 768px) { .jec-landing { --jec-header-h: 104px; } }  /* pt-8 32 + h-10 40 + pb-8 32 */
.jec-landing .jec-anchor { scroll-margin-top: calc(var(--jec-header-h) + 0.5rem); }
```

| Option | Tradeoff | Decision |
|---|---|---|
| `scroll-mt-[5rem] md:scroll-mt-[6.5rem]` per section | Repeats the magic number at 4 call sites; drifts from the header's real height | Rejected |
| Global `.jec-landing section[id] { … }` | Reaches `/inscripcion` and `/contenidos`, which have no pinned header | Rejected |
| `--jec-header-h` + shared `.jec-anchor` class | Header consumes the same variable as `min-h-[var(--jec-header-h)]`, so offset and height are the same number | **Chosen** |

Applied to `#cronograma`, `#invitados`, `#ubicacion` and `#faq`. The `+0.5rem` is optical clearance. `md` is 768px to match Tailwind's `md:`. The `/` header therefore takes `pb-6 md:pb-8` at the call site (it has none today; `/contenidos` supplies its own `pb-2` and is unaffected).

**Verify at 320px**: only the two `essential: true` links render below `md`, leaving roughly 11px of slack before the nav wraps. If it wraps, `--jec-header-h` must go up — `min-h` does not clamp.

### D3 — `SiteHeader` gains `logo` and nothing else

Proposal shape confirmed as-is; the prop names the *logo's* colour, matching the `ivsWhite` / `ivsBlack` asset keys.

```ts
const logoSrc = { light: jecAssets.logos.ivsWhite, dark: jecAssets.logos.ivsBlack } as const
type SiteHeaderProps = { className?: string; logo?: keyof typeof logoSrc }   // default "light"
```

Sticky behaviour stays at the call site, **verified against `src/lib/utils.ts`**: `cn` is `twMerge(clsx(…))`, so `className="sticky top-0 z-50 …"` beats the base `relative z-10` (same position group, later wins) with no edit to the base string. `/contenidos` keeps a static header for free.

- `/` — `<SiteHeader logo="dark" className="campo-papel sticky top-0 z-50 min-h-[var(--jec-header-h)] pb-6 md:pb-8" />`
- `/contenidos` — `<SiteHeader className="campo-tinta pb-2" />` (the one forced exception; `--dato`/`--acento` resolve to the same bone/amber the literals produced, focus ring moves amber → bone)

`navLinkClass` → `text-[var(--dato)] hover:text-[var(--acento)] focus-visible:outline-[var(--foco)]`.

### D4 — Cronograma day labels: corrected literals, source named in a comment

| Option | Tradeoff | Decision |
|---|---|---|
| `Intl.DateTimeFormat("es-AR")` over `eventStartsAt` + offset | `{weekday:"long",day:"numeric"}` yields `"viernes, 18"`, so the pinned `"Viernes 18"` shape needs `formatToParts` + capitalisation; correctness needs an explicit `timeZone: "America/Argentina/Buenos_Aires"`, or a server east of UTC renders the 19th. Three runtime dependencies to derive three strings from another hardcoded constant | Rejected |
| Add an ISO `date` field to `CronogramaDia` | Widens a type this change otherwise leaves alone, forcing a `CronogramaDiaCard` edit | Rejected |
| Corrected literals + `// Fuente de verdad: siteConfig.eventStartsAt` | Smallest diff; the file's times and titles stay hardcoded mock content anyway, so a half-derived file would be worse | **Chosen** |

`"Viernes 18"` / `"Sábado 19"` / `"Domingo 20"`. Type untouched.

### D5 — `campo-fuego` goes on `SiteFooter`; the CTA bar takes `campo-tinta`

The decisive fact is in the tree: `Hero.tsx:7` and `HeroFinale.tsx:162` are both `bg-[var(--jec-ember)]`, the exact value of `campo-fuego`'s `--sup`. A persistent orange bar over the orange hero is orange-on-orange — the same defect class this change exists to kill.

| Surface | Field | Why |
|---|---|---|
| `SiteFooter` | `campo-fuego` | Renders at every breakpoint; the CTA bar is `md:hidden`, so putting fuego there would leave desktop `/` with no fuego block at all |
| Mobile CTA bar | `campo-tinta` | Ink surface stays legible over ember (hero), bone (`campo-papel`) and ink (`campo-tinta`) alike; its bone `--cta-bg` on ink is the page's highest-contrast pairing |

Over Invitados the ink bar would merge into an ink section, so it carries `border-t-[3px] border-[var(--regla)]` — bone there, ink elsewhere — reusing the 3px rule language of D5/D6 in `landing-tokens-b`. The footer needs no rule; paper → ember is its own boundary.

### D6 — Mobile CTA: `fixed` + a footer reserve, and the truth about `env()`

Spec requires visibility "at any scroll position", which rules out `position: sticky` scoped to a wrapper — and a wrapper is impossible anyway, because the header sits *inside* the range the bar must cover, and any wrapper enclosing it would unstick the header at the footer (D1), breaking "pinned for the rest of the page".

```
<StickyCta />  →  fixed inset-x-0 bottom-0 z-40 md:hidden campo-tinta border-t-[3px]
                  min-h-[var(--jec-cta-h)] …
SiteFooter     →  pb-[calc(var(--jec-cta-h)+env(safe-area-inset-bottom,0px))] md:pb-…
globals.css    →  .jec-landing { --jec-cta-h: 4.5rem; }
```

`min-h-[var(--jec-cta-h)]` on the bar itself is **not optional**: it is what makes the reserve honest. The header does this correctly (D3's `min-h-[var(--jec-header-h)]`); without the matching rule here the bar's height would be implicit from its `CtaButton` content while the footer reserves a fixed `4.5rem`, and the two numbers would drift the moment the button's padding or type scale changes — exactly the failure the "declared once, consumed everywhere" invariant exists to prevent. The bar is therefore `4.5rem` **plus** its 3px top rule (75px total); the reserve covers the content box, and the 3px rule overlaps the footer's own boundary harmlessly.

As with `--jec-header-h`, `min-h` sets a floor and does not clamp: if the CTA label ever wraps at 320px the bar grows past the reserve, so the 320px check in the Testing Strategy is load-bearing, not cosmetic.

`fixed` is safe: no ancestor (`html`, `body`, `.jec-landing`) sets `transform`, `filter` or `will-change`.

**`env(safe-area-inset-bottom)` currently evaluates to `0px`** — verified: `src/app/layout.tsx:26-28` exports `viewport` with `colorScheme` only, no `viewportFit: "cover"`. Without it iOS constrains the layout viewport to the safe area already, so a `bottom: 0` bar is *not* under the home indicator; the `env()` term is a forward-compatible no-op with an explicit `0px` fallback. Adding `viewportFit: "cover"` is a **root**-layout change shared with `/admin` and is deliberately not taken here.

DOM placement: last, after `SiteFooter`, so the document order Requirement 1 mandates (Hero → … → SiteFooter) stays literally true and the bar never interrupts reading order.

### D7 — `MapaSimulado`: a decorative figure that does not move

Inline `<svg>` — an abstract plate drawn from field tokens only (`--linea` streets, `--regla` main axis), with `jecAssets.iconos.ancla` as the pin via `<image href=…>` inside the SVG (it is a PNG; an SVG `<image>` keeps one coordinate space, needs no wrapper, and does not trip `@next/next/no-img-element`). Same-origin, so the "no external mapping service" requirement holds.

**Accessible name: none — it is decorative.** `role="presentation" aria-hidden="true" focusable="false"`. The graphic is not geographic; announcing it as a map would assert something false. The real information is adjacent and already accessible: the `<address>` block and the "Cómo llegar" link. A `<figcaption>` states the same in visible text — proposed copy `"Ilustración de referencia — no es un mapa a escala."`, adjustable.

**`prefers-reduced-motion`: no guard needed, because nothing animates.** The pin does not pulse, drift or fade. A page whose hero is a full GSAP sequence does not need a decorative marker competing with it.

### D8 — `InvitadoCard`: outlined plate, glyph, name

Server Component. `"use client"`, three `useState`, `useId`, the reveal mechanic and all six `/jec/oradores/*` paths are deleted; `Invitado` narrows to `{ id: string; name: string }`, which clears the `TODO(landing-home-secciones)`.

| Concern | Resolution |
|---|---|
| Element | `<article>`, not `<button>` — nothing is activatable. Focus surface shrinks as accepted in the proposal |
| Surface | `border border-[var(--linea)]`, **no fill**. `bg-[var(--jec-ink-soft)]` is a banned literal; a nested `campo-*` is banned by the spec; a tenth "raised surface" token would break `landing-tokens-b` D1's nine-token invariant |
| Glyph | `?`, `.jec-display text-7xl md:text-8xl` (72–96px, above D9's 34px floor), colour `var(--acento)` |
| Name | Rendered as the caption, `.jec-label` |
| Per-guest `accent` | Dropped. The field owns the accent now; ember/amber alternation is not expressible without literals |

The name stays visible: the previous UI made it reachable, and hiding real content is a product decision, not a design one. See Open Questions.

### D9 — `faq/data.ts` and `ubicacion/data.ts`

```ts
// faq/data.ts
export type FaqItem = { id: string; question: string; answer: string }
export const faqItems: readonly FaqItem[] = [ /* placeholders, marked in the rendered string */ ]
```

`answer` is `string`, not `ReactNode`, so the file stays `.ts` with no JSX. `Faq.tsx` maps each item to `<Disclosure summary={item.question}><p className="text-[var(--suave)]">{item.answer}</p></Disclosure>`. The chevron is right-aligned from the call site with `className="[&>summary]:flex [&>summary]:items-center [&>summary]:justify-between border-b border-[var(--linea)]"` — chosen over adding a `summaryClassName` prop, because it avoids reopening a primitive that shipped one change ago.

```ts
// ubicacion/data.ts
export type UbicacionInfo = { venue: string; street: string; city: string; mapsUrl: string }
```

`venue`/`city` mirror `siteConfig.org` / `siteConfig.city`; `mapsUrl` is built **in this file** from those same two fields, so the displayed address and the link cannot drift — that is the whole reason it moves out of `Ubicacion.tsx:7-8`. Two consequences, both stated rather than silent: the query becomes `"…Vida Sobrenatural La Plata, Buenos Aires"` (today's hand-written `" La Plata"` suffix disappears, and the duplicate literal with it); and `street` is **excluded** from the query while it holds the marked placeholder, with a comment saying to add it once a real address lands. `Ubicacion.tsx` reads all four fields, drops `STREET_PLACEHOLDER`, and swaps line 26's `.jec-display` for `.jec-label` (D9 of `landing-tokens-b`).

## Data Flow

```
globals.css  --jec-header-h ──┬─→ SiteHeader min-height (call site, "/")
                              └─→ .jec-anchor scroll-margin-top → #cronograma #invitados #ubicacion #faq
             --jec-cta-h    ──── → SiteFooter padding-bottom reserve

page.tsx   Hero → SiteHeader(sticky top-0 z-50, campo-papel) → Cronograma → Invitados
                → Ubicacion → Faq → SiteFooter(campo-fuego) → StickyCta(fixed bottom-0 z-40, campo-tinta)

siteConfig ──→ ubicacion/data.ts ──→ Ubicacion (address + "Cómo llegar")
           ──→ cronograma/data.ts (literals, comment names the source)
navigation.ts ──→ SiteHeader · SiteFooter (ignores `essential`, renders all)
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/globals.css` | Modify | `--jec-header-h` (+`md`), `--jec-cta-h`, `.jec-anchor` |
| `src/app/(external)/page.tsx` | Modify | Full composition per D1/D6 ordering |
| `src/app/(external)/contenidos/page.tsx` | Modify | `bg-[var(--jec-ink)]` → `campo-tinta` (forced exception) |
| `.../shared/SiteHeader.tsx` | Modify | `logo` prop (D3); `navLinkClass` onto field tokens |
| `.../shared/SiteFooter.tsx` | New | `campo-fuego`; every `navItem`; nothing for empty `socialLinks`; no tagline |
| `.../shared/StickyCta.tsx` | New | `fixed`, `md:hidden`, `campo-tinta`, `min-h-[var(--jec-cta-h)]`, one `CtaButton` to `/inscripcion` |
| `.../shared/navigation.ts` | Modify | `"Inscribirme"` → `/inscripcion` |
| `.../shared/index.ts` | Modify | Barrel: `SiteFooter`, `StickyCta` |
| `.../hero/Hero.tsx` | Modify | Delete the `sr-only` `#inscripcion` div |
| `.../hero/HeroFinale.tsx` | Modify | CTA → `/inscripcion` |
| `.../hero/HeroCountdown.tsx` | Modify | Line 70 `.jec-display` → `.jec-label` |
| `.../cronograma/Cronograma.tsx` · `CronogramaDiaCard.tsx` · `data.ts` | Modify | `campo-papel` + `.jec-anchor`; token swaps; corrected labels (D4) |
| `.../invitados/Invitados.tsx` · `InvitadoCard.tsx` · `data.ts` | Modify | `campo-tinta` + `.jec-anchor`; static rewrite (D8); type narrows |
| `.../ubicacion/Ubicacion.tsx` | Modify | `campo-papel` + `.jec-anchor`; reads `data.ts`; mounts the map; `.jec-label` |
| `.../ubicacion/MapaSimulado.tsx` · `data.ts` · `index.ts` | New / Modify | D7 figure; D9 data; barrel |
| `.../faq/Faq.tsx` · `data.ts` · `index.ts` | New | D9 composition over `Disclosure` |

## Slice Map

`sdd-tasks` owns the breakdown; the decisions partition cleanly so the slices are independent.

| Slice | Decisions | Also touches |
|---|---|---|
| 1 · Header | D1, D2, D3 | `/contenidos` — the only cross-page slice, lands first |
| 2 · Schedule | D4 | — |
| 3 · Guests | D8 | — |
| 4 · Location + map | D7, D9 (ubicacion) | — |
| 5 · FAQ | D9 (faq) | — |
| 6 · Footer + sticky CTA | D5, D6 | — |
| 7 · CTA target + display type | — | `Hero`, `HeroFinale`, `HeroCountdown`, `navigation.ts` |

Every slice adds its own mount line to `page.tsx`; those diffs are additive and do not conflict.

## Testing Strategy

No test runner exists (`openspec/config.yaml` — `testing.test_runner.available: false`).

| Layer | What | Approach |
|---|---|---|
| Static | Types after the `Invitado` narrowing; no `/#inscripcion`; no `bg-[var(--jec-*)]` in owned files | `npx tsc --noEmit`, `npm run lint`, `rg` |
| Layout | Header invisible over the hero, pinned after, not painted under `HeroFinale` at the handoff | Browser, slow scroll through the 255vh track |
| Anchors | `/#cronograma`, `/#invitados`, `/#ubicacion` land the heading below the header at 375px and 1280px | Browser, direct URL |
| A11y | Header focusable and scrolled into view while the hero is on screen; map not announced; no `aria-hidden` on the header | Keyboard tab-through + AT |
| Mobile | CTA bar visible at every scroll position and clear of footer content at 320px | Browser + a real iOS device (safe-area claim) |
| Regression | `/contenidos` logo, nav, hover, focus ring | Browser side-by-side |
| Content | Every placeholder visibly marked | Read `faq/data.ts`, `ubicacion/data.ts` |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. Presentational Server Components, CSS custom properties and static data modules only.

## Review Budget

Roughly **590 changed lines** of source (additions + deletions), the two rewrites dominating: `InvitadoCard` ≈ 143 and `Ubicacion` ≈ 70. Against the 800-line budget:

- **Per slice**: all seven land under 250. Low risk.
- **Single PR**: 590 source lines plus this change's OpenSpec artifacts pushes past 800. Chained PRs per the slice map are the expected shape, as the proposal already anticipated.

## Migration / Rollout

No migration, no persisted state. Partial rollback follows the slices: reverting `page.tsx` unmounts every new section while leaving the CTA-anchor fix in place. New files roll back by deletion.

## Open Questions

None blocks `sdd-tasks`. Both are product calls with a decision already in place, so work can proceed either way.

- [ ] **The fixed CTA bar overlaps `HeroFinale`'s own pill CTA on mobile.** The bar is 75px tall (`--jec-cta-h` 4.5rem + a 3px rule); `HeroFinale`'s pill sits 32px above the viewport bottom (`py-8`), so roughly 42px of a ~50px pill is covered while the hero is on screen. Not a spec violation (nothing protects hero content) and functionally harmless (both go to `/inscripcion`), but visually poor. The one-line remedy — bumping the hero overlay's bottom padding at `HeroFinale.tsx:171` — is a hero layout edit the proposal excludes ("only its CTA target changes"), so it is **not** taken. Confirm whether to accept the overlap or widen the hero slice.
- [ ] **`InvitadoCard` shows each guest's name** (D8). Hiding the six real names behind a permanent "por anunciar" is defensible for a "mystery guest" section, but it withholds content that is reachable today, which is a product decision. The component reads `name` from data, so switching is a one-line change.

## Observations (not blockers)

- `HeroCountdown` is exported from `hero/index.ts` but **mounted nowhere** — `HeroFinale` renders its own countdown inline. The spec still names `HeroCountdown.tsx:70` as a violation to fix, so this design fixes it; strictly, a dead component cannot violate "no element *rendered on* `/`". Worth a later decision on whether the component should exist at all — out of scope here.
