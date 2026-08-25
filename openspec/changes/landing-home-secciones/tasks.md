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
- [ ] 1.7 Verify browser: slow-scroll `/` through the 255vh hero track — header not visible anywhere over the hero, scrolls in and pins from the first post-hero section onward. **Verificado en código 2026-08-24**: `SiteHeader` sits after `<Hero />` in `page.tsx` flow with `sticky top-0`, and the file contains no `"use client"`, no scroll listener and no `IntersectionObserver` — that half of the task is proven. **Pendiente de navegador**: only the visual pass over the 255vh track remains
- [x] 1.8 ~~Verify at 320px viewport: only `essential: true` nav links render below `md`~~ — **superseded**. Hiding three of five links below `md` left `#cronograma`, `#invitados` and `#ubicacion` unreachable on phones. `essential` is gone; every entry now renders at every breakpoint, below `md` inside the `:target` menu panel (commit `8016828`). Nothing can wrap, so the wrap check no longer applies. `--jec-header-h` was measured and raised 80px → 92px (pt-6 24 + 44px touch target + pb-6 24), which D2's "the variable follows the real height" rule required
- [ ] 1.9 Verify browser `/contenidos`: logo, nav colors, hover, and focus ring match today's appearance (regression check for the forced exception). **Pendiente de navegador** — a side-by-side visual diff cannot be produced without a viewport; `campo-tinta` resolves to the same bone/amber the removed literals produced, but that is the claim under test
- [ ] 1.10 Verify keyboard tab-through: focus reaching a header nav link while the hero is on screen scrolls the header into view. **Verificado en código 2026-08-24**: `SiteHeader.tsx` carries no `aria-hidden` and no negative `tabindex`; the only `display: none` is `.jec-menu-movil` while closed and the desktop nav's `hidden md:flex`, and every entry stays reachable at every breakpoint (the `:target` panel below `md`, the inline nav from `md` up) — the attribute half is proven. **Pendiente de navegador**: the scroll-into-view behaviour on focus
- [x] 1.11 Rollback boundary recorded: `59d96cb` (header slice) + `542796b` (vector wordmarks) + `8016828` (`:target` mobile menu, which also raised `--jec-header-h` to 92px). Reverting all three unmounts `SiteHeader` from `/` and restores `contenidos/page.tsx:15`; no later slice depends on them

## Phase 2: Schedule (D4)

- [x] 2.1 `.../cronograma/data.ts`: correct day labels to `"Viernes 18"` / `"Sábado 19"` / `"Domingo 20"`; add `// Fuente de verdad: siteConfig.eventStartsAt`
- [x] 2.2 `.../cronograma/Cronograma.tsx`: field class → `campo-papel`; add `jec-anchor` to the section wrapper's className — `id="cronograma"` already exists at `Cronograma.tsx:9`, do not duplicate it
- [x] 2.3 `.../cronograma/CronogramaDiaCard.tsx`: swap remaining `text-[var(--jec-*)]` literals onto field tokens
- [x] 2.4 `src/app/(external)/page.tsx`: mount `<Cronograma />` after `<SiteHeader />`
- [x] 2.5 `npx tsc --noEmit && npm run lint`
- [ ] 2.6 Verify browser: `/#cronograma` direct nav lands the heading fully below the pinned header at 375px and 1280px. **Verificado en código 2026-08-24**: the date half is settled — `data.ts` reads `Viernes 18`/`Sábado 19`/`Domingo 20`, and `Intl` over `siteConfig.eventStartsAt` (`2026-09-18T19:00:00-03:00`) returns `viernes, 18 de septiembre de 2026`, so the labels agree with the source of truth. `Cronograma.tsx:11` carries `jec-anchor` and `globals.css:197` gives it `scroll-margin-top: calc(var(--jec-header-h) + 0.5rem)`. **Pendiente de navegador**: the two-viewport landing check
- [x] 2.7 Rollback boundary recorded: `0ad94bf` (mount + field class) + `c6d7665` (`Sábado 13` → `Sábado 19`). Reverting both removes the `<Cronograma />` mount and its date edits; Phase 1 unaffected

## Phase 3: Guests (D8)

