# Design: Landing Tokens B — "Papel encendido"

## Technical Approach

One CSS cascade layer plus four Server Components. Fields are plain custom properties scoped under `.jec-landing`; primitives read semantic tokens and never branch on props. No client JS is added. Layer responsibilities per `nextjs-monolith-architecture`: `components/external/shared/` holds presentational primitives and their static config; `lib/` holds path/SEO constants; no action, store, interface or Prisma surface is touched.

## Architecture Decisions

### D1 — Field classes are plain scoped custom properties, not `@theme`

| Option | Tradeoff | Decision |
|---|---|---|
| Register in `@theme inline` | Emits global utilities (`bg-acento`) valid inside `.admin-shell` too, where the vars are undefined; edits a block shared with the shadcn theme | Rejected |
| Plain custom properties + `bg-[var(--cta-bg)]` | Matches every existing `(external)` call site; zero global surface | **Chosen** |
| `<Field>` wrapper component | Forces an element choice and breaks `<section id="cronograma">` anchors used by nav | Rejected |

Consumers write `className="campo-papel"`. `globals.css` order: `@theme inline` / `:root` / `.dark` / `@layer base` untouched → `.jec-landing` (legacy `--jec-*` kept + paper defaults + `color-scheme: light only` + `font-synthesis: none`) → `.jec-landing .campo-*` → `.jec-eyebrow` / `.jec-disclosure` → `.admin-shell` byte-identical.

**Invariant**: every field class MUST declare all nine tokens. Partial fields would inherit a parent field's values through a nested `campo-*` and silently break contrast.

### D2 — Token semantics and field matrix

`--sup` field surface · `--dato` primary text · `--suave` muted text · `--linea` hairline · `--regla` 3px structural rule · `--acento` brand block · `--foco` focus ring · `--cta-bg`/`--cta-fg`.

| Token | `campo-papel` | `campo-tinta` | `campo-fuego` |
|---|---|---|---|
| `--sup` | `--jec-bone` | `--jec-ink` | `--jec-ember` |
| `--dato` | ink | bone | ink |
| `--suave` | `#57504a` (derived: 6.31:1 on bone) | `--jec-smoke` | ink (no muted tier on a saturated field) |
| `--acento` | ember | amber (lime) | ink |
| `--linea` | ink/12% | bone/12% | ink/20% |
| `--regla` | ink | bone | ink |
| `--foco` | ink | bone | ink |
| `--cta-bg` / `--cta-fg` | ink / bone | bone / ink | ink / bone |

Orange and lime appear only as `--acento` block fills, never as `--dato` or `--foco`.

### D3 — `CtaButton` discriminated union

Narrow on the whole props object before destructuring; never default the discriminant (a default breaks narrowing under `strict`). `href?: never` on the button member rejects `<CtaButton as="button" href=…>`. No casts, no `any`.

```ts
type Base = { children: ReactNode; className?: string; variant?: "solid" | "pill" }
type LinkProps = Base & { as?: "link"; href: string } &
  Omit<ComponentPropsWithoutRef<typeof Link>, "href" | "className" | "children">
type ButtonProps = Base & { as: "button"; href?: never } &
  Omit<ComponentPropsWithoutRef<"button">, "className" | "children">
export type CtaButtonProps = LinkProps | ButtonProps
```

`Ubicacion.tsx:37` and `HeroFinale.tsx:258` compile unchanged (`as` absent → link). `disabled:` utilities live in the shared class string (inert on `<a>`); `w-full` stays at the call site via `className`.

**Hover is structural, not chromatic**: `hover:-translate-y-0.5` + `hover:shadow-[3px_3px_0_0_var(--regla)]`, `motion-reduce:transform-none`. Rejected: accent-colour hover — 6.31:1 on paper but 2.73:1 on tinta, so it cannot be field-agnostic. Colours never change, so the approved 17.25:1 holds in every field and every state.

### D4 — `color-scheme` is document-level

`.jec-landing`'s `dark only` was the only dissenter against `html`, `:root` and `.admin-shell`. After the flip all four agree with PRODUCT.md principle 5. Consequence: dark *fields* are painted with tokens, never with `color-scheme`; any control placed on `campo-tinta` MUST set its own colours instead of relying on UA defaults.

### D5 — `SectionHeading`

Props unchanged → four call sites need zero edits. Eyebrow becomes `<p class="jec-label jec-eyebrow">` with `color: var(--suave)`; the brand carrier is `.jec-eyebrow::before` — `content:""`, `inline-block`, `28px × 3px`, `background: var(--acento)`, `vertical-align: middle`, `margin-inline-end: .75rem`. It follows `--acento` through the cascade with no colour prop, adds no DOM node, is not announced by AT, and stays centred under `align="center"`. Kept as a global class (not `before:` utilities) because `Disclosure` and the chained sections reuse it and JSX quoting of `content-['']` is brittle.

