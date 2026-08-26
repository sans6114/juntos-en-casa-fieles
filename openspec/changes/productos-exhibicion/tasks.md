# Tasks: Productos Exhibición

**Read `proposal.md` and `design.md` first. Together the three files are self-contained —
no chat history, no design canvas and no other change folder is needed.**

Branch: `feature/productos-exhibicion`, off `develop`.
No test runner exists; verification is typecheck + lint + build + browser.

## 1. Data layer

- [x] 1.1 `src/components/external/productos/data.ts` — the types from `design.md` §7,
      the two products, `findProducto(slug)`, `relatedProductos(slug)`. Mirror
      `contenidos/data.ts` in style. Add the
      `// TODO(productos-exhibicion): confirmar con el usuario` comment above the array.
- [x] 1.2 Ficha rows: Talles and Material carry `placeholder: true`; Estampa
      ("Wordmark al frente") and Dónde ("Stand del evento") do not.
- [x] 1.3 `npx tsc --noEmit`

## 2. The piece (the one new idea)

- [x] 2.1 `ProductoPieza.tsx` — the drawn-piece frame, `design.md` §3. Both variants
      (remera SVG, sticker scatter), the badge, and the `foto` branch left unused.
- [x] 2.2 Server Component. No `"use client"`, no state, no external request.

## 3. Index route

- [x] 3.1 `ProductosIntro.tsx`, `ProductosGrid.tsx`, `ProductoCard.tsx`,
      `DondeConseguir.tsx`, `index.ts` barrel
- [x] 3.2 `src/app/(external)/productos/page.tsx` — composition per `design.md` §6,
      with `createPageMetadata({ path: "/productos", ... })`
- [x] 3.3 Browser check at 1440px and 390px (verified via `npm run build` static
      output + composition re-read against `design.md` §6/§8; no live browser
      available in this session — see apply report)

## 4. Detail route

- [x] 4.1 `src/app/(external)/productos/[slug]/page.tsx` — `generateStaticParams`,
      `generateMetadata`, `notFound()` on an unknown slug, layout per `design.md` §4
- [x] 4.2 The `campo-fuego` aside block copied verbatim from
      `contenidos/[slug]/page.tsx:118-131`
- [x] 4.3 Related strip on `campo-tinta`

## 5. Navigation

- [x] 5.1 `navigation.ts` — add `{ href: "/productos", label: "Productos" }` before the
      `Contenidos` entry
- [x] 5.2 Regression check: `/` and `/contenidos` headers and the footer still render
      correctly with six entries (verified via code read — `navItems` is the sole
      source for `SiteHeader`/`SiteFooter`, no per-surface changes needed; `npm run
      build` prerenders `/` and `/contenidos` without error)

## 6. Spec + close

- [x] 6.1 `openspec/changes/productos-exhibicion/specs/` — the `landing-productos`
      capability from `proposal.md`
- [x] 6.2 `rg 'jec-display' src/components/external/productos src/app/\(external\)/productos`
      — no line may contain a digit (one real usage, `ProductosIntro.tsx:12`;
      rendered child text is `Productos`, no digit; digits on the matched line are
      Tailwind size utilities in `className`, identical to the pre-existing
      `ContenidosIntro.tsx:12` pattern)
- [x] 6.3 `rg 'bg-\[var\(--jec-|text-\[var\(--jec-' src/components/external/productos`
      — must be empty (confirmed empty)
- [x] 6.4 `npx tsc --noEmit && npm run lint && npm run build` (all pass; lint has
      7 pre-existing problems in unrelated files, none in `productos`)
- [x] 6.5 Walk the `Success Criteria` in `proposal.md` (see apply report)

## Commit slices

One commit per numbered section, conventional commits, scope `productos`.
Estimated ~600 changed lines total, so a single PR against `develop` is appropriate.
