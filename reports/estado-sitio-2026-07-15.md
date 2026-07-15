# hacecuentas.com — inventario de lo que hay que arreglar

**Fecha:** 15-jul-2026 · **Método:** auditorías del repo + verificación en vivo con `curl` contra producción + GA4 (28d: 17-jun → 14-jul).

Todo lo marcado **[VERIFICADO]** se comprobó contra producción o contra datos medidos. Lo marcado **[INFERIDO]** es un mecanismo confirmado cuya magnitud no se midió. Nada acá es estimación a ojo.

---

## 0. Contexto del sitio (necesario para entender lo demás)

- Sitio de calculadoras en **Astro**, desplegado en **Cloudflare Pages**. ~3.150 URLs en el sitemap.
- **3.409 calcs** en 14 locales; **1.722 son ES-AR**. Más un blog de 57 posts.
- **Composición del tráfico (GA4, 28 días, medido):** 49.977 sesiones totales.
  - **Paid Search: 30.347 (60,7%)** ← el sitio es mayoritariamente pago
  - **Organic Search: 16.549 (33,1%)**
  - Dentro del orgánico, **Bing es ~85%** y Google ~1%. Google Search Console es ciego para este sitio.
- **AdSense:** 3 rechazos por *"low value content"*. Se prepara la 4ta solicitud.
- Existe una campaña de **Google Ads DSA** (Dynamic Search Ads) que se targetea con un **page feed** (`/google-page-feed.csv`) generado automáticamente a partir de los sitemaps.

---

## 1. 🔴 P0 — INCIDENTE ACTIVO: se apagó el 45% del catálogo ES hace 48 horas

### Qué pasó

El **14-jul-2026** (commit `801b1430d`), un script de cuarentena editorial (`quarantine-editorial-risk.ts --write`) estampó `status:"draft"` + `noindex:true` + `distribution:"restricted"` sobre **772 de las 1.722 calcs ES (45%)**.

**[VERIFICADO]** Estas páginas responden HTTP 200 con `<meta name="robots" content="noindex, follow">` en producción **ahora mismo**:

- `/calculadora-plazo-fijo`
- `/calculadora-interes-compuesto`
- `/calculadora-indemnizacion-despido`

**[VERIFICADO]** El historial del archivo `plazo-fijo.json` muestra el corte exacto: hasta el commit `e08f5ad1e` (14-jul) no tenía `status`; en `801b1430d` (14-jul) aparece `draft + noindex:true + restricted`. **No es un estado viejo: tiene menos de 48 horas.**

### Impacto medido (GA4, 28 días)

El daño va por **dos mecanismos independientes** que apuntan en la misma dirección:

| Mecanismo | Qué se pierde | Timing |
|---|---|---|
| `noindex` → salen del índice de Bing/Google | Tráfico orgánico | Decae en semanas (hay que esperar el re-crawl) |
| `noindex` → salen del sitemap → **salen del page feed de Google Ads DSA** | Tráfico **pago** | **Inmediato, ya está live** |

**Tráfico de las 772 calcs ES afectadas (28d, medido):**

| Métrica | 28d | % del sitio |
|---|---:|---:|
| **Sesiones totales** | **9.184** | **18,4%** |
| → Paid Search | 6.247 | 20,6% del pago |
| → Organic Search | 2.434 | 14,7% del orgánico |

**Contando todos los locales afectados** (la cuarentena pegó más allá de ES: AR 906, CO 80, CL 62, MX 58, ES 38, EN 29, PT 18 URLs):

| Métrica | 28d | % del sitio |
|---|---:|---:|
| **Sesiones** | **12.303** | **24,6%** |
| → Paid | 6.020 | 19,8% del pago |
| → Organic | 5.175 | **31,3% del orgánico** |

### El page feed de Google Ads DSA

**[VERIFICADO]** El feed se vació a la mitad:

| Momento | URLs en `/google-page-feed.csv` |
|---|---:|
| Antes de la cuarentena (`801b1430d^`) | **3.079** |
| Después del commit (`801b1430d`) | 1.960 |
| **Live en producción ahora** | **1.792** |

**Pérdida neta: -1.287 URLs (-42%).** De las que desaparecieron, ~1.177 (90%) son atribuibles a la cuarentena.

**[VERIFICADO]** Las tres calcs con más facturación tienen **0 apariciones** en el feed live: `calculadora-plazo-fijo`, `calculadora-indemnizacion-despido`, `calculadora-impuesto-ganancias-sueldo`.

**[VERIFICADO]** 6.237 de las 6.247 sesiones pagas afectadas venían de la campaña llamada literalmente `DSA`.

**[INFERIDO]** Que esas 6.247 sesiones pagas se pierdan: está verificado que las URLs ya no están en el feed y que la campaña es DSA, pero no se revisó la consola de Google Ads para confirmar que el feed sea su única fuente de targeting, ni el gasto/conversiones asociado. **Ese es el chequeo que falta para ponerle plata al número.**

⚠️ **El daño sigue creciendo:** 4 páginas del top-25 afectado (`iva-incluido-neto-discriminar`, `carne-asado-kg-por-persona`, `premios-mundial-2026`, `talla-sosten-corpino`) todavía están en el feed live pero ya están en `draft` → **se caen en el próximo build.**

### Top 10 afectadas por tráfico total (28d)

| # | Slug | Sesiones | Orgánico | Motivo de cuarentena |
|---|---|---:|---:|---|
| 1 | `/calculadora-indemnizacion-despido` | 1.572 | 10 | YMYL sin revisor |
| 2 | `/calculadora-impuesto-ganancias-sueldo` | 744 | 158 | YMYL sin revisor |
| 3 | `/calculadora-liquidacion-final-renuncia` | 382 | 46 | YMYL sin revisor |
| 4 | `/calculadora-art-indemnizacion-tabla-incapacidad-laboral` | 324 | 3 | YMYL sin revisor |
| 5 | `/calculadora-costo-impresion-3d-pieza` | 267 | 0 | explicación <1500 + fuente genérica |
| 6 | `/calculadora-interes-judicial-tasa` | 214 | 135 | fuente genérica |
| 7 | `/calculadora-transfer-auto-costo-registro` | 172 | 13 | fuente genérica |
| 8 | `/calculadora-iva-incluido-neto-discriminar` | 158 | 12 | fuente genérica |
| 9 | `/calculadora-liquidacion-final-empleada-casa-particular` | 122 | 24 | YMYL sin revisor |
| 10 | `/calculadora-gastos-escritura-compra-inmueble` | 121 | 4 | fuente genérica |

Nota interpretativa: `/calculadora-indemnizacion-despido` es la #1 del daño total (1.572 ses) pero solo tiene **10 sesiones orgánicas** — es una página casi 100% pago. Su riesgo es enteramente DSA, no SEO.

**8 de las top-25 calcs del sitio están en draft; 17 siguen vivas.** La #1 del sitio (`/calculadora-imc`, 4.312 ses) sobrevivió, igual que ICL, aguinaldo e IPC. **El corte se llevó específicamente el bloque laboral/impositivo AR** (indemnización, liquidación, ganancias, ART) — que es exactamente el cluster "YMYL sin revisor".

### Por qué el arreglo es barato (esto es lo importante)

Los motivos de cuarentena, contados (1.353 páginas, 1.589 motivos — una página puede acumular varios):

| Motivo | Páginas | Tipo de fix |
|---|---:|---|
| **`generic-data-source`** | **971 (72%)** | **Metadato: 1 campo por calc** |
| `explanation-under-1500` | 275 | Escribir prosa |
| `high-stakes-without-professional-review` | 225 | Necesita un profesional matriculado real |
| `source-topic-mismatch-bcra` | 38 | Metadato |
| `duplicate-meta-description` | 32 | Metadato |
| `missing-solved-example` | 28 | Contenido |
| `missing-source` | 18 | Metadato |

