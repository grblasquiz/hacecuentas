# 05 — Log de implementación

## Scripts creados (todos runnable, corridos con datos reales)

| Script | Salida | Resultado |
|---|---|---|
| `scripts/bing-growth/normalize-perf-data.mjs` | `query-url-data.csv` | 1045 filas (308 page-level Bing real + 737 query-level). GA4 sessions por path (483). |
| `scripts/bing-growth/build-url-inventory.mjs` | `url-inventory.csv` | 3433 URLs de contenido (3357 calcs 14 locales + 76 guías/comparaciones). 28 noindex/sensibles. |
| `scripts/bing-growth/classify-opportunities.mjs` | `opportunities.csv` | 2161 filas. 114 OPTIMIZE_TITLE, 11 FIX_CANONICAL (ver nota), 1845 OPTIMIZE_INTERNAL_LINKS (ver nota), 191 KEEP. |
| `scripts/bing-growth/find-duplicate-candidates.mjs` | `duplicate-candidates.csv` | 572 pares. **0 MERGE_ALLOWED**, 28 DIFFERENTIATE, 534 MANUAL_REVIEW, 10 KEEP_SEPARATE. |
| `scripts/bing-growth/audit-sitemaps.mjs` | `sitemap-audit.csv` | 7353 URLs / 51 sitemaps. 4 REDIRECT_IN_SITEMAP (→ corregido), resto DUPLICATED (overlap priority intencional) / MISSING_LASTMOD (no-calc). |
| `scripts/bing-growth/build-internal-links.mjs` | `internal-links-before/after.csv` | 3329 calcs indexables. Enlazado por related-auto TF-IDF + relatedSlugs. |
| `scripts/bing-growth/indexnow-manifest.mjs` | `current-url-manifest.json`, `indexnow-urls.txt` | Manifiesto de 3405 URLs indexables con content-hash. Diff CREATED/UPDATED/DELETED. |

## Cambios de código aplicados (seguros, testeados)

1. **`src/lib/content-policy.ts`** — agregado `isSensitiveCalculator()` (objeto
   compuesto §23) + interface `SensitivePermissions`. Envuelve la lógica ya
   centralizada. Tests `tests/sensitive-permissions.test.ts` (6/6 PASS).

2. **`scripts/generate-sitemap.ts`** — filtro defensivo: excluir sources de
   301/308 de `public/_redirects` de TODOS los sitemaps (incluido images).
   Corrige 11 zombies "JSON-vivo / URL-301eada" (ej: `calculadora-plan-maraton-
   semanas-experiencia`, `calculadora-regla-72-duplicar-dinero`). Verificado:
   `Stripped 11 URLs con 301/308 en _redirects` + 0 en cualquier sitemap.

3. **`scripts/indexnow-push.py`** — agregado modo `--changed` (§27): lee el
   change-set de `indexnow-manifest.mjs` y envía en lotes de **500** (vs 10k del
   `--all`). Modifica la implementación existente (no crea una paralela). El
   `--all` diario queda intacto para no romper el drip actual.

## Notas de fidelidad (no se maquilla)

- **FIX_CANONICAL (11)**: son mayormente `canonicalSlug` INTENCIONALES
  (consolidaciones previas), no errores. No se tocaron.
- **OPTIMIZE_INTERNAL_LINKS (1845)**: sobre-contado — el flag `has_related=false`
  mira sólo `relatedSlugs` manual, pero el runtime enlaza por `related-auto.json`
  (TF-IDF). Muchas de esas 1845 SÍ tienen enlaces. El gap real es menor.
- **internal-links "1266 sin enlaces"**: sobre-contado — el análisis cargó sólo
  `related-auto.json` (AR); los locales tienen `related-auto-{locale}.json`
  separados. El gap real es mucho menor.
- **Títulos (§29)**: los top OPTIMIZE_TITLE (fixture-mundial, feriados-*, salario-
  mínimo país) tienen trabajo de CTR previo (varios lotes). No se reescribieron
  en masa (§29: no reescribir indiscriminadamente + riesgo de churn). Quedan en
  `opportunities.csv` priorizados para una pasada editorial dedicada con criterio.
