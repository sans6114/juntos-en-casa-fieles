# Landing Assets Specification

## Purpose

Guarantee that every static asset path declared in the codebase's asset registry (`src/lib/jec-assets.ts`) resolves to a file that actually exists under `public/`, so page rendering and Open Graph metadata never reference a missing file. This concern is independent of any visual redesign and MUST hold before, during, and after token or theme changes.

## Requirements

### Requirement: Asset registry integrity

Every path declared as a value in `src/lib/jec-assets.ts` (including nested objects such as `background`, `logos`, `personaje`, `recursos`, `iconos`) MUST resolve to a file that exists under `public/` at build time.

#### Scenario: All declared paths exist on disk

- **GIVEN** the exported `jecAssets` object in `src/lib/jec-assets.ts`
- **WHEN** each leaf string value is resolved as a path under `public/`
- **THEN** a file exists at that path for every leaf value

#### Scenario: Dead entry is removed together with its group

- **GIVEN** an asset group (e.g. `oradores`) whose backing files were deleted from `public/`
- **WHEN** the registry is updated
- **THEN** the group MUST be removed from `jecAssets` rather than left pointing at a missing file

### Requirement: Open Graph image resolves through the registry

`siteConfig.ogImage` (`src/lib/seo/site.ts`) MUST be assigned from a value in `jecAssets`, and that value MUST resolve to an existing file under `public/`.

The referenced image MUST also be consumable by the platforms that fetch it: it MUST be a raster format (SVG is rejected by most Open Graph consumers), it SHOULD use the canonical 1200x630 dimensions, and it MUST stay under 5 MB, the lowest cap among the major consumers.

#### Scenario: Open Graph metadata serves a real image

- **GIVEN** a public page rendering `createPageMetadata()`
- **WHEN** the resulting `openGraph.images[0].url` is requested
- **THEN** the server responds with a 200 status and the image content, not a 404

#### Scenario: A resolvable but unusable image is still a defect

- **GIVEN** `siteConfig.ogImage` points at an existing raster of 2730x1536 weighing 5.9 MB
- **WHEN** a consumer that caps images at 5 MB fetches it
- **THEN** the requirement is violated even though the path resolves, because resolving is necessary but not sufficient

### Requirement: Asset removal is paired with declaration removal

Deleting a file from `public/` MUST be accompanied, in the same change, by removing its corresponding declaration from `src/lib/jec-assets.ts` (or repointing it to a surviving file).

#### Scenario: Removing a public asset without updating the registry is a defect

- **GIVEN** a file referenced by `jecAssets` is deleted from `public/`
- **WHEN** the corresponding registry entry is not removed or repointed in the same change
- **THEN** the asset registry integrity requirement is violated
