# Delta for landing-tokens

## MODIFIED Requirements

### Requirement: Landing color tokens

The public landing theme scoped to `.jec-landing` MUST use `campo-papel` (paper, `#f4efe8`) as its base field, not an ink-dark palette. Flat always-on tokens (`--jec-ink` as background, fixed ember/amber accent roles) are replaced by field classes (`campo-papel` / `campo-tinta` / `campo-fuego`; see "Field classes") that each rewrite a shared semantic token set. `color-scheme` under `.jec-landing` MUST be `light only`.

The change MUST NOT modify `.admin-shell` or the global shadcn theme on `:root` / `.dark`.

(Previously: base field was `--jec-ink` (#0b0a0f) with flat ember/amber tokens and `color-scheme: dark only`.)

#### Scenario: Landing shell defaults to the paper field

- **Given** a page wrapped with `.jec-landing`
- **When** no additional field class is applied
- **Then** the rendered background is `campo-papel`'s paper (`#f4efe8`), not the former ink background

#### Scenario: Admin theme stays untouched

- **Given** `.admin-shell` and the `:root` / `.dark` shadcn theme
- **When** the field classes are introduced
- **Then** both remain byte-identical to before the change

### Requirement: Shared CtaButton

The system MUST provide a reusable `CtaButton` component rendering either a Next.js `Link` (default) or a native `<button>` (`as="button"`), and MUST derive background/foreground from the `--cta-bg` / `--cta-fg` pair exposed by the active field class, never from a fixed ember/amber pair. Orange (`#ff5a00`, 2.73:1 on paper) and lime (`#c0f700`, 1.11:1 on paper) MUST NOT be used as CTA text or focus-ring color on a light field.

(Previously: wrapped only `Link`; fixed "ember fill, amber hover" regardless of field.)

#### Scenario: Primary CTA link

- **Given** `href` and children, no `as` prop
- **When** `CtaButton` renders inside any field
- **Then** it renders an accessible `<a>` styled with that field's `--cta-bg` / `--cta-fg` pair and accepts optional `className`

#### Scenario: CTA rendered as a native button

- **Given** `as="button"` and `type="submit"` inside a `<form>`
- **When** `CtaButton` renders
- **Then** it renders a native `<button>` with the same field-aware styling and submits the form on activation

#### Scenario: CTA legible in every field

- **Given** `CtaButton` inside `campo-papel`, `campo-tinta`, or `campo-fuego`
- **When** its computed colors are measured
- **Then** contrast is 17.25:1 in all three fields

### Requirement: Shared SectionHeading

The system MUST provide a reusable `SectionHeading` Server Component with optional eyebrow and required title. The eyebrow MUST render using label typography (`jec-label`), not display typography, in ink-on-field color; the field's accent color MUST be carried by a 28px `::before` rule, not by the eyebrow's own text color.

(Previously stated: eyebrow renders "using display typography and secondary accent color" — already false before this change, since `SectionHeading.tsx` used `jec-label`; corrected here to match actual pre-existing behavior, not a change introduced by this redesign.)

#### Scenario: Render heading with eyebrow

- **Given** `eyebrow` and `title` props
- **When** `SectionHeading` renders
- **Then** the eyebrow appears above the title using `jec-label` typography with a 28px accent `::before` rule, at 6.31:1 contrast

#### Scenario: Render heading without eyebrow

- **Given** only a `title` prop
- **When** `SectionHeading` renders
- **Then** no eyebrow element or accent rule is rendered

## ADDED Requirements

### Requirement: Field classes

`.jec-landing` MUST expose three field classes — `campo-papel`, `campo-tinta`, `campo-fuego` — each rewriting the same semantic token set: `--acento`, `--dato`, `--suave`, `--linea`, `--sup`, `--regla`, `--foco`, `--cta-bg`, `--cta-fg`. A primitive placed in any field MUST adopt that field's values via these shared names, with no prop-level branching.

#### Scenario: Same primitive adapts across fields

- **Given** a primitive that only reads the shared token names
- **When** placed inside `campo-papel`, then `campo-tinta`, then `campo-fuego`
- **Then** it renders with each field's colors with no prop change

#### Scenario: Contrast targets are met per field

- **Given** `--cta-bg` / `--cta-fg` and `--foco` in each field
- **When** measured
- **Then** CTA contrast is 17.25:1 in all three fields; focus-ring contrast is 17.25:1 on `campo-papel` and 15.54:1 on `campo-tinta` / `campo-fuego`

### Requirement: Typographic discipline

Because Cayento ships a single weight (400), `.jec-landing` MUST set `font-synthesis: none`, and headings (`h1`–`h6`) MUST NOT inherit synthetic browser bold. Cayento MUST be reserved for text at 34px and above; text below 34px MUST use Helvetica Neue Bold.

#### Scenario: Small text does not use Cayento

- **Given** a card eyebrow or label under 34px inside `.jec-landing`
- **When** it renders
- **Then** it uses Helvetica Neue Bold with no synthetic bold artifact

#### Scenario: Large headings use Cayento

- **Given** a heading at 34px or larger inside `.jec-landing`
- **When** it renders
- **Then** it uses Cayento at its native 400 weight

### Requirement: Disclosure primitive

The system MUST provide a `Disclosure` component rendering a styled native `<details>` / `<summary>` element. It MUST work with JavaScript disabled and MUST be keyboard operable.

#### Scenario: Works without JavaScript

- **Given** a page containing `Disclosure` with JavaScript disabled
- **When** the user activates `<summary>`
- **Then** the content toggles open/closed via native `<details>` behavior alone

#### Scenario: Keyboard operable

- **Given** a page containing `Disclosure`
- **When** the user tabs to the summary and presses Enter or Space
- **Then** the disclosure toggles without requiring a mouse

### Requirement: Single navigation source

Nav items and social links MUST be defined in exactly one module (`src/components/external/shared/navigation.ts`). Both the site header and footer MUST consume this module rather than declaring inline copies.

#### Scenario: Header and footer share the same nav data

- **Given** `navigation.ts` exporting nav items and social links
- **When** `SiteHeader` and the footer render
- **Then** both read from `navigation.ts`, with no inline duplicate array in either

#### Scenario: Adding a nav item updates both surfaces

- **Given** a new entry added to `navigation.ts`
- **When** the header and footer next render
- **Then** the new entry appears in both with no additional code change
