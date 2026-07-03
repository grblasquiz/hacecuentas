# Analytics — cluster de fin de semana

**Fecha:** 2026-07-03
**Estado:** capa de eventos creada (`src/lib/weekend-analytics.ts`), **NO cableada todavía** en calcs/hubs. Se cablea con OK explícito (regla: cero cambios de tracking sin aviso).
**Regla dura:** el helper **reusa** el `gtag`/`dataLayer` existente; **no crea, renombra ni modifica** ningún tag de GA4/Google Ads. Nunca envía PII.

---

## 1. Eventos (`WEEKEND_EVENTS`)

| Evento | Cuándo se dispara |
|---|---|
| `calculator_view` | Se ve una calc (page view del calc) |
| `calculator_start` | El usuario toca un input / empieza a completar |
| `calculator_complete` | Se calcula un resultado válido |
| `calculator_share` | Toca compartir (cualquier canal) |
| `calculator_copy_result` | Copia el resumen del resultado |
| `calculator_copy_link` | Copia el link con parámetros |
| `calculator_print` | Imprime |
| `calculator_download` | Descarga (lista/imagen) |
| `calculator_related_click` | Click en una calc relacionada |
| `weekend_hub_click` | Click en una tarjeta del hub de finde |
| `weekend_recommendation_click` | Click en el módulo "3 cuentas para tu finde" |
| `shopping_list_generate` | Genera una lista de compras |
| `expense_split_use` | Usa la división de gastos |

## 2. Parámetros (whitelist — `ALLOWED_PARAM_KEYS`)

Sólo se envían estas claves (categóricas, no identificatorias). `sanitizeParams` descarta cualquier otra y recorta a 64 chars.

| Param | Valores de ejemplo |
|---|---|
| `calculator_slug` | `calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo` |
| `calculator_category` | `cocina`, `viajes`, `entretenimiento`, `mascotas` |
| `calculator_family` | `asado`, `bebidas-evento`, `viajes-combustible`, … (key de `WEEKEND_CLUSTERS`) |
| `traffic_context` | `organic`, `paid`, `direct`, `social` |
| `day_type` | `weekday` · `friday` · `weekend` (de `getHomeContextByDate`) · `holiday` (futuro) |
| `result_type` | `shopping_list`, `budget`, `quantity`, `time` |
| `share_channel` | `whatsapp`, `copy_link`, `copy_result`, `print` |
| `weekend_module` | `hub`, `home_recommendations`, `related` |
| `content_cluster` | key de cluster (para agrupar en reportes) |

**Prohibido enviar:** nombres, emails, direcciones, texto libre del usuario, o cualquier valor que identifique a una persona. El helper ya lo bloquea por whitelist.

## 3. Triggers y ejemplos de uso (al cablear)

```ts
import { trackWeekendEvent } from '../lib/weekend-analytics';
import { getHomeContextByDate } from '../lib/home-context';

const day_type = getHomeContextByDate(new Date()); // 'weekday' | 'friday' | 'weekend'

// al calcular un asado:
trackWeekendEvent('calculator_complete', {
  calculator_slug: 'calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo',
  calculator_category: 'cocina',
  calculator_family: 'asado',
  result_type: 'shopping_list',
  day_type,
});

// click en el hub:
trackWeekendEvent('weekend_hub_click', { weekend_module: 'hub', content_cluster: 'viajes-combustible', day_type });
```

## 4. Verificar en GA4 DebugView

1. Activar debug: extensión "GA Debugger" de Chrome, o agregar `?_dbg=1` y (al cablear) pasar `debug_mode: true` al config de GA4 en entorno de prueba (NO en prod).
2. GA4 → Admin → **DebugView**.
3. Disparar el evento en la calc; verificar que aparece con los params correctos y **sin** claves fuera de la whitelist.
4. Confirmar que `day_type` coincide con el día real en ART.

## 5. Propuesta de dashboard (detalle en `docs/dashboard-fin-de-semana.md`)

- Segmentar **todo** por `day_type` (weekday/friday/weekend).
- Embudo por familia: `calculator_view → start → complete → share`.
- Tasa de finalización = `calculator_complete / calculator_view` por `calculator_family`.
- Compartidos por `share_channel` (esperado: WhatsApp domina el finde).

## 6. Definición del índice de fin de semana (KPI north-star)

> **Índice finde = (promedio diario de sesiones de sáb + dom) / (promedio diario de sesiones de mar + mié + jue).**

- Baseline actual estimado: **0,50**.
- Meta 1: **0,65** · Meta 2: **0,70–0,75**.
- Denominador = **mar/mié/jue** (NO todos los hábiles: lunes y viernes tienen dinámicas propias).
- Fuente: GA4 (sesiones), no GSC (ver regla del proyecto: tráfico se mide en GA4).