- [x] 3.1 `.../invitados/data.ts`: narrow `Invitado` to `{ id: string; name: string }`; drop the six `/jec/oradores/*` paths and per-guest `accent`; remove `// TODO(landing-home-secciones)`
- [x] 3.2 `.../invitados/InvitadoCard.tsx`: rewrite as a Server Component — delete `"use client"`, the three `useState`, `useId`, and the reveal mechanic; `<article className="border border-[var(--linea)]">` with `?` glyph (`.jec-display text-7xl md:text-8xl text-[var(--acento)]`, 72–96px, above the 34px floor) and the guest name as caption (`.jec-label`)
- [x] 3.3 `.../invitados/Invitados.tsx`: field class → `campo-tinta`; add `jec-anchor` to the section wrapper's className — `id="invitados"` already exists at `Invitados.tsx:9`, do not duplicate it
- [x] 3.4 `src/app/(external)/page.tsx`: mount `<Invitados />` after `<Cronograma />`
- [x] 3.5 `npx tsc --noEmit && npm run lint` + `rg "/jec/oradores" src` — zero hits; confirm no `useState`/`"use client"` remains in `InvitadoCard.tsx`
- [ ] 3.6 Verify browser: `/#invitados` heading clears the pinned header at 375px/1280px. **Verificado en código 2026-08-24**: the reveal-state half is proven — `InvitadoCard.tsx` has no `"use client"` and no `useState`, so no hover/click/focus state can exist; its `?` glyph keeps `.jec-display` at `text-7xl md:text-8xl` (72–96px). `Invitados.tsx:11` carries `jec-anchor`. **Pendiente de navegador**: the two-viewport landing check
- [x] 3.7 Rollback boundary recorded: `8f26f5c` — single commit, removes the `<Invitados />` mount and restores the prior interactive `InvitadoCard`; Phases 1-2 unaffected

## Phase 4: Location + map (D7, D9 ubicacion)

- [x] 4.1 NEW `.../ubicacion/data.ts`: `export type UbicacionInfo = { venue: string; street: string; city: string; mapsUrl: string }`; `venue`/`city` mirror `siteConfig.org`/`siteConfig.city`; build `mapsUrl` here from those two fields (query `"…Vida Sobrenatural La Plata, Buenos Aires"`); exclude `street` from the query with a comment to add it once a real address lands; `street` value is an explicit, visibly-marked placeholder
- [x] 4.2 NEW `.../ubicacion/MapaSimulado.tsx`: inline `<svg>` decorative figure — ~~streets from `--linea`, main axis from `--regla`, `jecAssets.iconos.ancla` as the pin via `<image href=…>`~~ — **superseded 2026-08-24**. `<image href>` pointed at `/jec/iconos/ancla.png`, a 48×48 raster stretched to full width that inherits neither `currentColor` nor any field token: the one element of the figure that did not answer to the field. The pin is now drawn inline with `--acento`/`--regla`/`--sup`. Strokes also moved off `--linea` (ink at 12% in `campo-papel`, effectively invisible) onto `--regla` with explicit per-group opacity. The figure now draws La Plata's real plan — orthogonal grid plus 45° diagonal avenues — so the illustration is true rather than arbitrary. `role="presentation" aria-hidden="true" focusable="false"` and the `<figcaption>` stay; no `prefers-reduced-motion` guard needed (nothing animates)
- [x] 4.3 `.../ubicacion/index.ts`: barrel-export `MapaSimulado` and `data.ts`'s exports
- [x] 4.4 `.../ubicacion/Ubicacion.tsx`: field class → `campo-papel`; add `jec-anchor` to the section className (`id="ubicacion"` already exists at line 13, do not duplicate it); read all four `UbicacionInfo` fields from `data.ts` instead of the inline `STREET_PLACEHOLDER` constant and the locally-built `mapsQuery`/`mapsUrl` (lines 7-8); mount `<MapaSimulado />`; swap line 26's `.jec-display` (`text-xl md:text-2xl`) for `.jec-label`
- [x] 4.5 `src/app/(external)/page.tsx`: mount `<Ubicacion />` after `<Invitados />`
- [x] 4.6 `npx tsc --noEmit && npm run lint`
- [ ] 4.7 Verify browser: `/#ubicacion` heading clears the pinned header at 375px/1280px. **Verificado en código 2026-08-24**: three of the four checks are settled without a viewport. (a) Zero external map requests — `MapaSimulado.tsx` is inline `<svg>` with no `<image href>` and no external URL; the only outbound URL under `ubicacion/` is `data.ts`'s `mapsUrl`, which is a link target, not a fetch. (b) CTA contrast — on `campo-papel` the button is `--cta-bg: --jec-ink` (`#0b0a0f`) on `--cta-fg: --jec-bone` (`#f4efe8`) = **17,25:1**, a filled button on a bone surface, so it is not background-on-background. (c) "Cómo llegar" resolves to `ubicacionInfo.mapsUrl`, built in `data.ts` from `siteConfig.org` + `siteConfig.city`. **Pendiente de navegador**: the two-viewport landing check
- [x] 4.8 Verify content: `ubicacion/data.ts`'s `street` placeholder is unambiguously marked in the **rendered text**, not only in a code comment
- [x] 4.9 Rollback boundary recorded: `d40ba92` (mount + `MapaSimulado` + `data.ts`) + `936b500` (the redesign that vectorised the map and dropped the raster pin). Reverting both removes the `<Ubicacion />` mount and the new files; Phases 1-3 unaffected. Note the boundary is two commits, not one, because the redesign landed after the slice

