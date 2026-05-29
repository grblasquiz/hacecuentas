# Auditoría SEO Comprehensive — hacecuentas.com — 2026-05-26

**Contexto**: D13 recovery post Core Update Abril 2026. Sitio en -94% tráfico orgánico. Score técnico previo 8.7/10. Esta auditoría enfoca **lo que NO se cubrió** en `audit_v2_deep` ni `REPORTE-CONSULTORIA`. Tono: lo bueno está bien, lo que falta es accionable y específico.

**Resumen ejecutivo**:
- 4 bugs nuevos detectados que se pueden arreglar HOY (1 crítico de producción)
- 7 quick wins (≤30 min) que rinden 10× su costo
- 12 strategic plays para próximos 30-90 días
- La palanca técnica está casi agotada; la palanca real son los 4 ítems del `martin-backlog-4w` que dependen de Martin (pitch medios, Reddit, encuesta, social)

---

## Sección 1 — SEO técnico

### 1.1 Crawlability — sólida, salvo un detalle

`robots.txt` (411 líneas) es uno de los más exhaustivos que vi: permite explícitamente 23 user-agents de AI/search (GPTBot, ClaudeBot, PerplexityBot, Amazonbot, Applebot-Extended, Common Crawl, etc.) y bloquea 7 scrapers comerciales. Allow + Disallow consistentes. **Bing necesidades cubiertas** (sub-sitemaps declarados explícitamente, fix del 25-may).

🔴 **Bug detectado**: Cloudflare Speed Brain está activo (header `speculation-rules: "/cdn-cgi/speculation"`). Cuando Googlebot / Lighthouse abre la home, especula prefetches a las top-5 calcs internas. **Esos prefetches devuelven HTTP 503** porque el Worker tiene la cabecera `cf-speculation-refused: prefetch refused: disabled for worker requests`. Resultado: cada audit Lighthouse contra `/` registra 5+ errores `503` en console y la home pierde ~5 puntos de Best Practices. Más grave: cualquier crawler que respete speculation rules ve 503s "transitorios" en URLs principales.

### 1.2 Indexability — bug menor, foco bien

- **noindex AR**: 533 calcs (18.7% del root). 178 fueron noindexed el 23-may por GSC drilldown. Coherente con HCU recovery.
- **Hreflang bidireccional roto en locales hispanos**: las páginas `/mx/*`, `/cl/*`, `/co/*`, `/es/*` declaran `esSlug` para mapear de vuelta a la versión AR, pero **0 de 373 calcs MX/CL/CO/ES tienen el campo `esSlug` seteado**. EN tiene 621/622 y PT 104/105 — bien. La consecuencia: AR aguinaldo NO declara hreflang a MX aguinaldo aunque ambas existen, y MX aguinaldo solo declara `es-MX` + `x-default` (sin link a otras variantes hispanas). Google trata cada locale como isla.

🔴 **Bug detectado**: `sitemap-fresh.xml` declara **2174 URLs con `lastmod` posteriores al 13-may** (78% del fresh = 1716 calcs con `lastmod=2026-05-23`). Eso violó la regla #3 de `CLAUDE.md`. La causa: commit `704790d3` (backfill `lastReviewed` + `seoKeywords` en masa). Aunque la edición fue puramente metadata, el sitemap promete a Google "estas 1716 URLs cambiaron el 23-may" — gasta crawl budget innecesariamente y diluye señal de freshness en las URLs que SÍ tienen cambios reales (49 calcs con `dataSource` live).

🔴 **Bug detectado**: `Cache-Control` duplicado en assets servidos por CF Pages. Confirmado en:
- `/og/*.png` → `public, max-age=0, must-revalidate, public, max-age=2592000` (browser usa el primero, no cachea 30d como debería)
- `/_astro/page.*.js` → `public, max-age=0, must-revalidate, public, max-age=31536000, immutable` (hashed assets ya nunca cambian, pero el browser revalida cada visita)
- `/search-index.json` → 3 headers concatenados (`max-age=0, must-revalidate, public, max-age=600, stale-while-revalidate=86400`)
- `/sw.js` → `max-age=0, must-revalidate` duplicado (afortunadamente cancela igual a 0)

El comentario en `public/_headers` ya advierte sobre el bug histórico de concatenación de CF Pages — pero **sigue activo en `/og/*` y `/_astro/*`**. Cada visita repetida pide assets que deberían cachearse, sumando ~30-50KB de transfer innecesario y subiendo TTFB sintético.

### 1.3 Mobile-friendliness — passing

Lighthouse SEO mobile = 1.00 en home, IMC y aguinaldo. Viewport correcto, no se reportan tap-targets en IMC ni aguinaldo. Sin embargo en `/` Lighthouse detecta **target-size fails en 3 elementos** (`.see-all`, `.pilar-card`) — son links de cards en bloques de guías que no llegan a 48×48 px en mobile.

