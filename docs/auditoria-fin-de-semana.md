# Auditoría de fin de semana — Hacé Cuentas

**Fecha:** 2026-07-03
**Objetivo:** reducir la caída de tráfico de sábado/domingo (índice finde/hábil ≈ 0,50) reforzando el cluster de ocio (asado, fiestas, viajes, cocina, hogar, deporte al aire libre, entretenimiento, mascotas no-médicas) **sin crear contenido masivo** — mejorando, integrando y consolidando lo que ya existe.
**Alcance de esta fase:** SOLO auditoría. No se ejecutaron redirecciones, borrados ni cambios estructurales. El working tree quedó limpio salvo artefactos de build (ver §Baseline).

Documentos hermanos:
- `docs/inventario-contenido-fin-de-semana.csv` — 481 calcs de las familias de ocio con 16 columnas.
- `docs/canibalizacion-fin-de-semana.md` — clusters que compiten por la misma intención.

---

## 0. Resumen ejecutivo (leé esto primero)

1. **El bajón de finde es de demanda, no técnico.** Confirmado por trabajo previo (GA4 56d): sáb −40,5% / dom −42,4% sesiones; orgánico finde −65%. El catálogo pesa a intención de día hábil (finanzas 254 + negocios 71 + impuestos 55 + salud 128). La palanca es **catálogo + programación + enlazado de ocio**, no fixes de render.
2. **La calidad técnica base es buena.** 0 H1 faltantes, 0 H1 duplicados, 0 títulos duplicados en las 481 calcs de ocio. Un solo template de calc (`CalcLayoutV2`), breadcrumb unificado (`Breadcrumbs.astro`), canonicals correctos, schema por página. No hay "templates viejos" conviviendo en producción.
3. **El problema #1 es enlazado interno: 253 de 431 calcs de ocio (59%) son huérfanas** (0 enlaces internos entrantes). Entretenimiento 60/69, hogar 34/39, cocina 20/33. Esto es consecuencia directa de que `<CalcRail>` es código muerto (ver §9). **Rescatar huérfanas con enlazado es la mayor ganancia de bajo riesgo.**
4. **Hay canibalización real pero acotada.** ~25 clusters (bebidas de evento, presupuesto de cumpleaños, combustible/km, equipaje, millas, café, temperatura de horno, siembra…). Parte ya se consolidó vía `canonicalSlug` (10 calcs). El resto necesita **mejor enlazado o canonical**, casi nunca borrado.
5. **Las 5 herramientas maestras tienen ancla existente** que conviene AMPLIAR (no crear URL nueva) en 4 de 5 casos; solo "planificador de hogar" y "comida para invitados" no tienen una URL integral clara.
6. **"Resultado de calculadora" NO está en el DOM inicial** servido (solo se inyecta por JS para impresión). Existe un matiz de Fase 10 que se explica en §12: hay un contenedor de resultado `hidden` con un ejemplo horneado para SEO (intencional, info-gain). No es un bug — recomiendo no tocarlo sin medir.

---

## 1. Framework y arquitectura

| Aspecto | Detalle |
|---|---|
| Framework | **Astro ^6.1.6** (`astro.config.mjs`), output SSR con adapter **@astrojs/cloudflare ^13** |
| Hosting | **Cloudflare Pages** + CF edge cache (dos capas de caché, ver CLAUDE.md §4) |
| Deploy | `wrangler` desde `dist/server` (`scripts/deploy-local.sh`), auto-commit pre/post build |
| Node | ≥22.12; build con `NODE_OPTIONS=--max-old-space-size=8192` (heap 8GB por OOM) |
| Contenido | JSON por calc en `src/content/calcs/*.json` (+ 13 colecciones locale: `calcs-cl/co/mx/pe/uy/py/ve/do/ec/es/en/pt/pt-pt`) |
| Fórmulas | `src/lib/formulas/*.ts` (2720 archivos), índice autogenerado `src/lib/formulas/index.ts` (`scripts/regenerate-formula-index.ts`) |
| Test | **Vitest** (`vitest.config.ts`), 12 archivos en `tests/` |
| Lint | **No hay ESLint/Prettier/Biome.** Type-check vía `tsc`/astro. El "lint" del proyecto son los scripts `validate:*` y `audit:*` de `package.json` |

