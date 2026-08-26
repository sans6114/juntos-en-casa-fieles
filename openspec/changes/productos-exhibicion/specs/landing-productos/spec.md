# Landing Productos Specification

## ADDED Requirements

### Requirement: Product catalog

The system MUST provide a public `/productos` index route listing every entry in the static product catalog (`src/components/external/productos/data.ts`), and a `/productos/[slug]` detail route addressed by each product's unique `slug`. Both routes MUST be statically generated (`generateStaticParams` on the detail route). An unknown slug MUST resolve to `notFound()`.

#### Scenario: Index lists every product

- **Given** the static product catalog
- **When** `/productos` renders
- **Then** every catalog entry appears as a card linking to `/productos/{slug}`

#### Scenario: Detail route resolves a known slug

- **Given** a product with slug `remera-jec-2026`
- **When** `/productos/remera-jec-2026` is requested
- **Then** the page renders that product's detail, statically generated at build time

#### Scenario: Unknown slug is not found

- **Given** no product has slug `no-existe`
- **When** `/productos/no-existe` is requested
- **Then** the route resolves via `notFound()`

### Requirement: No transactional affordance

`/productos` and `/productos/[slug]` MUST NOT offer any purchase, reservation, pre-save, cart, or stock control. The only interactive control on either route MUST be a `CtaButton` pointing at `/inscripcion`.

#### Scenario: No purchase control exists

- **Given** either `/productos` or `/productos/[slug]`
- **When** the rendered markup is inspected
- **Then** it contains no form, button, or link whose purpose is to buy, reserve, or pre-save a product — the only actionable control is `CtaButton` targeting `/inscripcion`

### Requirement: Unconfirmed commercial values render as placeholders

Every unconfirmed commercial value (price, sizes, material) MUST render through the `PlaceholderTag` primitive, never as plain text and never as an invented number.

#### Scenario: Price renders as a placeholder

- **Given** a product card or detail page
- **When** the price is rendered
- **Then** it appears inside `PlaceholderTag` reading "Precio a confirmar", not as a plain number

#### Scenario: Sizes and material render as placeholders

- **Given** a product's "Ficha" card
- **When** the Talles and Material rows render
- **Then** both values appear inside `PlaceholderTag`, while Estampa and Dónde render as plain text

### Requirement: Product piece is drawn, never photographed

`ProductoPieza` MUST render a product as a flat vector/CSS composition on a `campo-*` field — a Server Component with no client state and no external network request. It MUST NOT render a fabricated or stock photograph. When a product's `foto` field is populated with a real asset path, `ProductoPieza` MUST render that image in the same frame instead of the drawn composition.

#### Scenario: Undecorated product renders a drawn piece

- **Given** a product with no `foto`
- **When** its `ProductoPieza` renders
- **Then** the frame shows a flat vector silhouette (remera SVG or sticker die-cut scatter) on a `campo-*` field, with no photographic image

#### Scenario: A product with a real photo swaps the composition

- **Given** a product whose `foto` field is set
- **When** its `ProductoPieza` renders
- **Then** the frame shows that image instead of the drawn composition, with no other markup change

### Requirement: Single call to action

The single call to action across `/productos` and `/productos/[slug]` MUST be "Inscribirme", linking to `/inscripcion`. No other competing action MUST be present on either route.

#### Scenario: Every CTA points to inscripción

- **Given** any `CtaButton` rendered on `/productos` or `/productos/[slug]`
- **When** its `href` is inspected
- **Then** it is `/inscripcion`

### Requirement: Productos reachable from navigation

`navigation.ts`'s `navItems` MUST include an entry for `/productos` labeled "Productos", positioned before the "Contenidos" entry. Because `SiteHeader` and the footer both consume `navItems`, the entry MUST be reachable from every public route without additional per-surface code.

#### Scenario: Nav entry appears on every public surface

- **Given** the updated `navItems`
- **When** `SiteHeader` or the footer renders on any public route
- **Then** a "Productos" link to `/productos` appears, positioned before "Contenidos"
