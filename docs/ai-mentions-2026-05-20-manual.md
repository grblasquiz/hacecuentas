# AI Mentions / SERP Visibility — 2026-05-20 (corrida manual)

**Engine**: Google Web Search (via Anthropic web_search tool — no usé API paga, fueron búsquedas directas).
**Domain target**: `hacecuentas.com`
**Queries**: 17 (ver `scripts/ai-mentions-queries.txt`)

## Resumen ejecutivo

| Métrica | Valor |
|---|---|
| Queries totales | 17 |
| Veces que aparece hacecuentas en top 10 | **0** |
| % visibilidad top 10 | **0.0%** |

**Crisis confirmada**: hacecuentas.com no aparece en ninguna SERP top 10 de Google para queries clave de su nicho. Esto valida la lectura de GSC (1.2 clicks/día, CTR 0.93%): el sitio está rankeando ≥ página 3 para queries comerciales/transaccionales con volumen real.

## Detalle por query

| # | Query | hacecuentas en top 10 | Top competidor | Tipo |
|---:|---|:---:|---|---|
| 1 | calcular porcentaje de un numero | ✗ | calcularporcentajeonline.com | Matemática genérica |
| 2 | calculadora monotributo argentina 2026 | ✗ | cuantocobro.ar (#1), contablix.ar, servidos.ar | Fiscal AR |
| 3 | inflacion argentina 2026 | ✗ | iprofesional.com, indec.gob.ar, infobae.com | Económica AR |
| 4 | calculadora aguinaldo argentina | ✗ | calculatusueldo.ar, calcularsueldo.com.ar, calcularaguinaldo.com.ar | Laboral AR |
| 5 | calculadora interes compuesto | ✗ | investor.gov, moneychimp.com, javilinares.com | Financiera genérica |
| 6 | calculadora plazo fijo argentina | ✗ | bbva.com.ar (#1), tuplazofijo.com.ar, bna.com.ar | Inversión AR |
| 7 | calculadora IVA 21 argentina | ✗ | nekocalc.com, calculariva.es, ivacalculator.com, servidos.ar | Fiscal AR |
| 8 | como calcular descuento de un precio | ✗ | abanca.es, calculardescuento.com, omnicalculator.com | Matemática genérica |
| 9 | indemnizacion despido argentina cuanto cobro | ✗ | marinpistachia.com, argentina.gob.ar, fundaciondhi.com.ar | Legal AR |
| 10 | calculadora horas extras argentina | ✗ | calcularsueldo.com.ar, todoprops.com, e-sueldos.com | Laboral AR |
| 11 | calculadora vacaciones no tomadas argentina | ✗ | calcularsueldo.com.ar, estudioszlit.com.ar, ignacioonline.com.ar | Laboral AR |
| 12 | calcular IMC indice masa corporal | ✗ | texasheart.org, fundaciondelcorazon.com, cdc.gov | Salud genérica |
| 13 | calorias diarias para bajar de peso | ✗ | medlineplus.gov, mdsaude.com, mayoclinic.org | Salud genérica |
| 14 | fecha probable de parto | ✗ | gynea.com, natalben.com, chicco.es | Salud genérica |
| 15 | calculadora regla de tres simple | ✗ | calculat.org, calculadorasonline.com, omnicalculator.com | Matemática genérica |
| 16 | conversor metros cuadrados a metros lineales | ✗ | buildingclub.info, electricistasmalaga.es, metric-conversions.org | Conversor |
| 17 | conversor celsius a fahrenheit | ✗ | calculatorsoup.com, metric-conversions.org, omnicalculator.com | Conversor |

## Análisis de competidores AR

Tres dominios AR dominan el espacio que hacecuentas debería ocupar:

| Competidor | Aparece en | Estrategia inferida |
|---|---|---|
| **calcularsueldo.com.ar** | aguinaldo, horas extras, vacaciones, plazo fijo, monotributo | Site dedicado a calcs salariales/laborales AR, parece focused |
| **calcularaguinaldo.com.ar** | aguinaldo | **Single-page site** con 1 calc, top 5. Demuestra que dedicated > generalista |
| **calculatusueldo.ar** | aguinaldo, monotributo | Calcs laborales AR, calidad alta |
| **servidos.ar** | monotributo, IVA | Calcs fiscales AR con datos vivos INDEC/BCRA |
| **contablix.ar** | monotributo | Calcs contables AR |
| **cuantocobro.ar** | monotributo (pos 1!) | Calcs salariales AR |
| **iprofesional.com** | inflación, indemnización | Editorial AR con CTR alto |

**Patrón**: dominios con **enfoque** (1 nicho, 10-50 calcs hyper-optimizadas) y **datos vivos** rankean. Hacecuentas con 4.118 calcs y `audience: global` se diluye.

## Diagnóstico

Esto valida:
- **HCU penalty severa** post-Core Update Abril 2026 (cerebro: 76→1.2 clicks/día).
- **El pruning + 410 es correcto** (ya hicimos 376 + 77 hoy) — necesitamos seguir podando.
- **La métrica del 2/6** medirá si el algorithmo restaura confianza tras la limpieza.

Lo NO confirma:
- ¿AI search (Perplexity, ChatGPT) menciona hacecuentas? Sin créditos Anthropic API hoy no lo sé. Pero si Google no lo rankea, AI search tampoco (Perplexity usa Bing/Google index como base).

## Acciones (urgencia alta → baja)

1. **Replicar la estrategia "single-page hyper-optimizada" para top 10 calcs AR**:
   - Aguinaldo, monotributo, IVA, plazo fijo, indemnización, horas extras, vacaciones, ganancias, inflación, sueldo neto.
   - Para cada una: title con año + verbo + dato concreto. CTR rescue tipo Fase 1 ya hizo 21 — replicar en estas 10 con todo el cuidado quirúrgico.

2. **Detectar y eliminar URLs canibalizadoras**: si hay 3 calcs de monotributo (por tipo, por categoría, por año), consolidar a 1 con todos los modos.

3. **Datos vivos visibles**: las top calcs deben mostrar "Actualizado hoy" + valores recientes (IPC, IVA, jubilación, etc.) above-the-fold. Es lo que `servidos.ar` hace bien.

4. **Backlinks editoriales**: iprofesional.com rankea para "inflación argentina 2026" porque tiene CTR de medio + backlinks. Hacecuentas necesita menciones de medios. Outreach a iProfesional, Infobae, Ámbito con reportes mensuales propios.

5. **Esperar el 2/6 + medir**. La métrica de Fase 1 (CTR rescue 21 URLs) va a indicar si el algoritmo HCU empezó a restaurar confianza tras el pruning agresivo.

## Notas técnicas

- Engine único usado: Google Search via Anthropic web_search tool (limitado a US-localized results — puede sesgar contra queries argentinas).
- Para mediciones más precisas, ejecutar `scripts/track-ai-mentions.py` con créditos Anthropic + Perplexity + OpenAI cuando esté disponible.
- Esta corrida NO mide AI Overviews (Google AI), Perplexity, ChatGPT Search ni Copilot. Solo Google clásico.
