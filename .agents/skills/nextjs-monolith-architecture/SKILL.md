---
name: nextjs-monolith-architecture
description: >-
  Structures and implements work in a Next.js 16+ App Router monolith: where
  files go, folder layout, route groups, pages, layouts, components, server
  actions, Prisma models/migrations, Auth.js/NextAuth, layout auth/role guards,
  Zustand stores, Zod boundaries, domain features, and greenfield scaffolding.
  Use this skill whenever the user creates or moves folders/files, asks where
  something belongs, adds a page/component/action/store, builds auth or business
  logic, protects admin/checkout routes, shapes action results ({ ok, message }),
  or says architecture/monolith/App Router/server actions — even for small
  requests like “add a form” or “new feature X”. Always respond with plan text
  for feedback plus concrete code. Prefer this over ad-hoc Next structure when
  the repo is (or should be) this monolith; do not add payment or media CDN
  vendors unless asked.
---

# Next.js Monolith Architecture

Apply this skill when building or changing features in a **Next.js 16+ App Router monolith**: one codebase for UI, server actions, auth, and data access.

Do **not** introduce payment SDKs, image CDN vendors, or other product-specific integrations unless the user asks for them. Keep the architecture tool- and vendor-agnostic.

## Response contract (always)

Every substantive reply that applies this skill must include **both**:

1. **Plan text (for feedback)** — short, reviewable explanation *before or alongside* the code:
   - Goal in one sentence
   - Target layers/paths and why those locations
   - Assumptions and open choices the user can correct
   - Files to create or touch (checklist)
2. **Code** — concrete files and edits that match the plan

If intent is ambiguous, lead with plan text and a clear feedback ask; implement only after the user confirms, or when the request is already specific enough that delaying would be unhelpful. Still keep the plan text so the user can course-correct.

### Plan text template

```markdown
## Plan
**Goal:** …
**Placement:** …
**Assumptions:** …
**Files:**
- `path/a` — why
- `path/b` — why
**Feedback needed:** …
```

Then ship the code (or wait if feedback was requested first).

## Core architecture

```
src/
├── app/                 # App Router: route groups, pages, layouts, minimal API
│   ├── (shop)/          # Main authenticated/storefront experience (name as needed)
│   ├── auth/            # Sign-in / register routes
│   └── api/auth/        # Auth.js route handlers only (avoid a general REST layer)
├── actions/             # Server Actions — application/business layer by domain
├── components/          # Reusable UI (feature folders + barrel `index.ts`)
├── store/               # Zustand client state (cart, UI, draft forms, etc.)
├── interfaces/          # Domain TypeScript types (UI/DTOs — not Prisma models)
├── lib/                 # Shared infra (Prisma singleton, helpers)
├── auth.config.ts       # Auth.js / NextAuth config (providers, callbacks)
├── config/              # App config (fonts, constants)
├── seed/                # DB seed scripts
└── utils/               # Pure helpers
prisma/                  # schema + migrations
```

Path alias: `@/*` → `src/*`.

**Read when needed:**
- Folder placement rules → [references/folder-structure.md](references/folder-structure.md)
- Server action conventions → [references/server-actions.md](references/server-actions.md)
- Auth & layout guards → [references/auth-patterns.md](references/auth-patterns.md)

## Layer responsibilities

| Layer | Responsibility | Does not |
|---|---|---|
| `app/**/page.tsx` | Compose UI, call actions, set `revalidate` / searchParams | Hide heavy business rules |
| `app/**/layout.tsx` | Shell UI + **auth/role guards** via `auth()` + `redirect` | Own domain mutations |
| `actions/<domain>/` | `"use server"` reads/writes, Zod validation, Prisma, `revalidatePath` | Depend on React components |
| `components/` | Presentational / interactive UI | Talk to Prisma directly |
| `store/` | Client-only ephemeral/persisted UI state | Be source of truth for server entities |
| `interfaces/` | Shared TS shapes for UI and action inputs | Duplicate Prisma client types unnecessarily |
| `lib/prisma.ts` | Singleton PrismaClient | Business workflows |
| `app/api/` | Auth handlers (and rare webhooks if required) | CRUD mirror of actions |

Prefer **Server Actions over REST** for app features. Add `app/api` routes only for protocol requirements (OAuth callbacks, external webhooks).

## Decision guide: where does this go?

| User asks for… | Put it in… |
|---|---|
| New page / URL | `src/app/...` with the matching route group |
| Form submit / mutation / server query used by pages | `src/actions/<domain>/` + re-export from `actions/index.ts` |
| Reusable widget | `src/components/<area>/` + barrel export |
| Cart, sidebar open, address draft | `src/store/<area>/` |
| Shared product/user shape for UI | `src/interfaces/` |
| DB model / relation | `prisma/schema.prisma` + migration |
| Login, session, roles | `auth.config.ts` + `actions/auth/` + layout guards |
| Admin-only section | nested `admin/layout.tsx` checking `session.user.role` |
| Login-required flow (e.g. checkout) | dedicated layout with `auth()` + redirect |

When creating a **feature**, touch all relevant layers in one pass (schema if needed → action → UI → store if client state → types), and explain that sequence in the plan text.

## Conventions to preserve

1. **Domain folders** under `actions/` (`auth`, `product`, `order`, `user`, …) — one concern per file when practical.
2. **Barrel exports** from `actions/index.ts`, `components/index.ts`, `store/index.ts`, `interfaces/index.ts`.
3. **Action result shape**: `{ ok: boolean; message?: string; ...data }` — avoid throwing across the client boundary for expected failures.
4. **Zod** at action boundaries for FormData / untrusted input.
5. **Prisma `$transaction`** for multi-step writes (stock + order, related creates).
6. **Layout-based authorization** rather than relying on middleware alone (middleware may exist but guards in layouts are the source of truth for role/session gates).
7. **Server Components by default**; `"use client"` only for interactivity, stores, or browser APIs.
8. **Colocate page-only UI** under `app/.../ui/` when it is not reusable; move to `components/` when shared.
9. **Docker Postgres + Prisma migrations + seed** for local bootstrapping; document env via `.env.template` without secrets.

## Stack baseline (Next.js 16+)

Assume or introduce as needed (versions compatible with Next.js 16+):

- Next.js App Router, React, TypeScript (strict)
- Prisma + PostgreSQL
- Auth.js / `next-auth` v5 (credentials or providers the user chooses)
- Zustand (client state), Zod (validation), Tailwind (styling) unless the repo already differs

Match the **existing** package choices in the target repo when adapting an existing app. When scaffolding greenfield, prefer this baseline and state it in the plan text.

## Anti-patterns

- Fat client components that import Prisma
- “API routes for everything” when a server action suffices
- Dumping all actions in one file
- Putting business rules only in components
- Vendor lock-in (payments, media CDN) baked into the architecture skill output
- Skipping plan text and only dumping code
- Inventing a microservices split for features that belong in this monolith

## Manual verification

Use [references/manual-verification.md](references/manual-verification.md) for a checklist and sample prompts to validate behavior on a real Next.js 16+ project.
