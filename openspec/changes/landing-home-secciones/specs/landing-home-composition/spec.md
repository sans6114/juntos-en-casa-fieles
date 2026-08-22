# Landing Home Composition Specification

## Purpose

Defines the public home route (`/`): which chrome and sections it renders and in what order, how the pinned header behaves relative to the hero and to anchored sections, that every CTA resolves to a live destination, that schedule content agrees with `siteConfig.eventStartsAt`, and the field-conformance rule that binds shared chrome and sections alike. Touches `/contenidos` only through the one forced exception named below.

## Requirements

### Requirement: Home page section set and order

`/` MUST render exactly one instance each of Hero, SiteHeader, Cronograma, Invitados, Ubicacion, Faq, and SiteFooter, plus a persistent mobile CTA bar. The reader MUST encounter them in the order Hero, SiteHeader, Cronograma, Invitados, Ubicacion, Faq, SiteFooter as they scroll. `Cronograma`, `Invitados` and `Ubicacion` — written and exported today but mounted nowhere — MUST all be mounted by this change.

Note that SiteHeader follows Hero in **document order**, not precedes it: that ordering is what "Header hidden over hero, pinned after" below requires. Once pinned, the header is visually at the top of the viewport while remaining after the hero in the document.

#### Scenario: All sections mount in reading order

- **GIVEN** a request to `/`
- **WHEN** the page renders
- **THEN** Hero, SiteHeader, Cronograma, Invitados, Ubicacion, Faq, and SiteFooter each appear exactly once, in that document order

#### Scenario: No home section component is left unmounted

- **GIVEN** `Cronograma`, `Invitados` and `Ubicacion`, exported but unmounted before this change
- **WHEN** `/` renders
- **THEN** each one is mounted

### Requirement: Header hidden over hero, pinned after

The header MUST NOT be visible anywhere within the hero's full viewport height, and MUST become visible and stay pinned to the top of the viewport from the first section after the hero onward, without a client component, scroll listener, or `IntersectionObserver`.

The header MUST remain a normal part of the document while off-screen: it MUST NOT be hidden from assistive technology, removed from the accessibility tree, or made unfocusable in order to satisfy the visual requirement. Keyboard focus reaching it while the hero is on screen MUST bring it into view rather than move focus to something invisible.

#### Scenario: Header absent during hero

- **GIVEN** a viewport scrolled anywhere within the hero
- **WHEN** the header's position is inspected
- **THEN** it is not visible in the viewport

#### Scenario: Header stays focusable and announced

- **GIVEN** a keyboard user tabbing forward from the hero
- **WHEN** focus reaches a header nav link
- **THEN** the header is scrolled into view and the focused link is visible, with no `aria-hidden`, `display: none` or negative `tabindex` applied to hide it

#### Scenario: Header pins from Cronograma onward

- **GIVEN** the viewport has scrolled past the hero into Cronograma
- **WHEN** the user continues scrolling
- **THEN** the header stays fixed at the top of the viewport for the rest of the page

### Requirement: Header field surface and cross-field legibility

The header MUST render its own opaque `campo-*` surface (not an inherited one) and MUST stay legible — logo, nav links, hover, and focus ring — on every field it travels over while pinned, including on `/contenidos`, where it MUST look as it does today.

#### Scenario: Header legible while pinned over campo-tinta

- **GIVEN** the pinned header travels over a `campo-tinta` section
- **WHEN** its colors are inspected
- **THEN** logo, nav text, and focus ring remain legible against that field

#### Scenario: /contenidos header unchanged

- **GIVEN** `/contenidos`, out of scope for this change except this header
- **WHEN** the header renders there
- **THEN** its logo, nav colors, hover, and focus ring match today's appearance

### Requirement: Anchor identity and scroll clearance

Cronograma, Invitados, and Ubicacion MUST each expose the `id` their `navigation.ts` entry targets (`cronograma`, `invitados`, `ubicacion`), and each MUST land its heading fully below the pinned header when navigated to directly.