## Phase 5: FAQ (D9 faq)

- [x] 5.1 NEW `.../faq/data.ts`: `export type FaqItem = { id: string; question: string; answer: string }`; `export const faqItems: readonly FaqItem[]` with placeholder question/answer pairs, each unambiguously marked (e.g. "Pregunta de ejemplo — reemplazar")
- [x] 5.2 NEW `.../faq/Faq.tsx`: Server Component, `campo-papel` on the section surface, `id="faq" className="jec-anchor"`; maps `faqItems` to `<Disclosure summary={item.question} className="[&>summary]:flex [&>summary]:items-center [&>summary]:justify-between border-b border-[var(--linea)]"><p className="text-[var(--suave)]">{item.answer}</p></Disclosure>`
- [x] 5.3 NEW `.../faq/index.ts`: barrel-export `Faq`
- [x] 5.4 `src/app/(external)/page.tsx`: mount `<Faq />` after `<Ubicacion />`; confirm `navigation.ts`'s `navItems` gains **no** Faq entry (user decision 2026-08-21 — Faq is reached by scrolling `/` only)
- [x] 5.5 `npx tsc --noEmit && npm run lint`
- [x] 5.6 **Verificado en código 2026-08-24** — no viewport needed for either half. `Disclosure.tsx:13-14` renders native `<details>`/`<summary>` and neither it nor `Faq.tsx` carries `"use client"`, so open/close is browser-native and works with JavaScript disabled by construction. `navigation.ts`'s `navItems` holds exactly five entries (Cronograma, Invitados, Ubicación, Contenidos, Inscribirme) and no Faq entry, and both `SiteHeader` and `SiteFooter` map that same array — confirmed in the prerendered `/` HTML, which contains zero `href="/#faq"`
- [x] 5.7 Verify content: every `faq/data.ts` entry's rendered text is unambiguously marked as placeholder
- [x] 5.8 Rollback boundary recorded: `c4cce41` — single commit, removes the `<Faq />` mount and deletes the new `faq/` files; Phases 1-4 unaffected

## Phase 6: Footer + sticky CTA (D5, D6)

