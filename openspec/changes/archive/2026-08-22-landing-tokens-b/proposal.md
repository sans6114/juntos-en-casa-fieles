# Proposal: Landing Tokens B — "Papel encendido" design-system layer

## Intent

The approved redesign ("Papel encendido") inverts the public field from ink to paper: `#f4efe8` base, `#0b0a0f` type, `#ff5a00` / `#c0f700` as colour blocks, 6px radius, 3px rules instead of shadows.

The base it must sit on is broken. 38 of 50 asset paths in `src/lib/jec-assets.ts` point at files deleted manually and never de-registered, and `siteConfig.ogImage` resolves to one of them (`/jec/background/fondo1.webp`) — Open Graph is broken on every public page. This change lands only the shared layer so the three chained changes have a stable base.

## Scope



### In Scope

- Repair `src/lib/jec-assets.ts`: 7 real `recursos`, add `iconos.ancla` / `iconos.pisada`, drop `oradores`, `background` keeps only `background.webp`
- Point `siteConfig.ogImage` (`src/lib/seo/site.ts:18`) at an existing asset
- Replace the `.jec-landing` block in `src/app/globals.css` with the direction B kit: field classes `campo-papel` / `campo-tinta` / `campo-fuego`, each rewriting `--acento`, `--dato`, `--suave`, `--linea`, `--sup`, `--regla`, `--foco` plus the `--cta-bg` / `--cta-fg` pair; 6px radius; `color-scheme: light only`; typographic discipline (`font-synthesis: none`, `h1-h6 { font-weight: 400 }`, Cayento reserved for >=34px)
- `CtaButton`: add `as="button"`, become field-aware via the CTA token pair
- `SectionHeading`: ink eyebrow, brand colour carried by a 28px `::before` rule instead of text colour
- NEW `src/components/external/shared/navigation.ts` (nav items + social links) and NEW `Disclosure.tsx` (styled native `<details>`, no JS)
- `SiteHeader.tsx` consumes `navigation.ts` instead of inline `NAV_ITEMS`
- `.jec-display` → `.jec-label` on card eyebrows/titles in `CronogramaDiaCard.tsx`, `ContenidoCard.tsx`, `InvitadoCard.tsx`
- Replace the hand-copied CTA class `<Link>` at `inscripcion/confirmacion/page.tsx:41` with `<CtaButton href="/">`
- Replace the hand-copied CTA class `<button type="submit">` at `InscripcionForm.tsx:166` with `<CtaButton as="button" type="submit">` — the only consumer of the new `as="button"` API this change introduces, so it ships verified rather than unused
- `DESIGN.md`: record direction B as decided, and correct the stale claim at `DESIGN.md:57` that `fueguin-reversion.png` exists on disk (it does not, and is not tracked)
- Spec delta on `openspec/specs/landing-tokens/`



### Out of Scope

- The three chained changes: `landing-home-secciones`, `contenidos-plenarias`, `productos-presave`
- Repainting section/page components; no entire page is rewritten (AGENTS.md Atomic Scope)
- The `--jec-amber` → lime rename (deferred, see below)
- Data layer: no Prisma schema or migration anywhere in the four-change plan



## Capabilities

> Contract for sdd-spec. `openspec/specs/` currently holds only `landing-tokens`.



### New Capabilities

- `landing-assets`: every path declared in `jec-assets.ts` MUST resolve to a file that exists in `public/`, and `siteConfig.ogImage` MUST resolve through it



### Modified Capabilities

- `landing-tokens`: all three existing requirements are now false and need `## MODIFIED Requirements` deltas — "Landing color tokens" (ink is no longer the base field; field classes and the CTA token pair replace flat tokens), "Shared CtaButton" ("ember fill, amber hover" is invalid: orange on paper is 2.73:1, lime on paper 1.11:1, so neither may carry text or focus on a light field), "Shared SectionHeading" (**pre-existing drift** — `SectionHeading.tsx:26` already uses `jec-label`, not display typography; corrected here because it is the same requirement block, not scope creep). The delta also ADDS requirements for the field classes, the typographic discipline block, `Disclosure`, and the single navigation source.



## Approach

**Fields, not flat tokens.** Each of `campo-papel`, `campo-tinta`, `campo-fuego` rewrites the same semantic token set, so a primitive dropped into any field adopts that field's contrast with no prop branching. `CtaButton` reads `--cta-bg` / `--cta-fg` and is correct in all three by construction. Approved contrast targets: CTA 17.25:1 in all three fields; focus ring 17.25:1 light / 15.54:1 dark; eyebrow 6.31:1; ink label on orange 6.31:1.

