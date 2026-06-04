# Monotributo 2026 — corrección de datos + fuente única

**Fecha:** 2026-06-04. **Disparador:** al propagar la "tabla maestra" guardada a todo el cluster, encontré que esa tabla (y todas las calcs del cluster) usaban un modelo **desactualizado**.

## El hallazgo

La data previa asumía el modelo **viejo** (pre-reforma): *"servicios topa en H; las categorías I, J y K son exclusivas de venta de bienes"*, con cuota K = $600.880. Una nota interna incluso marcaba la cuota K $1.381.688 como "error a corregir".

**Eso es incorrecto en 2026.** Según la tabla oficial de ARCA (vigente desde 2026-02-01), **servicios alcanza hasta K**, con cuota distinta a bienes. $1.381.688 NO es un error: es la cuota de **servicios** de la categoría K. $600.880 es la de **venta de bienes**. Las dos existen.

Confirmado x3:
- **ARCA oficial** — https://www.afip.gob.ar/monotributo/categorias.asp (fuente primaria)
- c5n (tabla junio 2026, columnas servicios/bienes)
- Estudio Bertora Brown (topes recategorización julio 2026)

## Tabla autoritativa (ARCA, vigente 2026-02-01)

| Cat | Tope anual | Cuota SERVICIOS | Cuota BIENES |
|-----|-----------:|----------------:|-------------:|
| A | 10.277.988 | 42.387 | 42.387 |
| B | 15.058.448 | 48.251 | 48.251 |
| C | 21.113.697 | 56.502 | 55.227 |
| D | 26.212.853 | 72.414 | 70.661 |
| E | 30.833.964 | 102.538 | 92.658 |
| F | 38.642.048 | 129.045 | 111.198 |
| G | 46.211.109 | 197.108 | 135.918 |
| H | 70.113.407 | 447.347 | 272.063 |
| I | 78.479.212 | **824.802** | 406.512 |
| J | 89.872.640 | **999.008** | 497.059 |
| K | 108.357.084 | **1.381.688** | 600.880 |

- Topes **iguales** para ambas actividades. La cuota difiere desde C.
- Recategorización **semestral** (enero y julio). La de julio 2026 cierra el **5/8/2026**.
- Si superás el tope de K → Régimen General.

## Fuente única de verdad (anti-drift)

Creé `src/lib/data/monotributo-2026.ts` con `TOPES`, `CUOTA_SERVICIOS`, `CUOTA_BIENES`, `PROP` y helpers (`cuota()`, `tope()`, `componentes()`, `fmtARS()`). **Toda calc de monotributo debe importar de ahí** para no volver a desincronizarse (este desfasaje entre calcs es exactamente el problema de coherencia que el curso de SEO marca como veneno para Google y los LLMs).

## Estado de las calcs

### ✅ Corregidas + verificadas con tsx (importan la fuente única)
| Calc | formulaId | qué se hizo |
|------|-----------|-------------|
| `calculadora-monotributo-cuota-2026-todas-categorias` | monotributo-cuota-2026-todas-categorias | reescrita + campo `actividad` (serv/bienes); FAQ "cuatrimestral"→semestral; tabla y ejemplos (tope A $7,8M→$10,27M, F $31,4M→$38,6M); `solvedExamples` duplicado eliminado; answerSnippet corregido |
| `calculadora-monotributo-2026` (la principal) | monotributo | wireada a la fuente única; servicios ahora llega a I-J-K; answerSnippet nuevo |
| `calculadora-impuestos-monotributo-freelance` | impuestos-monotributo-freelance | reescrita (cuotas viejas A=$20.000 → reales); answerSnippet |
| `calculadora-monotributo-alta-afip-tramite-zero` | monotributo-alta-afip-tramite-zero | cuotas A-D viejas → fuente única; answerSnippet |
| `calculadora-ganancias-monotributista-pase-regimen-general` | ganancias-monotributista-pase-regimen-general | tabla de cuotas vieja (K $450.000) → fuente única; answerSnippet |

### ⏳ Pendientes (mismo modelo viejo; receta = wirear a la fuente única)
Topes **ya correctos** en estas, pero la **cuota** usa el modelo viejo (servicios no llega a I-J-K / K=$600.880 genérico). No tienen riesgo de tope, sí de cuota en categorías altas:
- `monotributo-categoria-ingresos-tope`
- `monotributo-categoria-2026-recategorizacion-julio`
- `monotributo-vs-inscripto`
- `monotributo-mejor-categoria-2026` (formulaId `monotributo-categoria-ideal`) — además tiene desglose de componentes con números chicos viejos
- `monotributo-vs-categoria-optima`
- `calculadora-monotributo-vs-autonomo-vs-empleado-mismo-ingreso`
- `facturacion-maxima-monotributo-vs-ri`

Sin tabla de categorías (no necesitan fix de datos, sólo answerSnippet/lastReviewed si se quiere): `monotributo-social-beneficio-exencion`, `retencion-rg2616-proveedor-monotributo`, `cuanto-falta-pago-monotributo-ingreso`, `obra-social-monotributista-aporte-extra-familiar`.

## Decisión que necesito de Martín

Propagar a las 7 pendientes significa afirmar en páginas vivas que **servicios llega hasta K** (hoy varias dicen "servicios topa en H"). El dato es oficial y está confirmado x3, pero cambia un claim en todo el cluster y revierte la validación previa. Con tu OK lo termino en una pasada (mecánico, ya con la fuente única).