- [x] 6.1 `src/app/globals.css`: inside `.jec-landing`, add `--jec-cta-h: 4.5rem;`
- [x] 6.2 NEW `.../shared/SiteFooter.tsx`: ~~`campo-fuego` surface~~ **`campo-tinta`** (user decision 2026-08-24). `campo-fuego` defines `--dato`, `--suave` and `--acento` as the same ink (`globals.css:235-237`), so the footer's `hover:text-[var(--acento)]` changed nothing and its `--suave` copyright was indistinguishable from the nav. Measured: a fuego `--suave` only clears AA past 75% opacity (4,58:1) against ink's 6,31:1 — a very narrow band. `campo-tinta` gives the three levels outright: bone 17,25:1 / smoke 7,58:1 / green 15,54:1. Also gains the wordmark, a three-column layout (brand / sections / action) and a colour-independent hover — a 3px bottom rule in `--regla`, which contrasts with `--sup` in every field. The `cta` entry renders as a `CtaButton`, mirroring SiteHeader's mobile menu; every `navItems` entry still renders. Unchanged from the original task: renders every `navItems` entry (the `essential` flag no longer exists — see 1.8 — so no filtering is needed; `NavItem` now carries `cta?: boolean`, set only on "Inscribirme"), renders nothing for `socialLinks` while empty, and carries no invented tagline — the brand column shows `siteConfig.org`/`siteConfig.city`, which are structural identity, not copy. ~~`pb-[calc(var(--jec-cta-h)+…)]` reserve~~ **removed**: `StickyCta` is `sticky`, not `fixed` (see 6.3), so it reserves its own space in flow and the footer no longer compensates for it. Bottom padding is now `pb-[calc(3rem+env(safe-area-inset-bottom,0px))] md:pb-12`
- [x] 6.2b Mount `SiteFooter` on `/contenidos`, `/contenidos/[slug]` and `/inscripcion` too. Those pages were redesigned ahead of this slice (commits `8546a4e`, `ce991c4`, `0a3e7ea`) and deliberately end on their closing section, because duplicating a footer before this slice existed would have guaranteed a conflict. **Done** — plain `<SiteFooter />` on `/inscripcion` and `/contenidos/[slug]` (both close on a non-`campo-fuego` surface). ~~On `/contenidos` the footer is mounted with a `border-t-[3px]` rule~~ — **no longer needed**: with the footer on `campo-tinta` (see 6.2) the field change alone separates it from that page's `campo-fuego` closing band, so all three mounts are a plain `<SiteFooter />`. `StickyCta` is deliberately **not** mounted on these three pages (D6 scopes it to `/`), and the dead bottom-padding that used to leave behind is gone too, since 6.3 removed the reserve
- [x] 6.3 NEW `.../shared/StickyCta.tsx`: ~~`fixed inset-x-0 bottom-0`, `campo-tinta`~~ → **`sticky bottom-0`, `campo-fuego`** (user decisions 2026-08-24). Two changes, two reasons. **Field**: the spec requires exactly one of SiteFooter/CTA bar to carry `campo-fuego`; with the footer on tinta the ember moves here, which is also where DESIGN.md wants the brasa — as a block of colour behind the action. **Positioning**: `fixed` painted the bar over the hero, where `HeroFinale.tsx:258` already renders an "Inscribirme" CTA *and* the background is `--jec-ember` (`HeroFinale.tsx:162`), so the ember bar sat ember-on-ember beside a duplicate CTA. As the last child of `page.tsx`'s post-hero wrapper, `sticky bottom-0` keeps it out of the viewport during the hero, pins it for the rest of the page, and lands it in flow below the footer at rest. Still `z-40 md:hidden`, `border-t-[3px] border-[var(--regla)]`, **`min-h-[var(--jec-cta-h)]`**, one `CtaButton` targeting `/inscripcion`. **Needs a spec delta**: Requirement "Persistent mobile CTA to inscription" says the bar must stay visible *at any scroll position*, which no longer holds over the hero
- [x] 6.4 `.../shared/index.ts`: barrel-export `SiteFooter`, `StickyCta`
- [x] 6.5 `src/app/(external)/page.tsx`: mount `<SiteFooter />` after `<Faq />`, then `<StickyCta />` last — after `SiteFooter`, so it never interrupts the Hero→…→SiteFooter reading order
- [x] 6.6 `npx tsc --noEmit && npm run lint`
- [ ] 6.7 Verify browser at 320px: (a) the CTA bar is **not** painted over the hero; (b) it is pinned to the viewport bottom through the page body; (c) at the end it sits **below** the footer in flow; (d) the label fits one line at 320px. **Verificado en código 2026-08-24**: the prerendered `/` HTML contains exactly one `campo-fuego sticky` element, and it is the last child of the post-hero wrapper `<div>`, after `<footer>` — so the flow position behind (a) and (c) is structurally as designed. **Pendiente de navegador**: (a)/(b)/(c) as rendered behaviour and (d) the label wrap, all of which need a real 320px viewport
- [x] 6.8 **Verificado en código 2026-08-24** in the prerendered `/` HTML — no viewport needed. The footer renders all five `navItems` entries (four as links in the "Secciones" column, `Inscribirme` as the `CtaButton` in "Sumate"), zero social `<ul>` elements (`socialLinks` is `[]`, and the render is guarded by `socialLinks.length > 0`), and no Faq entry
- [x] 6.9 **Verificado en código 2026-08-24** — the premise is confirmed and it settles the check. `src/app/layout.tsx:26-28` exports `viewport` with `colorScheme: "only light"` only: there is no `viewportFit: "cover"`, so the page never extends under the home indicator and `env(safe-area-inset-bottom)` resolves to `0px`. `StickyCta` is additionally `sticky` in flow, not `fixed`. A device pass is worth doing if `viewportFit` is ever added; today there is nothing for it to catch
- [x] 6.10 Rollback boundary recorded: `51b817d` (footer + CTA bar) + `4105da2` (barrel exports) + `3e41e41` (footer on the other three pages) + `611ab76` (footer → `campo-tinta`, brasa → CTA bar). Reverting all four removes both mounts, deletes the two new files and drops `--jec-cta-h`; Phases 1-5 unaffected. Four commits, not one — the closing redesign landed after the slice

