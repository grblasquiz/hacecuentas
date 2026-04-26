#!/usr/bin/env python3
"""
Pipeline para generar 7 calcs MX completas usando Claude Opus 4.7.
- Prompt caching activado (system prompt cacheado se reusa para las 7 llamadas)
- Streaming para ver progreso por calc
- Output: JSON en src/content/calcs-mx/ + TS en src/lib/formulas/
"""
import json
import os
import sys
import time
from pathlib import Path

import anthropic
from calcs_config import CALCS

ROOT = Path(__file__).resolve().parent.parent.parent
JSON_OUT_DIR = ROOT / "src" / "content" / "calcs-mx"
TS_OUT_DIR = ROOT / "src" / "lib" / "formulas"

# Reference template - una calc MX existente para que el modelo entienda la estructura exacta
TEMPLATE_PATH = ROOT / "src" / "content" / "calcs-mx" / "calculadora-finiquito-liquidacion-mexico.json"

SYSTEM_PROMPT = """Sos un experto en derecho fiscal y laboral mexicano que escribe calculadoras de alta calidad para hacecuentas.com (mercado MX).

Vas a recibir specs de una calculadora y devolvés un JSON con DOS campos top-level:
1. `json_calc`: el contenido completo del archivo JSON de la calc
2. `ts_formula`: el código TypeScript completo de la fórmula (un único archivo .ts)

REGLAS DE CALIDAD (estrictas, sin excepciones):
- `description`: 130-160 caracteres exactos. Empieza con emoji. Specifica país (México). Debe ser informativa y atractiva, no rellena.
- `intro`: mínimo 200 palabras. Explica el contexto legal/fiscal mexicano relevante.
- `keyTakeaway`: 1-2 oraciones con la conclusión más importante en negritas markdown.
- `useCases`: array de 4-6 casos de uso concretos (oraciones cortas).
- `explanation`: mínimo 1500 palabras de markdown bien estructurado con headings (##), tablas markdown, listas, ejemplos. Cubre: cómo se calcula, marco legal mexicano (citar artículos LFT/LISR/etc.), tabla de referencia con datos 2026, casos típicos, errores comunes, calcs relacionadas.
- `faq`: mínimo 7 preguntas con respuestas detalladas. Las respuestas deben tener datos concretos, no vaguedades.
- `sources`: solo URLs oficiales (sat.gob.mx, imss.gob.mx, infonavit.org.mx, banxico.org.mx, dof.gob.mx, diputados.gob.mx). Mínimo 2.
- `relatedSlugs`: 3-5 slugs de otras calcs MX (te las paso en specs).
- Datos hardcoded: SOLO valores oficiales 2026. Salario mínimo general $278.80/día, frontera norte $419.88. UMA diaria $113.14, mensual $3,439.46. Si los specs traen tabla, copiala fiel.
- Tono: profesional pero accesible. Mexicano (no usar "vos" — usar "tú/usted"). Evitar argentinismos.
- En el JSON, evitá comillas tipográficas — usar comillas rectas para que el JSON sea válido.

ESTRUCTURA EXACTA DEL JSON (todos los campos requeridos):
{
  "slug": "<slug-del-spec>",
  "title": "<title 60-70 chars terminando en | Hacé Cuentas México>",
  "h1": "<h1 del spec>",
  "description": "<130-160 chars>",
  "category": "<del spec>",
  "icon": "<emoji del spec>",
  "formulaId": "<formula_id del spec>",
  "audience": "MX",
  "seoKeywords": ["<7 keywords MX>", ...],
  "intro": "<200+ palabras>",
  "keyTakeaway": "<1-2 oraciones con **negritas**>",
  "useCases": ["<caso 1>", ...],
  "fields": <array del spec, copiar tal cual>,
  "outputs": <array del spec, copiar tal cual>,
  "example": {"title": "<>", "steps": ["<>", ...], "result": "<>"},
  "explanation": "<1500+ palabras markdown>",
  "faq": [{"q": "<>", "a": "<>"}, ... 7+ items],
  "sources": [{"label": "<>", "url": "<>"}, ... mínimo 2 oficiales],
  "relatedSlugs": [<del spec>],
  "dataUpdate": {"frequency": "yearly|never|quarterly", "lastUpdated": "2026-04-25", "source": "<oficial>", "sourceUrl": "<url>", "updateType": "manual", "notes": "<>"},
  "howToSteps": [{"name": "<>", "text": "<>"}, ... 3-5 pasos]
}

ESTRUCTURA DEL TS:
- Export `interface Inputs { ... }` y `interface Outputs { ... }`
- Export función nombrada en camelCase del formula_id
- Validar inputs (números > 0, etc.)
- Implementar la fórmula EXACTAMENTE como dice formula_logic
- Hardcodear las tablas/valores oficiales 2026 dadas en formula_logic con comentarios citando fuente
- Manejar edge cases razonables
- NO importar nada externo (a menos que sea de _ganancias-escala u otro helper local — pero típicamente la fórmula es self-contained)
- Comentarios al inicio del archivo: 1-2 líneas explicando la calc + fuente oficial.

Tu output es UN ÚNICO JSON OBJECT con `json_calc` y `ts_formula`. No agregues markdown, no expliques, solo el JSON.
"""


