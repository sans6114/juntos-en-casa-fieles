# Proposal: Landing Home Secciones — compose the public home page on the direction B field system

Second of four chained changes for the approved "Papel encendido" redesign. Depends on `landing-tokens-b` (done/verified).

## Intent

`src/app/(external)/page.tsx` renders **only** `<Hero />`. `Cronograma`, `Invitados` and `Ubicacion` are written, exported and never mounted, so the home page ends at the hero and the site has no schedule, no guests, no location, no header, no footer. Four defects compound it:

0. **No navigation on `/`.** `SiteHeader` is imported at exactly one call site, `contenidos/page.tsx:15`; neither `(external)/layout.tsx` nor `Hero` renders it. The home page ships with no nav, and its three anchors are reachable only by arriving from `/contenidos`.
1. **Dead CTA, two call sites.** `HeroFinale.tsx:258` and the "Inscribirme" entry in `navigation.ts:19` both target `/#inscripcion`, an empty `sr-only` div (`Hero.tsx:16`) left as a "fase siguiente" placeholder. The real `/inscripcion` route exists and ships. Today the primary conversion path goes nowhere.
2. **Invisible CTA.** `Ubicacion.tsx`'s `CtaButton` inherits the un-classed default `--cta-bg: var(--jec-ink)` while sitting on a literal `bg-[var(--jec-ink)]` section — ink on ink. Dormant only because the section is unmounted; mounting it ships the bug.
3. **Stale dates.** `cronograma/data.ts` says "Viernes 12 / Sábado 13 / Domingo 14"; `siteConfig.eventStartsAt` is `2026-09-18T19:00:00-03:00` (a Friday). The visible schedule contradicts the source of truth.

`landing-tokens-b` shipped the field classes (`campo-papel` / `campo-tinta` / `campo-fuego`) and the primitives (`CtaButton`, `SectionHeading`, `Disclosure`, `navigation.ts`) precisely so this change can compose the page without inventing styling.

## Scope

### In Scope