**Números del catálogo (root AR):** 1.675 calcs JSON · 2.720 fórmulas `.ts` · 175 páginas `.astro` · 7.390 URLs en sitemaps (todos los locales/países).

**Distribución por categoría (root AR):** finanzas 254 · vida 212 · salud 128 · deportes 111 · matemática 91 · construcción 78 · cocina 78 · educación 75 · viajes 72 · negocios 71 · tecnología 67 · mascotas 66 · impuestos 55 · marketing 47 · automotor 46 · entretenimiento 44 · ciencia 44 · familia 34 · jardinería 28 · resto <25.

---

## 2. Cómo se generan las URLs

- **Calcs:** ruta catch-all `src/pages/[...slug].astro`. **Importante:** NO usa `getCollection()` — lee los JSON directo (documentado en `src/content.config.ts:14`). El schema (`makeCalcSchema`) valida `slug, title, description, category, audience, h1?, icon?, formulaId?, referenceTables?, restrictedMode?, noindex?, canonicalSlug?, relatedSlugs?, dataUpdate?, …`.
- **Gotcha crítico (confirmado en código):** en el cluster de ocio, **filename ≠ campo `slug` ≠ `formulaId`**. Ej: `carne-asado-kg-por-persona.json` → slug `calculadora-carne-asado-kg-por-persona` → formulaId `carne-asado-kg-por-persona`. Cualquier script debe cruzar por el campo correcto, no por nombre de archivo.
- **Locales/países:** subcolecciones con prefijo de ruta (`/en/…`, `/cl/…`). Las calcs AR raíz no llevan prefijo.
- **Hubs y landings temáticas:** páginas `.astro` sueltas en `src/pages/` (ej. `calculadoras-fin-de-semana.astro`, `calculadoras-evento.astro`, `impuestos-argentina.astro`, `mundial-2026.astro`). Resuelven calcs por `slug` con `import.meta.glob('../content/calcs/*.json', { eager: true })`.
- **Categorías:** `src/pages/categoria/[cat]/[...page].astro` (paginado por categoría).
- **Salas de decisión:** `src/pages/decidir/…` (componentes `DecisionHubPage`, `DecisionIntlRoomPage`).
- **Sitemap:** `scripts/generate-sitemap.ts` (corre en `prebuild`). `lastmod = max(lastReviewed, dataUpdate.lastUpdated, mtime del JSON)`. Sitemaps partidos por categoría + `priority`, `fresh`, `news`, `images`. Un calc con `noindex` o pruneado (301/410) queda fuera.

---

## 3. Templates de calculadora

**Hay UN template productivo de calc:** `src/components/CalcLayoutV2.astro`, invocado desde `[...slug].astro`, envuelto por `src/layouts/Layout.astro`. El motor de la calc (form + resultado + share + FAQ + reftables) vive en `src/components/Calculator.astro` (6.319 líneas, un único componente para las ~1.675 calcs).

Componentes de apoyo reutilizados en el template:
- `Breadcrumbs.astro` (breadcrumb + `BreadcrumbList` schema).
- `RelatedCalcs.astro` / `NextCalcs.astro` / `NextStep.astro` (enlazado interno saliente).
- `ScenarioComparator.astro`, `ResultContext.astro`, `CalcInfographic.astro`, `StickyResultPill.astro`.
- `PillarHub.astro`, `DecisionHubPage.astro`, `FeriadosLanding.astro`, `EconomiaLanding.astro` (para páginas no-calc).

**Templates viejos detectados:** ninguno vivo. Existió un `v1` y hubo `Header.astro` triplicado en worktrees stale, pero ya fueron removidos (histórico). **`CalcRail.astro` es el único componente muerto** (importado pero nunca renderizado — ver §9).

