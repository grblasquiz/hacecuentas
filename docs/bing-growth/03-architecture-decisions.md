# 03 — Decisiones de arquitectura

Este repo es **maduro**: la mayoría de las correcciones técnicas del plan ya
estaban implementadas y verificadas. Se documenta el estado y las decisiones.

## Estado de los items técnicos (auditoría)

| Item (plan) | Estado | Acción |
|---|---|---|
| §15 print-header fuera del DOM inicial | ✅ YA CORRECTO | JS inyecta en `beforeprint`, `data-nosnippet` (`Layout.astro:765-792`). Sin cambios. |
| §16 flujo de resultado | ✅ CORRECTO | `CalcLayoutV2.astro`: form→resultado→respuesta-rápida→tabs (resumen/cómo/FAQ/fuentes)→relacionados→descargas. "Seguí calculando" es slot del Calculator (post-resultado), no antes. Sin cambios. |
| §14 header unificado | ✅ UN SOLO COMPONENTE | `Header.astro` único, `COUNTRY_NAVS`, links en HTML crawlables, logo→/. Ver decisión de nav abajo. |
| §23 helper sensible compuesto | ✅ AGREGADO | Ver §04. Lógica ya centralizada en `content-policy.ts`; se agregó `isSensitiveCalculator()` (objeto compuesto) + tests. |
| §24 byline sin revisor falso | ✅ YA CORRECTO | `AuthorByline.astro` default "Editado por" (NO "Revisado por"); revisor sólo si completo; 0 hardcodes "Revisado por Martín/Fórmula revisada". Sin cambios. |
| §26 lastmod real | ✅ YA CORRECTO | `generate-sitemap.ts`: `max(lastReviewed, dataUpdate.lastUpdated, git mtime)`, clamp a hoy, NO build time. Sin cambios. |
| §27 IndexNow por cambios | ⚠️ ERA send-all → ✅ IMPLEMENTADO | Ver §05. |
| §25 sitemaps sin URLs inválidas | ⚠️ 11 zombies 301 → ✅ CORREGIDO | Filtro defensivo de sources de `_redirects`. Ver §05. |

## Decisión: navegación del header (§14)

El plan pide una nav de 6 items (Dinero/Trabajo/Casa/Salud/Decidir/Más). El
header **ya está unificado** (un componente, links crawlables, logo→/), que es
el requisito técnico real. La nav ACTUAL es la de **4 pilares** por país
(AR: Sueldos/Impuestos/Finanzas/Negocios + Más), una decisión de arquitectura
deliberada y reciente (arquitectura de pilares, jul-2026).

**Decisión:** NO se reemplaza la nav de 4 pilares por la de 6 etiquetas. Razones:
(1) el requisito técnico (unificación + crawlabilidad + logo) está cumplido;
(2) cambiar las etiquetas/estructura de nav es una decisión de producto de alto
impacto (afecta expectativa de usuario y CTR en TODAS las páginas) que no debe
tomarse en una pasada técnica de SEO; (3) el plan §14 dice "no cambiar URLs de
destino válidas sin necesidad". Se documenta como pendiente de producto.

## Decisión: consolidaciones (§9-10)

El detector encontró **0 MERGE_ALLOWED** válidos. Los 2 candidatos que pasaron
el umbral de fórmula/inputs eran **falsos positivos de intención distinta**
(conversión inversa VES↔USD; ejercicios distintos deadlift/squat en 1RM) y se
degradaron a DIFFERENTIATE. **No se aplicó ninguna redirección** (§1.3: los
dudosos se registran, no se redirigen). El codebase ya está de-duplicado por
trabajo previo (fusiones/podas/canonical).

## Decisión: contenido nuevo internacional (§21)

Bing entrega query y page por separado (sin cruce query×url) → no hay evidencia
de query real con ≥100 impresiones ligada a una URL inexistente. Regla de
contingencia §21: **no se crean páginas internacionales nuevas**. Se refuerzan
las existentes.
