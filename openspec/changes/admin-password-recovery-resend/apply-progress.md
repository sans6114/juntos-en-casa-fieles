# Apply Progress: admin-password-recovery-resend

**Mode**: Standard (strict_tdd: false; no test runner)
**Workload**: single PR (forecast Low; Decision needed before apply: No)
**Batch**: Phase 1–3, tasks 1.1, 2.1, 3.1–3.3
**Status**: 4/5 tasks complete; 3.1 blocked by proving constraint

## Work Unit Evidence

| Evidence | Required value |
|---|---|
| Focused test command and exact result | `npx tsc --noEmit` → exit 0. `npx eslint src/lib/email/send-password-reset.ts` → exit 0. `npm run lint` → exit 1 from **pre-existing** issues in `src/hooks/use-mobile.ts` (`react-hooks/set-state-in-effect`) and a warning in `src/components/external/hero/ScrollExpand.tsx` (`@next/next/no-img-element`); neither file is in this change. |
| Runtime harness command/scenario and exact result | Temporary `npx tsx` harness (deleted after run; no secrets printed). Local env: `RESEND_API_KEY` present, `EMAIL_FROM` present, `EMAIL_FROM` is **not** the onboarding test sender. Resend `/emails` returned **401** `API key is invalid` for every send (no `id`). Active staff count: 4. Matching owner-mailbox staff: **not proven**. Inbox receipt: **not claimed**. Seed ADMIN password: **not changed**. **3.2 inactive:** throwaway `COLABORADOR` `activo: false` → `requestPasswordReset` `{ ok: true, GENERIC_MESSAGE }`, token count 0 (no send), user deleted (`harnessUsersLeft: 0`). **Missing `EMAIL_FROM`:** helper threw `Falta la variable de entorno EMAIL_FROM`. **Invalid Resend config:** helper throw on API error; `requestPasswordReset` for an active staff user returned `{ ok: false, RETRY_MESSAGE }` (not silent success). Cleanup: unused reset tokens 0; throwaway gone. |
| Rollback boundary | Revert `src/lib/email/send-password-reset.ts` and `.env.example`. No schema rollback. |

## Completed Tasks

- [x] 1.1 `.env.example` keeps empty `RESEND_API_KEY` and onboarding `EMAIL_FROM`; comments say local onboarding only delivers to the API-key owner mailbox; no production from-address invented
- [x] 2.1 `sendPasswordResetEmail` inspects `resend.emails.send` `{ error }` and throws on API error; missing-`EMAIL_FROM` throw kept
- [x] 3.2 Inactive staff: generic success, no send. Invalid/missing Resend config: retry, not silent success
- [x] 3.3 `npx tsc --noEmit` + eslint on the touched ts file

## Blocked Task

- [ ] 3.1 Send from the browser succeeded for `santisosa244@gmail.com` (active COLABORADOR). UI showed the generic success copy. Server log: `requestPasswordReset` 200 with no Resend error after fixing `EMAIL_FROM`. First attempt failed: `EMAIL_FROM` was missing the closing `>` (`Juntos en Casa <onboarding@resend.dev`). Inbox click + `resetPassword` + login not completed here (token is only in the mail; Resend list API returned 403).

**Unblock rest of 3.1:** open the mail (check spam), use the reset link, set a new password, log in. Or paste the reset URL so the browser flow can finish.

## Files Changed

| File | Action | What Was Done |
|------|--------|---------------|
| `.env.example` | Modified | Onboarding comments; empty key; no secrets; no invented production from |
| `src/lib/email/send-password-reset.ts` | Modified | Throw when Resend returns `{ error }` |
| `openspec/changes/admin-password-recovery-resend/tasks.md` | Modified | Marked 1.1, 2.1, 3.2, 3.3 `[x]`; 3.1 left `[ ]` |
| `openspec/changes/admin-password-recovery-resend/apply-progress.md` | Created | This file |

Not edited (per task 2.1): `src/lib/email/resend.ts`, `src/actions/auth/request-password-reset.ts`, `src/actions/auth/reset-password.ts`, proxy, UI, token schema.

## Deviations from Design

None — specs/design were skipped by the user. Implementation follows proposal + `tasks.md` only. Helper destructures `{ error }` from the send result (the API error field); unused `data` is not bound.

## Issues Found

- Repo-wide `npm run lint` already fails on files outside this change (`use-mobile.ts`, `ScrollExpand.tsx`).
- Local Resend credentials are present but not operational (invalid API key; from-address is not onboarding). 3.1 cannot be proven.
- Harness send-failure probe deleted unused reset tokens for the probed active staff user (count went to 0). No throwaway users left.

## Remaining Tasks

- [ ] 3.1 Active staff whose email is the Resend-key inbox: mail → valid token → `resetPassword` → login