## Phase 7: CTA target + display type (Hero, HeroFinale, HeroCountdown, navigation.ts)

- [x] 7.1 `.../hero/Hero.tsx:16`: delete the `sr-only` `#inscripcion` placeholder div
- [x] 7.2 `.../hero/HeroFinale.tsx:258`: repoint the CTA `href` from `/#inscripcion` to `/inscripcion`
- [x] 7.3 `.../hero/HeroCountdown.tsx:70`: swap `.jec-display` for `.jec-label` (10.4px violation; component is exported but mounted nowhere — fix applies regardless)
- [x] 7.4 `.../shared/navigation.ts:19`: `"Inscribirme"` entry's `href` from `/#inscripcion` to `/inscripcion`
- [x] 7.5 `rg "/#inscripcion" src` — zero hits across the full `src/` tree
- [x] 7.6 `npx tsc --noEmit && npm run lint`
- [x] 7.7 **Verificado en código 2026-08-24** in the prerendered `/` HTML — no viewport needed. The rendered body holds five `href="/inscripcion"` targets and zero `/#inscripcion`: header desktop nav, header `:target` menu, `HeroFinale` CTA, footer `CtaButton`, `StickyCta`. All are plain `href`s to a route the build emits (`○ /inscripcion`). On `/`, the surviving `.jec-display` uses are `HeroCountdown.tsx:67` (`text-4xl`, 36px), `HeroSequence.tsx:270` (`clamp(2.25rem,9vw,5.5rem)`), `HeroFinale.tsx:197` (`clamp(3rem,15vw,9rem)`) and `InvitadoCard.tsx:10` (`text-7xl md:text-8xl`) — all at or above the 34px floor.
  - Out of scope but worth recording: `src/app/(external)/inscripcion/ui/InscripcionForm.tsx:75` still sets `.jec-display text-2xl sm:text-3xl` (24px/30px), below the floor. It lives on `/inscripcion`, which this change does not own, so it is left untouched here
- [x] 7.8 Rollback boundary recorded: `8016828` (CTA repoint, shared with the mobile-menu work) + `936983d` (countdown `.jec-display` → `.jec-label`). Reverting restores the `/#inscripcion` references and the `sr-only` placeholder div; Phases 1-6 unaffected. Note the repoint is not isolated in its own commit — reverting `8016828` also removes the `:target` mobile menu

## Phase 8: Final verification (Testing Strategy)

