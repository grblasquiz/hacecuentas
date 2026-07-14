# `scripts/` — qué está vivo y qué no

Mapa de los scripts. **Si vas a borrar/mover algo, chequeá acá primero.** Generado en la auditoría 2026-05-31.

Regla: un script está "vivo" si lo referencia `package.json`, un workflow de `.github/workflows/`, o `deploy-local.sh` (directa o transitivamente). El resto son herramientas ad-hoc (las corrés a mano) o one-off ya ejecutados.

## 1. Pipeline de BUILD (corre en cada deploy — NO romper)

`package.json` → `prebuild` (orquesta) → `build`:

| Script | Rol |
| --- | --- |
| `prebuild.ts` | orquestador del prebuild (fases paralelas) |
| `regenerate-formula-index.ts` | regenera `src/lib/formulas/index.ts` escaneando el dir |
| `validate-data-updates.ts` | gate Zod-like de `dataUpdate` |
| `generate-sitemap.ts` | sitemaps + estado anti-churn (`db/sitemap-state.json`) |
| `generate-og-images.ts` / `.mjs` | OG images (satori) |
| `generate-og-manifest.ts` | manifest de qué slugs tienen OG |
| `generate-search-index.ts` | índice de `/buscar` |
| `generate-calc-api-index.ts` | catálogo `/api/calcs-index.json` |
| `generate-compute-index.ts` | índice slim que consume el Worker SSR |
| `compute-related.ts` | `related-auto*.json` (TF-IDF) |
| `generate-page-feed.ts` | CSV DSA Google Ads |
| `stamp-sw.ts` | versiona el service worker |
| `optimize-css-loading.mjs`, `strip-pruned-html.mjs`, `generate-worker-wrapper.mjs` | post-build (`npm run build`) |
| `detect-changes.ts`, `incremental-purge.ts` | build incremental + purge CF |

## 2. Pipeline de DATOS (crons diarios/mensuales — NO romper)

| Script | Workflow / trigger |
| --- | --- |
| `data-sources/fetch-all.mjs` (+ `fetch-*.mjs`) | `data-refresh-daily.yml` |
| **`validate-data-sanity.ts`** | gate de sanidad en `data-refresh-daily.yml` (nuevo 2026-05-31) |
| `update-data/index.ts` (+ `registry.ts`, `fetchers/`, `patchers/`, `utils/`) | `update-data-*.yml` |
| `data-sources/fetch-arca-ganancias.py` | `arca-monitor-daily.yml` |
| `check-stale-data.ts` | `check-stale-data.yml` |

## 3. Pipeline de SEO / indexing (crons — NO romper)

`google-indexing-api.py`, `indexnow-push.py`, `bing-submit.py`, `bing-news-submit.py`, `bing-submit-feed.py`, `submit-rss-aggregators.py`, `gsc-emerging-queries.py`, `wayback-snapshots.py`, `recovery-watch.py`, `reddit-monitor.py`, `ratings-pull.ts`, `generate-monthly-post.py`, `refresh-home-popular.py`, `daily-audit.mjs`, `expand-thin-content.mjs`.

## 4. Deploy / setup

`deploy-local.sh`, `cf-purge-cache.sh`, `install-hooks.sh`, `new-calc.ts`, `bump-lastmod.ts`, `generate-llms-full.py`.

El aviso a IndexNow post-deploy NO se corre a mano: lo hace `indexnow-push.yml`
en cada push a main, en streaming (sólo las URLs que cambiaron).

## 5. Herramientas AD-HOC (se corren a mano — NO están en el pipeline)

Quedan en `scripts/` a propósito; sin referencias en CI pero útiles a demanda:
análisis (`audit-*.py/.mjs`, `gsc-*.py`, `ga4-*.py`, `bing-perf-pull.py`, `bing-weekly-pulse.py`, `cannibalization-report.mjs`, `analyze-css-usage.mjs`, `internal-linking-audit.py`, `ai-visibility-monitor.py`, `track-ai-mentions.py`, `pruning-analysis.py`, `prune-*.py`, `psi-batch.py`), generación reusable (`llm-batch-generate-*.py`, `translate-*.py`, `enrich-thin-calcs.py`), etc.

## 6. `.archive/` — one-off ya ejecutados

Migraciones, backfills, fixes de evento puntual (`fix-navidad-mayuscula`, etc.) y duplicados superados (`generate-og-default` → `generate-og-images`). Movidos 2026-05-31. No los referencia nada; quedan por si hace falta consultarlos.
