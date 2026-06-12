# Embed Seeding Playbook — el motor de widgets ya está, falta distribuirlo

> **Estado del motor (verificado 2026-06-12):** COMPLETO y live. No falta ingeniería.
> - Botón "Embeber en tu sitio" en cada calc (`Calculator.astro`, `.embed-cta`).
> - Modal con 2 snippets (iframe + script responsive), ambos con **backlink keyword-anchor followable** en la página anfitriona (marca→home + nombre-calc→/slug).
> - Ruta `/embed/[slug]` (iframe, auto-resize, link a la fuente) + oEmbed (`/oembed.json`) + loader `/embed.js`.
> - Landing pública `/embeber` (en sitemap, ahora linkeada desde footer + modal).
> - Medición: eventos GA4 `embed_open` y `embed_copy` ya disparan.
>
> **El cuello de botella es adopción.** Esto es trabajo de distribución, no de código.

## Por qué este motion gana (y el cold-link-begging pierde)

Todo el outreach previo del repo (`outreach-kit.md`, reddit queues, etc.) pide **el link**. Eso convierte mal porque le pedís un favor al otro.

El widget invierte la ecuación: le das **una herramienta gratis que mejora SU página** (más dwell time, más engagement para sus lectores) y el backlink viene incluido como crédito. Es value-first. **Así Omni Calculator construyó ~30.580 dominios de referencia** — no con outreach de links, con su programa de widgets.

Regla de oro: **nunca menciones "backlink" ni "SEO" en el pitch.** Vendés la herramienta. El link es un detalle del crédito.

## Targets — emparejar calc ↔ tipo de sitio (ranked por conversión esperada)

El match tiene que ser obvio: la calc resuelve un problema que ESE sitio ya cubre con texto.

| Segmento | Sitios a buscar | Calc a ofrecer |
|---|---|---|
| **1. Estudios contables / gestorías AR** | webs de contadores, "estudio contable", asesores monotributo | `/calculadora-monotributo-2026`, `/sueldo-en-mano-argentina`, `/calculadora-impuesto-ganancias-sueldo`, `/calculadora-aguinaldo-sac` |
| **2. Blogs de finanzas personales LatAm** | blogs de ahorro/inversión, newsletters fintech | `/calculadora-plazo-fijo`, `/calculadora-interes-compuesto`, `/calculadora-cuota-prestamo` |
| **3. RRHH / portales de empleo** | consultoras RRHH, blogs de liquidación de sueldos | `/calculadora-indemnizacion-despido`, `/sueldo-en-mano-argentina`, `/calculadora-vacaciones` |
| **4. Inmobiliarias / portales propiedad** | blogs inmobiliarios, calculadoras de crédito hipotecario | `/calculadora-cuota-prestamo`, calc de crédito UVA |
| **5. Salud / fitness / nutrición** | blogs de entrenamiento, nutricionistas, ginecología | `/calculadora-imc`, `/calculadora-calorias-diarias-tdee`, `/calculadora-embarazo` |
| **6. Docentes / sitios educativos** | profes de mate/física, apuntes, portales escolares | `/calculadora-regla-de-tres-simple`, `/calculadora-porcentajes`, conversores |
| **7. Medios / periodismo económico** | secciones de economía, notas de inflación/dólar/paritarias | calcs con data live (inflación, sueldo, aguinaldo) — embed interactivo para la nota |

### Cómo encontrarlos (operadores de búsqueda)
```
"calculadora de monotributo" -hacecuentas -site:gob.ar        # blogs que ya hablan del tema
"como calcular el aguinaldo" intitle:blog
estudio contable monotributo site:.com.ar
intitle:"calculadora" inurl:blog finanzas personales
```
El que YA escribió un artículo sobre el tema es el mejor target: la calc le completa la nota.

## Templates (copy-paste, value-first, español rioplatense neutro)

### Email — a estudios contables / blogs
> **Asunto:** Una calculadora gratis para tu nota de [tema]
>
> Hola [nombre], vi tu artículo sobre [tema exacto] y está muy bueno.
>
> Hicimos una calculadora interactiva de [monotributo 2026 / aguinaldo / etc.] que tus lectores pueden usar sin salir de tu página — se embebe con un copy-paste, es gratis, sin registro y los datos se calculan en el navegador (nada se manda a ningún servidor).
>
> Te dejo el preview: https://hacecuentas.com/embeber
>
> Si te sirve, está el código listo en el botón "Embeber" de cada calculadora. Cualquier cosa me decís.
>
> Abrazo, [Martín]

### DM corto — Instagram / X / LinkedIn
> Hola! Vi que tocás temas de [finanzas/sueldos] — tenemos calculadoras interactivas que podés embeber gratis en tu sitio (IMC, monotributo, aguinaldo, etc.). Copy-paste, sin registro. Por si te suma para tus lectores: hacecuentas.com/embeber 🙌

### Pitch a medios (sección economía)
> Para notas de coyuntura (inflación, dólar, paritarias) tenemos calculadoras con **datos en vivo** que se actualizan solas dentro del embed — el lector mete su sueldo y ve el número actualizado sin que ustedes toquen nada. Ej: [link]. Gratis, se embebe en un bloque HTML.

## Medición (ya está todo el tooling)

- **GA4 eventos:** `embed_open` (abrió el modal) y `embed_copy` (copió el código, con `calc_slug` + `type`). Filtrá en GA4 → ver qué calcs generan más intención de embed.
- **Referral traffic:** las visitas que entran desde un iframe `/embed/` aparecen en GA4 como referral del dominio anfitrión → así sabés QUIÉN te embebió de verdad (no solo quién copió).
- **Backlinks:** chequear en Bing Webmaster / ahrefs los dominios nuevos que linkean con anchor "Hacé Cuentas" o nombre-de-calc.

## Cadence sugerida (sin spamear)

- 5-10 outreach value-first por semana, hiper-targeteados (match calc↔sitio obvio).
- Priorizar segmento 1 (contadores) y 5 (salud) — son los de match más limpio y mayor volumen de sitios chicos receptivos.
- NO mandar el mismo día a 50 sitios (spam-flag). Personalizar SIEMPRE la primera línea con el artículo real del target.

## Próximo nivel (opcional, si el motion funciona)

Lo que tiene Omni y todavía no vos: **Omni Builder** — dejar que el sitio arme SU propia calc. Es otra liga (producto B2B). Primero validar que el seeding del widget existente trae embeds; recién ahí evaluar el builder.
