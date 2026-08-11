# Apply Progress: redisenio-landing-externa-jec

**Change**: redisenio-landing-externa-jec  
**Mode**: Standard (`strict_tdd: false`, no test runner)  
**Batch**: Tarea 7 only (`/contenidos` page)  
**Date**: 2026-08-11

## Completed Tasks (cumulative)

### Tarea 1 — Tokens + shared
- [x] 1.1 Update `.jec-landing` tokens in `src/app/globals.css`
- [x] 1.2 `SectionHeading.tsx`
- [x] 1.3 `CtaButton.tsx`
- [x] 1.4 `shared/index.ts` barrel

### Tarea 2 — Hero
- [x] 2.1 `Hero.tsx` at `src/components/external/hero/`
- [x] 2.2 `HeroCountdown.tsx` moved + `useSyncExternalStore` lint fix
- [x] 2.3 `hero/index.ts` barrel
- [x] 2.4 `page.tsx` imports `Hero` from `@/components/external/hero`
- [x] 2.5 Primary CTA → `CtaButton` (SectionHeading skipped — logo brand)
- [x] 2.6 Content preserved (bg, logos, countdown, Gálatas 5:25, Inscribirme, `#inscripcion`)
- [x] 2.7 Removed `src/app/(external)/ui/` orphans

### Tarea 3 — Cronograma
- [x] 3.1 `data.ts` — typed mock 3 days
- [x] 3.2 `CronogramaDiaCard.tsx` — `--jec-ink-soft` surface
- [x] 3.3 `Cronograma.tsx` — SectionHeading + 3-card grid, `id="cronograma"`
- [x] 3.4 `cronograma/index.ts` barrel
- [x] 3.5 `page.tsx` mounts `<Cronograma />` below `<Hero />`

### Tarea 4 — Invitados
- [x] 4.1 `data.ts` — typed list from `jecAssets.oradores` (6)
- [x] 4.2 `InvitadoCard.tsx` — client monotono/duotono + "?" ; reveal hover/focus/click
- [x] 4.3 `Invitados.tsx` — SectionHeading + grid, `id="invitados"`
- [x] 4.4 `invitados/index.ts` barrel
- [x] 4.5 `page.tsx` mounts `<Invitados />` below `<Cronograma />`

### Tarea 5 — Ubicacion
- [x] 5.1 `Ubicacion.tsx` — `id="ubicacion"`, SectionHeading, org + city + street placeholder, CtaButton Maps search
- [x] 5.2 `ubicacion/index.ts` barrel
- [x] 5.3 `page.tsx` mounts `<Ubicacion />` below `<Invitados />`

### Tarea 6 — Assemble + nav
- [x] 6.1 `page.tsx` order confirmed: Hero → Cronograma → Invitados → Ubicacion (no footer CTA)
- [x] 6.2 `SiteHeader.tsx` in shared/
- [x] 6.3 Nav: Cronograma, Invitados, Ubicación, Contenidos, Inscribirme
- [x] 6.4 Responsive collapse: section anchors `hidden md:inline`; Contenidos + Inscribirme always
- [x] 6.5 Hero uses `<SiteHeader />`; barrel export updated

### Tarea 7 — `/contenidos` page
- [x] 7.1 Feature folder `contenidos/` — data, ContenidoCard, ContenidosGrid, barrel
- [x] 7.2 `app/(external)/contenidos/page.tsx` — SiteHeader + grid + metadata
- [x] 7.3 GET `/contenidos` → 200 (verified via curl on dev server)

## Files Changed (Tarea 7)

| File | Action | What Was Done |
|------|--------|---------------|
| `src/components/external/contenidos/data.ts` | Created | Typed mock (podcast \| evento), 3 items |
| `src/components/external/contenidos/ContenidoCard.tsx` | Created | Minimal ink-soft card |
| `src/components/external/contenidos/ContenidosGrid.tsx` | Created | SectionHeading + responsive grid |
| `src/components/external/contenidos/index.ts` | Created | Barrel exports |
| `src/app/(external)/contenidos/page.tsx` | Created | Page + `createPageMetadata` |
| `src/components/external/shared/SiteHeader.tsx` | Modified | Section anchors → `/#…` for cross-route nav |
| `openspec/.../tasks.md` | Modified | Tarea 7 `[x]` |
| `openspec/.../design.md` | Modified | Tarea 7 slice design + evidence |
| `openspec/.../apply-progress.md` | Modified | Cumulative progress through Tarea 7 |

## Work Unit Evidence (Tarea 7)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npx eslint` on contenidos + page + SiteHeader | Pass (exit 0) |
| Runtime harness | `curl` GET `/contenidos` on localhost:3040 → **HTTP 200**; HTML includes mock titles |
| Rollback boundary | Delete `contenidos/` components + route; revert SiteHeader hrefs |

## Work Unit Evidence (Tarea 6 — retained)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npx eslint` on SiteHeader + Hero + page | Pass (exit 0) |
| Runtime harness | N/A automated — no e2e runner; verify visually: nav anchors + `/contenidos` link |
| Rollback boundary | Revert Hero header; delete SiteHeader; revert shared barrel |

## Work Unit Evidence (Tarea 5 — retained)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npx eslint src/components/external/ubicacion/ src/app/(external)/page.tsx` | Pass (exit 0) |
| Runtime harness | N/A automated — no e2e runner; verify visually on `/` below Invitados |
| Rollback boundary | Revert page.tsx Ubicacion mount; delete `components/external/ubicacion/` |

## Work Unit Evidence (Tarea 4 — retained)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npx eslint src/components/external/invitados/ src/app/(external)/page.tsx` | Pass (exit 0) |
| Runtime harness | N/A automated — no e2e runner; verify visually on `/` below Cronograma |
| Rollback boundary | Revert page.tsx Invitados mount; delete `components/external/invitados/` |

## Work Unit Evidence (Tarea 3 — retained)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npx eslint src/components/external/cronograma/ src/app/(external)/page.tsx` | Pass (exit 0) |
| Runtime harness | N/A automated — no e2e runner |
| Rollback boundary | Revert page.tsx Cronograma mount; delete `components/external/cronograma/` |

## Work Unit Evidence (Tarea 2 — retained)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass (exit 0) |
| `npx eslint src/components/external/hero/ src/app/(external)/page.tsx` | Pass (exit 0) |
| Runtime harness | N/A automated — no e2e runner |
| Rollback boundary | Restore ui/ Hero files + revert page.tsx; delete `components/external/hero/` |

## Work Unit Evidence (Tarea 1 — retained)

| Evidence | Result |
|---|---|
| `npx tsc --noEmit` | Pass |
| `npm run lint` | Pre-existing fails elsewhere; shared clean |
| Rollback | Revert `.jec-landing` + delete `shared/` |

## Deviations from Design

- SiteHeader section links changed from `#anchor` to `/#anchor` so navigation from `/contenidos` returns to landing sections (home still works).

## Remaining Tasks

- None — all 7 tasks complete.

## Status

**7/7 tasks complete.** Ready for `sdd-verify` (full change) then `sdd-archive`.