- [x] 8.1 Static: `npx tsc --noEmit`, `npm run lint`, `npm run build`; `rg` for `bg-\[var\(--jec-` and `text-\[var\(--jec-` across `src/components/external` **and** `src/app/(external)` — `InscripcionForm.tsx`, `CongregacionCombobox.tsx` and `ContenidosGrid.tsx` were migrated to field tokens (commits `8546a4e`, `0a3e7ea`) and are no longer excluded. Remaining `--jec-*` literals are deliberate and must stay: the play badge and duration chip in `ContenidoThumb.tsx` (bone-on-ink over a thumbnail, constant across fields), the iframe backdrop in `VideoEmbed.tsx`, and `text-[var(--jec-ink)]` on the combobox's highlighted option (ink reads on both `--acento` values). `hero/` and `ubicacion/` are owned by other slices
  - `npm run lint` exits non-zero on a clean tree: `src/hooks/use-mobile.ts:14` (error) and `src/components/external/hero/ScrollExpand.tsx:257` (warning) both predate this change. Compare against that floor, not against zero
  - **Resultado 2026-08-24** — `npx tsc --noEmit` exits 0. `npm run build` succeeds (20 static pages, `○ /`). `npm run lint` reports 1 error + 3 warnings, **all four pre-existing**: the two already documented above, plus `src/lib/email/send-qr-email.ts:22` (unused `data`, from `f108730`) and `svgo.config.mjs:8` (anonymous default export, from `7b05ee0`) — neither commit belongs to this change, so the real floor is 1 error + 3 warnings, and this change adds nothing to it
  - **Resultado del scan `--jec-*`** — every literal found is on the documented deliberate list: `ContenidoThumb.tsx:59,68` (play badge + duration chip), `VideoEmbed.tsx:34` (iframe backdrop), `CongregacionCombobox.tsx:144,145` (`--jec-ink` on the highlighted option). `ubicacion/` is clean (zero literals), as are `cronograma/`, `invitados/` and `faq/`
  - **Hallazgo no documentado en 8.1** — `src/components/external/shared/TickerTape.tsx:39,46,50` still carries `--jec-bone`/`--jec-ink-soft`/`--jec-amber` literals. It is **exported through the `shared` barrel but mounted on no page**, exactly like `HeroCountdown`, so none of it reaches `/` and it blocks nothing here. Left untouched: migrating it is outside this change's scope. Worth a follow-up alongside whichever change first mounts it
