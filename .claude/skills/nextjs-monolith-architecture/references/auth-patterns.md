# Auth patterns reference

## Configuration

Centralize Auth.js / NextAuth v5 in `src/auth.config.ts`:

- `pages.signIn` / `newUser` pointing at `app/auth/...`
- Credentials (or other providers) with Zod-validated input
- Password verify with a hash library (e.g. bcryptjs)
- JWT callback: attach safe user payload to `token`
- Session callback: expose `session.user` (id, role, email, name, …) **without** password
- Export `{ handlers, auth, signIn, signOut }` from the same module

Route handlers:

```ts
// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/auth.config";
export const { GET, POST } = handlers;
```

Extend session types in a `next-auth` module augmentation file (e.g. `nextauth.d.ts`) so `session.user.role` and `session.user.id` are typed.

## Actions

- `actions/auth/login.ts` — wrap `signIn('credentials', …)`
- `actions/auth/register.ts` — create user (hash password) then optional login
- `actions/auth/logout.ts` — wrap `signOut`

## Layout guards (preferred)

**Session required:**

```tsx
// e.g. checkout/layout.tsx
const session = await auth();
if (!session?.user) {
  redirect("/auth/login?redirectTo=/checkout/address");
}
return <>{children}</>;
```

**Role required:**

```tsx
// e.g. admin/layout.tsx
const session = await auth();
if (session?.user.role !== "admin") {
  redirect("/auth/login");
}
return <>{children}</>;
```

Guards in layouts keep authorization next to the route tree and work with Server Components. Middleware can complement (matchers, edge redirects) but should not be the only place role checks live for admin sections.

## Client session

Wrap the tree with `SessionProvider` in a client `Providers` component used from the root layout. Keep third-party providers optional and only add them when the feature needs them.

## Roles in schema

Model roles in Prisma (`enum Role { admin user }` or equivalent) and mirror the value on the session. Admin actions should re-check role server-side, not only rely on the layout.
