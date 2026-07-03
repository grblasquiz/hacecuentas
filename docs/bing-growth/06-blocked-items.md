# 06 — Items bloqueados / no ejecutados

| Item | Motivo | Riesgo si se fuerza | Dato faltante | Acción manual |
|---|---|---|---|---|
| Cruce query×url de Bing (`query-url-data.csv` join) | Bing Webmaster entrega query y page en tablas separadas | Inventar el join = dato falso (§1.1) | Export con dimensión query+page combinada (Bing API `SearchAnalytics` no lo da) | Marcado `BING_QUERY_URL_JOIN=DATA_MISSING` |
| Creación de páginas internacionales nuevas (§21) | Sin join query×url no hay evidencia de query real ≥100 impr ligada a URL inexistente | Crear páginas sin demanda comprobada (§1.2) | Query×url con impresiones | Se refuerzan existentes; no se crean nuevas |
| Nav de 6 items Dinero/Trabajo/Casa/Salud/Decidir/Más (§14) | El header YA está unificado (requisito real cumplido); cambiar las etiquetas es decisión de producto de alto impacto | Cambiar nav en todas las páginas afecta CTR/UX sin validación | Decisión de producto de Martín | Documentado en 03-architecture-decisions.md |
| Reescritura masiva de títulos top-CTR (§29) | Ya hubo múltiples lotes de CTR previos; §29 prohíbe reescribir indiscriminadamente | Churn de títulos sin ganancia + riesgo de bajar CTR ya optimizado | — | `opportunities.csv` prioriza 114 OPTIMIZE_TITLE para pasada editorial dedicada |
| Consolidaciones/redirects (§9-10) | 0 MERGE_ALLOWED reales (los 2 candidatos = intención distinta) | Redirigir por similitud de fórmula = perder equity de páginas legítimas (§1.3) | — | `consolidations-applied.csv` vacío; dudosos en `manual-review.csv` |
| Switch del cron IndexNow diario `--all` → `--changed` | El `--all` diario es parte del "drip" actual de Bing; cambiarlo unilateralmente puede reducir señales | Menos re-crawl de Bing | Confirmación de Martín sobre estrategia de drip | Modo `--changed` implementado y listo; el switch del cron queda a decisión de Martín |

## DEPLOY

Ver 07-final-report.md. El repo tiene proceso de deploy documentado
(`scripts/deploy-local.sh`). El deploy se ejecuta tras el QA.