def build_user_prompt(calc_spec: dict, template_calc: dict) -> str:
    """Construye el prompt user específico para esta calc, con template de referencia."""
    spec_str = json.dumps(calc_spec, indent=2, ensure_ascii=False)
    template_str = json.dumps(template_calc, indent=2, ensure_ascii=False)
    return f"""TEMPLATE de referencia (esta es una calc MX YA EXISTENTE — usá su estructura, tono y nivel de detalle como guía, pero NO copies su contenido):

```json
{template_str}
```

---

ESPECIFICACIÓN DE LA CALC A GENERAR:

```json
{spec_str}
```

Generá el JSON output con `json_calc` y `ts_formula`. Recordá:
- description 130-160 chars
- intro 200+ palabras
- explanation 1500+ palabras con tablas markdown
- 7+ FAQ
- sources oficiales SAT/IMSS/INFONAVIT/Banxico/DOF
- TS implementando exactamente la formula_logic dada
- Datos 2026 actualizados
"""


def generate_calc(client: anthropic.Anthropic, calc_spec: dict, template_calc: dict, idx: int, total: int) -> tuple[dict, str]:
    """Llama API con streaming + prompt caching. Retorna (json_calc, ts_formula)."""
    print(f"\n{'=' * 70}")
    print(f"[{idx}/{total}] Generando: {calc_spec['slug']}")
    print(f"  Categoría: {calc_spec['category']} | FormulaID: {calc_spec['formula_id']}")
    print(f"{'=' * 70}")

    user_prompt = build_user_prompt(calc_spec, template_calc)

    # Streaming con prompt caching en system
    t0 = time.time()
    chars_received = 0
    last_print = time.time()

    with client.messages.stream(
        model="claude-opus-4-7",
        max_tokens=32000,
        thinking={"type": "adaptive"},
        output_config={"effort": "high"},
        system=[
            {
                "type": "text",
                "text": SYSTEM_PROMPT,
                "cache_control": {"type": "ephemeral"},
            },
        ],
        messages=[
            {"role": "user", "content": user_prompt},
        ],
    ) as stream:
        for text in stream.text_stream:
            chars_received += len(text)
            now = time.time()
            if now - last_print > 5:
                elapsed = now - t0
                print(f"  ⏳ {elapsed:.0f}s  |  {chars_received:,} chars recibidos...", flush=True)
                last_print = now

        msg = stream.get_final_message()

    elapsed = time.time() - t0
    print(f"  ✓ Completado en {elapsed:.0f}s")
    print(f"  Tokens: in={msg.usage.input_tokens} | out={msg.usage.output_tokens} | cache_read={msg.usage.cache_read_input_tokens} | cache_create={msg.usage.cache_creation_input_tokens}")

    # Extraer texto
    text_content = ""
    for block in msg.content:
        if block.type == "text":
            text_content += block.text

    # Parsear JSON output
    # El modelo a veces envuelve el JSON en ```json ... ``` — detectar y limpiar
    text_content = text_content.strip()
    if text_content.startswith("```"):
        # remover fences
        lines = text_content.split("\n")
        text_content = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])

    try:
        result = json.loads(text_content)
    except json.JSONDecodeError as e:
        print(f"  ❌ Error parseando JSON: {e}")
        # Guardar para debug
        debug_path = ROOT / "scripts" / "mx_calcs_pipeline" / f"debug_{calc_spec['slug']}.txt"
        debug_path.write_text(text_content)
        print(f"  Output guardado en: {debug_path}")
        raise

    json_calc = result.get("json_calc")
    ts_formula = result.get("ts_formula")

    if not json_calc or not ts_formula:
        raise ValueError(f"Response missing json_calc or ts_formula: {list(result.keys())}")

    # Validaciones
    if json_calc.get("slug") != calc_spec["slug"]:
        print(f"  ⚠️  Slug en respuesta ({json_calc.get('slug')}) ≠ esperado ({calc_spec['slug']}) — corrigiendo")
        json_calc["slug"] = calc_spec["slug"]

    if json_calc.get("formulaId") != calc_spec["formula_id"]:
        print(f"  ⚠️  formulaId mismatch — corrigiendo")
        json_calc["formulaId"] = calc_spec["formula_id"]

    desc_len = len(json_calc.get("description", ""))
    if desc_len < 100 or desc_len > 170:
        print(f"  ⚠️  description length: {desc_len} (target 130-160)")

    faq_count = len(json_calc.get("faq", []))
    if faq_count < 7:
        print(f"  ⚠️  FAQ count: {faq_count} (mín 7)")

    explanation_words = len(json_calc.get("explanation", "").split())
    if explanation_words < 1200:
        print(f"  ⚠️  Explanation words: {explanation_words} (mín 1500)")
    else:
        print(f"  ✓ Explanation: {explanation_words} palabras")

    print(f"  ✓ Description: {desc_len} chars | FAQ: {faq_count} preguntas | Sources: {len(json_calc.get('sources', []))}")

    return json_calc, ts_formula


