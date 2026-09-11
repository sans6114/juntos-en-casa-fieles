# Apply Progress: admin-password-recovery-access

**Mode**: Standard (strict_tdd: false; no test runner)
**Workload**: single PR (forecast Low; Decision needed before apply: No)
**Batch**: Phase 1–4, tasks 1.1–4.5
**Status**: 11/11 tasks complete

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `npx tsc --noEmit` → exit 0. `npx eslint src/lib/admin-access.ts src/proxy.ts src/actions/auth/request-password-reset.ts` → exit 0. `npm run lint` → exit 1 from **pre-existing** issues in `src/hooks/use-mobile.ts` (`react-hooks/set-state-in-effect`) and a warning in `src/components/external/hero/ScrollExpand.tsx` (`@next/next/no-img-element`); neither file is in this change. |
| Runtime harness command/scenario and exact result | Next.js 16.2.12 `npm run dev` on `http://localhost:3000`. Logged-out GET: `/admin/forgot-password` 200 (“Recuperar contraseña”); `/admin/reset-password` and `?token=testtoken` 200 (“Nueva contraseña”); `/admin/inscripciones` 307 → `/admin/login`. Login link in `AdminLoginForm.tsx` is `href="/admin/forgot-password"` (page not edited). Logged-in ADMIN: both recovery paths 307 → `/admin/inscripciones`; `/admin/login?error=CredentialsSignin` stays 200. Logged-in COLABORADOR: both recovery paths 307 → `/admin/inscripciones/grilla`. Forced send failure: process `EMAIL_FROM=` empty, POST Next-Action `requestPasswordReset` with an active admin email → `{ ok: false, message: "No se pudo enviar el correo. Intentá de nuevo más tarde." }` (not GENERIC_MESSAGE). Missing and inactive emails → `{ ok: true, GENERIC_MESSAGE }`. Forgot page already `toast.error` on `!response.ok` (3.2). Browser MCP could not open a tab; harness used HTTP fetch + Auth.js session cookies. |
| Rollback boundary | Revert `src/lib/admin-access.ts`, `src/proxy.ts`, `src/actions/auth/request-password-reset.ts`. Pages were not changed. |

## Completed Tasks

- [x] 1.1 `ADMIN_PATHS.forgotPassword` / `ADMIN_PATHS.resetPassword`
- [x] 1.2 `isPublicAdminAuthPath(pathname)` exact match on login + those two (query stripped)
- [x] 2.1 Logged-out gate uses `isPublicAdminAuthPath`
- [x] 2.2 Logged-in + public auth path → `defaultHomeForRole(role)`; login `?error` skip kept
- [x] 3.1 `catch` returns `{ ok: false, message: RETRY_MESSAGE }`; Zod still `ok: false`; absent/inactive still GENERIC_MESSAGE; `send-password-reset.ts` not edited
- [x] 3.2 Confirmed forgot page `toast.error` on `!response.ok`; forgot/login/reset pages not edited
- [x] 4.1 Logged-out recovery pages reachable
- [x] 4.2 Logged-in recovery redirects; other `/admin/*` still session-gated
- [x] 4.3 Send-failure contract vs GENERIC_MESSAGE
- [x] 4.4 Resend diagnosis (below)
- [x] 4.5 tsc + lint run

## Resend diagnosis (task 4.4 / verify notes)

- `.env.example` has `RESEND_API_KEY=""` and `EMAIL_FROM="Juntos en Casa <no-reply@tudominio.com>"` (placeholder / unverified domain). Comment in the example points at `onboarding@resend.dev` for local Resend, which is not configured here.
- `src/lib/email/send-password-reset.ts` throws `Falta la variable de entorno EMAIL_FROM` when `EMAIL_FROM` is missing. This file was **not** edited.
- The helper `await resend.emails.send(...)` does not inspect a Resend `{ error }` return; a send API failure without a throw would still look like success. Forcing a throw via missing `EMAIL_FROM` is the in-scope way to hit the action `catch`.
- Delivery (valid `re_` API key, verified domain, working `EMAIL_FROM`) stays **out of scope**. Do not configure Resend in this change.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `src/lib/admin-access.ts` | Modified | Named recovery paths + `isPublicAdminAuthPath` |
| `src/proxy.ts` | Modified | Public allowlist + logged-in redirect; whitespace normalized in `proxy()` |
| `src/actions/auth/request-password-reset.ts` | Modified | Send `catch` is `{ ok: false, RETRY_MESSAGE }` |
| `openspec/changes/admin-password-recovery-access/tasks.md` | Modified | Marked 1.1–4.5 `[x]` |
| `openspec/changes/admin-password-recovery-access/apply-progress.md` | Created | This file |

## Deviations from Design

None — specs/design were skipped by the user. Implementation follows proposal + `tasks.md` only. `admin-password-recovery-resend` was not implemented.

## Issues Found

- Repo-wide `npm run lint` already fails on files outside this change (`use-mobile.ts`, `ScrollExpand.tsx`).
- Cursor browser MCP could not create a tab (`No browser tab available`); runtime checks used HTTP instead of a visible toast screenshot.
- Local Postgres on `:5433` was down until Docker Desktop + `juntos-db` were started for the logged-in / action harness. Throwaway colaborador `apply.harness.colab@juntosencasa.org` was inserted then deleted.

## Remaining Tasks

None.