---

## 4. Componentes duplicados / headers / breadcrumbs

- **Headers:** un solo header (dentro de `Layout.astro`). No hay headers divergentes en producción.
- **Breadcrumbs:** un solo componente `Breadcrumbs.astro`, usado por `CalcLayoutV2`, hubs (`PillarHub`, `DecisionHubPage`, `FeriadosLanding`, `EconomiaLanding`) y `Layout`. Consistente.
- **Duplicación real:** `CalcRail.astro` (muerto). Además existe cierta redundancia de *contenido* (no de componentes) entre calcs casi-iguales — eso se trata como canibalización (§8, y `docs/canibalizacion-fin-de-semana.md`), no como duplicación de template.

---

## 5. SEO técnico — estado por dimensión (cluster de ocio)

| Dimensión | Estado | Detalle |
|---|---|---|
| Title único | ✅ | 0 títulos duplicados en las 481 calcs de ocio |
| Meta description | ✅ | `description` obligatoria en schema |
| H1 | ✅ | 0 faltantes, 0 duplicados (H1 opcional en schema pero presente en todas las de ocio) |
| Canonical | ✅ | `[...slug].astro:1178` → `canonical={calc.canonicalSlug ? '/'+slug : undefined}`. 10 calcs de ocio ya con `canonicalSlug` a su cabeza de cluster |
| Robots/noindex | ✅ | `effectiveNoindex = calc.noindex || isRestrictedCalc(calc)` (`[...slug].astro:985`). 3 calcs de ocio en noindex (dosis mascota YMYL, correcto) |
| Schema | ✅ | Por página; en noindex NO emite rich-result schemas (`:980`). Hubs emiten `ItemList` + `CollectionPage` |
| Breadcrumb | ✅ | `BreadcrumbList` en todas |
| Sitemap | ⚠️ | 19 de 481 calcs de ocio **no aparecen en sitemap** — son las ya canonicalizadas/pruneadas/noindex (esperado). Revisar caso por caso en el CSV (columna "En sitemap") |
| Metadata duplicada | ✅ | No detectada |
| Referencias a organismos (ARCA/AFIP/ANSES/BCRA) | ✅ | Todas las del cluster de ocio son **contextualmente legítimas** (AFIP al importar camiseta del Mundial, regalías de Spotify, vender comida casera, ingresos de influencer, impuesto PAÍS en pasajes, peajes, patente). `fernet` está limpio. **No hay boilerplate fiscal fuera de lugar** |

**Conclusión SEO técnico:** el cluster de ocio está técnicamente sano. La oportunidad NO es "arreglar SEO roto" sino **concentrar autoridad** (enlazado + consolidación) y **ampliar utilidad** (herramientas maestras).

---

## 6. Canonicals — estado

10 calcs de ocio ya tienen `canonicalSlug` a la cabeza de su cluster (consolidación previa LIVE 2026-07-03):

| Secundaria (canonicalSlug) | → Cabeza |
|---|---|
| `calculadora-carne-asado-kg-por-persona` | `calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo` |
| `calculadora-asado-por-invitado-kg-carne` | ídem |
| `conversor-tazas-gramos-cocina-recetas` | `calculadora-conversion-medidas-cocina-tazas-gramos` |
| `calculadora-conversion-cups-gramos-harina-azucar-aceite` | ídem |
| `calculadora-cantidad-pizzas-por-invitados-pizzeria` | `calculadora-pizza-por-invitado-porciones` |
| `calculadora-masa-pizza-casera-gramos-invitados` | `calculadora-masa-pizza-ingredientes-porciones` |
| `calculadora-porciones-torta-cumpleanos-invitados-tamano` | `calculadora-torta-personas-kg-porciones` |
| `calculadora-litros-nafta-viaje-ruta-argentina` | `calculadora-costo-viaje-combustible-kilometros` |
| `calculadora-combustible-viaje-auto` | ídem |
| `calculadora-presupuesto-viaje-vacaciones` | `calculadora-presupuesto-viaje` (además ya 301 en `_redirects`) |