**Typography.** Cayento ships one weight (400) and is a heavy display face, so `.jec-display` at 12px card eyebrows makes browsers synthesize a fake bold. `font-synthesis: none` plus reserving Cayento for >=34px removes it; the three card swaps to `.jec-label` are the consumer side of that rule.

**Colour scheme.** `color-scheme: dark only` (`globals.css:142`) becomes `light only` — required by the paper field, and aligned with PRODUCT.md principle 5 (forced light mode is deliberate).

## Affected Areas


| Area                                                   | Impact   | Description                                                                    |
| ------------------------------------------------------ | -------- | ------------------------------------------------------------------------------ |
| `src/lib/jec-assets.ts`                                | Modified | 38 dead paths repaired; `oradores` removed; `iconos` added                     |
| `src/lib/seo/site.ts`                                  | Modified | `ogImage` points at an existing asset                                          |
| `src/app/globals.css`                                  | Modified | `.jec-landing` block replaced by the direction B kit                           |
| `.../shared/CtaButton.tsx`                             | Modified | `as="button"`; field-aware via `--cta-bg` / `--cta-fg`                         |
| `.../shared/SectionHeading.tsx`                        | Modified | Ink eyebrow + `::before` brand rule                                            |
| `.../shared/navigation.ts`                             | New      | Single source for nav items and social links                                   |
| `.../shared/Disclosure.tsx`                            | New      | Styled native `<details>`, no client JS                                        |
| `.../shared/SiteHeader.tsx`                            | Modified | Consumes `navigation.ts`                                                       |
| `CronogramaDiaCard` / `ContenidoCard` / `InvitadoCard` | Modified | `.jec-display` → `.jec-label`                                                  |
| `inscripcion/confirmacion/page.tsx`                    | Modified | Hand-copied class `<Link>` → `<CtaButton>`                                     |
| `inscripcion/ui/InscripcionForm.tsx`                   | Modified | Hand-copied class `<button>` → `<CtaButton as="button">`                       |
| `DESIGN.md`                                            | Modified | Direction B recorded as decided; stale `fueguin-reversion.png` claim corrected |
| `openspec/specs/landing-tokens/`                       | Modified | Delta: 3 MODIFIED + ADDED requirements                                         |




## Risks


| Risk                                                                        | Likelihood | Mitigation                                                                                                                                                    |
| --------------------------------------------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Token replacement leaks into admin or shadcn theme                          | Low        | `.jec-landing` is applied once, at `src/app/(external)/layout.tsx:29`; no public component uses shadcn semantic utilities, only arbitrary `bg-[var(--jec-…)]` |
| Sections not repainted in this change look wrong on a paper field mid-chain | High       | Accepted and expected: this is the first of four chained changes; visual coherence lands with `landing-home-secciones`                                        |
| Lime or orange used as text/focus on paper (1.11:1 / 2.73:1)                | Med        | Field classes never expose them as `--dato` or `--foco` on light fields; verify in browser                                                                    |
| Removing `oradores` breaks an unseen consumer                               | Low        | `npm run typecheck` fails loudly on any remaining reference                                                                                                   |
| Renaming CSS custom properties strands a consumer that reads an old name    | Med        | Old `--jec-*` tokens consumed outside scope stay defined until the chained changes migrate them                                                               |
| Change exceeds the 800-line review budget                                   | Low        | Estimated 400-480 changed lines; if apply overruns, stop and report rather than split silently                                                                |




## Rollback Plan

No persisted state, no migration — `git revert` of the single commit fully restores prior behaviour.

Partial rollback is available and preferred: if only the visual layer is wrong, revert the `.jec-landing` block in `src/app/globals.css` alone (restoring `color-scheme: dark only`) and keep the asset repair, which is a standalone bug fix. Reverting the two new files means deleting them and restoring the inline `NAV_ITEMS` in `SiteHeader.tsx`.

## Known Deferred

- `--jec-amber` holds `#c0f700` (lime green), so the token name is wrong. Renaming touches 14 files, most outside this scope. `DESIGN.md` already documents it as a deliberate postponement. Deferred, not forgotten.
After this change there are zero hand-copied CTA class strings left in the codebase.



## Open Questions