Faq is deliberately **not** a nav destination. `navItems` MUST NOT gain a Faq entry (user decision, 2026-08-21): `navItems` is shared by SiteHeader and SiteFooter, so an entry there would also place Faq in `/contenidos`'s header. Faq is reached by scrolling `/` only.

#### Scenario: Anchored heading clears the pinned header

- **GIVEN** a direct navigation to `/#cronograma`
- **WHEN** the browser scrolls to that anchor
- **THEN** the Cronograma heading is fully visible below the pinned header, not obscured under it

#### Scenario: Faq is absent from navigation

- **GIVEN** `navigation.ts`'s `navItems`
- **WHEN** SiteHeader and SiteFooter render from it
- **THEN** no Faq entry appears in either

### Requirement: Inscription CTA resolves to a live route

No CTA, anchor, or nav link in `src/` MAY reference `/#inscripcion`. Every control representing the inscription entry point (header nav, hero finale CTA, sticky mobile bar) MUST resolve to `/inscripcion`.

#### Scenario: Zero dead references remain

- **GIVEN** the full `src/` tree
- **WHEN** searched for `/#inscripcion`
- **THEN** no reference remains

#### Scenario: Every inscription CTA opens the real route

- **GIVEN** the header nav, hero finale CTA, and sticky mobile bar
- **WHEN** each is activated
- **THEN** it navigates to `/inscripcion`

### Requirement: Schedule dates match the event source of truth

Cronograma's three day labels MUST represent the calendar dates and weekdays beginning at `siteConfig.eventStartsAt` (18, 19, and 20 September 2026: Friday, Saturday, Sunday).

#### Scenario: Displayed dates agree with the source of truth

- **GIVEN** `siteConfig.eventStartsAt` of 2026-09-18
- **WHEN** Cronograma renders its three day labels
- **THEN** they name 18, 19 and 20 September 2026 with their correct weekdays, in the site's Spanish copy (currently the `"Viernes 18"` / `"Sábado 19"` / `"Domingo 20"` shape), not the stale 12 / 13 / 14

### Requirement: Field-driven color conformance

Every landing surface **this change owns** — the shared chrome (SiteHeader, SiteFooter, the mobile CTA bar) and the sections mounted on `/` — MUST establish its colors by carrying a `campo-*` field class on the surface element, and its descendants MUST take their colors from that field's shared tokens (`--sup`, `--dato`, `--suave`, `--acento`, `--linea`, `--regla`, `--foco`, `--cta-bg`, `--cta-fg`). Neither the surface nor its descendants MAY hardcode a `bg-[var(--jec-*)]` or `text-[var(--jec-*)]` literal.

The field class belongs on the surface, not on every element: descendants inherit the tokens and MUST NOT each carry their own `campo-*` class.

This requirement is scoped to the surfaces named above. It does NOT bind other routes that also sit under `.jec-landing` and are out of scope for this change — notably `/inscripcion` (`InscripcionForm.tsx`, `CongregacionCombobox.tsx`) and `ContenidosGrid.tsx`, all of which still hold such literals and are addressed by later changes.

#### Scenario: No hardcoded field literal remains

- **GIVEN** the sections and chrome this change mounts
- **WHEN** their class lists are inspected
- **THEN** none contains a `bg-[var(--jec-*)]` or `text-[var(--jec-*)]` literal

#### Scenario: Out-of-scope routes are not required to conform yet

- **GIVEN** `/inscripcion`'s form components and `ContenidosGrid.tsx`, which still hold `bg-[var(--jec-ink)]` literals
- **WHEN** this change's conformance is evaluated
- **THEN** those files are not in violation, being outside the surfaces this change owns

#### Scenario: /contenidos literal is the one forced exception

- **GIVEN** `contenidos/page.tsx`'s header wrapper
- **WHEN** its class is inspected
- **THEN** it uses `campo-tinta`, not the `bg-[var(--jec-ink)]` literal, reproducing today's colors

