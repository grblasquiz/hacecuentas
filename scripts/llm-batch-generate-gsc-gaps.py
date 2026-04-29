#!/usr/bin/env python3
"""
Genera N calcs globales (EN/ES/PT-BR) vía Claude Sonnet 4.6 desde
scripts/calcs-gsc-gaps-specs.json. Cada spec lleva un campo `lang` que
determina (a) el idioma del contenido producido y (b) el directorio destino.

Output:
  src/content/calcs-en/{slug}.json   — lang=en
  src/content/calcs/{slug}.json      — lang=es (neutro, comparte dir AR)
  src/content/calcs-pt/{slug}.json   — lang=pt-BR
  src/lib/formulas/{slug}.ts         — fórmula TS (compartida)
  scripts/.batch-gsc-gaps-state.json   — checkpoint

Concurrencia alta (12) + cache estático en system → ~5 min para 100.

Uso:
  python3 scripts/llm-batch-generate-global.py
  python3 scripts/llm-batch-generate-global.py --limit 3      # smoke
  python3 scripts/llm-batch-generate-global.py --resume
  python3 scripts/llm-batch-generate-global.py --concurrency 16
"""
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parent.parent
SPECS_FILE = ROOT / "scripts" / "calcs-gsc-gaps-specs.json"
FORMULAS_DIR = ROOT / "src" / "lib" / "formulas"
STATE_FILE = ROOT / "scripts" / ".batch-gsc-gaps-state.json"

LANG_DIRS = {
    "en": ROOT / "src" / "content" / "calcs-en",
    "es": ROOT / "src" / "content" / "calcs",
    "pt-BR": ROOT / "src" / "content" / "calcs-pt",
}

MODEL = "claude-haiku-4-5"
MAX_TOKENS = 16000

LANG_INSTRUCTIONS = {
    "en": (
        "Language: ENGLISH (en-US). All output text in English. "
        "Use $ for currency, US conventions (lb/oz/mi/°F primary; metric secondary). "
        "Tone: direct, technically precise, no hype. "
        "Action verbs in description: 'Calculate', 'Estimate', 'Compare'. "
        "Title ends with ' | Hacé Cuentas' (keep brand). "
        "Sources: prefer .gov / .edu / WHO / IRS / FDA / CDC URLs."
    ),
    "es": (
        "Idioma: ESPAÑOL NEUTRO (LATAM, NO argentino). Usar 'tú' o construcciones impersonales — NUNCA 'vos' ni 'che'. "
        "No referencias AR-specific (AFIP, ANSES, BCRA, ARCA). "
        "Moneda: USD por default si la calc no es regional; o pesos genéricos. "
        "Tono: directo, técnicamente preciso, sin marketing fluff. "
        "Verbos de acción en description: 'Calcula', 'Estima', 'Compara'. "
        "Title termina con ' | Hacé Cuentas'. "
        "Fuentes: OMS/OPS, BIS, FMI, sitios oficiales LATAM cuando aplique (.gob)."
    ),
    "pt-BR": (
        "Idioma: PORTUGUÊS BRASILEIRO. Todo o output em pt-BR. "
        "Moeda: R$ (BRL). Convenções BR: kg, cm, °C, km. "
        "Referências oficiais BR: Receita Federal, INSS, BACEN, Banco Central, IBGE, ANVISA. "
        "Tom: direto, tecnicamente preciso, sem hype. "
        "Verbos de ação na description: 'Calcule', 'Estime', 'Compare'. "
        "Title termina com ' | Hacé Cuentas'. "
        "Fontes: gov.br, oficiais BR."
    ),
}

