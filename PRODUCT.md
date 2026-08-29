# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two primary audiences:
- **Public attendees**: jóvenes y adolescentes que se inscriben al evento desde la landing pública (`(external)`), sin autenticación.
- **Staff interno**: `ADMIN` (métricas, grilla completa, usuarios, panel de contacto) y `COLABORADOR` (grilla completa; detalle y contacto solo de inscriptos sin congregación) — acceso vía `/admin`, autenticado con Auth.js.

## Product Purpose

Aplicación web para la gestión de inscripciones del evento "Juntos En Casa" (JEC), con panel de administración y seguimiento de contacto post-evento.

## Positioning

Doble propósito sin uno dominante: (1) la experiencia de la conferencia en sí — 3 días de adoración, palabra y unidad — y (2) el seguimiento pastoral posterior, conectando a los asistentes sin congregación con una iglesia local (flujo de contacto en el panel, limitado a inscriptos "sin iglesia").

## Operating Context

- Evento anual JEC 2026, 3 días: 18, 19 y 20 de septiembre de 2026, comienza 19:00 ART.
- Organiza Iglesia cristiana Vida Sobrenatural, La Plata, Buenos Aires.
- Flujo admin: login → rol → (ADMIN: métricas/vista general/grilla/usuarios/contacto) o (COLABORADOR: grilla → detalle solo sin iglesia) → si sin congregación: contacto vía WhatsApp, marcar contactado, guardar observación.
- Stack existente: Next.js 16 (App Router, TS), PostgreSQL, Prisma ORM, Auth.js.

## Capabilities and Constraints

- Registro público de inscripción (`Inscripcion`: nombre, email, teléfono?, edad, congregación? con FK opcional a `Congregacion`).
- Roles: `ADMIN` y `COLABORADOR`, con visibilidad de contacto restringida por congregación para `COLABORADOR`.
- `color-scheme: light only` forzado en `globals.css` — no debe habilitarse dark mode automático (distorsión reportada en modo oscuro del SO).
- Dos sistemas visuales separados en el mismo proyecto: la landing pública (`(external)`) usa tipografías locales propias (Helvetica Neue, Helvetica Neue Condensed, Cayento) y assets de marca en `public/jec/`; `/admin` usa una capa de tokens shadcn/Tailwind independiente (`--font-admin`, paleta `--color-*` de shadcn).

## Brand Commitments

- Mascota oficial del evento: **Fueguín** (tema de fuego), con assets en `public/jec/personaje/`.
- Recursos de diseño (SVGs, íconos, fondos) se van subiendo de forma incremental a `public/jec/` (recursos, iconos, background) y deben usarse tal como se suben — no reemplazar ni reinventar el asset.
- Tipografías obligatorias para la landing: las ya cargadas localmente en el proyecto (Helvetica Neue / Helvetica Neue Condensed / Cayento) — no introducir tipografías nuevas.
- Paleta y criterio de UX/UI vigente: el ya definido en `src/app/globals.css` — preservar como base, no reemplazar por una paleta nueva.

## Evidence on Hand

- Assets de marca reales en `public/jec/` (background, iconos, personaje/mascota, recursos SVG optimizados) — usar estos, no inventar placeholders.
- Sin testimonios, casos de estudio ni cifras de asistencia documentados; no fabricar evidencia social.

## Product Principles

1. La landing pública prioriza persuasión (inscripción) sin perder fidelidad a la identidad Fueguín/tema de fuego ya establecida.
2. El panel admin prioriza operación clara y rápida para staff (métricas, grilla, contacto), con separación estricta de visibilidad por rol.
3. El contacto post-evento con inscriptos sin iglesia es una función central, no accesoria — cualquier rediseño del panel debe preservar ese flujo.
4. Un solo lenguaje visual coherente por superficie: la landing no debe heredar tokens shadcn de admin, ni viceversa.
5. Modo claro forzado es una decisión deliberada, no un descuido — cualquier trabajo de diseño debe respetarlo.