- Identity mechanism for the future `productos-presave` pre-save flow. Context, not a decision for this change: `src/actions/inscripcion/crear-inscripcion.ts:64` already writes the inscription id to a `jec_inscripcion_uuid` cookie, but with `maxAge: 600` and `path: "/inscripcion"`, so it cannot identify a returning visitor as-is. Raising `maxAge` and widening `path` would turn it into persistent identity without inventing a new mechanism. To be resolved in `productos-presave`.
- `fueguin-reversion.png` — resolved, not a question. `DESIGN.md:57` claims the file exists on disk awaiting wiring. Verified: it does not exist under `public/` and is not tracked. The stale claim is corrected as part of the `DESIGN.md` scope item; nothing to wire.



## Dependencies

- None external. This change is the dependency: `landing-home-secciones`, `contenidos-plenarias` and `productos-presave` all consume the field classes and shared primitives defined here.



## Verification

No test runner exists (`openspec/config.yaml` `testing.test_runner.available: false`).

- `npm run typecheck` passes
- `npm run lint` passes
- Browser: `/`, `/contenidos`, `/inscripcion`, `/inscripcion/confirmacion` render on a paper field with no dark-mode flash; header nav, `CtaButton` (link and button), `SectionHeading` and `Disclosure` render correctly; card eyebrows show no synthetic bold
- Open Graph: `siteConfig.ogImage` returns 200



## Success Criteria

- [ ] Every path declared in `jec-assets.ts` resolves to a file that exists
- [ ] `siteConfig.ogImage` resolves to an existing asset (Open Graph no longer broken)
- [ ] `.jec-landing` exposes `campo-papel` / `campo-tinta` / `campo-fuego`, each rewriting the semantic token set and the `--cta-bg` / `--cta-fg` pair
- [ ] `CtaButton` renders as both link and `<button type="submit">` and is legible in all three fields
- [ ] `SiteHeader` and future consumers read nav items from `navigation.ts` only
- [ ] `Disclosure` works with JavaScript disabled
- [ ] No hand-copied CTA class remains in `inscripcion/confirmacion/page.tsx`
- [ ] `DESIGN.md` records direction B as decided
- [ ] `.admin-shell` and the `:root` / `.dark` shadcn theme are byte-identical
- [ ] `npm run typecheck` and `npm run lint` pass

---



## Session Context

Facts from the planning session that live nowhere else in the repo. Recorded here so they travel with the change instead of dying with a chat transcript.

**Visual reference.** The approved design canvas is a published Artifact:
`https://claude.ai/code/artifact/c31ecfe9-a1db-444f-8ce8-83cd07b56ef1`
It holds 14 artboards in the chosen "Papel encendido" direction, plus the two rejected directions kept as a record of the decision. This change does not need it — every token value and contrast number is in `design.md` — but the three chained changes are visual composition and do. The canvas source (`.dc.html` files) is deliberately NOT committed: once the React components exist they would be duplicate mockups drifting beside the real implementation.

**Design direction, how it was chosen.** Three directions were built on identical content and compared; the user picked B ("Papel encendido"). `DESIGN.md` had explicitly left the question open, stating that the previous dark background, square corners and absence of shadows were NOT confirmed brand doctrine. Scope item 10 closes that question.

**Design review.** An `/impeccable critique` run scored the design 19/40 and is archived at `.impeccable/critique/2026-08-20T17-19-51Z__design-jec-v2.md`. Its two P0 and three P1 findings were fixed in the canvas before this change was written; several of them are the reason the contrast numbers in `design.md` are acceptance criteria rather than suggestions.

**SDD session preflight.** Execution mode `interactive`; artifact store `openspec`; delivery strategy `ask-on-risk`; review budget 800 changed lines. Partially mirrored in the `tasks.md` forecast table.

**The** `pre-commit` **hook is disabled.** `.git/hooks/pre-commit` ran `gga run || exit 1` (Gentleman Guardian Angel, an AI code review). It aborted every commit with `No provider configured` despite `.gga` declaring `PROVIDER="claude"`, and it blocked a rebase mid-flight. It was moved to `.git/hooks/pre-commit.gga-backup`. **Consequence: commits in this repo currently get no automated review.** Restore it with a plain `mv` once the provider issue is diagnosed.

**Chained changes.** This is the first of four, planned together:
`landing-tokens-b` (this one) → `landing-home-secciones` → `contenidos-plenarias` → `productos-presave`.
The last one is partly blocked: its pre-save flow assumes the visitor is already registered and therefore asks for no email, but the site has no login. Closest path, recorded in Open Questions above: `crear-inscripcion.ts` already writes the inscription id to `jec_inscripcion_uuid`, currently `maxAge: 600` and `path: "/inscripcion"`.