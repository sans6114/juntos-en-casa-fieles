# Folder structure reference

## Route groups (`src/app`)

| Area | Typical path | Notes |
|---|---|---|
| Public / catalog | `app/(shop)/`, `app/(shop)/product/[slug]/` | Shared shop shell: TopMenu, Sidebar, Footer |
| Auth pages | `app/auth/login`, `app/auth/new-account` | Own layout (often minimal chrome) |
| Checkout | `app/(shop)/checkout/...` | Layout requires session |
| Admin | `app/(shop)/admin/...` | Layout requires `role === 'admin'` |
| Auth API | `app/api/auth/[...nextauth]/route.ts` | Export Auth.js `handlers` only |

Name route groups for the product (`(shop)`, `(marketing)`, `(dashboard)`). Keep **one composition shell per group** via `layout.tsx`.

### Page-local UI

```
app/(shop)/checkout/(checkout)/ui/PlaceOrder.tsx
app/(shop)/admin/product/[slug]/ui/ProductForm.tsx
```

Use `ui/` under the route when the component is tightly coupled to that page. Promote to `src/components/` when a second route needs it.

## Actions (`src/actions`)

```
actions/
├── index.ts                 # barrel re-exports
├── auth/login.ts
├── auth/logout.ts
├── auth/register.ts
├── product/get-product-by-slug.ts
├── product/product-pagination.ts
├── product/create-update-product.ts
├── order/place-order.ts
└── …
```

Naming: verb-oriented files (`get-…`, `create-…`, `place-…`, `change-…`). Export named async functions.

## Components (`src/components`)

Group by UI concern, not by page route:

```
components/
├── index.ts
├── ui/           # shell: menu, sidebar, footer, pagination, title
├── product/      # slideshow, quantity, size, stock label
├── products/     # grids
├── orders/       # status badges, etc.
└── providers/    # SessionProvider and other client providers
```

## Stores (`src/store`)

```
store/
├── index.ts
├── cart/cart-store.ts      # persist when UX needs reload survival
├── address/address-store.ts
└── ui/ui-store.ts          # sidebar open, etc.
```

Server entities (orders, users, catalog) live in the DB via actions — not in Zustand.

## Interfaces (`src/interfaces`)

Define UI-facing types (`CartProduct`, `Address`) separately from Prisma models when the client shape differs (e.g. images as `string[]`, size as union).

## Prisma

- Schema: `prisma/schema.prisma`
- Migrations: `prisma/migrations/`
- Singleton: `src/lib/prisma.ts` (guard against hot-reload multiple clients in dev)
- Seed: `src/seed/` + npm script

## Config & env

- `.env.template` lists required vars (`DATABASE_URL`, `AUTH_SECRET`, …) with placeholders
- `docker-compose.yml` for local Postgres
- `src/config/` for fonts and static app config
