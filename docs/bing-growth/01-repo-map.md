# 01 — Mapa del repositorio (SEO)

| Qué | Dónde | Nota |
|---|---|---|
| JSON de calcs | `src/content/calcs/` (AR, 1708) + `calcs-{en,pt,pt-pt,mx,es,co,cl,pe,ec,ve,py,uy,do}/` | filename ≠ slug ≠ formulaId. slug=URL; formulaId→`.ts` de fórmula. |
| Rutas Astro | `src/pages/[...slug].astro` (AR catch-all), `src/pages/{co,mx,cl,pe,es}/[...slug].astro`, `guia/[slug]`, `comparar/[slug]`, `decidir/[slug]`, `fin-de-semana/*` | |
| Layout global | `src/layouts/Layout.astro` | props: title, description, canonical, schema, noindex, audience, domain, pageType, noAds. |
| Header (único) | `src/components/Header.astro` | `COUNTRY_NAVS` por país, links en HTML, logo→/. AR=4 pilares. |
| UI calc/resultado | `src/components/CalcLayoutV2.astro` (+ `Calculator.astro`) | form→resultado→respuesta-rápida→tabs→relacionados→descargas. |
| Byline | `src/components/AuthorByline.astro` | default "Editado por"; revisor sólo si completo. |
| Sitemaps | `scripts/generate-sitemap.ts` → `public/sitemap-*.xml` (51) | lastmod=max(lastReviewed, dataUpdate, git). Filtros: canDistribute + PRUNING + GONE_410 + (nuevo) _redirects. |
| IndexNow | `scripts/indexnow-push.py` (+ `.github/workflows/indexnow-*.yml`) | key `00e48c...txt`. Modos: default(priority), `--all`, `--changed`(nuevo), urls. |
| Redirects | `public/_redirects` (301/410 CF Pages) + `src/lib/pruning-redirects.ts` + `src/lib/gone-410.ts` + `src/middleware.ts` | |
| Middleware | `src/middleware.ts` | 410 www-sitemaps, trailing-slash 308, GONE_410, pruning. |
| Política YMYL | `src/lib/content-policy.ts` | fuente única. `isSensitiveCalculator()` compuesto (nuevo). |
| Buscador | `src/pages/search-index.json.ts` + `src/pages/buscar.astro` + Header ⌘K | filtra por canDistribute. |
| Widgets/embed | `src/pages/embed.js.ts`, `oembed.json.ts`, `/embed/[slug]` | |
| Relacionados | `src/scripts/compute-related.ts` → `src/lib/related-auto*.json` (TF-IDF por locale) + `relatedSlugs` manual | |
| Exportaciones | OG `src/lib/og-manifest.json`, email `api/email-result.ts`, datos `datos/[slug].{json,csv}.ts` | gateadas por canShareResults. |
| Deploy | `scripts/deploy-local.sh` (incremental/full, gate ≥2000 HTMLs + smoke) + `cf-purge-cache.sh` | |
| Datos Bing/GA4 | `data/bing-perf-latest.json`, `data/ga4-*.csv`, `data/bing-kw-*.json` | reales. |

(Mapa detallado por componente disponible en el análisis; esta tabla es la referencia operativa.)