def main():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        print("ERROR: ANTHROPIC_API_KEY no encontrado en env. Cargá .env primero.")
        sys.exit(1)

    template_calc = json.loads(TEMPLATE_PATH.read_text())
    print(f"Template cargado: {TEMPLATE_PATH.name}")

    client = anthropic.Anthropic(api_key=api_key)
    JSON_OUT_DIR.mkdir(parents=True, exist_ok=True)
    TS_OUT_DIR.mkdir(parents=True, exist_ok=True)

    total = len(CALCS)
    print(f"Generando {total} calcs con claude-opus-4-7...")
    print(f"Output JSON: {JSON_OUT_DIR}")
    print(f"Output TS: {TS_OUT_DIR}")

    successes = []
    failures = []
    t_start = time.time()

    for idx, spec in enumerate(CALCS, 1):
        try:
            json_calc, ts_formula = generate_calc(client, spec, template_calc, idx, total)

            # Guardar JSON
            json_path = JSON_OUT_DIR / f"{spec['slug']}.json"
            json_path.write_text(json.dumps(json_calc, indent=2, ensure_ascii=False) + "\n")
            print(f"  → JSON: {json_path.relative_to(ROOT)}")

            # Guardar TS
            ts_path = TS_OUT_DIR / f"{spec['formula_id']}.ts"
            ts_path.write_text(ts_formula if ts_formula.endswith("\n") else ts_formula + "\n")
            print(f"  → TS: {ts_path.relative_to(ROOT)}")

            successes.append(spec["slug"])
        except Exception as e:
            print(f"  ❌ FALLO: {e}")
            failures.append((spec["slug"], str(e)))

    total_elapsed = time.time() - t_start
    print(f"\n{'=' * 70}")
    print(f"COMPLETADO en {total_elapsed:.0f}s")
    print(f"  Éxitos: {len(successes)}/{total}")
    if failures:
        print(f"  Fallos: {len(failures)}")
        for slug, err in failures:
            print(f"    - {slug}: {err}")
    print(f"{'=' * 70}")

    # Imprimir formulaIds para registry update
    print("\nFormula IDs generados (para registrar en src/lib/formulas/index.ts):")
    for spec in CALCS:
        if spec["slug"] in successes:
            print(f"  {spec['formula_id']}")


if __name__ == "__main__":
    main()
