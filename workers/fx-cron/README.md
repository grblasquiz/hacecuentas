# hacecuentas-fx-cron — runbook

Worker independiente con Cron Trigger (10:00 UTC = 07:00 ART, diario). Baja FX
e indicadores de fuentes públicas y los guarda en D1 (`hacecuentas-forms`, la
misma base del sitio). Corre 100% en Cloudflare: **no depende de la Mac de
Martin ni del cron local**.

## Qué guarda

| Tabla | Clave | Contenido |
|---|---|---|
| `fx_live` | `pais` (`chile`, `colombia`, `mexico`, `peru`, `uruguay`, `paraguay`, `venezuela`, `argentina`) | JSON con la misma forma que `src/data/live/<pais>.json`. AR = `{ quotes: { blue, oficial, bolsa, ... } }` desde dolarapi.com |
| `series_live` | `serie` (`ar.ipc`) | IPC AR (INDEC vía ArgentinaDatos, misma serie que `scripts/update-data/fetchers/ipc.ts`): `last_month`, `last_12_months`, `acumulado_12m` |

Sanidad: cada valor headline se valida contra `BOUNDS` en `index.mjs`. Si cae
fuera de rango o la fuente falla, **no se escribe** ese país/serie → queda el
último valor bueno en D1.

## Endpoints

Base: `https://hacecuentas-fx-cron.rodriguezb-martin.workers.dev`

- `GET /` — status: países + series y su `updated_at`.
- `GET /?run=<RUN_TOKEN>` — fuerza un refresh manual (token en `index.mjs`).
- `GET /live/<pais>` — **endpoint público de hidratación client-side**.
  JSON `{ ok, pais, updated_at, data, series }` con `cache-control: public,
  max-age=300` y CORS para `*.hacecuentas.com` + `localhost`.
  Ej.: `/live/argentina` trae `data.quotes.blue.venta` y
  `series.ipc.last_month.valor`.

## Deploy

```bash
cd workers/fx-cron
npx wrangler deploy
```

## Migración D1 (una vez, idempotente)

```bash
cd workers/fx-cron
npx wrangler d1 execute hacecuentas-forms --remote --file=migrations.sql
```

(El worker igual hace `CREATE TABLE IF NOT EXISTS` defensivo en cada refresh.)

## Verificar

```bash
BASE=https://hacecuentas-fx-cron.rodriguezb-martin.workers.dev
# seed/refresh manual (primera vez tras el deploy):
curl -s "$BASE/?run=hc-fx-7Qm2xR" | python3 -m json.tool
# status: todos los países + ar.ipc con updated_at de hoy
curl -s "$BASE/" | python3 -m json.tool
# endpoint de hidratación
curl -s "$BASE/live/argentina" | python3 -m json.tool
curl -s "$BASE/live/chile" | python3 -m json.tool
```

## Qué cubre CF vs qué sigue dependiendo del cron local

**Cubre Cloudflare (Mac apagada, todo sigue fresco para el usuario):**
- El refresh diario de D1 (`fx_live` + `series_live`) — este worker.
- El SSR de las 7 landings `/dolar-hoy-{pais}`: leen D1 vía
  `src/lib/fx-live.ts` en cada request (fallback al snapshot de build).
- El refresh client-side: las 8 landings dolar-hoy ya refrescan en el browser
  contra sus fuentes primarias (dolarapi / mindicador / socrata / er-api), y
  `src/components/LiveWorkerHydrate.astro` permite hidratar cualquier otra
  página desde `GET /live/<pais>` (útil para datos sin fuente CORS-open, p. ej.
  IPC AR).

**Sigue dependiendo del cron local (Mac de Martin):**
- El rebuild del sitio: los snapshots de build (`src/data/live/*.json`) y todo
  lo estático/prerendered (p. ej. `/dolar-hoy` AR es `prerender=true` — su HTML
  SSR solo se refresca al deployar; el valor que VE el usuario igual se
  actualiza client-side desde dolarapi).
- `lastReviewed`/`dataUpdate` de los calcs, sitemap, y los fetchers de
  `scripts/update-data/` que parchean JSONs de calcs.
