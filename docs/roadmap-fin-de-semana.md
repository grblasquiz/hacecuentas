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
| Home dinámica (render del módulo finde) | ⬜ | Cablear `getHomeContextByDate` en `index.astro` para el bloque "¿Qué plan tenés este finde?" (vie 15hs–dom). Sin cloaking |
| Módulo `WeekendRecommendations` (Fase 8) | ⬜ | Componente reutilizable (home/hub/categorías/newsletter) |
| Cablear analytics en calcs/hubs | ⏸️ | Necesita OK explícito (toca tracking) |

## Etapa 3 — Herramienta maestra: asado

| Ítem | Estado | Notas |
|---|---|---|
| Ampliar planificador de asado | ⬜ | Sumar pan, ensaladas, bebidas, agua, hielo, carbón/leña, presupuesto, costo/invitado, lista de compras |
| `ShareableCalculatorResult` (Fase 9) | ⬜ | WhatsApp, copiar, link con params, imprimir, descargar |
| Lista de compras + división de gastos | ⬜ | Módulos reutilizables |

## Etapa 4 — Viaje · Fiesta · Comida

| Ítem | Estado |
|---|---|
| Planificador de viaje en auto (ampliar `costo-viaje-combustible-kilometros` + capa de mapas desacoplada, sin API paga) | ⬜ |
| Planificador de fiesta (ampliar `presupuesto-cumpleanos`) | ⬜ |
| Comida para invitados (**crear** `/calculadora-comida-para-invitados`, con parámetros) | ⬜ |

## Etapa 5 — Hogar · Editorial · Estacional

| Ítem | Estado |
|---|---|
| Proyectos para el hogar (**crear** `/calculadora-proyectos-hogar`) | ⬜ |
| Contenido editorial (guías que enlazan a herramientas) | ⬜ |
| Contenido estacional (config central de fechas, sin URL por fecha) | ⬜ |

## Consolidaciones bloqueadas por datos (⏸️ — necesitan GA4/GSC/backlinks)

Canonical/301 de: vino-evento ×2, fernet ×2, bebidas genéricas ×2, presupuesto cumple/boda ×4, café ×3, temp-horno ×3, arroz ×2, combustible duplicados, equipaje ×7, millas ×12, edad-perro ×6. **No ejecutar sin confirmar tráfico/impresiones/backlinks propios.**

## Riesgos y notas operativas

- **Churn de sitemap:** el rescate + limpieza tocó ~248 calcs (mtime → lastmod). Al deployar, ~248 URLs re-crawlean (justificado: enlazado real). Timing de deploy = decisión de Martín (evitar finde per reglas del proyecto).
- **Mundial muere dom 19-jul** — el mayor sostén de tráfico finde. Priorizar tener el cluster de ocio enlazado y el hub fuerte antes de esa fecha.
- **YMYL (Fase 19):** nada de salud/veterinaria médica como palanca de finde. Mascotas solo presupuesto/comida/paseos/costos.