- Mount `SiteHeader` on `/` — today it renders on `/contenidos` only (`contenidos/page.tsx:15`), so the home page has no navigation at all and its `/#cronograma` · `/#invitados` · `/#ubicacion` anchors are reachable only by cross-page navigation from `/contenidos`
- **The home header must not appear over the hero.** It renders from the first section after the hero onward. Delivered CSS-only, no client component, no scroll listener and no `IntersectionObserver`: `SiteHeader` is placed **after** `<Hero />` in `page.tsx` and made `sticky top-0`, so it is simply not in the viewport while the hero fills it, scrolls in at the hero's end, and pins for the rest of the page. Three constraints this imposes, all verified against the current tree:
  - The header needs its **own opaque surface** — a `campo-*` class on the element itself, not an inherited one. Pinned, it travels over sections on different fields; a transparent header would be illegible the moment it crosses one. It carries `campo-papel` and therefore `logo="dark"`
  - Every anchor target needs `scroll-margin-top` matching the header height, or `/#cronograma` scrolls its heading under the pinned header
  - `sticky` breaks under any ancestor with a non-`visible` `overflow`. None exists today (`globals.css` declares no `overflow` rule; `(external)/layout.tsx` is a plain `div`; `Hero.tsx:7`'s `overflow-hidden` is on the hero `<section>`, which the header is a sibling of, not a child). `HeroFinale` already relies on `sticky` for ScrollExpand — the same trap `Hero.tsx:11-12` documents — so `sdd-design` must also settle the header's `z-index` against it
- Mount `Cronograma`, `Invitados`, `Ubicacion` (+ new `Faq`) in `page.tsx`. The first three each keep the `id` their `navItems` entry targets. **`Faq` is not a nav destination** — `navItems` does not gain an entry for it (user decision, 2026-08-21), because that list is shared with `SiteFooter` and with `/contenidos`'s header; Faq is reached by scrolling `/`
- Retrofit every mounted section off the hardcoded `bg-[var(--jec-ink)]` / `text-[var(--jec-*)]` literals onto field classes — `Cronograma.tsx:11`, `Invitados.tsx:11`, `Ubicacion.tsx:15`, `CronogramaDiaCard.tsx`. Fixes defect 2 by construction
- Retrofit `SiteHeader`'s `navLinkClass` (`SiteHeader.tsx:7-8`) off `text-[var(--jec-bone)]` / `hover:text-[var(--jec-amber)]` / `outline-[var(--jec-amber)]` onto `--dato` / `--acento` / `--foco`, so the header reads correctly on whichever field hosts it. Without this it is bone-on-paper — invisible — the moment it lands on `/`
- Repoint both `/#inscripcion` call sites to `/inscripcion`; remove the now-unused `sr-only` anchor at `Hero.tsx:16`
- Correct `cronograma/data.ts` to 18 / 19 / 20 September 2026 (Friday / Saturday / Sunday), the dates `siteConfig.eventStartsAt` implies
- Rewrite `InvitadoCard.tsx` as a **static, non-interactive** "invitado misterioso" treatment: drop `"use client"`, the 3 `useState`, the hover/click/focus photo-reveal mechanic and the six dead `/jec/oradores/*.webp` paths (product decision: no speaker photos). Clears the `TODO(landing-home-secciones)` left in `invitados/data.ts`
- NEW `MapaSimulado.tsx` — inline SVG, no iframe and no external map API, `jecAssets.iconos.ancla` as the pin; consumed by `Ubicacion`
- NEW `ubicacion/data.ts` — street/city/org address fields **and the Maps deep link** as data, placeholder copy (see Open Questions). `Ubicacion.tsx` consumes it instead of the inline `STREET_PLACEHOLDER` constant and the locally-built `mapsQuery` / `mapsUrl` (`Ubicacion.tsx:7-8`), so the address and the link the "Cómo llegar" CTA opens cannot drift apart
- `Ubicacion.tsx:26` — `.jec-display` at 20px (`text-xl`, `md:text-2xl`), a second D9 violation the mount would otherwise ship. Same treatment as the `HeroCountdown` handoff below
- NEW `SiteFooter.tsx` — greenfield, reads `navItems` (all of them, ignoring `essential` per landing-tokens-b D7) and `socialLinks` (empty ⇒ renders nothing)
- NEW `Faq.tsx` — composed from the existing `Disclosure` primitive, driven by NEW `faq/data.ts` (question/answer pairs, placeholder copy — see Open Questions)
- NEW mobile sticky CTA bar to `/inscripcion`
- `HeroCountdown.tsx:70` — `.jec-display` at 10.4px, the typographic-discipline violation landing-tokens-b D9 explicitly handed to this change
- `SiteHeader` logo: the `logos.ivsWhite` → `ivsBlack` repaint landing-tokens-b D8 deferred here, delivered as an explicit `logo?: "light" | "dark"` prop rather than a hard swap. `next/image` cannot pick its `src` from a CSS custom property, so the variant has to be chosen at the call site. **The prop defaults to `"light"` (`ivsWhite`, today's behaviour)**, so `/contenidos` keeps its current logo without being edited; `/` passes `logo="dark"` for the paper field. A hard swap would have put a black logo on `/contenidos`'s ink background — the header's only current render site — which is why D8's assumption that this change repaints it on paper did not hold

### Out of Scope

- `/contenidos` (change #3 `contenidos-plenarias`) — including the identical `bg-[var(--jec-ink)]` literal at `ContenidosGrid.tsx:10`. **One narrow exception**: `contenidos/page.tsx:15` swaps its `bg-[var(--jec-ink)]` literal for `campo-tinta`. This is forced, not opportunistic — `SiteHeader` becomes field-driven in this change, and a field-driven header over a raw literal inherits the `.jec-landing` paper defaults and renders dark-on-dark. `campo-tinta` resolves `--dato`/`--acento` to bone/amber, reproducing that header's current appearance (only the focus ring moves from amber to bone). `ContenidosGrid.tsx:10` stays untouched for change #3
- `/productos` (change #4 `productos-presave`)
- The hero's GSAP sequence and loader — only its CTA target changes
- Any Prisma, action, or data-layer change
- The `--jec-amber` → lime rename (deferred by `landing-tokens-b`)

## Capabilities

> Contract for `sdd-spec`. `openspec/specs/` holds only `landing-tokens`; `landing-assets` exists as a pending delta in `landing-tokens-b` and merges on its archive.

### New Capabilities

- `landing-home-composition`: which chrome and sections the public home page renders and in what order; that the home header is hidden for the hero's full height and pinned from the following section onward; each section's anchor identity, including that an anchored heading lands clear of the pinned header; every CTA resolving to a live destination; schedule content agreeing with `siteConfig.eventStartsAt`; and the conformance rule that a landing surface MUST set its colours via a `campo-*` field class and its tokens, and MUST NOT hardcode `bg-[var(--jec-*)]` / `text-[var(--jec-*)]` literals — a rule that binds shared chrome (`SiteHeader`, `SiteFooter`) as well as sections, since chrome is what renders across more than one field

### Modified Capabilities

- None. The field-conformance rule is deliberately placed in the new capability rather than as a second delta on `landing-tokens`: that capability's `landing-tokens-b` delta has not merged into `openspec/specs/` yet, and a parallel delta on the same requirement blocks would create an archive-ordering conflict for no benefit.

## Approach

**Compose, do not restyle.** Every visual decision already exists as a token or a primitive. This change's job is mounting, wiring anchors, and deleting the literals that bypass the field system.

**Delete an interaction, don't port it.** `InvitadoCard`'s reveal mechanic exists only to uncover photos that no longer exist. Rewriting it static removes a client component from the tree instead of migrating dead state.

**No external map.** An iframe or map SDK adds a third-party request, a consent surface and a visual language foreign to the paper field. An inline SVG using the existing anchor icon is fully controllable and costs nothing.

**Scope tension, addressed directly.** `AGENTS.md` Atomic Scope says "one change per cycle… never entire pages", and this change composes an entire page. Resolution: the constraint targets *reviewable units*, not SDD change count. `sdd-tasks` MUST slice this into per-section work units (header / schedule / guests / location+map / FAQ / footer+sticky CTA / CTA-anchor fix), each with its own start, finish, verification and rollback. The header slice lands first: it is the one unit that also touches `/contenidos`, so isolating it keeps the cross-page regression check on a single reviewable commit. Splitting into five SDD *changes* was rejected: they would all block on the same unresolved field-assignment decision, and every boundary between them leaves the home page in a visually incoherent half-mounted state.

## Affected Areas

| Area | Impact | Description |
|---|---|---|
| `src/app/(external)/page.tsx` | Modified | Mounts the section composition, with a sticky `SiteHeader` placed after `<Hero />` |
| `src/app/(external)/contenidos/page.tsx` | Modified | `bg-[var(--jec-ink)]` literal → `campo-tinta` (forced by the field-driven header; see Out of Scope) |
| `.../hero/Hero.tsx` | Modified | Remove the `sr-only` `#inscripcion` placeholder |
| `.../hero/HeroFinale.tsx` | Modified | CTA → `/inscripcion` |
| `.../hero/HeroCountdown.tsx` | Modified | `.jec-display` → `.jec-label` (D9 handoff) |
| `.../shared/navigation.ts` | Modified | "Inscribirme" → `/inscripcion` |
| `.../shared/SiteHeader.tsx` | Modified | `logo` prop for the D8 handoff (defaults to today's `ivsWhite`); `navLinkClass` onto field tokens |
| `.../shared/SiteFooter.tsx` | New | Nav + social, driven by `navigation.ts` |
| `.../shared/StickyCta.tsx` | New | Mobile-only persistent CTA |
| `.../cronograma/Cronograma.tsx` · `CronogramaDiaCard.tsx` · `data.ts` | Modified | Field class; correct dates |
| `.../invitados/Invitados.tsx` · `InvitadoCard.tsx` · `data.ts` | Modified | Field class; static rewrite; drop dead paths |
| `.../ubicacion/Ubicacion.tsx` | Modified | Field class; mount the map; read address + Maps link from `data.ts`; `.jec-display` → `.jec-label` (D9) |
| `.../ubicacion/MapaSimulado.tsx` | New | Inline SVG map |
| `.../ubicacion/data.ts` | New | Address fields + Maps deep link, placeholder copy |
| `.../faq/Faq.tsx` | New | `Disclosure` composition, reads `data.ts` |
| `.../faq/data.ts` | New | Question/answer pairs, placeholder copy |
| `openspec/specs/landing-home-composition/` | New | Full spec |

## Risks

| Risk | Likelihood | Mitigation |
|---|---|---|
| Field assignment decided by the agent instead of the user | Resolved | User confirmed Open Question 1's recommendation on 2026-08-21 |
| FAQ/footer/address copy fabricated to fill a gap | Resolved | User confirmed Open Question 2's revised resolution on 2026-08-21: FAQ and address ship via `data.ts` with clearly-marked placeholder copy the user edits by hand; footer ships structural-only |
| Placeholder copy in `faq/data.ts` / `ubicacion/data.ts` ships to production unreplaced | Low | Placeholder strings are explicitly labeled ("placeholder", "reemplazar"), not disguised as real content; `Success Criteria` calls this out for verification review |
| Composing a whole page overruns the review budget | High | `sdd-tasks` slices per section; chained PRs expected |
| `InvitadoCard` rewrite loses an accessibility affordance the reveal provided | Low | Static content needs no focus/hover affordance; keyboard surface shrinks |
| Sticky CTA overlaps footer content or iOS safe area on small screens | Med | Bottom padding reserve + `env(safe-area-inset-bottom)`; verify on a real device |
| Correcting dates in `data.ts` desyncs from `siteConfig` again later | Med | `sdd-design` decides between derived labels (`Intl.DateTimeFormat("es-AR")` over `siteConfig.eventStartsAt` + day offset) and corrected literals with a comment naming `siteConfig` as the source. Derivation removes the drift but adds a formatting dependency for three strings; either is acceptable, but the choice must be made once and stated, not left implicit |
| The field-driven `SiteHeader` regresses `/contenidos`, an out-of-scope page | Med | The `logo` prop defaults to today's `ivsWhite`, and `contenidos/page.tsx:15` moves to `campo-tinta`, whose tokens resolve to the same bone/amber the hardcoded classes produce. Verification covers `/contenidos` explicitly, not just `/` |
| The sticky home header collides with `HeroFinale`'s own `sticky` ScrollExpand, or an ancestor's `overflow` kills it silently | Med | No `overflow` rule exists in `globals.css` or in either layout today, so the mechanism is sound as of this proposal; `sdd-design` fixes the `z-index` order explicitly and `sdd-tasks` puts the header in its own slice so the interaction is verified in isolation. A regression here is visual and immediate, not silent |
| `SiteHeader` is shared, so making it sticky on `/` could make it sticky on `/contenidos` too | Low | Stickiness is applied at the call site via `className` (the prop already exists and `/contenidos` already uses it), not baked into the component. `/contenidos` keeps a static header |

## Rollback Plan

No persisted state, no migration — `git revert` of the slice commits restores prior behaviour.

Partial rollback is available and preferred, and follows the task slices: reverting `page.tsx` alone unmounts every new section while leaving the CTA-anchor fix (a standalone bug fix worth keeping) in place. New files roll back by deletion.

## Dependencies

- `landing-tokens-b` — **done/verified**. Supplies the field classes, `CtaButton` (`as="button"`), `SectionHeading`, `Disclosure`, `navigation.ts` and `jecAssets.iconos.ancla`. Not archived yet, so its spec deltas are still pending merge; archive order matters (see Modified Capabilities).
- Real content from the user, post-ship, to replace the placeholder copy in `faq/data.ts` and `ubicacion/data.ts` — a manual hand-edit, not a blocker for this change.

## Open Questions

All three resolved by the user on 2026-08-21; each recommendation below was adopted as-is.

**1. Field assignment per section — RESOLVED.**

`campo-papel` dominant (Cronograma, Ubicacion, Faq); `campo-tinta` reserved for the one deliberate inversion where contrast serves the content (Invitados — "invitado misterioso" reads as concealment); `campo-fuego` as a single rare accent block, used on exactly one of footer or sticky CTA, not both. `sdd-design` picks which of the two carries `campo-fuego`; both are consistent with this decision.

**2. Content gaps — RESOLVED (revised 2026-08-21).**

**(a) for FAQ and the street address**: both ship in this change, wired to real components, but backed by a `data.ts` holding placeholder copy the user replaces by hand afterward — not by the agent inventing final content. `faq/data.ts` exports the question/answer pairs `Faq.tsx` renders through `Disclosure`; `ubicacion/data.ts` exports the address fields `Ubicacion.tsx` renders in place of the inline `STREET_PLACEHOLDER` constant. Every placeholder string is unambiguously marked as such (e.g. `"Dirección por confirmar (placeholder)"`, `"Pregunta de ejemplo — reemplazar"`) so a leftover placeholder in production is obvious rather than passable as real content. **(b) for the footer**: ships with its structural parts only — nav links from `navItems`, a generic legal/copyright line — no invented tagline. `socialLinks` renders nothing while empty, per `landing-tokens-b` D7.

**3. Sticky CTA behaviour — RESOLVED.** Always visible on mobile, CSS-only. No client component added.

## Verification

No test runner exists (`openspec/config.yaml` `testing.test_runner.available: false`).

- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npm run build` passes
- Browser on `/`: `SiteHeader` is **not visible anywhere over the hero**, scrolls into view at the first section after it, then stays pinned; its logo and nav stay legible while it travels over every field, including `campo-tinta`; each nav anchor scrolls its section's heading to a position **below** the pinned header, not under it; all sections render in order, each on its assigned field; header, hero and sticky CTAs all reach `/inscripcion`; the `Ubicacion` CTA is legible and its "Cómo llegar" link opens the address `ubicacion/data.ts` displays; dates read 18/19/20 September 2026; `Faq` opens and closes with JavaScript disabled; sticky CTA does not obscure the footer at 320px width; keyboard focus is visible throughout
- Browser on `/contenidos` (regression check, page otherwise out of scope): the header's logo, nav links, hover and focus ring look as they do today
- `faq/data.ts` and `ubicacion/data.ts` content review: every value is unambiguously marked as placeholder (no plausible-but-fake claim shipped as if real)

## Success Criteria

- [x] `/` renders SiteHeader, Hero, Cronograma, Invitados, Ubicacion, Faq, SiteFooter — no unmounted section component remains in `components/external`
- [x] `SiteHeader` reads its colours from field tokens, not `--jec-*` literals, and renders legibly on both the paper field (`/`) and `campo-tinta` (`/contenidos`)
- [~] On `/`, the header is absent for the full height of the hero and pinned from the next section onward, with no client component, scroll listener or `IntersectionObserver` added — the second half is confirmed in code (`SiteHeader.tsx` has no `"use client"`, no scroll listener, no `IntersectionObserver`); the visual half is the one browser check still open, tracked as tasks 1.7 / 8.2
- [x] Every home anchor target carries `scroll-margin-top`; no section heading lands under the pinned header
- [x] Zero `/#inscripcion` references remain in `src/`; every CTA resolves to a live route
- [x] Zero `bg-[var(--jec-ink)]` literals remain in the sections this change owns; each sets its surface via a `campo-*` class
- [x] `Ubicacion`'s CTA passes contrast on its field
- [x] Schedule dates agree with `siteConfig.eventStartsAt`
- [x] `InvitadoCard` is a Server Component with no `useState` and no `/jec/oradores/*` path
- [x] `MapaSimulado` renders with no external network request
- [x] `SiteFooter` renders every `navItem` and nothing for an empty `socialLinks`
- [x] `Faq` renders from `faq/data.ts`; `Ubicacion` address renders from `ubicacion/data.ts`; both files hold clearly-marked placeholder copy, no invented-but-plausible content
- [x] No `.jec-display` below 34px remains on `/` — covers `HeroCountdown.tsx:70` and `Ubicacion.tsx:26`. `InvitadoCard`'s large "?" glyph keeps `.jec-display` per landing-tokens-b D9
- [x] `npx tsc --noEmit`, `npm run lint` and `npm run build` pass