**Faltantes/riesgos:** ninguna canonical *incorrecta* detectada. El campo correcto es `canonicalSlug` (NO `canonical`); el canonical apunta al **slug**, no al filename.

---

## 7. Enlaces internos — el hallazgo central

**253 de 431 calcs de ocio (59%) son huérfanas** (0 enlaces internos entrantes, medido contando apariciones del slug en `relatedSlugs` de todo el catálogo). Desglose:

| Familia | Huérfanas / total |
|---|---|
| entretenimiento | 60 / 69 |
| hogar (construcción/hogar/jardinería DIY) | 34 / 39 |
| viajes | 25 / 53 |
| otros-viajes (millas/visas/vuelos) | 21 / 39 |
| cocina | 20 / 33 |
| otros-mascotas | 20 / 47 |
| otros-automotor | 14 / 25 |
| fiestas | 13 / 45 |
| mascotas | 13 / 19 |
| otros-jardinería | 12 / 13 |

**Causa raíz:** `railPinned` + `<CalcRail>` en el render de calcs es **código muerto** (importado, nunca renderizado). El enlazado saliente hoy depende de `relatedSlugs` (curado a mano) + `RelatedCalcs`/`NextCalcs`. Las calcs de ocio que nadie referenció quedaron sin inbound.

**Enlaces internos irrelevantes / rotos:** en consolidaciones previas se limpiaron ~13 `relatedSlugs` muertos (apuntaban a slugs inexistentes = 404 internos silenciosos). Recomiendo un `link-guard` en prebuild que falle si un `relatedSlug` no resuelve a una calc viva (ya existe un guard similar para el home — extenderlo).

---

## 8. Riesgos de canibalización (resumen; detalle en doc dedicado)

Categorías con demasiadas páginas similares dentro del cluster de ocio (ver `docs/canibalizacion-fin-de-semana.md`):

- **Bebidas de evento:** `cerveza-invitado-evento` (12 inbound, nodo autoridad) + vino×2 + fernet×2 + agua + whisky + ~9 recetas de cóctel + 2 genéricas de bebidas → cluster grande, mezcla intención "cuánto comprar" con "receta".
- **Presupuesto de fiesta/cumple:** `presupuesto-cumpleanos`, `costo-fiesta-cumpleanos-infantil-invitados`, `cumpleanos-invitados-gastar-torta-regalos`, `presupuesto-cumple-15`, `presupuesto-graduacion`, `costo-boda-argentina` + `presupuesto-casamiento-por-invitado` (11 inbound) → intención "presupuesto de evento" repartida.
- **Combustible / costo por km:** `costo-por-kilometro-auto` (15 in) + `consumo-nafta-litros-100km` (13 in) + `costo-viaje-combustible-kilometros` (cabeza canonical, solo 3 in) + autonomía×2 + gnc×2. **Anomalía:** la cabeza canonical tiene MENOS autoridad interna que sus satélites.
- **Café ratio por método:** 4-5 calcs casi idénticas (`cafe-french-press-ratio`, `cafe-ratio-agua-gramos-metodo`, `proporcion-cafe-agua-metodo`, `cafe-molido-taza-metodo`).
- **Temperatura de horno:** 3 (`temperatura-horno-celsius-fahrenheit-gas`, `conversor-fahrenheit-a-celsius-horno`, `conversion-temperaturas-horno-gas-electrico`).
- **Porciones (arroz/pasta/sushi):** arroz×2, sushi×3, pasta.
- **Pintura / pisos-cerámica / siembra / pileta:** clusters DIY casi todos huérfanos (canibalización + orfandad simultánea).
- **Equipaje aéreo (~7), millas/puntos (~12), jet-lag/husos (~6):** clusters de viaje-hacking, mucha superposición; prioridad baja para finde (intención más de planificación de viaje largo que de escapada de finde).

