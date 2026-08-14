# Design (slice): Feedback — fade reveal + hide chrome + hero.png finale

## Context

Tareas 1–9 landed (tokens → discrete frames → tipographic `HeroFinale`). User rejected abrupt frame cuts, small phrase type, chrome during reveal, and tipographic finale.

## Decisions (this slice)

- **Keep change** `redisenio-landing-externa-jec`; do not open a parallel change.
- **Phrase count:** confirmed 3 reveal frames (`jecRevealPhrases`); 4th stays in ticker. Unchanged.
- **A — Fade:** replace `gsap.set(autoAlpha)` in `showFrame` with short `gsap.to` crossfade (outgoing → 0, incoming → 1). Keep snap/threshold index; kill prior tweens to avoid overlap stacks. Respect `prefers-reduced-motion` (instant OK).
- **B — Type scale:** bump phrase classes in `HeroSequence.tsx` (current `text-3xl`…`lg:text-6xl` → clearly larger, e.g. `text-5xl`…`lg:text-8xl`). No new font.
- **C — Chrome:** `SiteHeader` MUST NOT render during phrase frames (indices 0..2). Show only on finale frame (`index === jecRevealPhrases.length`). Do not set `showChrome` on loader complete alone.
- **D — Finale:** park tipographic lockup; `HeroFinale` uses full-bleed `public/jec/hero/hero.png` (exists, 2730×1536). Overlay `HeroCountdown` numbers into the four white 3D boxes (~Y 78–92%, centers ~32/44/56/68% W). Digits dark on white; hide duplicate printed labels if overlay covers them. Keep CTA `#inscripcion` if it fits without covering art; else place below image — confirm in apply if cramped.
- **Asset:** `hero.png` present — no “add asset” blocker.

## File-change table

| File | Action | Notes |
|------|--------|-------|
| `src/components/external/hero/HeroSequence.tsx` | Modify | Fade tweens; larger phrases; chrome only on finale |
| `src/components/external/hero/HeroFinale.tsx` | Modify | Image hero + absolute countdown slots; park tipography |
| `src/components/external/hero/HeroCountdown.tsx` | Modify if needed | Variant/props for overlay digits in white boxes |
| `public/jec/hero/hero.png` | Reuse | Already in repo |

## Work Unit Evidence

| Unit | Focused test | Runtime harness | Rollback |
|------|--------------|-----------------|----------|
| 10 reveal polish | `tsc` + eslint `hero/` | Manual: fade between phrases; no nav during phrases | Revert HeroSequence |
| 11 hero.png finale | `tsc` + eslint hero/ | Manual: digits sit in white boxes; responsive | Revert HeroFinale (+ countdown props) |

## Open ask (does not block Unit 10)

After pin ends (Cronograma+): should SiteHeader stay sticky/fixed, or only appear on finale frame inside the pin? **Recommend:** finale-frame only for this slice; sticky-after-pin = follow-up.

## Prior slices (retained)

Tareas 1–9 complete in code; tipographic finale superseded by Unit 11.
