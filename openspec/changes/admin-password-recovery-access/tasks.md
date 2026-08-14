# Tasks: Admin Password Recovery Access

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 40–80 |
| 400-line budget risk | Low |
| Chained PRs recommended | No |
| Suggested split | single PR |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: No
Chained PRs recommended: No
Chain strategy: pending
400-line budget risk: Low

### Suggested Work Units

| Unit | Goal | Likely PR | Focused test command | Runtime harness | Rollback boundary |
|------|------|-----------|----------------------|-----------------|-------------------|
| 1 | Public recovery access + send-failure contract | PR 1 | `npx tsc --noEmit` && `npm run lint` | Logged-out `/admin/forgot-password` and `/admin/reset-password`; logged-in redirect; failed-send toast | `src/lib/admin-access.ts`, `src/proxy.ts`, `src/actions/auth/request-password-reset.ts` |

## Phase 1: Named public paths

- [x] 1.1 In `src/lib/admin-access.ts`, add `ADMIN_PATHS.forgotPassword` (`/admin/forgot-password`) and `ADMIN_PATHS.resetPassword` (`/admin/reset-password`).
- [x] 1.2 In `src/lib/admin-access.ts`, export `isPublicAdminAuthPath(pathname)` matching login + those two paths by exact pathname (query ignored). Verify: only those three paths return true.

## Phase 2: Proxy allowlist and logged-in redirect

- [x] 2.1 In `src/proxy.ts` `proxy()`, replace the logged-out `isLoginPath` gate with `isPublicAdminAuthPath` so unauthenticated forgot/reset are not redirected to `ADMIN_PATHS.login`.
- [x] 2.2 In `src/proxy.ts`, if logged-in with `role` and `isPublicAdminAuthPath(pathname)`, redirect to `defaultHomeForRole(role)`. Keep the existing login `?error` skip. Verify: ADMIN and colaborador leave both recovery paths.

## Phase 3: Send-failure contract

- [x] 3.1 In `src/actions/auth/request-password-reset.ts` `requestPasswordReset` `catch`, return `{ ok: false, message }` with a generic retry string (do not say whether the account exists). Keep Zod validation `ok: false`. Absent/inactive users still `{ ok: true, GENERIC_MESSAGE }` on the success path. Do not edit `src/lib/email/send-password-reset.ts`.
- [x] 3.2 Confirm `src/app/(internal)/admin/forgot-password/page.tsx` already uses `toast.error` when `!response.ok`. Do not edit that page, `src/app/(internal)/admin/login/ui/AdminLoginForm.tsx`, or `src/app/(internal)/admin/reset-password/page.tsx`.

## Phase 4: Manual verification

- [x] 4.1 Logged-out: login link “¿Olvidaste tu contraseña?” (`AdminLoginForm.tsx` → `/admin/forgot-password`) renders the forgot page (no bounce to login). Logged-out `/admin/reset-password` and `?token=` render the reset page.
- [x] 4.2 Logged-in: both recovery paths redirect to `defaultHomeForRole`. Other `/admin/*` still require session.
- [x] 4.3 Force send failure (empty/invalid `RESEND_API_KEY` or missing `EMAIL_FROM`): toast is generic retry, not `GENERIC_MESSAGE`. Missing/inactive email still shows success copy. Do not configure Resend delivery.
- [x] 4.4 Record diagnosis in verify notes: `.env.example` empty `RESEND_API_KEY` and unverified `EMAIL_FROM`; `sendPasswordResetEmail` throws if `EMAIL_FROM` is missing; delivery stays out of scope.
- [x] 4.5 Run `npx tsc --noEmit` and `npm run lint`. Do not add a test framework.
