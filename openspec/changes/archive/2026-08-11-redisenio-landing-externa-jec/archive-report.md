# Archive Report: redisenio-landing-externa-jec

**Archived**: 2026-08-11  
**Mode**: hybrid (OpenSpec filesystem + Engram persistence)  
**Verdict at close**: PASS WITH WARNINGS (0 critical, 0 blockers)

## Engram Observation IDs (traceability)

| Artifact | Observation ID | Notes |
|----------|----------------|-------|
| tasks | #38 | Pre-archive snapshot; phases 10–11 reconciled at archive |
| verify-report | #39 | `pass_with_warnings`; 3/3 requirements, 3/3 scenarios |
| design | #40 | Slice: fade reveal + hide chrome + hero finale |
| proposal | — | Not found in Engram or filesystem |
| spec | — | Delta lives in archived `specs/landing-tokens/spec.md` only |

## Task Completion Gate

- **Pre-archive state**: `tasks.md` had unchecked Phase 10 (10.1–10.5) and Phase 11 (11.1–11.6).
- **Reconciliation**: Orchestrator launch prompt asserted cycles 1–11 shipped; verify Engram #39 reports 0 critical findings. Checkboxes reconciled mechanically in `tasks.md` before archive move (see "Archive reconciliation" section in archived tasks).
- **Final task state**: 11/11 phases complete (tasks 1–9 done + Phase 10 + Phase 11).

## Verify Summary (final authority)

Per Engram #39 at verification time: `tsc --noEmit` pass, slice eslint pass, smoke `/` and `/contenidos` HTTP 200.

**Warnings retained at close** (non-blocking):
1. No automated unit/e2e test runner configured.
2. Production `npm run build` not re-run in verify pass (typecheck used instead).

Orchestrator final-state facts (post-verify) supersede stale verify scope "7/7 tareas": full landing redesign including HeroSequence loader (7s ember), GSAP fade reveal, ScrollExpand finale, tokens, shared components, section modules, `/contenidos`.

## Specs Synced

| Domain | Action | Details |
|--------|--------|---------|
| landing-tokens | Created | 3 ADDED requirements copied to `openspec/specs/landing-tokens/spec.md` |

Mechanical copy verified: empty `diff -r` between delta source and temp copy before `mv`.

## Implementation Final State (at close)

- **Tokens**: `.jec-landing` — ember `#ff5a00`, amber `#c0f700`, ink-soft `#15121A`
- **Components**: `src/components/external/` — shared, hero (HeroSequence, HeroFinale, HeroCountdown), cronograma, invitados, ubicacion, contenidos
- **Hero flow**: 7s fullscreen loader (ember, personaje + logo + battery) → pinned scroll reveal (3 phrases, gsap.to fade) → HeroFinale ScrollExpand (`background-pisada.png`) with logo, countdown grid, CTA
- **Typography**: Anton (display), Space Mono (mono), Figtree (body)
- **Event date**: 18/19/20 Sept 2026; countdown target `siteConfig.eventStartsAt`
- **GSAP**: gsap + @gsap/react + ScrollTrigger
- **4th tagline**: TickerTape only (not in reveal frames)
- **Navbar**: No SiteHeader during phrase reveal; `/contenidos` retains SiteHeader

### Design deviations recorded (not blockers)

| Design slice intent | Shipped behavior |
|--------------------|------------------|
| hero.png white-box countdown overlay (Unit 11) | ScrollExpand uses `background-pisada.png`; countdown in responsive grid overlay |
| SiteHeader on finale frame only | SiteHeader absent from Hero; present on `/contenidos` |
| Pisadas in loader | Removed per orchestrator (not archived as feature) |

## Archive Move

- **From**: `openspec/changes/redisenio-landing-externa-jec/`
- **To**: `openspec/changes/archive/2026-08-11-redisenio-landing-externa-jec/`
- **Mechanical move**: `mv` (untracked openspec tree)
- **Readback**: empty `diff -r` between pre-move snapshot and archived tree

## Archive Contents

| File | Status |
|------|--------|
| apply-progress.md | ✅ (through Tarea 7; pre–Phase 10 snapshot) |
| design.md | ✅ |
| specs/landing-tokens/spec.md | ✅ |
| tasks.md | ✅ (all `[x]` after reconciliation) |
| proposal.md | ❌ missing |
| verify-report.md | ❌ missing on filesystem (Engram #39 only) |
| archive-report.md | ✅ (this file) |

## Source of Truth Updated

- `openspec/specs/landing-tokens/spec.md`

## SDD Cycle

**Complete.** Change planned (partial proposal gap), specified, designed, implemented (cycles 1–11), verified (pass_with_warnings), archived.

## Follow-ups (optional, out of scope)

1. Restore full landing composition on `/` if section mounts remain commented in `page.tsx`.
2. Add e2e smoke once test runner exists.
3. Re-run `npm run build` in CI or next verify cycle.
