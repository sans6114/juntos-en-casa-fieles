---
name: Juntos En Casa 2026
description: Conferencia cristiana de adolescentes y jóvenes — landing pública (JEC)
colors:
  fuego-naranja: "#ff5a00"
  fuego-verde: "#c0f700"
typography:
  display:
    fontFamily: "Cayento, ui-sans-serif, system-ui, sans-serif"
  label:
    fontFamily: "Helvetica Neue, ui-sans-serif, system-ui, sans-serif"
  condensed:
    fontFamily: "Helvetica Neue Condensed, ui-sans-serif, system-ui, sans-serif"
---

# Design System: Juntos En Casa 2026 (Landing pública)

## Overview

Este archivo documenta deliberadamente poco. La implementación visual actual de `(external)` (fondo `--jec-ink` casi negro, formas sin redondeo, cero sombras, ritmo de spacing actual) la produjo un pase de IA anterior que no distinguió identidad de marca real de decisión arbitraria — por eso **no** se documenta aquí como doctrina. Lo que sigue es solo lo que el equipo confirmó como identidad real de JEC.

**Key Characteristics:**
- Dualidad de fuego en dos colores: naranja y verde.
- Fueguín como mascota/personaje central del evento.
- El ancla como símbolo de marca disponible (sin regla de uso todavía).
- La historia de apertura se cuenta con una secuencia animada de frases (GSAP), no con una imagen estática.
- Tono enérgico y juvenil en motion, copy y ritmo.

## Colors

Paleta deliberadamente acotada a dos colores, ambos derivados del fuego.

### Primary
- **Fuego Naranja** (#ff5a00): color de marca principal. Implementado hoy en CSS como el token `--jec-ember`.

### Secondary
- **Fuego Verde** (#c0f700): segundo color de marca confirmado. Implementado hoy en CSS como el token `--jec-amber` — el nombre del token es un error heredado (el valor es verde-lima, no ámbar); no se corrige acá porque es un cambio de código, no de documentación.

### Named Rules
**La Regla de las Dos Brasas.** La paleta de JEC son exactamente dos colores — naranja y verde — y ambos existen porque vienen del fuego. No sumar un tercer acento sin confirmarlo primero como identidad de marca.

## Typography

**Display Font:** Cayento (con fallback ui-sans-serif, system-ui, sans-serif)
**Label/Body Font:** Helvetica Neue
**Condensed/Numeric Font:** Helvetica Neue Condensed

**Character:** Pareja tipográfica enérgica y juvenil — Cayento lleva los momentos declarativos (frases del hero, titulares grandes); Helvetica Neue lleva texto de lectura y etiquetas; Helvetica Neue Condensed cubre contextos numéricos/ticker ajustados.

Los tamaños, pesos y tracking exactos hoy en el código son estado de implementación actual, no identidad confirmada — quedan abiertos a revisión en un futuro pase de `document` o `new-work`.

## Components

Solo los elementos que el equipo confirmó como identitarios; el resto de los componentes de `(external)` (botones, cards, formulario) no tiene tratamiento visual confirmado como marca y no se documenta acá.

### Fueguín (mascota)
Personaje oficial del evento. Assets en `public/jec/personaje/` (poses: llama, orando, festejando, apuntando). Existe además `fueguin-reversion.png` en disco que todavía no está expuesto por `src/lib/jec-assets.ts` — asset disponible, pendiente de cablear.

### Ancla
Símbolo de marca confirmado. Asset disponible en `public/jec/iconos/`. Sin regla de uso establecida todavía — dónde y cómo aparece se decide en un surface o task futuro, no acá.

### Secuencia de frases del hero (GSAP)
Mecánica de marca confirmada: la apertura del sitio se cuenta con una secuencia animada de frases cortas, reveladas por click (no por scroll) sobre el loader de la mascota, usando la tipografía display. Implementada hoy en `HeroSequence.tsx`. El detalle exacto de timing/loader es implementación, no identidad; el hecho confirmado es el mecanismo narrativo en sí — contar la apertura con texto animado, no con una imagen fija.

## Do's and Don'ts

### Do:
- **Do** usar Cayento para momentos display/titulares, Helvetica Neue para label y texto de lectura, Helvetica Neue Condensed para contextos numéricos/ticker.
- **Do** construir la paleta desde naranja (#ff5a00) y verde (#c0f700) — los dos colores de marca confirmados.
- **Do** dar a Fueguín protagonismo como mascota del evento.
- **Do** mantener el tono enérgico y juvenil — en motion, copy y ritmo, no corporativo ni solemne.
- **Do** contar momentos clave de apertura con secuencias de frases animadas en vez de una imagen estática sola — es parte de la identidad de JEC.

### Don't:
- **Don't** tratar el fondo oscuro actual (`--jec-ink`), las formas sin redondeo, la ausencia de sombras o el ritmo de spacing actual como doctrina de marca confirmada — son decisiones de un pase de IA anterior, siguen abiertas para un futuro `new-work` o `document`.
- **Don't** sumar un tercer color de acento sin confirmarlo primero — la paleta es deliberadamente de solo dos colores.
- **Don't** asumir que el nombre del token CSS `--jec-amber` describe el color real — hoy contiene el verde de marca confirmado (#c0f700), no ámbar.