### D6 — `Disclosure`

Server Component, native `<details>`/`<summary>`, props `{ summary, children, className?, defaultOpen? }`. Keyboard support and JS-disabled operation are native. `list-style: none` + `::-webkit-details-marker { display:none }`; chevron is a CSS border triangle in `--acento` rotated by `details[open] > summary::after`, `motion-reduce` guarded. No icon asset exists for it, and the border trick reuses the 3px rule language.

### D7 — `navigation.ts`

```ts
export type NavItem = { href: string; label: string; essential: boolean }
export type SocialLink = { href: string; label: string; handle: string }
export const navItems: readonly NavItem[]
export const socialLinks: readonly SocialLink[] // [] — data is an open question
```

`essential` is a **header density hint**, not a permission: `true` MUST stay visible at every breakpoint; `false` MAY be hidden below `md` (`hidden md:inline`) because the destination is reachable elsewhere. Future consumers (footer) MUST ignore it and render every item. Exported from the `shared/index.ts` barrel.

### D8 — `jec-assets.ts` and the sequencing problem

New shape: `favicon`, `background.pisada`, `logos` (`jecWhiteSvg`→`logoblanco.svg`, `jecBlackPng`, `ivsWhite`, `ivsBlack`), `personaje` (4, all real), `hero.finale`, **new** `og.default`, **new** `iconos` (`ancla.png`, `pisada.png`), `recursos` (the 7 real SVGs: `background-colores.svg`, `huellas.svg`, `logo-blanco.svg`, `logo-blanco-desc.svg`, `logo-color.svg`, `logo-negro.svg`, `logo-negro-desc.svg`). Dropped: `background.hero/secondary/tertiary`, `logos.jecWhitePng`, `oradores`, `recursos.pngsTransparente`.

`siteConfig.ogImage` → **new** `jecAssets.og.default` (`/jec/og/og-jec-2026.jpg`).

Measured, not assumed: `hero.png` is 2730×1536 and **5.9 MB**. That exceeds X's 5 MB image cap and is heavy enough that scrapers commonly time out, so it cannot serve as the OG image directly. SVG is rejected by most OG consumers and `background.webp` is an untitled texture, so neither substitutes.

Resolution (user-approved): ship a derivative of `hero.png`, centre-cropped to the 1.91:1 ratio Open Graph and X expect and resized to the canonical **1200×630**, at **184 KB**. It is a crop of an existing brand asset, not a new visual — PRODUCT.md's "use the assets as uploaded, do not reinvent them" is respected. `hero.finale` stays declared for its own in-app use.

**Sequencing (the constraint)**: removing `oradores` breaks `invitados/data.ts`, owned by `landing-home-secciones`.

| Option | Tradeoff | Decision |
|---|---|---|
| Defer `oradores` removal | This change then fails its own `landing-assets` capability | Rejected |
| Repoint the six to an existing asset | Invents a visual inside a tokens change | Rejected |
| Make `imageSrc` optional | Forces a second edit in `InvitadoCard` | Rejected |
| Inline the six literals in `data.ts`, drop the `jecAssets` import | Behaviour-preserving (already 404 today), zero visual change, typecheck green | **Chosen** |

Same rule for `HeroSequence.tsx:220`: `logos.jecWhitePng` → `logos.jecWhiteSvg` — a one-token consequence of the key removal that also fixes a live 404. Both carry `// TODO(landing-home-secciones)`. `landing-assets` constrains the registry, not every string in the app; the residual 404 is documented and owned by the successor change.

`SiteHeader` keeps `logos.ivsWhite`: swapping to `ivsBlack` is a repaint of an unrepainted section (proposal Risk 2, AGENTS.md Atomic Scope) → handoff to `landing-home-secciones`.

**Drift guard**: none automated. A `fs.existsSync` walker wired into `prebuild` is the right eventual shape, but it is not in the proposal's scope and costs review budget. Enforcement is the spec requirement plus a source-of-truth comment atop `jec-assets.ts`. Accepted risk: drift can recur.

### D9 — Typographic discipline

Verified: Cayento ships **only** weight 400; Helvetica Neue ships real 300/400/500/700/900. So `.jec-landing { font-synthesis: none }` kills Cayento's faux bold while every `font-bold`/`font-extrabold` on Helvetica still resolves to a real file (800 → 900). Only faux italic at HN 300/500 is lost; unused.

Heading reset goes **inside `@layer base`** — `.jec-landing :is(h1,…,h6){font-weight:400}` — so Tailwind's utilities layer still wins where a component asks explicitly, instead of fighting specificity `(0,1,1)` vs `(0,1,0)`.

Threshold: `.jec-display` allowed from **34px (2.125rem)** up — in Tailwind terms `text-4xl` and above.

