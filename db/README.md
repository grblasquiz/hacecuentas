# `db/` — estado y snapshots de datos

**Todo lo de esta carpeta va trackeado en git a propósito. NO gitignorear sin leer esto.**

Auditoría 2026-05-31: la idea de "sacar `db/` de git porque es derivado" es **incorrecta y peligrosa**. Cada archivo cumple un rol distinto y la mayoría rompe el build o el SEO si falta.

## Qué es cada archivo

| Archivo | Rol | ¿Se puede gitignorear? |
| --- | --- | --- |
| `sitemap-state.json` | **Estado anti-churn del sitemap.** Mapa `URL → lastmod previo` que usa el *tripwire* de `scripts/generate-sitemap.ts` para abortar una actualización masiva accidental. Publica la fecha editorial/de datos exacta: no desplaza `lastmod` gradualmente entre deploys. | **NO.** Sin él, un build fresco cae a `xml-bootstrap` o `fresh` y no puede detectar qué URLs existentes cambiaron de fecha. |
| `uva.json`, `icl.json`, `cer.json`, `tm20.json`, `ripte.json`, `plazo-fijo-bcra-30d.json` | **Snapshots de series BCRA**, importados en build por componentes y ~9 calcs (UVA/ICL/hipotecas). Los actualiza el cron `data-refresh-daily` / `update-data` y commitea. | **NO.** Son imports de build: sin ellos el build rompe. No hay fetcher en `prebuild` que los regenere en un clon limpio. |
| `ratings.json` | Ratings agregados, importado por `src/pages/[...slug].astro`. Lo actualiza `ratings-pull-daily`. | **NO** (import de build). |
| `data-sources/arca-ganancias-*.json` | Snapshot de escala/deducciones Ganancias. | **NO** (lo consume el pipeline ARCA). |
| `schema.sql` | Fuente del schema de la DB (admin). | **NO** (es fuente, no derivado). |

## Regla práctica

- **Frescura/validez** de los datos: se chequea con `npm run validate:sanity` (valores + drift) y `npm run validate:freshness` (antigüedad), no removiéndolos de git.
- **Churn de `sitemap-state.json` en `git status`**: es esperado y deseado — es estado que persiste entre builds. No es ruido a "limpiar".
- Si alguna vez ves en logs de CI `[sitemap] ⚠ sin db/sitemap-state.json`, **algo borró el state file**: restauralo de git antes de deployar o el sitemap se infla.