**Regla aplicada:** ningún borrado propuesto sin datos externos (GA4/GSC/backlinks). La acción por defecto es **enlazar mejor** o **canonical reversible**, no 301.

---

## 9. Código muerto / render / performance

- **`CalcRail.astro`:** importado en el render pero nunca emitido al HTML. Los "pins" temáticos (Mundial/evento/finde) que debían aparecer en cada calc **no aparecen**. La palanca de enlazado interno de ~2.500 calcs está apagada. (El pin al hub temático se recuperó parcialmente vía `themeHub` en `CalcLayoutV2`, gateado a `lang===''`.)
- **Performance:** LCP/CLS ok según CWV previo; el único CWV que falla históricamente es **INP** (JS first-party del home). Calcs simples cargan `Calculator.astro` completo aunque no lo necesiten (componente monolítico de 6.3k líneas) — oportunidad de code-split, pero fuera del alcance de finde.
- **Contenido oculto por CSS:** el contenedor de resultado usa `hidden` (HTML) + `data-nosnippet`, no `display:none` decorativo para esconder texto SEO. Ver §12.
- **Renderizado:** `prerender = true` en hubs; calcs SSR. No se detectaron errores de hidratación en el cluster de ocio.

---

## 10. Accesibilidad (observaciones de código)

- Resultado con `aria-live` (para anunciar el cambio tras calcular) — el bloque `.calc-results` está pensado para eso (`Calculator.astro:760`).
- Labels presentes en `fields[].label`. Falta verificar contraste y foco visible en los CTAs de share en un pase dedicado (Fase 17).
- Empty-state accesible ("Tu resultado va a aparecer acá") en el DOM inicial — correcto.

---

## 11. Baseline técnico (build / lint / tests) — ANTES de tocar nada

**Working tree al iniciar:** limpio. Durante el build se modificaron 4 archivos (artefactos, NO cambios de código): `db/sitemap-state.json`, `public/api/calcs-index.json`, `public/sw.js`, `src/lib/data/mundial-2026-fixture.json`. No commitear.

### Build — ✅ OK
`npm run build` → `Server built in 292.83s`, `BUILD_EXIT=0`. 5.823 archivos, 32 HTML pruneados (1004 pruning + 451 gone-410), worker wrapper con 1.223 redirects + 451 410. Sin errores.

### Lint — N/A
No hay ESLint. El proyecto usa `validate:*`/`audit:*` como gates. No se corrieron en esta fase (no modifiqué datos).

### Tests — ⚠️ 3 archivos fallan, TODOS PRE-EXISTENTES (no relacionados con finde)
`npx vitest run` → **Test Files 3 failed | 9 passed (12)** · **Tests 1 failed | 124 passed (125)**.

| Archivo | Falla | Causa | ¿Relación con finde? |
|---|---|---|---|
| `tests/formulas.test.ts` | No carga | importa `../src/lib/formulas/bmr` pero el archivo se renombró a `bmr-mifflin-st-jeor-calculator.ts` | No — import stale post-rename |
| `tests/formulas-top50.test.ts` | No carga | mismo import roto (`bmr`) | No |
| `tests/calc-formula-integrity.test.ts` | 1 assertion | 265 calcs "vivas" apuntan a un `formulaId` sin `.ts` (casi todas locale `/en`) | No — gap de fórmulas EN |

**Estos 3 fallos existen HOY, antes de cualquier cambio de finde.** Quedan documentados para no atribuirlos a trabajo nuevo. (Arreglarlos — fix de imports + gap EN — es un track aparte, opcional.)

---

## 12. Fase 10 — "Resultado en el DOM inicial": diagnóstico honesto

**El literal "Resultado de calculadora" NO está en el HTML servido.** Sus 3 apariciones están en `Layout.astro` y son un **print-header inyectado por JS solo para `@media print`** (patrón ya corregido previamente). Verificado: no aparece en el DOM inicial ni lo snippetea Google.

