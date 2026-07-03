# Roadmap de fin de semana — Hacé Cuentas

**Fecha:** 2026-07-03
Tracker del plan finde. Meta: subir el índice finde de **0,50 → 0,65 → 0,70–0,75**. Trabajo en incrementos chicos y revisables, **sin cambios destructivos** (nada de borrar URLs / 301 sin datos GA4/GSC).

Leyenda: ✅ hecho · 🟡 en progreso · ⬜ pendiente · ⏸️ bloqueado por datos externos

---

## Etapa 1 — Auditoría + fundaciones

| Ítem | Estado | Notas |
|---|---|---|
| Auditoría del repo | ✅ | `docs/auditoria-fin-de-semana.md` |
| Inventario CSV (16 columnas) | ✅ | `docs/inventario-contenido-fin-de-semana.csv` (481 calcs) |
| Canibalización por familia | ✅ | `docs/canibalizacion-fin-de-semana.md` (25 clusters) |
| Detección de templates | ✅ | 1 template vivo (`CalcLayoutV2`); `CalcRail` muerto |
| Corrección DOM inicial (Fase 10) | 🟡 | "Resultado de calculadora" NO está en DOM inicial (solo print). Contenedor `.calc-results` existe `hidden`+`data-nosnippet` con ejemplo horneado (info-gain intencional) → no tocar sin medir |
| Analytics base | ✅ | `src/lib/weekend-analytics.ts` (aditivo, no cableado) + `docs/analytics-fin-de-semana.md` |
| Tests base | ✅ | `tests/home-context.test.ts` (12) + `tests/weekend-clusters.test.ts` (4) |
| **Limpieza `relatedSlugs` rotos** | ✅ | 28 typos de prefijo corregidos + 157 muertos (404/410) eliminados en 143 calcs |
| **Link-guard extendido** | ✅ | valida `relatedSlugs` en prebuild (WARN; `STRICT_RELATED=1`→ERROR) |

## Etapa 2 — Hub + enlazado + home dinámica

| Ítem | Estado | Notas |
|---|---|---|
| Config central de clusters | ✅ | `src/lib/weekend-clusters.ts` (16 clusters, 119 slugs, testeada) |
| **Rescate de huérfanas (enlazado)** | ✅ | 117 calcs interlinkeadas, 721 links nuevos; huérfanas categorías finde 253→199. Cola larga (millas/visas/construcción industrial) queda para después |
| Enriquecer hub general (Fase 3) | ✅ | `/calculadoras-fin-de-semana` reescrito: breadcrumb, 7 grupos, herramienta destacada, FAQ (8), schema completo. Arregla 9 slugs muertos que desaparecían en silencio |
| `getHomeContextByDate` (Fase 7) | ✅ | `src/lib/home-context.ts` puro y testeable |
| Home dinámica (render del módulo finde) | ✅ | `#finde-mode` en `index.astro` reescrito: 8 intents con masters verificados, toggle vía `getHomeContextByDate` (vie 15hs–dom, tz AR), sin cloaking (SSR siempre emite, JS togglea) |
| Módulo `WeekendRecommendations` (Fase 8) | ✅ | `src/components/WeekendRecommendations.astro` reutilizable; usado en el hub (bloque "Las 3 cuentas que más se usan") |
| Cablear analytics en calcs/hubs | ✅ | Aditivo (solo `gtag('event',…)`, no toca config/tags): `weekend_recommendation_click` (finde-mode + componente) + `weekend_hub_click` (cards del hub) |

## Etapa 3 — Herramienta maestra: asado ✅

| Ítem | Estado | Notas |
|---|---|---|
| Ampliar planificador de asado | ✅ | Fórmula extendida ADITIVA (backward-compat): +pan, ensalada, provoleta, bebidas con/sin alcohol, agua, hielo, carbón, presupuesto (solo si se ingresa precio — no inventa precios) + lista de compras. 3 inputs + 11 outputs nuevos. Test `tests/asado-planner.test.ts` (12) |
| `ShareableCalculatorResult` (Fase 9) | ✅ | YA es genérico en `Calculator.astro` (share nativo, WhatsApp, copiar link con datos que re-ejecuta, imprimir) — no se duplicó |
| Contenido estacional (Fase 6) | ✅ | `src/lib/seasonal-events.ts` (config año-agnóstico, `getActiveSeasonalEvent`) + test (8) |

## Etapa 4 — Viaje · Fiesta · Comida ✅

| Ítem | Estado | Notas |
|---|---|---|
| Planificador de viaje en auto | ✅ | `costo-viaje-combustible-kilometros` ampliado (aditivo, ida/vuelta afecta todo con default 'no' backward-compat): +ida-vuelta, pasajeros, peajes, estacionamiento, comidas, alojamiento → `costo_total` + `costo_por_pasajero`. Capa de mapas: diferida (no se agregó API paga; la calc funciona manual) |
| Planificador de fiesta | ✅ | `presupuesto-cumpleanos` ampliado con **cantidades** (sin inventar precios): vasos, platos, cubiertos, servilletas, mesas, sillas, hielo, margen para invitados extra |
| Comida para invitados | ✅ | **Creado** `/calculadora-comida-para-invitados` (formulaId `comida-para-invitados`): 8 tipos de comida, parámetros (no URLs por cantidad), FAQ 8, tabla de referencia, tests. Master del cluster `comida-invitados` |

## Etapa 5 — Hogar · Editorial ✅

| Ítem | Estado | Notas |
|---|---|---|
| Proyectos para el hogar | ✅ | **Creado** `/calculadora-proyectos-hogar` (7 proyectos: pintar/pisos/empapelar/limpieza/mudanza/césped), con materiales+desperdicio+tiempo+cronograma+DIY-vs-contratar. Cubre los gaps cajas-mudanza y limpieza-profunda. FAQ 8, tests. Master del cluster `hogar-proyectos` |
| Contenido editorial (guías) | ✅ | En vez de crear guías nuevas (thin/duplicado), se enlazaron las herramientas maestras nuevas desde las guías existentes: `comida-para-invitados` + asado en la guía de cocina; `proyectos-hogar` en la guía de construcción/DIY |

## Pendiente menor (no bloqueante)

- Capa de mapas para el planificador de viaje (API de rutas desacoplada, sin claves en repo — cuando se decida el proveedor).
- Cablear analytics en las calcs individuales (hoy cableado en hub + finde-mode + recomendaciones).
| Contenido estacional (config central de fechas, sin URL por fecha) | ⬜ |

## Consolidaciones bloqueadas por datos (⏸️ — necesitan GA4/GSC/backlinks)

Canonical/301 de: vino-evento ×2, fernet ×2, bebidas genéricas ×2, presupuesto cumple/boda ×4, café ×3, temp-horno ×3, arroz ×2, combustible duplicados, equipaje ×7, millas ×12, edad-perro ×6. **No ejecutar sin confirmar tráfico/impresiones/backlinks propios.**

## Riesgos y notas operativas

- **Churn de sitemap:** el rescate + limpieza tocó ~248 calcs (mtime → lastmod). Al deployar, ~248 URLs re-crawlean (justificado: enlazado real). Timing de deploy = decisión de Martín (evitar finde per reglas del proyecto).
- **Mundial muere dom 19-jul** — el mayor sostén de tráfico finde. Priorizar tener el cluster de ocio enlazado y el hub fuerte antes de esa fecha.
- **YMYL (Fase 19):** nada de salud/veterinaria médica como palanca de finde. Mascotas solo presupuesto/comida/paseos/costos.