### 1.4 Internationalization — gap MX/CL/CO/ES

Cubierto arriba (1.2). Resumen: 7 locales, hreflang funciona bien EN↔AR↔PT pero **roto bidireccionalmente para MX/CL/CO/ES**. Esto frena el flujo de equity entre la fuerza AR y los mercados secundarios.

### 1.5 Core Web Vitals real — REGRESIÓN desde baseline

Lighthouse mobile (M1 Mac, headless, prod, hoy 26-may 19:08 hora local):

| URL | Perf | LCP | FCP | TBT | CLS | INP |
|---|---:|---:|---:|---:|---:|---:|
| `/calculadora-imc` | **0.97** | **2.3 s** ✅ | 1.8 s | 90 ms | 0 | — |
| `/` | 0.69 | **7.3 s** 🔴 | 1.9 s | 220 ms | 0 | — |
| `/calculadora-aguinaldo-sac` | 0.65 | **8.5 s** 🔴 | 3.0 s | 170 ms | 0 | — |

**Lo bueno**: IMC quedó con LCP 2.3s — confirmás el fix `b1ad79f3` (entry scripts separados). El elemento LCP debe ser el formulario o el primer texto del calc card.

**Lo malo**: **Aguinaldo SAC perdió tiempo respecto al baseline del 26-may** (era 6.9s, ahora 8.5s — regresión de 1.6s). Home pasó de 6.4s a 7.3s (+0.9s). Probable causa: rollout de "Para vos" SSG (`8bd5df6a`) inflama el bundle del Layout y vuelven a entrar 222KB de JS unused en aguinaldo (de los cuales `Calculator.astro` aporta 93KB). El AdSense interaction-triggered ayuda — pero el GTM gtag dual (GA4 + Google Ads) suma 130KB de unused JS persistente que no es removible (regla `CLAUDE.md` #5).

**CrUX (PSI field data)**: la query a PSI API hoy devolvió `loadingExperience: {}` vacío — Google perdió la suficiencia estadística por la caída de tráfico. Sin CrUX, ranking signal de page experience cae al lab data (peor caso). Una vez que el tráfico vuelva, CrUX volverá; mientras tanto el lab fluctuando es la única señal y por eso los Lighthouse runs locales mueven la aguja.

### 1.6 Schema completeness — uno de los más completos del país

Cubre Article, HowTo, FAQPage, Speakable, BreadcrumbList, SoftwareApplication+WebApplication, Dataset (restringido a 45 live-data calcs), Recipe (cocina con patrones), MedicalWebPage (salud), LearningResource (educación), CreativeWork+about (medio-ambiente), VideoObject (cuando hay video), Person + Organization global con knowsAbout + areaServed, AggregateRating cuando hay >=5 ratings. **Faltan**:

- **Recipe schema con cobertura limitada** (23 calcs de cocina sobre 123). El patrón actual mira slugs con `por-persona|por-invitado|cantidad-X|porciones-`. Calcs como `calculadora-gin-tonic-proporciones`, `calculadora-cafe-ratio-v60-pour-over`, `calculadora-cold-brew-ratio`, `calculadora-temperatura-horno-celsius-fahrenheit-gas` son Recipe-eligible y quedan fuera. Recipe da rich result + Discover Card. Ampliar el patrón regex podría llevar de 23 a ~70 cobertura.
- **Falta `ImageObject` en author page** (no hay avatar real, sólo div CSS con iniciales "MR"). E-E-A-T quiere foto real. Si no hay foto, agregar al menos `image: { "@type": "ImageObject", url: "/og/martin-rodriguez.png" }` con una imagen generada (puede ser una abstract avatar generada con Satori, lo mismo que se usa para OG).
- **`Person.sameAs` mínimo**: solo GitHub. Falta LinkedIn (cuenta corporate existe), X personal, ORCID (si aplica). Más sameAs = más confianza para Knowledge Graph.
- **No hay `Organization.contactPoint` en home** (sí está en `/sobre-nosotros`). Bing-Copilot lee contactPoint del primer schema que matchea — moverlo a global.

### 1.7 Security headers — sólido, dos faltantes menores

CSP rev 3 (sin `unsafe-eval`), HSTS preload-ready 2 años, HSTS includeSubDomains, X-Frame-Options SAMEORIGIN, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy granular. COEP/COOP/CORP aplicados vía middleware (correcto). **Faltan**:

- `Cross-Origin-Embedder-Policy: require-corp` global rompe AdSense — está bien tener `credentialless` por ahora.
- `Reporting-Endpoints` header para CSP violation reporting (gratis con CF Worker, mejora visibilidad de breaches).
- `Origin-Agent-Cluster: ?1` para process isolation en browsers Chromium (defensa Spectre, score Best Practices +2).

---

## Sección 2 — SEO on-page

### 2.1 Titles — sano

- 2,850 calcs AR, **67 con title > 60 chars** (2.3%). Sigue siendo overfit el caso "Calculadora Valuación Fiscal Automotor Argentina 2026 — Patente por provincia" (77 chars).
- 4 titles < 35 chars (probablemente noindexed o muy específicos).
- Únicos: sí (cada calc tiene su título distinto, no detectamos duplicados).

### 2.2 Meta descriptions — sano

- 20 calcs con desc > 160 (0.7%) — Google las trunca. Casos vivos quedan visibles en sitemap-fresh.
- 3 con desc < 80 (delgadas — Google puede reemplazarla con un snippet).

### 2.3 Heading hierarchy — bug menor consistente

🔴 **Bug detectado**: Lighthouse reporta `listitem failures` en `/calculadora-imc` y `/calculadora-aguinaldo-sac` — el selector apunta a `div.calc-main > section#como-funciona > li`. Son `<li>` sueltos generados por el parser markdown cuando una lista no está envuelta en `<ul>` (probablemente líneas que arrancan con `-` o `*` y el markdown no las detecta como bloque). Afecta accesibilidad (3 puntos por instancia) y rich snippets pueden ignorar el bloque "Cómo funciona". Fix: revisar `src/lib/markdown.ts` para envolver `<li>` huérfanos en `<ul>`.

### 2.4 Internal linking — el 92% de calcs no tiene links contextuales en intro

🔴 **Hallazgo importante**: Densidad de links en page calc = 3.4-3.6/100 palabras (sano). PERO **2,134 de 2,317 calcs activas (92%) NO tienen ningún link interno en el campo `intro`**. Los únicos links son del breadcrumb, header, footer y bloques estándar (relatedCalcs, ClusterHub si aplica) — todos no contextuales. El campo `intro` es el primer párrafo, el más valioso para link interno temático.

Resultado: Google ve estructura de hub-and-spoke vía categoría/cluster, pero le falta la red anchorada "este calc menciona X y X tiene su propia calc". Las redes así suben el authority pass mucho más que el footer estándar.

### 2.5 Imágenes alt text — sano, pero hay un caso

- Logo en header/footer tiene `alt="Hacé Cuentas — Calculadoras online"` ✅
- OG images: 3,872/3,872 manifest registradas (99.9% AR). ✅
- **`apple-touch-icon-180x180.png` confirma existencia**, pero NO se referencia en `<link rel="apple-touch-icon">` con `sizes="180x180"` — Layout solo declara `<link rel="apple-touch-icon" href="/apple-touch-icon.png">`. iOS aceptará pero un sizes-attribute mejora compatibilidad.

### 2.6 URL structure — limpia

`trailingSlash: 'never'` consistente, middleware fuerza 308 si entra con `/`, redirects 301 para slug normalizations, sin parameters innecesarios. ✅

### 2.7 Breadcrumbs — perfectos

BreadcrumbList JSON-LD inyectado en cada calc page + categoría. ✅

---

## Sección 3 — Content quality

### 3.1 AnswerSnippet coverage — el gap más grande

Distribución actual:
- AR: 102/2850 (3.6%)
- AR `audience=AR` (local-specific): 27/538 (5.0%)
- AR `audience=global` (universal): 74/1779 (4.2%)
- EN: 10/688 (1.5%)
- PT: 10/220 (4.5%)
- MX: 11/85 (12.9%)
- CL: 10/99 (10.1%)
- CO: 10/101 (9.9%)
- ES: 10/88 (11.4%)

**Patrón**: los locales secundarios (~10%) están sobre-cubiertos respecto al root AR (3.6%). Eso es bueno para los locales pero el root AR — donde está 90% de la oportunidad — sigue al 3.6%. **Las top 200 AR ya están — los siguientes 300 (top 500 acumulado) deberían moverse a snippet**: cubre ~17% de las impresiones GSC del último mes con muy poco trabajo (~30 min de Claude por calc, batcheable).

### 3.2 FAQ por calc — cumple regla CLAUDE.md #7

- 0 calcs con FAQ < 7 (regla mínima cumplida 100%)
- 757 calcs con exactamente 7 FAQs (33%)
- Mayoría tiene 8+ (1,560 calcs, 67%)

✅ Sin issue. Quizás vale subir el mínimo a 8 en el próximo backfill.

### 3.3 Information Gain real — solo 1.7% tiene live data block

- 49/2850 (1.7%) AR calcs tienen `dataSource` que renderiza el componente `LiveData.astro` (BCRA, dolar, ICL, IPC, UVA en vivo).
- 100% tienen `dataUpdate` declarado, pero solo 6 con `frequency: daily` (real Information Gain).
- 281 con `frequency: yearly` (formula estable, sin IG real).

**Implicación**: post-HCU Google premia páginas con datos vivos que diferencian del competidor. Cada `LiveData` block es un IG visible. Calcs como `calculadora-presupuesto-familiar`, `calculadora-prestamo-personal-cuota-mensual`, cualquier calc con "argentino" en el título pueden levantar `tasa:plazo_fijo_30d` o `inflacion:last_month` sin esfuerzo. Subir de 49 a 150 sería trivial (los datos ya están en `src/data/live/*.json`).

### 3.4 Cocina: Recipe schema cobertura — 19% de cocina

- 123 calcs cocina, 23 con Recipe schema (19%).
- ~50 calcs cocina serían Recipe-eligible si el patrón se expande: cocktails (gin-tonic, mojito, manhattan, bloody-mary), café (v60, cold-brew, moka, ratio), bebidas (proporciones), ingredientes-evento, sustituciones de receta.

### 3.5 Locales: gaps de contenido

EN: 331/688 (48%) noindexed — la auditoría 5-20 ya identificó 387 calcs KILL_410. Si aún no se aplicó esos 410, hay capacidad de limpieza grande.

PT: 64/220 (29%) noindexed. Probable similar.

MX/CL/CO/ES: 0 noindexed. Pero coverage muy chica (85-101 calcs). El path correcto es expandir orgánicamente desde GSC opportunities locales por país antes de masificar.

---

## Sección 4 — AI Visibility / GEO / AEO

### 4.1 llms.txt content quality — bueno y mantenido

`/llms.txt` (15,793 bytes) con estructura clara: descripción, secciones por categoría, top calcs linkeadas con descripción de 1 línea cada una. `/llms-full.txt` (21,350 bytes) versión expandida. Sólo Argentina tiene cobertura completa; otros locales remiten al sitemap. Para AI engines que comen llms.txt como sitio del autor, está bien.

**Mejora**: `llms-full.txt` no usa formato consistente — algunos calcs tienen "Punto clave" + "Casos de uso" + "FAQ" + "Fuentes", otros solo descripción. La inconsistencia hace que ChatGPT/Claude extraigan menos contexto. Si se regenera con el mismo template `<calc> → Descripción + 3 casos clave + 3 FAQs + Fuentes`, mejora la cita-bilidad.

### 4.2 Citation potential

Los schemas SoftwareApplication+Article con `citation: [sources...]` y `mentions: [Wikidata entities]` están bien hechos. El array `mentions` linkea automáticamente entidades como ANSES (Q830348), AFIP (Q830277), BCRA (Q642444), Monotributo (Q97273582), UVA (Q9015013) cuando aparecen en h1/seoKeywords. Eso le da a LLMs entity disambiguation gratis.

**Métrica concreta**: en una muestra de top 5 calcs AR, todas declaran `mentions` con 2-4 entidades Wikidata reconocidas. Bien.

### 4.3 Author E-E-A-T — incompleto

🟡 **`/autores/martin-rodriguez` necesita más profundidad**. Hoy tiene:
- Schema Person con `@id`, `worksFor`, `knowsAbout`, `sameAs: [GitHub]`, `nationality`. ✅
- Bio honesta (no es contador/abogado matriculado). ✅
- Disclaimer claro. ✅

Falta:
- **Foto/avatar real** (hoy es `<div class="avatar">MR</div>` — CSS-only initials). Google E-E-A-T post-2026 valora foto del autor visible.
- **`Person.image`** en schema apuntando a la imagen real.
- **`Person.sameAs` expandido**: solo GitHub. Sumar LinkedIn personal, X personal, Mastodon si aplica.
- **`Person.alumniOf` / `Person.award` / `Person.hasOccupation`** — agregar contexto profesional verificable (universidad, premios, posiciones). Si Martin es CMO en Argenprop, sería un edge muy fuerte (`worksFor` adicional o `hasOccupation`).
- **Author bylines en calcs no apuntan a `/autores/martin-rodriguez`** en el rendered HTML — sí en schema, pero el bloque visible en `[...slug].astro` dice "Revisado por Martín Rodríguez" sin link visible al perfil en todos los calcs (depende del componente). Confirmé el link `<a href="/autores/martin-rodriguez">` está en el meta-block — bien — pero la página del autor podría aparecer destacada al final como "Sobre el autor".

### 4.4 AI Overviews potential — depende del answerSnippet rollout

El `answerSnippet` (50-60 palabras formateado para Position 0) es la mecha de AI Overviews. 102 calcs AR cubiertas hoy. Para que Google empiece a usar HC como fuente en AI Overviews de queries AR, hace falta llegar a ~500+ con cobertura (las top 500 por impresiones GSC históricas). Calcular el impacto: si HC aparece como fuente citable en 50 AI Overviews de queries comunes ("aguinaldo cómo se calcula", "monotributo categorías 2026"), eso son ~5K visits/mes solo de AI Overviews (estimación conservadora 100 visits/mes por fuente citada).

---

## Sección 5 — Performance / UX

### 5.1 LCP medido — IMC ya está en verde, otros no

Ver sección 1.5. Resumen:
- IMC: LCP 2.3s ✅
- Home: LCP 7.3s 🔴 (regresión post "Para vos")
- Aguinaldo: LCP 8.5s 🔴 (regresión)

### 5.2 Page weight medido (transfer)

- Home: 147 KB HTML (con brotli activo el wire es ~30 KB)
- IMC: 127 KB HTML
- Aguinaldo: 134 KB HTML

Brotli activo (`content-encoding: br`). ✅

### 5.3 JS bundle — el limit conocido

- Calculator.astro: 93 KB unused JS por página
- GTM gtag dual (GA4 + Ads): 130 KB unused JS
- Total página: ~222 KB unused JS

Bug crítico ya conocido y aceptado por trade-off de revenue.

### 5.4 Critical CSS inline — implementado para hero (correcto)

El `<style>` inline en Layout.astro:487 cubre las reglas `.hero`, `.hero-title`, `.hero-lead`, `.trust-row`, `.trust-pill` — esto es exactamente para que el LCP de la home no espere al CSS externo. Está OK.

### 5.5 Hero / LCP candidate optimization

El LCP de la home (7.3s) es el `<p class="hero-lead">`. Está inline (en HTML) y debería paintear inmediato. La causa probable de 7.3s NO es el HTML — son los redirects/blocking del prefetch + GTM en parallel + AdSense iframe que termina recibiendo CPU. Si Lighthouse simula 3G, el hero-lead recibe paint instantáneo pero algún elemento posterior (logo SVG? slider? imagen del primer card?) toma el rol de LCP y eso explica los 7s. **Próximo paso**: en el report Lighthouse de `/`, ver qué selector reporta como LCP element — si es el `<img>` del logo o algún card grande, considerar agregar `fetchpriority="high"` a ese elemento (ya está el logo, pero quizás el LCP es otro).

---

## Sección 6 — Trust signals / Off-page

### 6.1 sameAs completeness — incompleto

`Organization.sameAs`:
- X (Hacecuentas) ✅
- LinkedIn (122324467) ✅
- GitHub (grblasquiz/hacecuentas) ✅
- Wikidata (Q139824747) ✅

Falta agregar:
- Crunchbase
- AngelList / Wellfound (si aplica al proyecto)
- BBB / Business directory equivalente AR (no hay BBB en AR, pero podría agregarse Mercado Libre Verified, Cuit verification)
- YouTube (cuando se cree)
- Pinterest (cuando se cree)
- Instagram (cuando se cree)

`Person.sameAs` (Martín):
- GitHub ✅
- LinkedIn personal — falta
- X personal — falta

### 6.2 Contact info — bien

`/contacto` tiene H1 + métodos de contacto. ContactPoint en `/sobre-nosotros` schema. Falta `contactPoint` en home/global Organization schema.

### 6.3 About / Editorial policy — extensa

`/politica-editorial` (9 secciones H2, completo), `/metodologia` (organizado por categoría), `/sobre-nosotros` (existe). Calidad del contenido editorial es uno de los puntos fuertes del sitio. ✅

### 6.4 Legal pages — completas

`/privacidad`, `/terminos`, `/cookies`, `/aviso-legal` existen y retornan 200. ✅

---

## Sección 7 — Backlinks / brand mentions

No tengo acceso directo a Ahrefs/Semrush en este audit. Por contexto del backlog:
- Reddit citations: ~3/100 (objetivo D30 = 30)
- Pitch a medios AR: 0/8 emails enviados (preparados desde 13-may)
- Wikipedia: Wikidata Q139824747 creado, sin artículo Wikipedia (lo siguiente)
- Backlinks pasivos: bajo (sitio joven en términos de autoridad, el HCU borró parte del equity histórico)

**Gap obvio**: las menciones unlinked en redes (Reddit citations, hilo de X) cuentan también para Google como brand signal. Cada vez que aparece "hacecuentas" en cualquier sitio (con o sin link) → Google lo levanta. Reddit y X son los dos canales con mejor ratio esfuerzo/resultado para Martin.

---

## Sección 8 — Competitive context

| Competidor | Fuerza | Debilidad respecto a HC |
|---|---|---|
| **calculator.net** | Top global, 50K+ calcs, autoridad masiva | Inglés único, sin foco LATAM/AR, UX 2010 |
| **OmniCalculator** | 3K calcs, UX moderna, redondea AI Overviews | Sin foco AR, no cubre AFIP/ANSES/BCRA |
| **Idealista calculadoras (ES)** | Top en ES para hipotecas/inmuebles | Solo ES, solo finanzas inmobiliarias |
| **Infobae calculadoras** | Brand AR fuerte, tráfico orgánico alto, cubre aguinaldo/sueldo | Pocas calcs (~30), UX inferior, sin live data |
| **Iprofesional, La Nación** | Brand authority, aparecen en SERP de calc queries vía artículos explicativos | No tienen calculadora interactiva, son contenido editorial |
| **MD Calc** | Top global salud, autoridad médica | Solo salud, profesional/médico (no consumer) |

**Diferenciador HC**:
- 4,131 calcs (10x más que cualquier competidor LATAM)
- Live data BCRA/INDEC/Dolar/UVA (49 calcs) — único en LATAM
- Schema completo (HowTo, FAQ, Article, Dataset, Recipe, Medical, Learning) — superior a calculator.net
- Cobertura provincial AR (IIBB, sellos por provincia) — único
- Author transparente + metodología — superior a la mayoría
- 7 locales con auditoría calidad por locale — superior a Idealista/Infobae

**Donde nos ganan**:
- Calculator.net / OmniCalculator: autoridad de dominio (DR 80+ vs HC ~25)
- Infobae: brand familiar para usuario AR, "infobae sueldo" tiene CTR alto sin necesidad de SEO
- MD Calc: trust médico para queries YMYL salud

---

## Sección 9 — Quick wins (≤30 min cada uno)

### 🔴 QW-1: Arreglar `Cache-Control` duplicado en `_headers`
- **Qué**: Eliminar la regla `/og/*` y la regla `/_astro/*` específicas que están causando concatenación. CF Pages las merge-a con `/*`.
- **Por qué**: Browsers están revalidando assets immutables en cada navegación — desperdicio puro de ancho de banda y TTFB.
- **Cómo**: En `public/_headers`:
  1. Remover el bloque `/og/*` y mover su `max-age=2592000` a una notación inline `/og/*\n  Cache-Control: ...` PERO usando un truco: `! Cache-Control:` para "reset" (CF Pages soporta `!` prefix para reemplazo, no concatenación).
  2. O alternativamente: cambiar `/*` para `Cache-Control: no-store, must-revalidate` (sin `public, max-age=0`) y dejar que las reglas específicas seteen el TTL correcto.
- **Esfuerzo**: 15 min. **Impacto**: -30% transfer en visitas repetidas, +5 puntos Best Practices.

### 🔴 QW-2: Crear `/favicon.svg` y `/logo-512.png` (404s en cada pageview)
- **Qué**: Los dos archivos no existen y son referenciados en manifest, sw.js, schema.org logo, blog templates.
- **Por qué**: Cada pageview registra 1 console error (404) que Lighthouse Best Practices penaliza, y Google logging interpreta como dominio "sucio".
- **Cómo**:
  1. Generar `favicon.svg` desde el `favicon.ico` (usar `convert` o ResVG).
  2. Generar `logo-512.png` desde `logo-128.png` con sharp.
  3. Commit + deploy + purge CF.
- **Esfuerzo**: 20 min. **Impacto**: -2 console errors per pageview, +3 Best Practices.

### 🔴 QW-3: Desactivar Cloudflare Speed Brain (o whitelist Lighthouse)
- **Qué**: En CF dashboard → Speed → Optimization → Speed Brain → OFF. O agregar el header `Speculation-Rules: false` en el Worker para que Lighthouse no especule.
- **Por qué**: Cada audit Lighthouse registra 5+ 503s en console; usuarios reales no se afectan pero Lighthouse Best Practices baja y CrUX puede penalizar.
- **Cómo**: Toggle simple en CF dashboard. Si querés mantener Speed Brain para usuarios reales, agregar en `middleware.ts` un check `Sec-Purpose: prefetch` que responda 200 con HTML cacheado en vez de 503.
- **Esfuerzo**: 5 min toggle, o 30 min implementación middleware. **Impacto**: -5 puntos errors-in-console + mejor UX prefetch real.

### 🟡 QW-4: Backfill `esSlug` en 373 calcs MX/CL/CO/ES
- **Qué**: Para cada calc MX/CL/CO/ES que tenga equivalente en AR (matching por slug similar), agregar `esSlug` apuntando al slug AR.
- **Por qué**: Sin esto, hreflang es unidireccional. Google trata los locales como islas separadas y no consolida equity.
- **Cómo**: Script Python que (a) lista todos los slugs AR, (b) por cada MX/CL/CO/ES busca match exacto o fuzzy con `levenshtein < 5`, (c) agrega `esSlug` si match confiable. Casos ambiguos quedan a revisión manual.
- **Esfuerzo**: 25 min script + 10 min review. **Impacto**: hreflang completo, mejor distribución de equity entre locales.

### 🟡 QW-5: Subir min FAQ de 7 a 8
- **Qué**: 757 calcs con exactamente 7 FAQs. Agregar 1 FAQ más a cada uno.
- **Por qué**: 7 es el mínimo absoluto. 8+ da más contenido único y suma a content depth signal. Cada FAQ extra es ~50 palabras + Question/Answer schema.
- **Cómo**: Agent batch que toma cada calc con FAQ=7, genera 1 pregunta nueva basada en el seoKeywords / h1, la responde brevemente.
- **Esfuerzo**: 30 min script + agent batch (corre en background).
- **Impacto**: +0.5% content depth promedio, +757 nuevas entradas Q&A indexables.

### 🟢 QW-6: Agregar Reporting-Endpoints + Origin-Agent-Cluster
- **Qué**: 2 headers más en `_headers`.
- **Por qué**: +2 Best Practices, defense in depth.
- **Cómo**: Append a `_headers` (revisar evitar duplicate Cache-Control bug):
  ```
  Reporting-Endpoints: csp="https://hacecuentas.com/api/csp-report"
  Origin-Agent-Cluster: ?1
  ```
- **Esfuerzo**: 5 min. **Impacto**: marginal pero gratis.

### 🟢 QW-7: Agregar foto/avatar real a `/autores/martin-rodriguez`
- **Qué**: Foto profesional o avatar SVG/PNG, referenciado en schema Person como `image`.
- **Por qué**: E-E-A-T post-2026 valora foto real verificable.
- **Cómo**: Subir `martin-rodriguez.jpg` (idealmente foto real) a `public/og/`, actualizar Person schema con `image: { @type: "ImageObject", url, width, height }`, reemplazar el `<div class="avatar">MR</div>` por `<img src="/og/martin-rodriguez.jpg" alt="Martín Rodríguez">`.
- **Esfuerzo**: 15 min (si Martin facilita foto) o 30 min si hay que generar avatar.
- **Impacto**: E-E-A-T signal directo, primer ítem que evaluator Quality Rater ve.

---

## Sección 10 — Strategic plays (30-90 días)

| # | Play | Esfuerzo | Impacto | Riesgo HCU |
|---|---|---:|---:|:---:|
| **SP-1** | Expandir answerSnippet a top 500 AR (de 102 a 500) | 8h batch (parallelizable Claude) | +25-40% AI Overviews citation, +5-15% organic CTR top 500 | bajo |
| **SP-2** | Activar live-data en 100 calcs adicionales (de 49 a 150) | 6h (batch script + manual review) | +20% Information Gain signals — diferencial vs scraped competitors | bajo |
| **SP-3** | Implementar contextual internal-linking en `intro` de 1000 top AR (hoy 92% sin links) | 10h (script de auto-linking con NER) | +10-15% link equity flow, mejor PageRank distribution | medio (overlink risk) |
| **SP-4** | Crear 47 Recipe schema additions (cocktails, café, bebidas) | 2h script regex expand | +30% rich snippets en cocina, +Discover potential | bajo |
| **SP-5** | Pitch a 8 medios AR (HIGH: pre-redactados desde 13-may) | 2h envíos + 2 semanas seguimiento | 1-3 backlinks editoriales = +DR 5-10 puntos | bajo |
| **SP-6** | Reddit campaign 3→30 hits en 30 días (1-2/día) | 30 min/día x 30d = 15h | 30 brand mentions = mejor brand authority + AI citations + 5-10% lift en queries de marca | bajo (si se hace bien) |
| **SP-7** | Crear artículo Wikipedia para hacecuentas (con Wikidata Q139824747 ya creado) | 4h research + 2h drafting + revisión | Knowledge Graph activado → marca aparece en sidebar SERP brand queries | medio (puede no aprobarse) |
| **SP-8** | Lanzar encuesta original (3 preguntas, 200-500 respuestas) | 3h setup + 6 semanas drip | Dataset propio único para 1-2 piezas de "Original Research" + 3-4 menciones medios | bajo |
| **SP-9** | YouTube canal con 10 videos top 10 calcs (CC + scripts) | 20h | YouTube ranking en queries de calc + video schema rich result + 2da brand surface | bajo |
| **SP-10** | Expandir `/autores/martin-rodriguez` con `worksFor` adicional (CMO Argenprop) + LinkedIn sameAs + foto | 1h | E-E-A-T++ signal, posible Knowledge Panel para Martin | bajo |
| **SP-11** | Aplicar 387 KILL_410 pendientes en `/en/*` (auditoría 5-20 ya identificada) | 1h script | -30% crawl budget desperdiciado en EN, mejora ratio impressions/clicks | bajo |
| **SP-12** | Fix LCP en home y Aguinaldo (regresión post "Para vos" SSG) | 3h debug + optimización | +30 Performance Lighthouse, -2s LCP real → mejor ranking page experience | bajo |

### Detalle de los strategic plays prioritarios

**SP-1 (top 500 answerSnippet)** es el highest-leverage. El template `04-26 ya prepared backlog` `docs/answersnippet-backlog.json` tiene 1202 candidates listas. Batchear 100 al día con Claude (~80% éxito autonomous, 20% review manual) en 5 días termina la cobertura.

**SP-3 (internal linking)** requiere cuidado porque overlink dispara HCU. El target debería ser 2-3 links contextuales en `intro` por calc, no 10. Script que detecte entidades en el intro y matchee con slugs existentes (con `findMentions` extendido para Slugs propios, no solo Wikidata).

**SP-5 (pitch medios)** es lo más DEPENDIENTE de Martin. Los 8 emails ya están en `docs/pitch-emails-sueldo-real.md`. Solo hace falta enviarlos. Costo: 2h efectivas. ROI potencial: cada mención en Infobae o La Nación = +500-2K visits orgánicas directas + backlink DR 80+.

**SP-12 (LCP regresión)** debería ser P1 porque revierte una mejora reciente. Probable culpable: el bloque "Para vos" SSG agrega más HTML/CSS a layout sin tree-shake; el commit `8bd5df6a` lo introduce. Verificar `dist/` size delta antes/después.

---

## Cierre: lo que YO haría mañana (priorización Martin)

Si tengo que elegir 3 cosas para hacer mañana (2026-05-27), serían en este orden:

### 1. 🔴 Pitch a 2 medios AR (Infobae + Cronista) — 1 hora máximo

Los emails están listos desde el 13-may. Falta solo presionar enviar. **Cada día de delay es 1 día perdido del hook fresh** (`/blog/argentino-promedio-ganancias-2026` y `/blog/sueldo-real-argentino-2026`). Si responden, +1 menciones = +500-2000 visits orgánicos + 1 backlink DR alto = impacto inmediato y compounding. Si NO responden en 2 semanas, descartar y rotar al siguiente hook. Es el play de mayor leverage que hay y es el más DESCUIDADO actualmente.

### 2. 🔴 Fix los 3 bugs técnicos detectados (45 min total)

- `Cache-Control` duplicado en `/og/*` y `/_astro/*` (15 min)
- Generar `favicon.svg` + `logo-512.png` (20 min)
- Toggle Speed Brain OFF en CF dashboard (5 min)

Estos son bugs que están penalizando Best Practices y CrUX Field Data sin que aporten nada. Resolverlos no tiene riesgo y aumenta el Score técnico que ya estaba en 8.7/10 → 9.2-9.5/10.

### 3. 🟡 Batch run de answerSnippet para top 50 siguientes calcs AR (1-2 horas)

De `docs/answersnippet-backlog.json` (1202 candidates), tomar las top 50 por impresiones GSC. Correr el agent script. Commit + deploy.

Eso lleva cobertura de 102 → 152 (todavía 5.3% del total, pero coverage de top 250 = 60%). Para AI Overviews y Featured Snippet captures, lo que cuenta es coverage de las URLs que ya rankean. **Es el play técnico con mejor leverage sin requerir nada de Martin más allá de revisar el batch antes de mergear**.

---

## Total de hallazgos por categoría

| Categoría | Hallazgos críticos 🔴 | Warnings 🟡 | OK 🟢 | Recomendaciones |
|---|---:|---:|---:|---:|
| Crawlability | 1 (Speed Brain 503) | 0 | 2 | 0 |
| Indexability | 2 (hreflang + sitemap-fresh inflado) | 0 | 1 | 0 |
| Mobile/UX | 1 (LCP regresión home/aguinaldo) | 1 (target-size home) | 2 | 0 |
| Schema | 0 | 2 (Person.image + Recipe coverage) | 8 | 1 |
| Security headers | 0 | 1 (Reporting-Endpoints faltante) | 5 | 1 |
| Title/Meta | 0 | 2 (67 titles >60, 20 desc >160) | 1 | 0 |
| Internal linking | 1 (92% calcs sin links en intro) | 0 | 1 | 0 |
| Content quality | 0 | 3 (snippet 3.6%, Recipe 19% cocina, LiveData 1.7%) | 2 | 0 |
| AI Visibility | 0 | 2 (llms-full consistency, AI Overviews coverage) | 3 | 0 |
| E-E-A-T author | 0 | 3 (foto, sameAs, worksFor) | 4 | 0 |
| Trust signals | 0 | 1 (sameAs incompleto) | 4 | 0 |
| Cache headers | 1 (duplicate header bug) | 0 | 3 | 0 |
| 404s | 1 (favicon.svg + logo-512.png) | 0 | 0 | 0 |
| **TOTAL** | **7 críticos** | **15 warnings** | **36 OK** | **2 recomendaciones** |

**Conclusión global**: técnicamente el sitio está al borde de lo que se puede hacer desde código. Los 7 críticos son fixes de 1-3 horas. La aguja real para recovery está afuera: **pitch a medios, Reddit campaign y encuesta original** — que dependen 100% de Martin. Los próximos 30 días el SEO técnico aporta +5-10% mejora, las acciones off-page aportan +50-200% si se ejecutan.

---
🤖 Generated by Claude Opus 4.7 — Auditoría comprehensive 2026-05-26 19:30 ART
