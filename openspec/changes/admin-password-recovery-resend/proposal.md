# Proposal: Admin Password Recovery Resend

## Intent

Local staff reset mail is not operational. `sendPasswordResetEmail` ignores Resend `{ data, error }` and `.env.example` uses an unverified from-address, so delivery cannot be proven.

## Scope

### In Scope
- Local env: `RESEND_API_KEY`, `EMAIL_FROM=Juntos en Casa <onboarding@resend.dev>`
- Fail the send helper on Resend API errors
- Manual proof: active staff whose email is the Resend-key inbox → mail → valid link → new password → login
- Align `.env.example` (no secrets)

### Out of Scope
- Staging/prod verified domain
- UI redesign; shop/public-user recovery
- Token TTL/schema; test runner
- `admin-password-recovery-access` proxy work (dependency)

## Capabilities

> Contract for sdd-spec. Main specs: `landing-tokens` only. `admin-password-recovery` is not in main specs.

### New Capabilities
- `admin-password-recovery-email`: Local Resend delivery, inbox verification, and complete staff password reset

### Modified Capabilities
- None

## Approach

Audience stays any active staff (`ADMIN` or colaborador with `activo`). Inactive users keep generic-success non-send.

Inspect `resend.emails.send` `{ data, error }` in `src/lib/email/send-password-reset.ts` and throw on API error so the sibling send-failure contract can show a generic retry. Do not change pages, proxy, token schema, or audience rules. Point local `EMAIL_FROM` at Resend’s test sender.

**Proving constraint (not a permission change):** `onboarding@resend.dev` only delivers to the mailbox that owns `RESEND_API_KEY`. Local proof MUST use an active staff user with that inbox.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/lib/email/send-password-reset.ts` | Modified | Honor `{ data, error }`; throw on API error |
| `.env.example` | Modified | Local onboarding `EMAIL_FROM`; comments; no secrets |
| `src/actions/auth/request-password-reset.ts` | Unchanged here | Audience/inactive path stay; send-failure catch is sibling |
| `src/actions/auth/reset-password.ts` | Unchanged | Completes reset after mail link |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Proof email ≠ Resend-key mailbox | High | Keep audience; document constraint |
| Sibling access change not applied | High | Depend on it; recovery pages must be reachable logged-out |
| Silent Resend `{ error }` | High | Throw from the send helper |

## Rollback Plan

Revert `src/lib/email/send-password-reset.ts` and `.env.example`. Restore prior `EMAIL_FROM`. No schema rollback.

## Dependencies

- `openspec/changes/admin-password-recovery-access/` (or applied): logged-out forgot/reset routes and send-failure contract
- Operator `RESEND_API_KEY`; local-only Resend test sender

## Success Criteria

- [ ] `.env.example` documents `RESEND_API_KEY` and local onboarding `EMAIL_FROM` without secrets
- [ ] Resend API errors fail the send path (not silent success)
- [ ] Active staff whose email is the Resend-key inbox receives the mail
- [ ] Reset token is valid; user sets a new password and can log in
- [ ] Inactive users still get generic success and no send
