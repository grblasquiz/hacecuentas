# Arquitectura de fin de semana — Hacé Cuentas

**Fecha:** 2026-07-03
Define cómo se organiza el cluster de ocio: hubs, clusters temáticos, enlazado interno, home dinámica y módulo de recomendaciones. Complementa `docs/auditoria-fin-de-semana.md` (diagnóstico) y `docs/canibalizacion-fin-de-semana.md`.

---

## 1. Config central de clusters — `src/lib/weekend-clusters.ts`

Fuente de verdad del cluster de ocio (Fase 12). 16 clusters, cada uno con `master` (herramienta ancla) + `members` (satélites). Todos son el campo `slug` (recordar: filename ≠ slug ≠ formulaId). Validado por `tests/weekend-clusters.test.ts` (falla si algún slug muere o si un master queda canonicalizado).

Clusters: `asado`, `bebidas-evento`, `presupuesto-evento`, `comida-invitados`, `cocina-conversores`, `cocina-cafe`, `cocina-horno`, `cocina-porciones`, `viajes-combustible`, `viajes-presupuesto`, `hogar-pintura`, `hogar-pisos`, `hogar-jardin`, `hogar-pileta`, `entretenimiento-ocio`, `mascotas-presupuesto`.

## 2. Enlazado interno (Fase 12)

Mecanismo real de enlazado = campo `relatedSlugs` de cada calc JSON + `related-auto.json` (complemento computado). El render (`RelatedCalcs.astro`) usa los `relatedSlugs` manuales como override y rellena hasta 4 con el auto.

**Regla de grafo (aplicada por `scripts/apply-weekend-links.ts`):**
- El **master** enlaza a todos sus members → da inbound a las huérfanas.
- Cada **member** enlaza al master + hermanos → cohesión temática.
- Cap: 12 en master, 8 en member. Nunca cross-family (relevancia garantizada por cluster).

**Guard (`scripts/validate-hardcoded-slugs.ts`, corre en prebuild):** valida `relatedSlugs` de todas las calcs. Buckets: typo de prefijo (auto-fixable), 301-hop, roto (404/410). WARN por defecto; `STRICT_RELATED=1` escala los rotos a ERROR.

## 3. Hubs

**Principio (decisión de Martín 2026-07-03):** un **hub general fuerte + anclas por familia**, NO 8 hubs separados (evita canibalización entre hubs).

- **`/calculadoras-fin-de-semana`** — hub general. Consume `WEEKEND_CLUSTERS`. Estructura (Fase 3): breadcrumb, H1 único, intro útil, **herramienta principal destacada por grupo**, grilla de complementarias, FAQ (≥7), schema `ItemList + CollectionPage + BreadcrumbList + FAQPage`, canonical, OG. 7 grupos: Asado · Fiesta/bebidas/comida · Cocina · Viajes · Hogar · Entretenimiento · Mascotas.
- **`/calculadoras-evento`** — hub profundo de asado/fiesta/evento (existente, complementa).

Los 6 hubs específicos del spec original (`/calculadoras-asado-reuniones`, etc.) se implementan como **anclas (`#secciones`) dentro del hub general**, no como URLs separadas, salvo que la demanda de una familia lo justifique más adelante.

## 4. Herramientas maestras (5)

| # | Herramienta | Ancla | Estrategia |
|---|---|---|---|
| 1 | Planificador de asado | `calculadora-asado-kg-por-persona-cortes-tira-vacio-pollo` | Ampliar (existe, es cabeza) |
| 2 | Planificador de fiesta | `calculadora-presupuesto-cumpleanos` | Ampliar + consolidar cluster presupuesto-evento |
| 3 | Planificador de viaje en auto | `calculadora-costo-viaje-combustible-kilometros` | Ampliar + reforzar inbound (autoridad real en `costo-por-kilometro-auto`) |
| 4 | Comida para invitados | *(crear)* `/calculadora-comida-para-invitados` | URL nueva limpia, parámetros/estado (NO URLs por cantidad) |
| 5 | Proyectos para el hogar | *(crear)* `/calculadora-proyectos-hogar` | URL nueva limpia, selector de proyecto |

Decisión de Martín: ampliar #1/#2/#3, **crear** #4/#5.

## 5. Home dinámica (Fase 7) — `src/lib/home-context.ts`

`getHomeContextByDate(date, tz, fridayCutoffHour)` → `'weekday' | 'friday' | 'weekend'`. Pura y testeable (no llama `new Date()` internamente → sin bugs de hidratación). Default tz `America/Argentina/Buenos_Aires`, corte viernes 15 ART (configurable).

- **Lun–jue (+ vie temprano):** home prioriza sueldo/impuestos/finanzas.
- **Vie 15hs → dom:** aparece "¿Qué plan tenés este finde?" con accesos a las herramientas maestras.
- **Anti-cloaking:** es re-orden y destaque visual, mismo HTML para Googlebot; nada oculto ni contenido distinto por user-agent.

## 6. Módulo de recomendaciones (Fase 8) — `WeekendRecommendations`

Componente reutilizable (home, hub, categorías, newsletter, redes). Acepta título, descripción, 3 herramientas, categoría, fechas, UTM, imagen, prioridad. Configuración reutilizable (sin URL nueva por semana). *(Pendiente de implementar — ver roadmap.)*

## 7. Analytics (Fase 14) — `src/lib/weekend-analytics.ts`

Helper aditivo que reusa el `gtag` existente. Ver `docs/analytics-fin-de-semana.md`. No cableado aún.