**Matiz real (a decidir con datos, no ahora):** el contenedor `.calc-results` (`Calculator.astro:765`) **sí existe en el DOM inicial** con atributo `hidden` + `data-nosnippet`, y su `.result-value` trae un **ejemplo horneado** (`exampleBaseline`) para info-gain SEO. Es decir: no hay un "resultado falso" visible, pero el nodo existe oculto con un número de ejemplo. Esto es **intencional** (estrategia de solved-examples que ya mostró tracción orgánica de finde). El estado visible por defecto es el empty-state accesible.

**Recomendación:** NO arrancar el bloque a ciegas. El requerimiento de Fase 10 ("el resultado no debe estar en el DOM esperando un cálculo") choca con una optimización deliberada de info-gain. Propuesta: (a) mantener el ejemplo horneado pero asegurar que semánticamente sea un "ejemplo" y no un "resultado del usuario" (rótulo claro), y (b) agregar un test que verifique que NO existe un resultado *del usuario* pre-cálculo. Cambiar el patrón entero requiere medir impacto SEO primero.

---

## 13. Mapeo a las 5 herramientas maestras (qué URL ampliar, no crear)

| Herramienta maestra | Ancla existente recomendada | Autoridad interna | Acción |
|---|---|---|---|
| **1. Planificador de asado** | `calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo` (cabeza canonical, cocina) | media (2 in, pero es la cabeza) | **AMPLIAR**: hoy calcula carne+cortes+chorizo+morcilla+pollo+achuras. Falta pan, ensaladas, bebidas, agua, hielo, carbón/leña, presupuesto, costo/invitado, lista de compras. Integrar satélites (`chorizos-por-invitado`, `tamano-parrilla`, `bebidas-evento`, `agua-por-invitado`) como módulos, dejando sus URLs vivas enlazando a la maestra |
| **2. Planificador de fiesta** | `calculadora-presupuesto-cumpleanos` (slug limpio, 0 in) o `calculadora-cumpleanos-invitados-gastar-torta-regalos` | baja | **AMPLIAR una** y consolidar el cluster de presupuesto de evento por canonical hacia ella. Integra comida (pizza/empanadas/torta/picada), bebidas, vajilla, mesas/sillas, presupuesto/persona |
| **3. Planificador de viaje en auto** | `calculadora-costo-viaje-combustible-kilometros` (cabeza canonical viajes) | **baja (3 in) ⚠️** | **AMPLIAR** + **arreglar enlazado**: los nodos de autoridad real son `costo-por-kilometro-auto` (15 in) y `consumo-nafta-litros-100km` (13 in). Que apunten a la maestra. Integrar peajes, estacionamiento, comidas, alojamiento, costo/pasajero, autonomía/cargas. Capa de mapas desacoplada (sin API paga; env vars) |
| **4. Comida para invitados** | *(sin URL integral clara)* — candidatas parciales: `bebidas-evento-litros-por-persona`, `pizza-por-invitado-porciones` | — | Decidir: ampliar una existente vs. crear `/calculadora-comida-para-invitados`. Debe usar parámetros/estado, **NO** URLs por cantidad (`comida-para-10-personas`). Integra los per-food (pizza/empanadas/sushi/picada/sándwiches) como sub-modos |
| **5. Proyectos para el hogar** | *(sin URL integral clara)* — nodo de autoridad: `madera-necesaria-mueble` (7 in) | — | Decidir: crear `/calculadora-proyectos-hogar` con selector de proyecto (pintar, piso, empapelar, muebles, mudanza, limpieza, jardín, pileta) que reúna el cluster DIY casi-huérfano. Detectados **gaps reales**: no existe calc de "cajas para mudanza" ni "limpieza profunda" |

