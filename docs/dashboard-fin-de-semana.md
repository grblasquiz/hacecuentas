# Dashboard de fin de semana — Looker Studio / GA4

**Fecha:** 2026-07-03
Especificación del tablero para medir el **índice de fin de semana** y el efecto del cluster de ocio. Fuente primaria: GA4 (sesiones/eventos) + GSC (orgánico). Ver eventos en `docs/analytics-fin-de-semana.md`.

---

## 1. KPI north-star — Índice de fin de semana

> **Índice finde = (prom. diario sesiones sáb + dom) / (prom. diario sesiones mar + mié + jue).**

- Baseline: **0,50** · Meta 1: **0,65** · Meta 2: **0,70–0,75**.
- Denominador = mar/mié/jue (lunes/viernes tienen dinámica propia). Comparar SIEMPRE vs mismo día de la semana anterior.
- Scorecard grande arriba + serie temporal semanal del índice.

## 2. Dimensiones

Fecha · Día de la semana · **Tipo de día** (`day_type`: weekday/friday/weekend/holiday) · Landing page · Categoría · **Familia** (`calculator_family`) · Canal · Dispositivo · País · Fuente · Medio.

## 3. Métricas

Sesiones · Usuarios · Usuarios nuevos · Sesiones con interacción · Tasa de interacción · Vistas · Eventos de cálculo (`calculator_complete`) · **Tasa de finalización** (`complete/view`) · Compartidos (`calculator_share`) · Copias de link (`calculator_copy_link`) · Ingresos · RPM · Clics orgánicos · Impresiones · CTR · Posición media.

## 4. Páginas del tablero

1. **Resumen finde:** scorecard del índice + serie temporal + delta vs semana anterior.
2. **Por familia:** tabla `calculator_family` × (sesiones finde, índice finde, tasa finalización, compartidos). Ordenar por índice desc para ver qué familias "aguantan" el finde (referencia histórica: tazas-gramos, split-gastos, asado, empanadas, pintura, edad-perro son resilientes; monotributo/sueldo/ganancias se destruyen).
3. **Embudo:** `calculator_view → start → complete → share` por familia.
4. **Orgánico (GSC):** clics/impresiones/CTR/posición por landing del cluster de ocio, split weekday vs weekend.
5. **Monetización:** RPM e ingresos por `day_type` (¿el finde monetiza distinto?).

## 5. Segmentos guardados

- `day_type = weekend` · `day_type = friday` · `day_type = weekday`.
- `calculator_category IN (cocina, viajes, entretenimiento, mascotas, construccion, hogar, jardineria)`.

## 6. Fórmula de campo calculado (Looker)

```
Índice finde =
  ( SUM(IF(dia IN ('Sat','Sun'), sesiones, 0)) / 2 )
  / NULLIF( SUM(IF(dia IN ('Tue','Wed','Thu'), sesiones, 0)) / 3, 0 )
```

## 7. Cadencia

- Revisión semanal (lunes) del índice vs meta.
- Comparación interanual en fechas estacionales (finde largo, feriados, vacaciones de invierno).
- Alertas de Looker si el índice baja de 0,45 (regresión) o supera 0,65 / 0,70 (hito).