**El 72% del backlog es `generic-data-source`**, y el fix es de una línea. El script lee el campo **`dataUpdate.sourceUrl`** (NO el array `sources[]`) y marca como genérica cualquier URL que sea dominio pelado o path superficial. Ejemplo real:

```
plazo-fijo.json          dataUpdate.sourceUrl = 'https://www.bcra.gob.ar/'   ← dispara la cuarentena
  pero sources[]  =  3 URLs deep y válidas (infoleg, BCRA con path completo)
```

**El deep link correcto ya vive en `sources[0]` en la mayoría de los casos** → el remapeo es casi automático y scriptable.

URLs genéricas más repetidas: `https://www.bcra.gob.ar` **68×**, `https://www.fci.be` 17×, `https://www.iram.org.ar` 11×, `https://www.inti.gob.ar` 11×, `https://www.acsm.org` 10×, `https://fdc.nal.usda.gov/` 10×, y `https://hacecuentas.com` 7× (se cita a sí mismo como fuente).

**Concentración:** top 10 afectadas = **45% del daño**; top 25 = 58%; top 50 = 68%. **210 de las 772 tienen cero tráfico** (cuarentenarlas no cuesta nada). **Revisar ~50 slugs recupera dos tercios de la exposición.**

### Decisiones que hay que tomar

1. **¿Revertir la cuarentena en bloque y re-aplicarla con criterio, o remediar por lotes?** El bloque laboral/impositivo AR es el que más factura y el que está bloqueado por el motivo más caro (necesita revisor humano).
2. **`professionalReviewer` no existe en ninguna de las 3.409 calcs.** **[VERIFICADO]** El estado `professionally_reviewed` es hoy **inalcanzable**: `hasValidProfessionalReviewer()` exige name + profession + credential + profileUrl + reviewedAt, y ningún JSON los tiene. Las 225 páginas `high-stakes` no se pueden destrabar sin conseguir un contador/abogado matriculado real. **Es una decisión de negocio, no de código.**

---

## 2. 🔴 P1 — 16 redirects que mueren en un 410 (link equity tirada a la basura)

**[VERIFICADO EN VIVO]** 16 reglas de `public/_redirects` hacen 301 hacia un slug que está en la lista de lápidas 410 (`src/lib/gone-410.ts`). El usuario y el crawler hacen el salto y aterrizan en un "Gone".

| Origen | → Destino (410) |
|---|---|
| `/calculadora-dca-dollar-cost-average-crypto` | `/calculadora-dca-dollar-cost-averaging-cripto` |
| `/calculadora-dollar-cost-averaging-cripto` | idem |
| `/calculadora-conversion-nudos-mph-kmh-viento` | `/calculadora-conversor-nudos-a-kmh` |
| `/calculadora-conversion-tiempo-segundos-minutos-horas` | `/calculadora-conversor-horas-a-minutos` |
| `/calculadora-indice-glucemico-alimentos` | `/calculadora-indice-glucemico-carga-alimento-porcion` |
| `/calculadora-edad-humana-raza-gato` | `/calculadora-esperanza-vida-gato-raza-indoor` |
| `/calculadora-expectativa-vida-raza-gato` | idem |
| `/calculadora-fees-comision-exchange-crypto` | `/calculadora-usdt-vs-usdc-comision-exchange` |
| `/waist-hip-ratio-calculator` | `/en/waist-to-hip-ratio-cardiovascular-health` |
| **`/logarithm`** | `/en/logarithm-base-any-number` |
| `/arithmetic-progression` | `/en/arithmetic-progression-nth-term-sum` |
| **`/daily-fiber-intake`** | `/en/daily-dietary-fiber-intake-calculator` |
| **`/due-date-calculator`** | `/en/ivf-due-date-calculator` |
| `/combinaciones-ncr` | `/calculadora-combinaciones-n-tomados-k-cnk` |
| `/calculo-cilindrada-motor` | `/calculadora-cilindrada-motor-relacion-potencia` |
| `/riego-plantas` | `/calculadora-agua-riego-plantas-dia` |

