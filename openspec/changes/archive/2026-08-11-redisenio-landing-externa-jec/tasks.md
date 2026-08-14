# Tasks: redisenio-landing-externa-jec

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 160–340 (2 units) |
| 400-line budget risk | Medium |
| Chained PRs recommended | Yes |
| Suggested split | PR1 reveal polish → PR2 hero.png finale |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: Medium

### Suggested Work Units

| Unit | Goal | PR | Focused test | Runtime harness | Rollback |
|------|------|----|--------------|-----------------|----------|
| 10 | Fade + type + hide nav | PR1 | `tsc` + eslint `hero/` | Manual `/`: soft fade; large type; no nav on phrases | Revert `HeroSequence.tsx` |
| 11 | hero.png + countdown boxes | PR2 | `tsc` + eslint hero/ | Manual: digits in white boxes; 375px+desktop | Revert `HeroFinale.tsx` (+ countdown props) |

### Dependency check

- [x] `public/jec/hero/hero.png` exists (2730×1536) — Unit 11 unblocked

### Open ask (does not block 10.x)

SiteHeader after pin (sections)? Recommend: finale-frame only this slice.

## Done (1–9)

- [x] Tokens → contenidos; discrete frames; tipographic finale (superseded by Phase 11)

## Phase 10 — Reveal polish (fade / type / chrome)

- [x] 10.1 `HeroSequence.tsx` `showFrame`: replace `gsap.set(autoAlpha)` with `gsap.to` fade in/out; kill prior tweens; keep snap index — Accept: soft crossfade, no double-visible phrases
- [x] 10.2 Phrase classes: bump size (e.g. `text-5xl` → `lg:text-8xl`) — Accept: clearly larger than prior (`clamp(2.25rem,9vw,5.5rem)`)
- [x] 10.3 Chrome: no `SiteHeader` during phrase frames; navbar deferred to post-reveal / hero finale per final impl — Accept: no nav during phrases
- [x] 10.4 Keep reduced-motion path + pin/snap — Accept: a11y + no section bleed
- [x] 10.5 Verify: `tsc` + eslint `hero/`; manual loader→fade phrases→finale

## Phase 11 — ScrollExpand finale + countdown

- [x] 11.1 ScrollExpand asset measured (`background-pisada.png`; hero.png parked in `jecAssets.hero.finale`) — Accept: asset wired before overlay
- [x] 11.2 `HeroFinale.tsx` full-bleed ScrollExpand with logo + countdown grid — Accept: tipographic lockup superseded
- [x] 11.3 Countdown digits in responsive grid (bone on ember); labels retained — Accept: readable countdown
- [x] 11.4 `#inscripcion` CTA via `CtaButton` below countdown — Accept: CTA usable
- [x] 11.5 Responsive: grid scales 375px + desktop — Accept: visual QA both
- [x] 11.6 Verify: `tsc` + eslint; full path loader→phrases→ScrollExpand finale

## Archive reconciliation (2026-08-11)

Phases 10–11 checkboxes reconciled at archive per orchestrator final-state authority: verify `pass_with_warnings` (Engram #39, 0 critical), launch prompt confirms cycles 1–11 shipped. Stale unchecked boxes from pre-apply snapshot corrected mechanically before archive move.

## Order

Unit 10 (10.1→10.5) → open-ask if needed → Unit 11 (11.1→11.6) → `sdd-verify`.