SYSTEM_PROMPT = """Sos un generador de calculadoras para hacecuentas.com (sitio multilenguaje, 2700+ calcs). Tu trabajo: producir el JSON spec + el código TypeScript de la fórmula para una calc nueva, en el idioma indicado por el spec.

# REGLA CRÍTICA: idioma

El user te indica `lang`. **TODO el contenido textual** del JSON (title, h1, description, intro, keyTakeaway, useCases, fields[].label, options[].label, outputs[].label, explanation, faq, sources[].name, dataUpdate.notes) debe estar en ese idioma. Los identificadores técnicos (slug, formulaId, field.id, output.id, value de options) quedan en inglés/snake-case sin traducir.

NO mezcles idiomas. Si lang=en, todo en inglés. Si lang=es, español neutro LATAM (NO argentino). Si lang=pt-BR, portugués brasileño.

# Convenciones del sitio

- Datos vigentes a 2026 (alícuotas, tasas, valores oficiales).
- Tono claro, directo, técnicamente preciso. Sin hype.
- Citar fuentes oficiales reales (no inventes URLs).

# JSON spec — campos requeridos

```
{
  "slug": "...",
  "title": "Título SEO 2026 | Hacé Cuentas",     # ≤70 chars idealmente
  "h1": "Título visible al usuario",              # 40-70 chars
  "description": "Meta SEO con cifras concretas", # 120-160 chars
  "category": "...",                              # del spec
  "audience": "global",                           # del spec
  "icon": "emoji",                                # del spec
  "formulaId": "<slug-sin-prefix-calculadora>",
  "intro": "Párrafo intro 200-400 chars en el idioma. Markdown light: **bold**. Mostrar problema que resuelve.",
  "keyTakeaway": "One-liner con cifras concretas (>=80 chars con números).",
  "useCases": ["caso 1", "caso 2", ...],          # 4-6 items
  "fields": [
    {"id": "amount", "label": "Amount", "type": "number", "placeholder": "10000", "default": 10000, "step": 0.01, "required": true},
    {"id": "category", "label": "Category", "type": "select", "options": [{"value":"a","label":"A"}], "default": "a", "required": true}
  ],
  "outputs": [
    {"id": "result", "label": "Result", "primary": true, "format": "currency", "suffix": "USD"},
    {"id": "extra", "label": "Detail", "format": "text"}
  ],
  "explanation": "## How it works\\n\\nMarkdown extenso 1500-3000 chars: ## Formula con bloque ```...```, ## Worked example, tabla si aplica, ## When NOT to apply / limitations. Sin URLs en explanation (van en sources).",
  "faq": [
    {"q": "Concrete question?", "a": "Direct answer with figures. 200-500 chars."}
  ],                                              # 7-10 items
  "sources": [
    {"name": "Source name", "url": "https://real-url.gov/path", "publisher": "Org", "date": "2026"}
  ],                                              # 2-5 fuentes oficiales reales
  "dataUpdate": {
    "frequency": "as-needed|monthly|biannual|yearly",
    "lastUpdated": "2026-04-28",
    "updateType": "manual",
    "notes": "Qué se actualiza"
  },
  "lastReviewed": "2026-04-28"
}
```

`format` outputs: `currency`, `percent`, `number`, `decimal`, `integer`, `time`, `date`, `text`.
`type` fields: `number`, `select`, `date`, `radio`, `checkbox`.

# Código TypeScript — fórmula

```typescript
export interface Inputs {
  amount: number;
  category: string;
  // ... mismos `id` que en fields del JSON
}

export interface Outputs {
  result: number;
  extra: string;
  // ... mismos `id` que en outputs del JSON
}

export function compute(i: Inputs): Outputs {
  const amount = Number(i.amount) || 0;
  if (amount <= 0) {
    return { result: 0, extra: "Enter a valid amount" };
  }
  const RATE_2026 = 0.30;
  const result = amount * RATE_2026;
  return { result, extra: `Calculated at ${(RATE_2026 * 100).toFixed(0)}%` };
}
```

Reglas TS:
- Solo standard library (sin imports externos).
- Función `compute(i: Inputs): Outputs` exportada.
- `Inputs` y `Outputs` interfaces exportadas con los MISMOS `id` que en JSON.
- Manejo defensivo: returns con defaults sensatos, NO throws.
- Constantes 2026 con nombre claro y comentario fuente.
- Para selects con `options`, los `value` mapean a casos del TS.
- Mensajes en strings TS van en el idioma del spec.

# Output esperado

Devolvé EXCLUSIVAMENTE un JSON válido (sin markdown wrapper):

```
{
  "json": { ... spec completo ... },
  "formula_ts": "// código TypeScript completo aquí"
}
```

`formula_ts` es string — escapá saltos de línea como \\n y comillas como \\".

NO uses links internos a slugs que no existan."""


def load_state() -> dict:
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text())
        except: pass
    return {"completed": [], "errors": {}}


def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