Varios son **vanity slugs cortos en inglés** (`/logarithm`, `/due-date-calculator`, `/daily-fiber-intake`) — pinta a link equity real yéndose a un 410. **Fix:** repointar en `public/_redirects` (que gana sobre `pruning-redirects.ts`) a `/categoria/<cat>` o a una calc viva equivalente.

**Corrección de un reporte previo:** se había anotado que `/calculadora-dca-dollar-cost-average-crypto` daba 404. **Es falso**: da 301 correctamente; el que está mal es el destino (410). Y no es un caso puntual: es 1 de 16.

---

## 3. 🟡 P2 — Cosas reales pero de menor impacto

### 3.1. Test roto en main
`tests/analytics.test.ts` falla: el evento `hc_decision_room_impression` existe en `HC_EVENTS` pero no en el spec del test. Es un test desactualizado, no un bug de producto. **Fix: 1 línea.**

### 3.2. Blog — 57 posts, 59 errores
- **22 titles >66 chars** (Bing trunca en ~65). El sufijo `" | Hacé Cuentas"` (14 chars) se come el 21% del presupuesto. 8 de los 22 son de 2 templates (`partidos-mundial-*`, `finde-largo-*`) → **un solo fix de patrón resuelve 8**.
- **10 posts sin `relatedCalcs`** → no rompe el build (el template tiene guards), rendea vacío: cero CTA hacia calculadoras. Son los 10 posts **más largos** del blog (14.789–18.419 chars) y ya tienen links inline vivos → el fix es promover esos links a `relatedCalcs`.
- **23 referencias a calcs podadas** desde 13 posts. **Matiz importante [VERIFICADO]:** `scripts/rewrite-internal-links.ts` corre post-build y reescribe todos los hrefs podados a su destino canónico → **ningún link del blog emite un 301**. El problema real no es link equity, es una **promesa rota**: el CTA dice "Próximo feriado Argentina 2026 → Usar la calculadora" y aterriza en `/categoria/vida`. Los 2 peores (`finde-largo-13-junio-2026`, `finde-largo-9-julio-2026`) tienen la podada en índice 0 → contamina las 3 superficies a la vez.
- **26 posts thin** (`content` <4000 chars). Los **14 recién publicados hoy** son los más finos del sitio (954–1.869 chars, ~⅓ del umbral) — se sumaron 14 URLs thin al índice **justo con AdSense en juego, cuyo rechazo fue por "low value content"**.
- **Bug que el audit no detecta:** `relatedCalcs` duplicados. `slice(0,3)` no deduplica → en `finde-largo-10-julio-2026` se rendean 2 cards idénticas + 1 al hub = **1 sola calc real ofrecida de 3**.

### 3.3. AdSense — bloqueantes que quedan
El corpus publicable (1.844 páginas KEEP) **no parece thin**: mediana de 1.259 palabras, 0 páginas sin fuentes, 0 con <300 palabras. El rechazo por "low value" probablemente no viene del volumen de texto sino de esto:

- **Asimetría YMYL cross-locale (11 pares verificados):** el mismo concepto médico está restringido en un locale y **monetizado con ads en otro**. Ejemplos: `cafeina-dosis-segura-diaria-peso` (restringida) vs `daily-caffeine-safe-maximum-cups` (**live + ads, mismo locale US**); `calculadora-spf-proteccion-solar-minutos-piel` (restringida) vs `spf-sun-protection-minutes-skin-type` (**live + ads**, traducción literal). Un revisor que abra las dos ve una política incoherente.
- **Procedimientos de emergencia médica monetizados:** `cpr-bls-chest-compressions-rate` (RCP) y `choking-heimlich-age-maneuver` (Heimlich) están **indexados y con ads**. Cayeron en MODERATE solo porque el slug no matchea ningún heurístico.
- **El quality gate es una tautología y nunca puede fallar:** `audit:adsense --gate` filtra `decision === 'KEEP'` y después busca P0 adentro — pero `KEEP` se **define** excluyendo P0. `p0InPublishable` es vacío por construcción → **siempre exit 0**. El gate no está protegiendo nada.
- **`editorialReview: "approved"` lo puso un script en 1.746 páginas**, con `approvalBasis: "owner-authorized exhaustive automated evidence report"`. El comentario del código dice *"Aprobación humana explícita; nunca se infiere"* — pero se infiere. Atenuante verificado: no se renderiza ningún byline falso on-page. Es una decisión tomada a conciencia (quality-gate automático), pero es exactamente la superficie que AdSense audita.
- **El blog no pasa por ningún gate de AdSense** — el audit solo recorre `src/content/calcs*`. Punto ciego, con 14 posts thin recién publicados.

### 3.4. Otros
- **11 cadenas 301→301→200** (`/iva`, `/prestamo`, `/calculadora-descuento`…). No están rotas, pero son slugs cortos con tráfico que pagan 2 saltos.
- **1.151 campos numéricos sin texto de ayuda** (599 en calcs visibles) — UX.
- **57 bloques de FAQ repetidos en ≥3 calcs** — riesgo de contenido duplicado.
- **277 de 685 calcs con fuente apuntan a la raíz del dominio** (mismo problema que alimenta la cuarentena).

---

## 4. ⚪ Ruido verificado — NO gastar tiempo acá

Cosas que los reportes marcan como problemas y **no lo son**. Se verificaron una por una:

1. **`audit:ymyl:check` falla con 3 violaciones de `calculadora-peso-ideal` → es un bug del propio audit.** El script hace `txt.includes('/' + slug)` **sin límite de palabra**, así que `/calculadora-peso-ideal` matchea como substring dentro de `/calculadora-peso-ideal-embarazo-imc-previo`, que sí es indexable y legítima. **[VERIFICADO]** por match exacto: **0 de las 1.398 URLs restringidas están en ningún canal**. Los sitemaps están limpios. Hay **16 slugs más** que son prefijo de otro → el falso positivo va a volver. **Fix: comparar contra el conjunto exacto de URLs, no substring.**
2. **Las 2 páginas "dosis/tratamiento indexables" son falsos positivos.** Una es `/calculadora-dias-sin-fumar-ahorro-salud`, marcada por **un comentario en el código fuente que dice literalmente "se muestran como referencia, no diagnóstico"** — el disclaimer que aclara que NO es diagnóstico es lo que la marca como diagnóstica. La otra es una **calculadora de IVA colombiano**, marcada porque los medicamentos son bienes exentos de IVA. Riesgo clínico: nulo.
3. **Los 349 "links rotos" del reporte AdSense no están rotos.** Son `relatedSlugs` obsoletos en los JSON, pero `RelatedCalcs.astro` y `NextCalcs.astro` filtran el pool con `canDistributeCalc()` **antes** de resolver, así que un slug podado devuelve `undefined` y se descarta, y el componente completa el hueco con TF-IDF. **[VERIFICADO]** No generan 301 ni 404 ni bloques vacíos. Higiene de datos, prioridad baja.
4. **695 tests "fallando"** → es un `dist/` a medio escribir de un build concurrente. Corriendo el suite con el build terminado, el único fallo real es `analytics.test.ts`.
5. **El título del audit `audit:links` está mal diagnosticado.** Dice "gate YMYL burlado", pero **0 de los 427 links tier0 apuntan a una calc YMYL**. El 100% apunta a calcs cuya única causa es la cuarentena editorial. Y su sugerencia ("apuntar a otra calc o sacar el link") sería un **error activo** en 259 de 427 casos: la calc está viva en 200 y el link es correcto — lo que está mal es un `dataUpdate.sourceUrl`. Repuntar `/calculadora-plazo-fijo` a otra calc sería destruir la página con más autoridad del vertical finanzas para satisfacer un linter.
6. **Los 11 destinos "404" del reporte de links** son slugs PY que el script nombra por filename pero viven en `/py/<slug>` → **200**.

