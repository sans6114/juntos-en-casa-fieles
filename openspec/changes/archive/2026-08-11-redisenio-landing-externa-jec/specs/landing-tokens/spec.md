# Spec delta: landing tokens + shared primitives

## ADDED Requirements

### Requirement: Landing color tokens

The public landing theme scoped to `.jec-landing` MUST expose:

- `--jec-ink` as the base background (near-black, #0b0a0f)
- `--jec-ink-soft` as elevated surface (#15121A)
- `--jec-ember` as primary accent orange (#FF5A00)
- `--jec-amber` as secondary accent green (#C0F700)
- `--jec-bone` and `--jec-smoke` unchanged in role

The change MUST NOT modify `.admin-shell` or the global shadcn theme on `:root` / `.dark`.

#### Scenario: Tokens available under landing shell

- **Given** a page wrapped with `.jec-landing`
- **When** components reference `var(--jec-ember)`, `var(--jec-amber)`, or `var(--jec-ink-soft)`
- **Then** they resolve to the redesigned palette values above

### Requirement: Shared SectionHeading

The system MUST provide a reusable `SectionHeading` Server Component with optional eyebrow and required title.

#### Scenario: Render heading with eyebrow

- **Given** `eyebrow` and `title` props
- **When** `SectionHeading` renders
- **Then** the eyebrow appears above the title using display typography and secondary accent color

### Requirement: Shared CtaButton

The system MUST provide a reusable `CtaButton` Server Component that wraps Next.js `Link` using the Hero primary CTA visual pattern (ember fill, amber hover).

#### Scenario: Primary CTA link

- **Given** `href` and children
- **When** `CtaButton` renders
- **Then** it renders an accessible link with the landing CTA styles and accepts optional `className` overrides
