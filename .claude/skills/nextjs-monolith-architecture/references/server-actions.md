# Server actions reference

## Basics

Every action module starts with:

```ts
"use server";

import prisma from "@/lib/prisma";
```

Import actions in Server Components or client forms via `@/actions` (barrel) or a specific path.

## Result shape

Prefer explicit results over thrown errors for expected business failures:

```ts
return { ok: true, order };
// or
return { ok: false, message: "No session" };
```

Throw (or let Prisma throw inside a transaction) when the failure should abort a `$transaction` and map to `{ ok: false }` in an outer `catch`.

## Validation

Parse untrusted input with Zod before touching the database:

```ts
const parsed = schema.safeParse(Object.fromEntries(formData));
if (!parsed.success) {
  return { ok: false, message: "Invalid input" };
}
```

Coerce FormData strings (`z.coerce.number()`, transforms for comma-separated lists) at the boundary.

## Reads used by pages

Pagination / filters belong in actions, not in the page body:

```ts
export const getPaginatedItems = async ({ page = 1, take = 12, … }) => {
  // prisma findMany + count
  // map DB → UI shape (e.g. images: product.ProductImage.map(i => i.url))
};
```

Pages stay thin: read `searchParams`, call the action, render components, optional `redirect` on empty.

## Writes & cache

After successful mutations:

```ts
import { revalidatePath } from "next/cache";

revalidatePath("/admin/products");
revalidatePath(`/product/${slug}`);
```

Set `export const revalidate = N` on catalog pages when ISR-style revalidation fits.

## Transactions

Use `prisma.$transaction` when multiple writes must succeed or fail together (decrement stock + create order + create address). Check invariants after updates (e.g. `inStock < 0` → throw → rollback).

## Auth inside actions

```ts
import { auth } from "@/auth.config";

const session = await auth();
if (!session?.user?.id) {
  return { ok: false, message: "Unauthorized" };
}
```

Do not trust client-sent `userId` for authorization.

## What not to do

- Import actions into `lib/` circularly with auth/prisma carelessly — keep deps one-way: actions → lib/auth/interfaces
- Call `revalidatePath` on failure paths
- Return Prisma entities with sensitive fields (`password`) — strip in the action
