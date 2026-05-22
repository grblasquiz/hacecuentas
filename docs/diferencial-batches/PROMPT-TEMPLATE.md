# Prompt template — Agregar valor diferencial a calcs candidatas a pruning

## Contexto

hacecuentas.com fue golpeado por Google Helpful Content Update (HCU) abril 2026. El script `scripts/pruning-analysis.py` identificó **595 calcs "fuertes" candidatas a pruning** (audience:global, sin IG, contenido genérico).

En vez de prunarlas, vamos a **agregar valor diferencial real** a cada una para que Google las reconozca como contenido útil único.

## Tu misión

Te asigné un batch de 8 calcs (archivo JSON con la lista). Por cada calc:

1. Leer su JSON en `src/content/calcs/<slug>.json`
2. **Evaluar si se le puede agregar valor diferencial REAL** (ver criterios abajo)
3. Si SÍ → editar el JSON agregando el valor
4. Si NO → marcarla como "skip" en tu reporte final (NO inventar contenido)

## Criterios de valor diferencial REAL

Una calc tiene valor diferencial si podés agregar **al menos UNO** de estos, con datos VERIFICABLES y CITADOS:

### A. Angle local (audience AR/MX/CL/ES/CO)
- Normativa local específica (Ley AR, NOM MX, RD ES, etc.)
- Costos/tarifas locales reales (precios AR en pesos, salarios mínimos, etc.)
- Instituciones reales (ANSES, IMSS AR, SEPE ES, etc.)
- Casos de uso por país (ej. propina USA 18-20% vs Argentina 10%)

### B. Information Gain real (data live)
- Dato de fuente oficial actualizada (BCRA, ARCA, INDEC, ANSES, ENARGAS, IMSS, BANXICO, etc.)
- Fórmulas oficiales con cita exacta (Ley, RG, Resolución)
- Tablas/escalas con vigencia 2026 + fuente verificable

### C. Diferenciación técnica/científica
- Cuál fórmula científica usa (ej. Mifflin-St Jeor 1990 vs Harris-Benedict 1919)
- Comparación con alternativas (ej. Brzycki vs Epley para 1RM)
- Edge cases y límites de aplicación
- Referencia académica (paper, organización médica/científica)

### D. Contexto temporal 2026
- Cambios recientes vs años anteriores
- Vigencia explícita ("a mayo 2026...")
- Ajustes esperados (RIPTE, IPC, salarios)

## REGLAS ESTRICTAS — NO INVENTAR

- ❌ **NO inventar datos numéricos** (precios, salarios, tasas)
- ❌ **NO inventar normativa** (artículos de leyes que no verificaste)
- ❌ **NO inventar fuentes** (URLs ficticias, organizaciones inexistentes)
- ❌ **NO usar lenguaje promocional** ("la mejor", "más completa", "líder")
- ❌ **NO repetir el mismo template** entre calcs distintas (Google detecta similitud)
- ✅ **SÍ citar fuentes con URL real verificable**
- ✅ **SÍ usar fechas/montos solo si los podés respaldar con fuente**
- ✅ **SÍ ser específico sobre vigencia** ("a abril 2026") cuando aplique
- ✅ **SÍ adaptar el angle a la calc específica** (no template-fill)

## Estructura del JSON a editar

Por cada calc que decidís adaptar, modificar estos campos:

### 1. `audience`
- Si la calc tiene relevancia para AR específicamente → `"AR"`
- Si aplica a 2-3 países latam → mantener `"global"` PERO agregar secciones por país en explanation
- Si es 100% genérica (matemática pura, conversión de unidades) → NO se puede adaptar, skip

### 2. `dataUpdate`
```json
{
  "frequency": "monthly|quarterly|yearly|biannual",  // según cambie la data
  "lastUpdated": "2026-05-22",
  "source": "Nombre oficial completo (ej. 'ARCA - RG 5860/2026' o 'OMS Growth Standards 2007')",
  "sourceUrl": "URL real verificable",
  "updateType": "manual",  // o "auto-llm" si es periódico
  "notes": "Una frase explicando qué actualiza y por qué"
}
```

### 3. `explanation` (cuando sea string)
- Expandir con secciones específicas: "Fórmula", "Cuándo usar", "Limitaciones", "Casos AR" (si aplica)
- Mínimo 500 palabras NUEVAS de contenido específico
- Citar al menos 1 fuente con autoridad

### 4. `faq` (mínimo 7 entradas)
- Si tiene <7, expandir a 7+ con preguntas REALES que un usuario AR/global se haría
- Las respuestas deben ser substantivas (>50 palabras)
- Diferenciar de FAQs de calcs similares

### 5. `seoKeywords`
- Agregar 3-5 keywords con angle local si aplica
- No stuffing — keywords reales que se buscan

## Fuentes confiables por dominio

| Dominio | Fuentes válidas |
|---|---|
| Salud | OMS, ACSM, ACOG, NIH, SAP (Soc. Arg. Pediatría), SAD (Soc. Arg. Diabetes), SAEM, ANMAT |
| Finanzas AR | BCRA, ARCA (ex-AFIP), INDEC, ANSES, BYMA, CNV |
| Finanzas global | IRS (US), BIS, FMI, World Bank |
| Deporte | NSCA, ACSM, FIFA, FBref, Opta, World Athletics |
| Cocina | FAO/WHO, USDA FoodData, Codex Alimentarius |
| Construcción | CAC (Cámara Argentina), CPIC, IRAM, ENRE |
| Cripto | DefiLlama, CoinGecko, blockchain explorers (verificable) |
| Vida cotidiana | INE/INDEC, ENARGAS, ENRE, organizaciones específicas |

## Tu output (reporte al final)

Cuando termines tu batch, retornás un resumen como:

```
BATCH N - DONE

Adaptadas: <X>/<Y> calcs
- calculadora-foo: audience AR, source ARCA RG 5860, explanation +600w, FAQs 5→9
- calculadora-bar: audience AR, dataUpdate con BCRA, explanation +500w
- ...

Skipped (no diferenciable): <Z> calcs
- calculadora-baz: matemática pura, sin angle local posible
- ...

Issues encontrados (si alguno):
- ...
```

## Restricciones operacionales

- **NO hacés git commit** — al final yo consolido y commito todo
- **NO toques otros archivos** que no sean los JSONs de tu batch
- **NO modifiques** la estructura del JSON (slug, formulaId, fields, outputs) — solo content
- **Si el JSON tiene una key que NO conocés, NO la borres** — preservala
- Si una calc parece tener data fake/inventada previa, **mencionarlo en el reporte** pero NO modificarla a una versión más fake

## Validación pre-output

Antes de terminar, asegurate que:
- El JSON resultante sigue siendo válido (parsea OK)
- Las URLs de source son reales (verificar con curl o web fetch si necesario)
- No agregaste duplicate content que ya está en otra calc