#### Scenario: Location CTA passes contrast

- **GIVEN** Ubicacion's CTA rendered on its assigned field
- **WHEN** its computed contrast is measured
- **THEN** it meets the field's CTA contrast, not background-on-background

### Requirement: Section field assignment

Cronograma, Ubicacion, and Faq MUST use `campo-papel`; Invitados MUST use `campo-tinta`; exactly one of SiteFooter or the mobile CTA bar MUST use `campo-fuego`, with the other using `campo-papel` or `campo-tinta`.

#### Scenario: Sections render on their assigned field

- **GIVEN** the composed home page
- **WHEN** Cronograma, Ubicacion, Faq, and Invitados render
- **THEN** the first three use `campo-papel` and Invitados uses `campo-tinta`

### Requirement: Display typeface reserved for large type

No element rendered on `/` MAY carry `.jec-display` below 34px at any breakpoint. Cayento ships a single weight, so the browser synthesises bold at small sizes; `landing-tokens-b` D9 reserves the display face for large type and `.jec-label` carries everything else. The two violations this change inherits are `HeroCountdown.tsx:70` (10.4px) and `Ubicacion.tsx:26` (20px, 24px at `md`).

`InvitadoCard`'s large "?" glyph keeps `.jec-display`: at 72–96px it is above the floor and is the deliberate display use D9 preserves.

#### Scenario: No small display type remains on the home page

- **GIVEN** every element rendered on `/`
- **WHEN** each `.jec-display` occurrence is measured at every breakpoint
- **THEN** none computes below 34px

#### Scenario: The mystery-guest glyph keeps the display face

- **GIVEN** `InvitadoCard`'s "?" glyph at 72–96px
- **WHEN** its classes are inspected
- **THEN** it still carries `.jec-display`

### Requirement: Placeholder content is unambiguously marked

Every placeholder value in `faq/data.ts` and `ubicacion/data.ts` MUST be marked as a placeholder in its rendered text, not only in a code comment.

#### Scenario: Placeholder text is visibly marked

- **GIVEN** an unreplaced entry in `faq/data.ts` or `ubicacion/data.ts`
- **WHEN** it renders on the page
- **THEN** its visible text identifies it as a placeholder (e.g. "placeholder", "reemplazar")

### Requirement: Footer navigation composition

SiteFooter MUST render every `navItems` entry regardless of its `essential` hint, MUST render nothing for `socialLinks` while it is empty, and MUST NOT include an invented tagline.

#### Scenario: All nav items appear, no social section when empty

- **GIVEN** `navigation.ts`'s current `navItems` and empty `socialLinks`
- **WHEN** SiteFooter renders
- **THEN** every nav item appears and no social-link element renders

### Requirement: Guest cards are static and non-interactive

Each Invitados card MUST render as a static "mystery guest" treatment with no client-side reveal state (no hover/click/focus interaction) and MUST NOT reference any `/jec/oradores/*` asset path.

#### Scenario: Guest card has no interactive state

- **GIVEN** an Invitados card
- **WHEN** inspected for client interactivity and asset references
- **THEN** it holds no reveal state and no `/jec/oradores/*` path

### Requirement: Location map has no external dependency

Ubicacion's map MUST render as inline vector graphics, with no iframe, no map SDK, and no network request to an external mapping service.

#### Scenario: Map renders without external requests

- **GIVEN** Ubicacion's map on page load
- **WHEN** network activity is inspected
- **THEN** no request to an external mapping service occurs

### Requirement: Persistent mobile CTA to inscription

On mobile viewports, a CTA bar targeting `/inscripcion` MUST remain visible at any scroll position without a client component or scroll listener, and MUST NOT obscure footer content.

#### Scenario: CTA bar stays visible and clear of the footer

- **GIVEN** a 320px-wide viewport scrolled to the footer
- **WHEN** the page is inspected
- **THEN** the sticky CTA bar is visible and does not overlap footer content