| Call site | Size | Action |
|---|---|---|
| `CronogramaDiaCard.tsx:10,13,24` | 12 / 24–30 / 14–16px | → `.jec-label` |
| `ContenidoCard.tsx:15,18` | 12 / 24–30px | → `.jec-label` |
| `InvitadoCard.tsx:101` | 18–20px | → `.jec-label` |
| `InvitadoCard.tsx:82` | 72–96px | keeps `.jec-display` |
| `HeroCountdown.tsx:70` | 10.4px | violation, **out of scope** → `landing-home-secciones` |

## Data Flow

```
globals.css  .jec-landing (paper defaults + discipline)
                 └─ .campo-papel | .campo-tinta | .campo-fuego   ← section className
                        │ rewrites 9 tokens
                        ▼
        CtaButton · SectionHeading · Disclosure · cards
        read --cta-bg/--cta-fg/--acento/--dato/--foco … no props

navigation.ts ──→ SiteHeader (now)  ──→ SiteFooter (chained change)
jec-assets.ts ──→ seo/site.ts ogImage · layout favicon · Hero* · SiteHeader
```

## File Changes

| File | Action | Description |
|---|---|---|
| `src/app/globals.css` | Modify | `.jec-landing` block replaced by the direction B kit; `.admin-shell`, `:root`, `.dark`, `@theme inline` untouched |
| `src/lib/jec-assets.ts` | Modify | 38 dead paths removed; `iconos` added; `oradores` dropped |
| `src/lib/seo/site.ts` | Modify | `ogImage` → `jecAssets.og.default` (see D8; `hero.finale` is 5.9 MB and cannot serve as OG) |
| `.../shared/CtaButton.tsx` | Modify | Discriminated union + CTA token pair + structural hover |
| `.../shared/SectionHeading.tsx` | Modify | `.jec-eyebrow`, `--suave` text, `--dato` title |
| `.../shared/navigation.ts` | Create | `navItems` + `socialLinks` + types |
| `.../shared/Disclosure.tsx` | Create | Styled native `<details>` |
| `.../shared/index.ts` | Modify | Barrel: `Disclosure`, navigation exports |
| `.../shared/SiteHeader.tsx` | Modify | Consumes `navItems` |
| `CronogramaDiaCard` / `ContenidoCard` / `InvitadoCard` | Modify | `.jec-display` → `.jec-label` per D9 |
| `.../hero/HeroSequence.tsx` | Modify | `jecWhitePng` → `jecWhiteSvg` (one token) |
| `.../invitados/data.ts` | Modify | Drop `jecAssets` import; inline six literals + TODO |
| `inscripcion/confirmacion/page.tsx` | Modify | Hand-copied `<Link>` → `<CtaButton href="/">` |
| `inscripcion/ui/InscripcionForm.tsx` | Modify | Hand-copied `<button>` → `<CtaButton as="button" type="submit" className="w-full">` |
| `DESIGN.md` | Modify | Direction B decided; stale `fueguin-reversion.png` claim corrected |

## Testing Strategy

| Layer | What | Approach |
|---|---|---|
| Static | Union narrowing, dead asset keys | `npx tsc --noEmit`, `npm run lint` |
| Visual | Three fields, CTA/focus/eyebrow contrast, no synthetic bold | Browser on `/`, `/contenidos`, `/inscripcion`, `/inscripcion/confirmacion` |
| Behaviour | `Disclosure` with JS disabled; `next/image` serving `logoblanco.svg` | Manual |
| SEO | `siteConfig.ogImage` returns 200 | Manual fetch |

## Threat Matrix

N/A — no routing, shell, subprocess, VCS/PR automation, executable-file classification, or process-integration boundary. CSS tokens, presentational components and static path constants only.

## Migration / Rollout

No migration. Partial rollback per proposal: reverting only the `.jec-landing` block restores the prior visual layer while keeping the asset repair.

## Open Questions

- [x] **Social links data** — RESOLVED by the user: `socialLinks` ships typed but empty in this change. No URL exists anywhere in the repo, and none is invented (AGENTS.md Zero Assumptions). The footer that lands in `landing-home-secciones` renders nothing when the array is empty, so the real entries can be filled in later without touching a component.
- [x] **`--suave` on paper** — RESOLVED by measurement, not by eye: `#57504a` on `#f4efe8` is **6.92:1**, above the 6.31:1 target and comfortably past the 4.5:1 floor for body text. The earlier note that it was "derived from 6.31:1" was imprecise; the value passes with margin.
- [x] **`hero.png` as OG image** — RESOLVED. Measured at 2730×1536 / 5.9 MB, over X's 5 MB cap, so it is not usable directly. Replaced by a 1200×630 / 184 KB centre-crop derivative at `/jec/og/og-jec-2026.jpg`. See D8.

Nothing blocks `sdd-tasks`.