async def generate_one(client, spec, sem):
    slug = spec["slug"]
    lang = spec["lang"]
    user_prompt = (
        f"{LANG_INSTRUCTIONS[lang]}\n\n"
        f"Generá la calculadora con estos datos:\n\n"
        f"slug: {slug}\n"
        f"lang: {lang}  (TODO el output en este idioma)\n"
        f"h1: {spec['h1']}\n"
        f"category: {spec['category']}\n"
        f"audience: {spec['audience']}\n"
        f"icon: {spec['icon']}\n"
        f"brief: {spec['brief']}\n\n"
        f"Devolvé solo JSON con `json` y `formula_ts`. Recordá: TODO el contenido textual en {lang}."
    )

    async with sem:
        try:
            response = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
                messages=[{"role": "user", "content": user_prompt}],
            )
        except anthropic.APIError as e:
            return slug, lang, None, f"API error: {e}"
        except Exception as e:
            return slug, lang, None, f"Unexpected: {type(e).__name__}: {e}"

    cache_read = response.usage.cache_read_input_tokens or 0
    cache_write = response.usage.cache_creation_input_tokens or 0

    text = next((b.text for b in response.content if b.type == "text"), None)
    if not text:
        return slug, lang, None, "No text block"

    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines)

    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError as e:
        return slug, lang, None, f"JSON parse: {e} | first 200: {stripped[:200]}"

    if "json" not in parsed or "formula_ts" not in parsed:
        return slug, lang, None, f"Missing keys (got {list(parsed.keys())})"

    print(
        f"  ✓ {slug} ({lang}) cache_r={cache_read} cache_w={cache_write} out={response.usage.output_tokens}",
        file=sys.stderr,
    )
    return slug, lang, parsed, None


def write_calc(slug: str, lang: str, data: dict):
    calc_json = data["json"]
    formula_ts = data["formula_ts"]
    calc_json["slug"] = slug
    formula_id = slug.removeprefix("calculadora-")
    # Forzar consistencia (sobreescribir si el LLM eligió otro id)
    calc_json["formulaId"] = formula_id
    calc_json.setdefault("lastReviewed", "2026-04-28")

    out_dir = LANG_DIRS[lang]
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{slug}.json").write_text(json.dumps(calc_json, ensure_ascii=False, indent=2) + "\n")

    ts_path = FORMULAS_DIR / f"{formula_id}.ts"
    ts_path.write_text(formula_ts.rstrip() + "\n")


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--concurrency", type=int, default=12)
    ap.add_argument("--warm-cache", action="store_true", default=True)
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        env_file = ROOT / ".env"
        if env_file.exists():
            for line in env_file.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"] = line.split("=", 1)[1].strip().strip('"')
                    break
        if not os.environ.get("ANTHROPIC_API_KEY"):
            print("ERROR: ANTHROPIC_API_KEY no seteado", file=sys.stderr)
            sys.exit(2)

    specs = json.loads(SPECS_FILE.read_text())
    if args.limit:
        specs = specs[: args.limit]

    state = load_state()
    if args.resume:
        completed = set(state.get("completed", []))
        specs = [s for s in specs if s["slug"] not in completed]
        print(f"[resume] saltando {len(completed)}, quedan {len(specs)}", file=sys.stderr)

    if not specs:
        print("Nada para generar.", file=sys.stderr)
        return

    print(f"[batch-global] {len(specs)} calcs con {MODEL}, conc={args.concurrency}", file=sys.stderr)
    print(f"[batch-global] system size: ~{len(SYSTEM_PROMPT)} chars", file=sys.stderr)

    client = anthropic.AsyncAnthropic()

    if args.warm_cache and len(specs) > 1:
        print(f"[batch-global] warming cache: {specs[0]['slug']}", file=sys.stderr)
        sem_warm = asyncio.Semaphore(1)
        slug, lang, parsed, err = await generate_one(client, specs[0], sem_warm)
        if err:
            print(f"  ✗ {slug}: {err}", file=sys.stderr)
            state["errors"][slug] = err
        elif parsed:
            try:
                write_calc(slug, lang, parsed)
                state["completed"].append(slug)
                state["completed"] = list(dict.fromkeys(state["completed"]))
                save_state(state)
                print(f"[batch-global] cache warm OK", file=sys.stderr)
            except Exception as e:
                state["errors"][slug] = f"write: {e}"
                print(f"  ✗ {slug}: write {e}", file=sys.stderr)
        remaining = specs[1:]
    else:
        remaining = specs

    sem = asyncio.Semaphore(args.concurrency)
    tasks = [generate_one(client, spec, sem) for spec in remaining]
    ok = err_count = 0
    for fut in asyncio.as_completed(tasks):
        slug, lang, parsed, err = await fut
        if err:
            err_count += 1
            state["errors"][slug] = err
            print(f"  ✗ {slug}: {err}", file=sys.stderr)
        elif parsed:
            try:
                write_calc(slug, lang, parsed)
                state["completed"].append(slug)
                state["completed"] = list(dict.fromkeys(state["completed"]))
                ok += 1
                save_state(state)
            except Exception as e:
                err_count += 1
                state["errors"][slug] = f"write: {e}"
                print(f"  ✗ {slug}: write {e}", file=sys.stderr)

    save_state(state)
    total_ok = len(state["completed"])
    print(f"\n[batch-global] done — total: {total_ok}, este run: {ok} ok / {err_count} err", file=sys.stderr)
    if state["errors"]:
        print(f"[batch-global] {len(state['errors'])} errores en {STATE_FILE}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