- [ ] 8.2 Layout: browser slow-scroll through the full 255vh hero track — header invisible over hero, not painted under `HeroFinale` at the 2.55× handoff, pinned for the rest of the page. **Pendiente de navegador** — genuinely visual; the structure behind it is proven in 1.7
- [ ] 8.3 Anchors: `/#cronograma`, `/#invitados`, `/#ubicacion` (direct URL) land the heading fully below the pinned header at 375px and 1280px. **Verificado en código 2026-08-24**: all four sections (`cronograma`, `invitados`, `ubicacion`, `faq`) carry both their `id` and `jec-anchor`, and `globals.css:197-199` gives `.jec-landing .jec-anchor` a `scroll-margin-top` of `calc(var(--jec-header-h) + 0.5rem)` — 92px + 8px below `md`, 104px + 8px from `md` up. **Pendiente de navegador**: that the measured header height still matches at both viewports
- [ ] 8.4 A11y: keyboard tab-through — header focusable and scrolled into view while the hero is on screen. **Verificado en código 2026-08-24**: `MapaSimulado.tsx:21-23` carries `role="presentation" aria-hidden="true" focusable="false"`, so AT does not announce the figure, and its `<figcaption>` stays readable. `SiteHeader.tsx` has no `aria-hidden` and no negative `tabIndex`. **Pendiente de navegador**: the focus-scrolls-header-into-view behaviour
- [ ] 8.5 Mobile: CTA bar absent over the hero, pinned at every scroll position past it, and clear of footer content at 320px. **Verificado en código 2026-08-24**: the iOS half is settled in 6.9 — no `viewportFit: "cover"`, so `env(safe-area-inset-bottom)` is `0px` and the page never reaches under the home indicator. **Pendiente de navegador**: the 320px scroll pass (see 6.7)
- [ ] 8.6 Regression: `/contenidos` side-by-side — logo, nav, hover, focus ring match today's appearance. **Pendiente de navegador** — a before/after visual diff needs a viewport (see 1.9)
- [x] 8.7 **Verificado en código 2026-08-24** — both files read end to end and checked against the prerendered `/` HTML. `faq/data.ts` holds four entries, every one rendering `Pregunta de ejemplo — reemplazar` / `Respuesta de ejemplo — reemplazar`. `ubicacion/data.ts` models the gap in the type rather than in a string: `street: string | null` is `null`, and `Ubicacion.tsx` renders `PlaceholderTag` for it — the rendered text reads **`Dirección por confirmar`**. `PlaceholderTag.tsx` adds a hatched fill so it reads as unfinished at a glance. No invented-but-plausible content anywhere in either file
- [x] 8.8 **Verificado en código 2026-08-24** in both `page.tsx` source and the prerendered `/` HTML — each component appears exactly once, in order. Confirm final document order in `page.tsx`: Hero, SiteHeader, Cronograma, Invitados, Ubicacion, Faq, SiteFooter, StickyCta — exactly once each, matching Requirement 1. Cronograma→StickyCta now sit inside a post-hero wrapper `<div>` that scopes `StickyCta`'s `sticky bottom-0`; `SiteHeader` stays **outside** it, since moving it in would re-scope its own `sticky top-0` containing block
- [x] 8.9 Walked every `proposal.md` Success Criteria checkbox against the shipped state. **12 of 14 confirmed in code**; the two left open are the same visual claims 8.2 and 8.6 cover, and they are now marked in `proposal.md` with the reason:
  - ✅ `/` renders every section, no unmounted section component remains — the prerendered DOM shows Hero → SiteHeader → Cronograma → Invitados → Ubicacion → Faq → SiteFooter → StickyCta, once each
  - ✅ `SiteHeader` reads its colours from field tokens, zero `--jec-*` literals in the file
  - ⏳ Header absent over the hero and pinned after it — the "no client component / scroll listener / `IntersectionObserver`" half is proven; the visual half is 8.2
  - ✅ Every home anchor carries `scroll-margin-top` via `jec-anchor`
  - ✅ Zero `/#inscripcion` in `src/`; all five CTAs resolve to `/inscripcion`, a route the build emits
  - ✅ Zero `bg-[var(--jec-ink)]` literals in the sections this change owns
  - ✅ `Ubicacion`'s CTA passes contrast — ink on bone, 17,25:1
  - ✅ Schedule dates agree with `siteConfig.eventStartsAt` (2026-09-18 is a Friday per `Intl`)
  - ✅ `InvitadoCard` is a Server Component, no `useState`, no `/jec/oradores/*`
  - ✅ `MapaSimulado` makes no external request — inline `<svg>`, no `<image href>`
  - ✅ `SiteFooter` renders every `navItem` and nothing for an empty `socialLinks`
  - ✅ `Faq` and `Ubicacion` render from their `data.ts`, both clearly marked as placeholder
  - ✅ No `.jec-display` below 34px on `/`
  - ✅ `tsc`, `lint` (at its pre-existing floor) and `build` all pass

## Verificación pendiente de navegador

Todo lo demostrable sin viewport quedó cerrado arriba. Estas seis comprobaciones necesitan ojos sobre la página y son las únicas que faltan para cerrar el change:

1. **1.7 / 8.2** — scroll lento por los 255vh del hero: el header no aparece sobre el hero y queda fijado desde `Cronograma` en adelante
2. **1.9 / 8.6** — `/contenidos` lado a lado: logo, nav, hover y anillo de foco iguales a hoy
3. **1.10 / 8.4** — tab con teclado: al enfocar un enlace del header con el hero en pantalla, el header entra en vista
4. **2.6 / 3.6 / 4.7 / 8.3** — `/#cronograma`, `/#invitados` y `/#ubicacion` por URL directa a 375px y 1280px: el título aterriza entero debajo del header
5. **6.7 / 8.5** — a 320px: la barra CTA no se pinta sobre el hero, queda fijada al fondo durante el cuerpo, aterriza debajo del footer al final, y la etiqueta entra en una línea
6. **6.9** — solo si algún día se agrega `viewportFit: "cover"` a `layout.tsx`; hoy `env(safe-area-inset-bottom)` es `0px` y no hay nada que comprobar en dispositivo
