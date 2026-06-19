# Campaña "Identidad propia por calc" — Baseline (Track A)

Fecha baseline: 2026-06-19 · Corpus: 4.179 calcs (9 locales).
Objetivo: revertir la percepción de Google de "scaled content / copia con cambios chicos"
dándole valor único e identidad a cada calc. Medir antes/después con los scripts de abajo.

## Diagnóstico medido (no opinión)

**1. Prosa — YA mayormente única** (las campañas previas funcionaron):
- 0 frases (8-gramas) compartidas por >50% del corpus en intro / answerSnippet / explanation.
- Solo **47 calcs (1%)** son clones de prosa reales entre sí.

**2. Familias-fábrica (el 1% que se ve como "copia con cambio chico"):**
- `peso-ideal-{raza}`: 18 (dachshund≈beagle 0.64) — la mayoría SIN reference table propia.
- `presupuesto-viaje-{ciudad}`: 9 (londres≈paris 0.74).
- conversores direccionales: ~20 (deliberados; baja prioridad).

**3. Fingerprint REAL del sitio = estructural, no de prosa:**
- 1 plantilla de 34 secciones en orden fijo para las 4.118.
- Bloques idénticos en todas: "Metodología y confianza", "Cómo citar", disclaimers.
- Footer "Revisado por el equipo editorial de Hacé Cuentas el {fecha}" en ~730 calcs (17%).

## Métricas baseline (correr para comparar)

| métrica | script | baseline |
|---|---|---|
| 8-gramas compartidos >50% corpus (intro/snippet/expl) | `scripts/fingerprint-audit.py` | 0 / 0 / 0 |
| footer editorial repetido | fingerprint-audit | ~730 (17%) |
| FAQ idénticas (≥10 calcs misma pregunta) | fingerprint-audit | 137 (0%) |
| calcs en pares casi-clon intra-familia (sim≥0.35) | (script clone-families) | 47 (1%) |
| similitud intra-familia promedio (explanation) | (script intra-familia) | ~0.00 |

## Plan por tracks
- **A** Dashboard/medición (este doc + scripts). ✅
- **B** Matar 47 familias-clon → data layer real por entidad (raza/ciudad). [EN CURSO]
- **C** De-fingerprint chrome global (metodología/cómo-citar/footer editorial) en template.
- **D** Information gain en top ~300 por tráfico (GA4+GSC).
- **E** Arquetipos de layout (4-6 por tipo de calc).
- **F** Levantar el piso (cola larga) con gate anti-fingerprint.

## Scripts de medición (la "dashboard de mismidad")
- `scripts/fingerprint-audit.py` — n-gramas boilerplate corpus-wide por campo.
- `scripts/find-similar-calcs.py` — clusters de similares + tráfico GA4.
- (intra-familia / clone-families: inline en sesión, formalizar acá.)
