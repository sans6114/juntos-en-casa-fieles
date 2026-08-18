# Manual verification

No automated eval harness is required for this skill. Use this checklist and the sample prompts against a Next.js **16+** project that should follow (or adopt) the monolith layout.

## Checklist

After applying the skill to a real request, verify:

- [ ] Reply included **Plan** text (goal, placement, assumptions, files, feedback ask) **and** code
- [ ] New server logic landed under `src/actions/<domain>/`, not in a random API route
- [ ] New shared UI landed under `src/components/` (or route `ui/` if page-local) with barrel export when appropriate
- [ ] Client-only state used `src/store/`, not Prisma from the client
- [ ] Auth/session gates used **layout** `auth()` + `redirect` when protecting a section
- [ ] Action returns `{ ok, message?, … }` for expected failures
- [ ] Zod (or equivalent) validated untrusted input at the action boundary
- [ ] No PayPal, Cloudinary, or other vendors were added unless explicitly requested
- [ ] Paths and naming match `@/` + domain folders described in the skill
- [ ] Plan text was specific enough that you could reject one assumption and get a corrected approach

## Sample prompts (run manually)

Copy these into a chat with the skill available. Judge with the checklist above.

### Prompt A — placement / architecture

> In this Next.js app, where should I put a new “wishlist” feature (per-user saved products)? Explain the folders and layers, then scaffold the minimal files (Prisma model sketch, server actions, a page, and any store only if needed). I want to review the plan before large diffs — call out assumptions.

**Expect:** Plan first with clear placement; actions under `actions/` (e.g. wishlist); page under `app/(…)`; Prisma relation to User/Product; no payment/media vendors; feedback section.

### Prompt B — auth feature

> Add an admin-only page at `/admin/reports` that lists aggregate order counts. Follow our monolith auth patterns. Show the plan (layout guard vs middleware), then implement the layout check and a server action + page.

**Expect:** `admin` layout role check (or nested layout); action uses `auth()` + Prisma aggregate; no REST CRUD; plan mentions role assumption.

### Prompt C — business logic mutation

> Implement “cancel order” for the owning user: set a cancelled status (add field if missing), only if unpaid. Put code in the right layer and revalidate the orders pages. Give me a short plan I can tweak (e.g. soft-delete vs status enum).

**Expect:** `actions/order/…`; transaction or single update with rules; `{ ok, message }`; `revalidatePath`; plan offers the status vs soft-delete choice.

### Prompt D — negative / should stay lean

> Create a small presentational `Badge` component for order status.

**Expect:** Still a brief plan + `components/` file; should **not** invent API routes, Prisma models, or vendors. If the skill over-scaffolds, tighten the skill later.

## How to score a run

| Result | Meaning |
|---|---|
| Pass | Plan + code; correct layers; no extra vendors; assumptions visible |
| Soft fail | Correct code location but missing plan/feedback text |
| Fail | Logic in wrong layer (e.g. Prisma in client), or unnecessary API surface, or ignored auth layout pattern |

Save notes on soft fails — they usually mean the **response contract** in `SKILL.md` needs stronger wording, not more stack detail.
