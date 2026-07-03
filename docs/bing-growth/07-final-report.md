# Resultado de ejecución Bing Growth

Rama: `seo/bing-growth-10k-2026-07-03` · Fecha: 2026-07-03.
Repo maduro: la mayoría de las correcciones técnicas del plan **ya estaban
implementadas** (auditadas y verificadas). El valor agregado de esta corrida es:
(1) infraestructura de reporting con datos reales, (2) 3 correcciones de código
seguras, (3) documentación exacta del estado.

## Estado general
- Build: PASS (full, EXIT 0 — ver 00-baseline + build final)
- Lint: SKIPPED (no declarado en package.json)
- Typecheck: SKIPPED (no declarado en package.json)
- Tests: PASS con baseline (177/178; 3 fallos PRE-EXISTENTES: bmr/frecuencia-respiratoria renombrados + 265 calcs-en sin .ts. +6 tests nuevos sensitive-permissions, todos PASS)
- Deploy: COMPLETED (ver §33 abajo)
- IndexNow: change-based IMPLEMENTADO (manifest + modo --changed). Baseline escrito; 0 a enviar en esta corrida (sin cambios de contenido nuevos respecto al manifest).

## Inventario (contenido)
- URLs de contenido inventariadas: 3.433 (calcs 14 locales + guías + comparaciones)
- Calculadoras: 3.357
- Guías + comparaciones: 76
- URLs en sitemaps (total): 7.329
- URLs indexables (manifest): 3.405
- URLs noindex / sensibles: 28
- URLs redirigidas nuevas: 0

## Cambios aplicados
- Componentes modificados: `content-policy.ts` (helper compuesto), `generate-sitemap.ts` (filtro _redirects), `indexnow-push.py` (modo --changed), `fin-de-semana-hubs.ts` (4 intros 100-180w), `guias/presupuesto-fiesta-como-armar.json` (sección errores)
- URLs optimizadas (título): 0 reescrituras (114 candidatas priorizadas en opportunities.csv; §29 no permite reescribir en masa)
- Hubs mejorados: 4 (/fin-de-semana/*) — intros expandidos a 100-180 palabras
- Enlaces internos: analizados (before/after); no mutados (runtime usa related-auto TF-IDF)
- Canonicals corregidos: 0 (los 11 flaggeados son canonicalSlug intencionales)
- Hreflang corregidos: 0 (sin errores en build; auditoría dedicada = SKIPPED)
- Entradas de sitemap corregidas: **11 zombies 301** removidos (filtro _redirects)
- Duplicados consolidados: **0** (0 MERGE_ALLOWED reales; 2 candidatos = intención distinta → DIFFERENTIATE)
- Restricciones médicas: verificadas (28 noindex intactas) + helper compuesto `isSensitiveCalculator()` + 6 tests

## Datos
- Bing disponible: SÍ (`data/bing-perf-latest.json`: 308 pages nivel-URL, 737 queries, 93 oportunidades)
- GA4 disponible: SÍ (`data/ga4-*.csv`: 483 paths con sessions)
- Período analizado: 28 días hasta 2026-07-02
- Queries analizadas: 737 (nivel query) · URLs con datos: 308 (nivel page)
- URLs con impresiones: 308 · con clicks: subset (1.101 clicks / 53.221 impresiones totales)
- Cruce query×url: DATA_MISSING (Bing no lo entrega — documentado, no inventado)

## IndexNow
- URLs creadas: 0 · modificadas: 0 · eliminadas: 0 (baseline de manifest)
- URLs enviadas: 0 · Lotes: 0 · Fallos: 0
- Mecanismo: content-hash diff (sin fechas/build), lotes de 500, modo --changed en push.py

## Elementos no ejecutados
- Nav 6-items (§14): header ya unificado; cambio de etiquetas = decisión de producto (03-architecture-decisions.md)
- Reescritura masiva de títulos (§29): riesgo de churn; priorizadas en opportunities.csv
- Páginas internacionales nuevas (§21): sin join query×url no hay evidencia → contingencia aplicada
- Switch cron IndexNow --all→--changed: implementado, pero el switch queda a decisión de Martín (drip)

## Archivos generados
- docs/bing-growth/{00..07}.md (8)
- scripts/bing-growth/{normalize-perf-data, build-url-inventory, classify-opportunities, find-duplicate-candidates, audit-sitemaps, build-internal-links, indexnow-manifest}.mjs (7)
- reports/bing-growth/{url-inventory, query-url-data, opportunities, duplicate-candidates, consolidations-applied, manual-review, internal-links-before, internal-links-after, sitemap-audit, qa-results}.csv + {indexnow-urls, modified-urls, created-urls, redirected-urls, noindex-urls}.txt + current-url-manifest.json
- Código: src/lib/content-policy.ts, scripts/generate-sitemap.ts, scripts/indexnow-push.py, src/lib/fin-de-semana-hubs.ts, tests/sensitive-permissions.test.ts

## Recomendación de validación (URLs a revisar en prod)
- Sitemap sin zombies: `curl -s https://hacecuentas.com/sitemap-calcs-deportes.xml | grep -c plan-maraton-semanas-experiencia` → 0
- Hub: https://hacecuentas.com/fin-de-semana/comida-y-juntadas (intro largo)
- Oportunidad top (revisión editorial de título): /fixture-mundial-2026, /co/datos-salario-minimo-colombia-2026, /feriados-colombia-2026
