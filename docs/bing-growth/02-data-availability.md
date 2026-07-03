# 02 — Disponibilidad de datos

```text
BING_DATA_STATUS=AVAILABLE
GA4_DATA_STATUS=AVAILABLE
BING_QUERY_URL_JOIN=DATA_MISSING
```

## Fuentes reales encontradas en el repo (no inventadas)

| Archivo | Contenido | Uso |
|---|---|---|
| `data/bing-perf-latest.json` | Bing Webmaster: `queries[]` (737), `pages[]` (308, nivel URL con clicks/impressions/position), `opportunities[]` (93, pre-computadas low-ctr) | Scoring de oportunidades §11-12 (nivel URL) |
| `data/bing-kw-en.json` (693), `data/bing-kw-pt.json` | Keyword research externo (kw, vol, cat, tier) — volúmenes de búsqueda EN/PT | Contexto de demanda; NO son impresiones propias |
| `data/ga4-new-traffic-calcs-organic.csv`, `data/ga4-organic-growth.csv`, `data/ga4-new-traffic-calcs.csv` | GA4: sessions/views por path | Join de sessions a nivel URL |
| `reports/bing-opportunities.txt` | Oportunidades Bing previas | Referencia |

Período: **28d hasta 2026-07-02** (última corrida del pipeline Bing).
Totales Bing (queries): **1.101 clicks / 53.221 impresiones**.

## Limitación real documentada (no se inventa el dato)

Bing Webmaster entrega `query` y `page` en tablas **separadas**, sin el cruce
query×url. Por eso `reports/bing-growth/query-url-data.csv` tiene dos tipos de fila:

- **filas PAGE** (308): url completa + clicks/impressions/ctr/position reales + sessions GA4. `query=""`.
- **filas QUERY** (737): query + métricas. `url=DATA_MISSING` (no hay join real).

`BING_QUERY_URL_JOIN=DATA_MISSING`. La clasificación de oportunidades usa las
filas PAGE (nivel URL), que es donde el dato es completo y real.

## Consecuencias para la ejecución (reglas del plan aplicadas)

- ✅ Scoring de oportunidades por URL con Bing real (§12) — habilitado.
- ✅ Consolidación con evidencia B (una URL con clicks, otra sin) — habilitada por page-level.
- ⚠️ Consolidación con evidencia A (query_overlap) — **no** disponible (falta join query×url) → se usa evidencia B/C/D.
- ⚠️ Creación de páginas nuevas (§21, action=CREATE): requiere query real con ≥100 impresiones ligada a una URL inexistente. Como no hay join query×url, **no se crean páginas internacionales nuevas por keyword** en esta corrida (regla de contingencia). Solo se refuerzan las existentes.
