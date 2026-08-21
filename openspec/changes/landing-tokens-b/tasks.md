# Tasks: Landing Tokens B — "Papel encendido"

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~460-560 |
| Review budget (session) | 800 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | Single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

Note on the proposal's 400-480 estimate: measured against the repo, it is roughly right but likely a touch low. `CtaButton.tsx` is a full rewrite to a discriminated union (~90 changed lines, not a token swap), and the new `.jec-landing` field-class block (3 fields x 9 tokens + `.jec-eyebrow` + `.jec-disclosure` + typographic discipline) is ~120-140 changed lines in `globals.css`. That is partly offset by `jec-assets.ts` shrinking (dropping the 28-entry `pngsTransparente` block) rather than growing. Net: ~460-560, still Low risk against the session's 800-line budget — single PR remains correct, no chain decision needed.

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Full change (assets, tokens, primitives, consumers, docs) | PR 1 | `npm run typecheck && npm run lint` | Manual browser: `/`, `/contenidos`, `/inscripcion`, `/inscripcion/confirmacion`; fetch `siteConfig.ogImage` for 200 | `git revert` the single commit; partial revert of only the `.jec-landing` block in `globals.css` keeps the asset repair intact |

## Phase 1: Asset registry repair

- [x] 1.1 Rewrite `src/lib/jec-assets.ts`: `favicon`; `background.pisada` only; `logos` (drop `jecWhitePng`); `personaje` (unchanged); `hero.finale`; new `iconos.ancla` (`/jec/iconos/ancla.png`) / `iconos.pisada` (`/jec/iconos/pisada.png`); `recursos` = 7 real files (`huellas`, `background-colores`, `logo-blanco`, `logo-blanco-desc`, `logo-color`, `logo-negro`, `logo-negro-desc`); new `og.default` (`/jec/og/og-jec-2026.jpg`); drop `oradores` entirely
- [x] 1.2 `src/lib/seo/site.ts:18`: point `siteConfig.ogImage` at `jecAssets.og.default` (not `hero.finale` — see risk note)
- [x] 1.3 `src/components/external/invitados/data.ts`: drop the `jecAssets` import; inline the six `oradores` image literals; add `// TODO(landing-home-secciones)`
- [x] 1.4 `src/components/external/hero/HeroSequence.tsx:220`: `jecAssets.logos.jecWhitePng` → `jecAssets.logos.jecWhiteSvg`; add `// TODO(landing-home-secciones)`
- [x] 1.5 `npx tsc --noEmit` — confirm no dangling `oradores` / `jecWhitePng` references

## Phase 2: Token layer (`src/app/globals.css`)

- [x] 2.1 Replace the `.jec-landing` block (~141-171): keep legacy `--jec-*` vars, set `color-scheme: light only`, add `font-synthesis: none`
- [x] 2.2 Add `campo-papel` / `campo-tinta` / `campo-fuego`, each declaring all nine tokens (`--acento --dato --suave --linea --sup --regla --foco --cta-bg --cta-fg`) per the D2 matrix
- [x] 2.3 Add `.jec-eyebrow` (`::before`, 28x3px, `background: var(--acento)`)
- [x] 2.4 Add `.jec-disclosure` chevron (border-triangle in `--acento`, `details[open]` rotation, `motion-reduce` guard); hide default marker
- [x] 2.5 Inside `@layer base`: `.jec-landing :is(h1,...,h6){font-weight:400}`
- [x] 2.6 Diff-check `.admin-shell`, `:root`, `.dark`, `@theme inline` are byte-identical

## Phase 3: Shared primitives

- [x] 3.1 Rewrite `CtaButton.tsx` as the D3 discriminated union (`LinkProps | ButtonProps`); colors from `--cta-bg`/`--cta-fg`; structural hover only
- [x] 3.2 `SectionHeading.tsx`: eyebrow → `jec-label jec-eyebrow`, `color: var(--suave)`
- [x] 3.3 Create `shared/navigation.ts`: `NavItem`/`SocialLink` types, `navItems` (5 current entries), `socialLinks: []`
- [x] 3.4 Create `shared/Disclosure.tsx`: Server Component, native `<details>/<summary>`, props `{summary, children, className?, defaultOpen?}`
- [x] 3.5 `shared/index.ts`: export `Disclosure`, `navItems`, `socialLinks`, types

## Phase 4: Consumers

- [x] 4.1 `SiteHeader.tsx`: drop inline `NAV_ITEMS`, import `navItems`
- [x] 4.2 `CronogramaDiaCard.tsx:10,13,24`: `.jec-display` → `.jec-label`
- [x] 4.3 `ContenidoCard.tsx:15,18`: `.jec-display` → `.jec-label`
- [x] 4.4 `InvitadoCard.tsx:101`: `.jec-display` → `.jec-label` (line 82 keeps `.jec-display`)
- [x] 4.5 `confirmacion/page.tsx:44-49`: hand-copied `<Link>` → `<CtaButton href="/">`
- [x] 4.6 `InscripcionForm.tsx:163-169`: hand-copied `<button>` → `<CtaButton as="button" type="submit" disabled={isPending} className="w-full">`

## Phase 5: Docs and verification

- [x] 5.1 `DESIGN.md`: record direction B as decided; correct line 57's stale `fueguin-reversion.png` claim (file absent, untracked)
- [x] 5.2 `npm run typecheck && npm run lint`
- [x] 5.3 Manual: `/`, `/contenidos`, `/inscripcion`, `/inscripcion/confirmacion` on paper field, no dark flash; header nav, `CtaButton` (link+button), `SectionHeading`, `Disclosure` correct; no synthetic bold; `siteConfig.ogImage` returns 200