**Decisión pendiente de Martín** (afecta #4 y #5): ¿preferís *ampliar una URL con algo de autoridad* aunque el slug no sea ideal, o *crear una URL nueva limpia* asumiendo que arranca sin autoridad? Recomiendo ampliar para #1/#2/#3 y crear nueva para #4/#5 (no hay ancla integral decente).

---

## 14. Hubs — estado vs. spec de Fase 3

Ya existen 2 hubs relevantes:
- **`/calculadoras-fin-de-semana`** (`calculadoras-fin-de-semana.astro`, 201 líneas): grid de 6 grupos (asado/recetas/escapadas/fitness/ocio/mascotas), `ItemList` + `CollectionPage` schema, canonical, en `sitemap-priority`. **Le falta** para cumplir Fase 3: breadcrumb visible, herramienta principal destacada por grupo, intro/texto original más útil, FAQ real (≥7 preguntas), Open Graph específico. Hoy es "grilla con contexto mínimo", no la portada rica que pide el spec.
- **`/calculadoras-evento`** (187 líneas): hub de asado/fiesta/evento.

Los 6 hubs específicos del spec (`/calculadoras-asado-reuniones`, `/calculadoras-fiestas-eventos`, etc.) **no existen** — antes de crearlos hay que decidir si se prefiere **enriquecer el hub general + secciones ancladas** vs. **8 hubs separados** (riesgo de canibalización entre hubs). Recomiendo un hub general fuerte + anclas por familia primero, y separar solo si la demanda lo justifica.

---

## 15. Problemas de indexación identificables desde el código

- 19 calcs de ocio fuera de sitemap = canonicalizadas/pruneadas/noindex (esperado, no es bug).
- Riesgo de "rastreada sin indexar" por thin-content en clusters casi-duplicados (café, temperatura horno, porciones) — se mitiga consolidando/enlazando, no borrando.
- Sin `hreflang` cruzado entre AR y locales para el cluster de ocio (fuera de alcance de finde).

---

## 16. Primer conjunto de cambios pequeños y seguros (propuesta — NO ejecutados)

Ordenados por relación impacto/riesgo. **Ninguno borra URLs ni agrega 301.**

1. **Rescate de huérfanas por enlazado (riesgo casi nulo, impacto alto).** Config central de relaciones por familia/intención + poblar `relatedSlugs` faltantes de las 253 huérfanas hacia su maestra y hub. Regenerar `related-auto.json`. Cero cambio de URL.
2. **Link-guard en prebuild (riesgo nulo).** Extender el guard existente para que el build falle si algún `relatedSlug` no resuelve a calc viva (evita 404 internos silenciosos como los ~13 ya limpiados).
3. **Enriquecer `/calculadoras-fin-de-semana` a spec Fase 3 (riesgo bajo).** Breadcrumb + herramienta destacada por grupo + FAQ ≥7 + OG. Sin tocar otras URLs.
4. **Capa de analytics de eventos (riesgo nulo, no toca gtag existente).** Wrapper reutilizable para `calculator_*`/`weekend_*` + `day_type` (weekday/friday/weekend). Documentar en `docs/analytics-fin-de-semana.md`. **No** modifica tags GA4/Ads existentes (regla CLAUDE.md §5).
5. **Tests base de finde (riesgo nulo).** `getHomeContextByDate(date, tz)` testeable + tests de "no hay resultado del usuario pre-cálculo" + serialización de parámetros. No reemplaza tests existentes.
6. **Fix opcional del baseline de tests (riesgo bajo).** Corregir imports `bmr` en `formulas.test.ts`/`formulas-top50.test.ts`. Separado del trabajo de finde.

**Lo que NO recomiendo hacer todavía** (necesita datos GA4/GSC/backlinks): canonical/301 de secundarias de bebidas, café, temperatura-horno, porciones, millas. Solo tras confirmar tráfico/impresiones/backlinks propios.

---

## 17. Próxima etapa recomendada

Presentar este diagnóstico a Martín y confirmar: (a) la decisión ampliar-vs-crear para herramientas #4/#5, (b) hub general fuerte vs. 8 hubs separados, (c) luz verde para el batch #1-#5 de §16 (todo no destructivo). Recién después: Etapa 2 (hub + enlazado + home dinámica + módulo recomendaciones) y Etapa 3 (planificador de asado como primera herramienta maestra).