**Lección transversal:** varios "problemas" son bugs de los scripts de auditoría, no del sitio. Antes de arreglar algo que reporta un audit, **verificar la URL real con `curl -sI`** (nunca `-L`, porque sigue el redirect y tapa el status original).

---

## 5. Los 820 links internos a páginas no distribuibles

`audit:links` reporta 820 links, de los cuales 427 son "tier 0" (desde una página viva). Desglose por causa raíz, ponderado por links:

| Razón | Links | Destinos | Fix |
|---|---:|---:|---|
| `generic-data-source` | **241** | 77 | Metadato, 1 línea |
| `high-stakes-without-professional-review` | 102 | 19 | Necesita revisor real |
| `explanation-under-1500` | 36 | 21 | Prosa |
| `explanation <1500` + `generic-data-source` | 20 | 13 | Prosa + metadato |
| Otros (mismatch BCRA, etc.) | 28 | 14 | Metadato |

**259 de 427 links tier0 (61%) se destraban solo tocando metadata** — sin escribir contenido y sin tocar un solo link. Es el mismo fix que el P0.

Un caso pintoresco: `/calculadora-cuenta-regresiva-dias-faltan` está en cuarentena por `explanation-under-1500` con **1.479 caracteres**. Le faltan **21 caracteres** para cruzar el piso.

⚠️ **Los 319 links "tier 2" son latentes, no cosméticos:** son links desde páginas que también están en cuarentena. Al levantar la cuarentena del origen, **se convierten en tier0/tier1 automáticamente**. El contador va a subir después de arreglar el P0.

---

## 6. Orden sugerido

| # | Acción | Impacto | Esfuerzo |
|---|---|---|---|
| **1** | **Remediar la cuarentena**: remapear `dataUpdate.sourceUrl` al deep link que ya está en `sources[0]`. Empezar por los ~50 slugs con tráfico. | **Recupera ~2/3 de 12.303 ses/28d + 1.287 URLs del feed DSA** | Scriptable |
| **2** | **Decidir qué hacer con el bloque laboral/impositivo AR** (indemnización, ganancias, liquidación, ART): bloqueado por `high-stakes` → necesita revisor matriculado. Es el que más factura. | ~3.000 ses/28d | Decisión de negocio |
| **3** | Repointar los 16 redirects 301→410 | Link equity | Trivial |
| **4** | Arreglar el gate tautológico de AdSense + el substring del audit YMYL | Los guards hoy no protegen nada | Trivial |
| **5** | Unificar la política YMYL cross-locale (11 pares) + bajar RCP/Heimlich | AdSense | Medio |
| **6** | Blog: titles >66 (8 son 2 templates), `relatedCalcs` faltantes, dedupe | CTR + funnel | Bajo |
| **7** | Auditar el blog para AdSense (punto ciego total) | AdSense | Medio |
| **8** | Conseguir 1 revisor profesional real → desbloquea 225 páginas high-stakes | Estructural | Alto / externo |

---

## 7. Qué NO se auditó (para no dar falsa cobertura)

- **ads.txt, política de privacidad, CMP/consentimiento, densidad de anuncios**: criterios frecuentes de rechazo de AdSense que ningún script del repo mira.
- **Core Web Vitals / performance**: no se midió en esta pasada.
- Hubs, páginas de categoría, `/mi/*`, páginas de datos y la home: fuera del audit de AdSense.
- El conteo de palabras sale del JSON, no del HTML renderizado.
- No se verificó en la consola de Google Ads el gasto ni las conversiones asociadas a las 1.287 URLs que se cayeron del feed DSA.
