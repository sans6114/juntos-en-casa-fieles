# Tasks: Landing Home Secciones — compose `/` on the direction B field system

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~590 (design estimate; per-slice breakdown below) |
| Review budget (session) | 800 |
| 400-line budget risk | High (single PR: 590 source + OpenSpec artifacts pushes past 800) |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (Header) → PR 2 (Schedule) → PR 3 (Guests) → PR 4 (Location+map) → PR 5 (FAQ) → PR 6 (Footer+CTA) → PR 7 (CTA target) |
| Delivery strategy | ask-on-risk |
| Chain strategy | stacked-to-main (recommended — every slice is independently shippable per design's Slice Map and Migration/Rollout section; confirm with user before `sdd-apply`) |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: stacked-to-main
400-line budget risk: High

Per-slice estimate (all seven land under 250, matching design's Review Budget section): Header ~85, Schedule ~40, Guests ~175 (InvitadoCard rewrite ≈143 dominates), Location+map ~140 (Ubicacion rewrite ≈70 + new MapaSimulado/data.ts), FAQ ~55, Footer+CTA ~75, CTA target ~20. Sum ≈590.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Header: sticky/pinned, `logo` prop, `.jec-anchor` CSS, `/contenidos` exception | PR 1 | `npx tsc --noEmit && npm run lint` | Browser: slow-scroll `/` through the 255vh hero track; 320px nav-wrap check; `/contenidos` side-by-side | `git revert` PR 1 — unmounts `SiteHeader` from `/`, reverts `SiteHeader.tsx` and `contenidos/page.tsx:15` |
| 2 | Cronograma mount, corrected dates, field class | PR 2 | `npx tsc --noEmit && npm run lint` | Browser: `/#cronograma` direct nav at 375px/1280px | `git revert` PR 2 — unmounts `<Cronograma />`; PR 1 unaffected |
| 3 | Invitados mount, static `InvitadoCard` rewrite | PR 3 | `npx tsc --noEmit && npm run lint` + `rg "/jec/oradores" src` (zero hits) | Browser: `/#invitados`; keyboard tab-through confirms no reveal state | `git revert` PR 3 — unmounts `<Invitados />`, restores prior `InvitadoCard` |
| 4 | Ubicacion mount, `MapaSimulado`, `ubicacion/data.ts` | PR 4 | `npx tsc --noEmit && npm run lint` | Browser: `/#ubicacion`; Network tab shows zero external requests; "Cómo llegar" link | `git revert` PR 4 — unmounts `<Ubicacion />`, deletes new files |
| 5 | Faq mount, `Disclosure` composition | PR 5 | `npx tsc --noEmit && npm run lint` | Browser: Faq opens/closes with JavaScript disabled | `git revert` PR 5 — unmounts `<Faq />`, deletes new files |
| 6 | SiteFooter + StickyCta mount | PR 6 | `npx tsc --noEmit && npm run lint` | Browser: 320px scrolled to footer; iOS device/simulator safe-area check | `git revert` PR 6 — unmounts both, removes `--jec-cta-h` |
| 7 | CTA target repoint, display-type fix | PR 7 | `npx tsc --noEmit && npm run lint` + `rg "/#inscripcion" src` (zero hits) | Browser: activate header nav, hero finale CTA, sticky bar → all resolve to `/inscripcion` | `git revert` PR 7 — restores `/#inscripcion` references and the `sr-only` placeholder |

## Phase 1: Header (D1, D2, D3) — lands first, only slice touching `/contenidos`

- [x] 1.1 `src/app/globals.css`: inside `.jec-landing`, add `--jec-header-h: 80px;` and a `@media (min-width: 768px)` override to `104px`; add `.jec-landing .jec-anchor { scroll-margin-top: calc(var(--jec-header-h) + 0.5rem); }`
- [x] 1.2 `.../shared/SiteHeader.tsx`: add `logo?: keyof typeof logoSrc` prop, `const logoSrc = { light: jecAssets.logos.ivsWhite, dark: jecAssets.logos.ivsBlack } as const`, default `"light"`
- [x] 1.3 `.../shared/SiteHeader.tsx`: rewrite `navLinkClass` onto field tokens — `text-[var(--dato)] hover:text-[var(--acento)] focus-visible:outline-[var(--foco)]`
- [x] 1.4 `src/app/(external)/page.tsx`: mount `<SiteHeader logo="dark" className="campo-papel sticky top-0 z-50 min-h-[var(--jec-header-h)] pb-6 md:pb-8" />` immediately after `<Hero />` — **`min-h-[var(--jec-header-h)]` is not optional** (D3, matches D6's CTA reserve invariant)
- [x] 1.5 `src/app/(external)/contenidos/page.tsx:15`: swap the `bg-[var(--jec-ink)]` literal on `<SiteHeader className="... pb-2" />` for `campo-tinta` — the one forced out-of-scope exception
- [x] 1.6 `npx tsc --noEmit && npm run lint`
- [ ] 1.7 Verify browser: slow-scroll `/` through the 255vh hero track — header not visible anywhere over the hero, scrolls in and pins from the first post-hero section onward, no client component/scroll listener/`IntersectionObserver` added
- [ ] 1.8 Verify at 320px viewport: only `essential: true` nav links render below `md`; confirm they do **not** wrap onto a second line (D2 — `min-h` is a floor, not a clamp; if it wraps, `--jec-header-h` must go up)
- [ ] 1.9 Verify browser `/contenidos`: logo, nav colors, hover, and focus ring match today's appearance (regression check for the forced exception)
- [ ] 1.10 Verify keyboard tab-through: focus reaching a header nav link while the hero is on screen scrolls the header into view, no `aria-hidden`/`display: none`/negative `tabindex`
- [ ] 1.11 Rollback: `git revert` this slice's commit(s) — unmounts `SiteHeader` from `/`, reverts `SiteHeader.tsx` prop/token changes and `contenidos/page.tsx:15`; no dependency on later slices

## Phase 2: Schedule (D4)

- [x] 2.1 `.../cronograma/data.ts`: correct day labels to `"Viernes 18"` / `"Sábado 19"` / `"Domingo 20"`; add `// Fuente de verdad: siteConfig.eventStartsAt`
- [x] 2.2 `.../cronograma/Cronograma.tsx`: field class → `campo-papel`; add `jec-anchor` to the section wrapper's className — `id="cronograma"` already exists at `Cronograma.tsx:9`, do not duplicate it
- [x] 2.3 `.../cronograma/CronogramaDiaCard.tsx`: swap remaining `text-[var(--jec-*)]` literals onto field tokens
- [x] 2.4 `src/app/(external)/page.tsx`: mount `<Cronograma />` after `<SiteHeader />`
- [x] 2.5 `npx tsc --noEmit && npm run lint`
- [ ] 2.6 Verify browser: `/#cronograma` direct nav lands the heading fully below the pinned header at 375px and 1280px; dates read 18/19/20 September 2026 Fri/Sat/Sun
- [ ] 2.7 Rollback: `git revert` this slice's commit — removes `<Cronograma />` mount and its field-class/date edits; Phase 1 unaffected

## Phase 3: Guests (D8)

- [x] 3.1 `.../invitados/data.ts`: narrow `Invitado` to `{ id: string; name: string }`; drop the six `/jec/oradores/*` paths and per-guest `accent`; remove `// TODO(landing-home-secciones)`
- [x] 3.2 `.../invitados/InvitadoCard.tsx`: rewrite as a Server Component — delete `"use client"`, the three `useState`, `useId`, and the reveal mechanic; `<article className="border border-[var(--linea)]">` with `?` glyph (`.jec-display text-7xl md:text-8xl text-[var(--acento)]`, 72–96px, above the 34px floor) and the guest name as caption (`.jec-label`)
- [x] 3.3 `.../invitados/Invitados.tsx`: field class → `campo-tinta`; add `jec-anchor` to the section wrapper's className — `id="invitados"` already exists at `Invitados.tsx:9`, do not duplicate it
- [x] 3.4 `src/app/(external)/page.tsx`: mount `<Invitados />` after `<Cronograma />`
- [x] 3.5 `npx tsc --noEmit && npm run lint` + `rg "/jec/oradores" src` — zero hits; confirm no `useState`/`"use client"` remains in `InvitadoCard.tsx`
- [ ] 3.6 Verify browser: `/#invitados` heading clears the pinned header at 375px/1280px; cards show no hover/click/focus reveal state; `?` glyph still `.jec-display`
- [ ] 3.7 Rollback: `git revert` this slice's commit — removes `<Invitados />` mount, restores the prior interactive `InvitadoCard`; Phases 1-2 unaffected

## Phase 4: Location + map (D7, D9 ubicacion)

- [ ] 4.1 NEW `.../ubicacion/data.ts`: `export type UbicacionInfo = { venue: string; street: string; city: string; mapsUrl: string }`; `venue`/`city` mirror `siteConfig.org`/`siteConfig.city`; build `mapsUrl` here from those two fields (query `"…Vida Sobrenatural La Plata, Buenos Aires"`); exclude `street` from the query with a comment to add it once a real address lands; `street` value is an explicit, visibly-marked placeholder
- [ ] 4.2 NEW `.../ubicacion/MapaSimulado.tsx`: inline `<svg>` decorative figure — streets from `--linea`, main axis from `--regla`, `jecAssets.iconos.ancla` as the pin via `<image href=…>`; `role="presentation" aria-hidden="true" focusable="false"`; `<figcaption>` "Ilustración de referencia — no es un mapa a escala."; no `prefers-reduced-motion` guard needed (nothing animates)
- [ ] 4.3 `.../ubicacion/index.ts`: barrel-export `MapaSimulado` and `data.ts`'s exports
- [ ] 4.4 `.../ubicacion/Ubicacion.tsx`: field class → `campo-papel`; add `jec-anchor` to the section className (`id="ubicacion"` already exists at line 13, do not duplicate it); read all four `UbicacionInfo` fields from `data.ts` instead of the inline `STREET_PLACEHOLDER` constant and the locally-built `mapsQuery`/`mapsUrl` (lines 7-8); mount `<MapaSimulado />`; swap line 26's `.jec-display` (`text-xl md:text-2xl`) for `.jec-label`
- [ ] 4.5 `src/app/(external)/page.tsx`: mount `<Ubicacion />` after `<Invitados />`
- [ ] 4.6 `npx tsc --noEmit && npm run lint`
- [ ] 4.7 Verify browser: `/#ubicacion` heading clears the pinned header at 375px/1280px; Network tab shows zero external map requests; `Ubicacion`'s CTA passes field contrast (not background-on-background); "Cómo llegar" opens the address `data.ts` builds
- [ ] 4.8 Verify content: `ubicacion/data.ts`'s `street` placeholder is unambiguously marked in the **rendered text**, not only in a code comment
- [ ] 4.9 Rollback: `git revert` this slice's commit — removes `<Ubicacion />` mount and deletes `MapaSimulado.tsx`/`data.ts`; Phases 1-3 unaffected

## Phase 5: FAQ (D9 faq)

- [ ] 5.1 NEW `.../faq/data.ts`: `export type FaqItem = { id: string; question: string; answer: string }`; `export const faqItems: readonly FaqItem[]` with placeholder question/answer pairs, each unambiguously marked (e.g. "Pregunta de ejemplo — reemplazar")
- [ ] 5.2 NEW `.../faq/Faq.tsx`: Server Component, `campo-papel` on the section surface, `id="faq" className="jec-anchor"`; maps `faqItems` to `<Disclosure summary={item.question} className="[&>summary]:flex [&>summary]:items-center [&>summary]:justify-between border-b border-[var(--linea)]"><p className="text-[var(--suave)]">{item.answer}</p></Disclosure>`
- [ ] 5.3 NEW `.../faq/index.ts`: barrel-export `Faq`
- [ ] 5.4 `src/app/(external)/page.tsx`: mount `<Faq />` after `<Ubicacion />`; confirm `navigation.ts`'s `navItems` gains **no** Faq entry (user decision 2026-08-21 — Faq is reached by scrolling `/` only)
- [ ] 5.5 `npx tsc --noEmit && npm run lint`
- [ ] 5.6 Verify browser: `Faq` opens and closes with JavaScript disabled (native `<details>/<summary>`); no Faq entry appears in `SiteHeader` or `SiteFooter` nav
- [ ] 5.7 Verify content: every `faq/data.ts` entry's rendered text is unambiguously marked as placeholder
- [ ] 5.8 Rollback: `git revert` this slice's commit — removes `<Faq />` mount and deletes the new `faq/` files; Phases 1-4 unaffected

## Phase 6: Footer + sticky CTA (D5, D6)

- [ ] 6.1 `src/app/globals.css`: inside `.jec-landing`, add `--jec-cta-h: 4.5rem;`
- [ ] 6.2 NEW `.../shared/SiteFooter.tsx`: `campo-fuego` surface; renders every `navItems` entry regardless of `essential`; renders nothing for `socialLinks` while empty; structural nav + generic legal/copyright line only, no invented tagline; `pb-[calc(var(--jec-cta-h)+env(safe-area-inset-bottom,0px))] md:pb-…` reserve
- [ ] 6.3 NEW `.../shared/StickyCta.tsx`: `fixed inset-x-0 bottom-0 z-40 md:hidden`, `campo-tinta`, `border-t-[3px] border-[var(--regla)]`, **`min-h-[var(--jec-cta-h)]`** (not optional — D6: makes the footer reserve honest, mirrors the header's `min-h` invariant), one `CtaButton` targeting `/inscripcion`
- [ ] 6.4 `.../shared/index.ts`: barrel-export `SiteFooter`, `StickyCta`
- [ ] 6.5 `src/app/(external)/page.tsx`: mount `<SiteFooter />` after `<Faq />`, then `<StickyCta />` last — after `SiteFooter`, so it never interrupts the Hero→…→SiteFooter reading order
- [ ] 6.6 `npx tsc --noEmit && npm run lint`
- [ ] 6.7 Verify browser at 320px scrolled to the footer: sticky CTA bar is visible and does not overlap footer content (reserve + `min-h` match; if the label wraps at 320px the bar grows past the reserve — check this explicitly, it is load-bearing not cosmetic)
- [ ] 6.8 Verify browser: `SiteFooter` renders every `navItems` entry, no social-link element (empty `socialLinks`), no Faq entry
- [ ] 6.9 Verify on a real iOS device (or simulator): `env(safe-area-inset-bottom)` is a no-op today (no `viewportFit: "cover"` in `layout.tsx`), so the bar is not under the home indicator
- [ ] 6.10 Rollback: `git revert` this slice's commit — removes `<SiteFooter />`/`<StickyCta />` mounts, deletes the two new files, removes `--jec-cta-h`; Phases 1-5 unaffected

## Phase 7: CTA target + display type (Hero, HeroFinale, HeroCountdown, navigation.ts)

- [ ] 7.1 `.../hero/Hero.tsx:16`: delete the `sr-only` `#inscripcion` placeholder div
- [ ] 7.2 `.../hero/HeroFinale.tsx:258`: repoint the CTA `href` from `/#inscripcion` to `/inscripcion`
- [ ] 7.3 `.../hero/HeroCountdown.tsx:70`: swap `.jec-display` for `.jec-label` (10.4px violation; component is exported but mounted nowhere — fix applies regardless)
- [ ] 7.4 `.../shared/navigation.ts:19`: `"Inscribirme"` entry's `href` from `/#inscripcion` to `/inscripcion`
- [ ] 7.5 `rg "/#inscripcion" src` — zero hits across the full `src/` tree
- [ ] 7.6 `npx tsc --noEmit && npm run lint`
- [ ] 7.7 Verify browser: header nav, hero finale CTA, and sticky mobile bar all navigate to `/inscripcion`; no `.jec-display` below 34px remains on `/` (covers `HeroCountdown.tsx:70`; `Ubicacion.tsx:26` fixed in Phase 4; `InvitadoCard`'s "?" glyph keeps `.jec-display` per Phase 3)
- [ ] 7.8 Rollback: `git revert` this slice's commit — restores the `/#inscripcion` references and the `sr-only` placeholder div; Phases 1-6 unaffected (each CTA still resolves somewhere, just to the dead anchor again)

## Phase 8: Final verification (Testing Strategy)

- [ ] 8.1 Static: `npx tsc --noEmit`, `npm run lint`, `npm run build`; `rg` for `bg-\[var\(--jec-` and `text-\[var\(--jec-` inside `src/components/external` surfaces this change owns — zero hits (excluding out-of-scope `InscripcionForm.tsx`, `CongregacionCombobox.tsx`, `ContenidosGrid.tsx`)
- [ ] 8.2 Layout: browser slow-scroll through the full 255vh hero track — header invisible over hero, not painted under `HeroFinale` at the 2.55× handoff, pinned for the rest of the page
- [ ] 8.3 Anchors: `/#cronograma`, `/#invitados`, `/#ubicacion` (direct URL) land the heading fully below the pinned header at 375px and 1280px
- [ ] 8.4 A11y: keyboard tab-through — header focusable and scrolled into view while the hero is on screen, no `aria-hidden`/`display: none`/negative `tabindex`; `MapaSimulado` not announced by AT
- [ ] 8.5 Mobile: CTA bar visible at every scroll position and clear of footer content at 320px; confirm on a real iOS device per D6's `env()` note
- [ ] 8.6 Regression: `/contenidos` side-by-side — logo, nav, hover, focus ring match today's appearance
- [ ] 8.7 Content: read `faq/data.ts` and `ubicacion/data.ts` end to end — every placeholder value visibly marked in its rendered text
- [ ] 8.8 Confirm final document order in `page.tsx`: Hero, SiteHeader, Cronograma, Invitados, Ubicacion, Faq, SiteFooter, StickyCta — exactly once each, matching Requirement 1
- [ ] 8.9 Walk every `proposal.md` Success Criteria checkbox against the shipped state before closing the change
