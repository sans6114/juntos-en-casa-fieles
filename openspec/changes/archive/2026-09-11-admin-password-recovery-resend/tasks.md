# Tasks: Admin Password Recovery Resend

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 20–40 |
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
| 1 | Fail Resend API errors + local onboarding comments | PR 1 | `npx tsc --noEmit` | Active staff whose email is the Resend-key inbox: mail → valid link → set password → login; inactive = generic success, no send | `src/lib/email/send-password-reset.ts`, `.env.example` |

Depends on applied `admin-password-recovery-access` (logged-out recovery routes + `requestPasswordReset` catch `{ ok: false, RETRY_MESSAGE }`). Do not re-do proxy/audience work.

## Phase 1: Local env comments

- [x] 1.1 In `.env.example`, keep `RESEND_API_KEY=""` and `EMAIL_FROM="Juntos en Casa <onboarding@resend.dev>"`. Align comments: local uses onboarding; it only delivers to the API-key owner mailbox. No secrets; do not invent a production/unverified from-address.

## Phase 2: Fail Resend API errors

- [x] 2.1 In `src/lib/email/send-password-reset.ts`, inspect `resend.emails.send` `{ data, error }` and throw on API error so the sibling catch can return `{ ok: false, RETRY_MESSAGE }`. Keep the existing missing-`EMAIL_FROM` throw. Do not edit `src/lib/email/resend.ts`, `src/actions/auth/request-password-reset.ts`, `src/actions/auth/reset-password.ts`, proxy, UI, or token schema.

## Phase 3: Manual verification

- [ ] 3.1 Local `RESEND_API_KEY` + onboarding `EMAIL_FROM`. Request reset as an **active** staff user (`ADMIN` or colaborador with `activo`) whose email is the Resend-key inbox. Confirm mail, valid token, new password via existing `resetPassword`, then login. Audience is unchanged.
- [x] 3.2 Inactive staff: generic success, no send. Invalid/missing Resend config: generic retry toast, not silent success.
- [x] 3.3 Run `npx tsc --noEmit`. Lint only files this change touches (`src/lib/email/send-password-reset.ts`) if repo-wide `npm run lint` is already red. Do not add a test runner.
