# Proposal: Admin Password Recovery Access

## Intent

Unauthenticated staff cannot open password recovery. The login link already points to `/admin/forgot-password`, but `src/proxy.ts` only allows `/admin/login` under `/admin/:path*`. Forgot/reset visits bounce to login, so the link looks dead.

## Scope

### In Scope
- Logged-out access to `/admin/forgot-password` and `/admin/reset-password`
- Redirect logged-in users from those paths to role home
- Generic retry error on email-send failure (do not reveal whether the account exists)
- Record why Resend currently fails (diagnosis only)

### Out of Scope
- Making Resend deliver mail (API key, verified domain, `EMAIL_FROM`)
- UI redesign; shop-user recovery; token TTL/hash/`passwordResetToken` schema

## Capabilities

> Contract for sdd-spec. `openspec/specs/` has only `landing-tokens` (unrelated).

### New Capabilities
- `admin-password-recovery`: Public forgot/reset access, logged-in redirect, request-reset success vs send-failure contract

### Modified Capabilities
- None

## Approach

Widen the proxy public allowlist to the two recovery paths. If a session exists, redirect with `defaultHomeForRole`. Leave pages unchanged.

In `requestPasswordReset`, stop treating send exceptions as success. Validation stays `ok: false`. Absent/inactive users still get generic success. Send failure returns a generic retry message.

Resend diagnosis (not implemented here):
- `sendPasswordResetEmail` already exists
- Send needs `RESEND_API_KEY` and `EMAIL_FROM`; `.env.example` has an empty key and an unverified from-address
- The action `catch` returns `{ ok: true }`, so the UI always looks successful
- The proxy block is why the login link never shows the page

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/proxy.ts` | Modified | Public recovery allowlist; logged-in redirect |
| `src/lib/admin-access.ts` | Modified | Named public recovery paths |
| `src/actions/auth/request-password-reset.ts` | Modified | Send failure is not success |
| Login / forgot / reset pages | Unchanged | Link and toasts already exist; reset must be reachable logged-out |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Public allowlist too broad | Low | Only the two recovery paths |
| Retry timing vs missing-user success | Med | Change failed-send result only |
| Mail still missing after access fix | High | Delivery stays out of scope |

## Rollback Plan

Revert the proxy allowlist/redirect and the action `catch` change. Pages remain guarded as today.

## Dependencies

- Existing recovery pages, `requestPasswordReset`, `passwordResetToken`
- Mail later needs configured `RESEND_API_KEY` and verified `EMAIL_FROM`

## Success Criteria

- [ ] Logged-out “¿Olvidaste tu contraseña?” renders forgot-password (no bounce to login)
- [ ] Logged-out `/admin/reset-password` is reachable
- [ ] Logged-in visit to either path redirects to role home
- [ ] Send failure shows a generic retry toast, not the success copy
- [ ] Resend diagnosis recorded; mail delivery is not required
