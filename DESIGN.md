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

Este archivo documenta deliberadamente poco. La implementación visual previa de `(external)` (fondo `--jec-ink` casi negro, formas sin redondeo, cero sombras) la produjo un pase de IA anterior que no distinguió identidad de marca real de decisión arbitraria — por eso no quedó documentada como doctrina, y quedó abierta a reemplazo. Esa pregunta ya está resuelta: ver "Dirección visual — Papel encendido (decidida)" más abajo. Lo que sigue en el resto de este archivo es lo que el equipo confirmó como identidad real de JEC — la parte que la dirección visual respeta y no reemplaza.

## Dirección visual — Papel encendido (decidida)

Tres direcciones se construyeron sobre el mismo contenido y se compararon; el equipo eligió **B — "Papel encendido"**: campo hueso (`--jec-bone`) dominante en vez de tinta oscura, tinta negra (`--jec-ink`) como texto y estructura, las dos brasas de marca (naranja/verde) entrando como bloque de color — nunca como color de texto de cuerpo —, radio de 6px, reglas estructurales de 3px en vez de sombras. `color-scheme` pasa de `dark only` a `light only`, alineado con el punto "Do" de modo claro forzado más abajo.

Implementada en el change `landing-tokens-b` vía tres clases de campo (`campo-papel` / `campo-tinta` / `campo-fuego`) que reescriben un mismo set de tokens semánticos (`--sup`, `--dato`, `--suave`, `--linea`, `--acento`, `--regla`, `--foco`, `--cta-bg`, `--cta-fg`), de forma que cualquier primitivo colocado en un campo hereda su contraste correcto sin lógica condicional por componente. Contrastes objetivo verificados: CTA 17.25:1 en los tres campos, foco 17.25:1 sobre claro / 15.54:1 sobre oscuro, eyebrow 6.31:1.

Esto reemplaza — no complementa — el fondo oscuro, las formas sin redondeo y la ausencia de sombras que el "Don't" de abajo marcaba como no confirmados. Esa doctrina anterior queda cerrada.

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
Personaje oficial del evento. Assets en `public/jec/personaje/` (poses: llama, orando, festejando, apuntando). `fueguin-reversion.png` **no existe en disco** (verificado: no está bajo `public/` ni trackeado en git) — la referencia anterior a un asset "pendiente de cablear" era incorrecta.

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
- **Don't** reintroducir el fondo oscuro (`--jec-ink` como base), las formas sin redondeo o la ausencia de sombras del pase de IA anterior — esa pregunta ya está resuelta: ver "Dirección visual — Papel encendido (decidida)" más arriba.
- **Don't** sumar un tercer color de acento sin confirmarlo primero — la paleta es deliberadamente de solo dos colores.
- **Don't** asumir que el nombre del token CSS `--jec-amber` describe el color real — hoy contiene el verde de marca confirmado (#c0f700), no ámbar.
