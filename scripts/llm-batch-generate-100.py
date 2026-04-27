#!/usr/bin/env python3
"""
Genera 100 calcs nuevas vía Claude API (claude-sonnet-4-6) a partir de
scripts/calcs-100-specs.json.

Cada spec dispara 1 llamada que devuelve JSON estructurado con todos los
campos del calc + el código TS de la fórmula. El system prompt es estático
con cache_control ephemeral, así la primera llamada paga write y las 99
restantes leen el cache (~10x más barato en input).

Output:
  src/content/calcs/{slug}.json     — calc spec
  src/lib/formulas/{slug}.ts        — fórmula TS
  scripts/.batch-100-state.json     — checkpoint para reanudar si falla

Costo estimado (sonnet 4.6, ~3K input system + 200 user / ~3K output cada):
  Input: 1×3000 (write 1.25x = $0.011) + 99×3000 (read 0.1x = $0.089) + 100×200 (uncached = $0.060) ≈ $0.16
  Output: 100×3000 × $15/M = $4.50
  Total ≈ $4.66

Uso:
  python3 scripts/llm-batch-generate-100.py                # genera todas
  python3 scripts/llm-batch-generate-100.py --limit 5      # smoke test
  python3 scripts/llm-batch-generate-100.py --resume       # solo las que faltan
  python3 scripts/llm-batch-generate-100.py --concurrency 4
"""
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path
from typing import Any

import anthropic

ROOT = Path(__file__).resolve().parent.parent
SPECS_FILE = ROOT / "scripts" / "calcs-100-specs.json"
CALCS_DIR = ROOT / "src" / "content" / "calcs"
FORMULAS_DIR = ROOT / "src" / "lib" / "formulas"
STATE_FILE = ROOT / "scripts" / ".batch-100-state.json"

MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 12000

# ---------------------------------------------------------------------------
# System prompt — estático (cacheable)
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """Sos un generador de calculadoras para hacecuentas.com, un sitio argentino con 2700+ calculadoras. Tu trabajo es producir el JSON spec + el código TypeScript de la fórmula para una calculadora nueva.

# Convenciones del sitio

- Audiencia AR: usá "vos" (no "tú"). Datos en pesos argentinos (ARS) o USD según corresponda. Referencias a AFIP/ARCA, ANSES, BCRA, INDEC.
- Audiencia global: español neutro, sin AR-specific.
- Datos vigentes a 2026 (alícuotas, tasas, valores oficiales, indicadores).
- Tono claro, directo, técnicamente preciso. Sin hype.

# JSON spec — campos requeridos

```
{
  "slug": "calculadora-...",
  "title": "Título SEO 2026 | Hacé Cuentas",     # ≤70 chars idealmente
  "h1": "Título visible al usuario",              # 40-70 chars
  "description": "Meta description SEO con números concretos cuando aplique",  # 120-160 chars
  "category": "finanzas|salud|impuestos|familia|...",  # usar la del spec
  "audience": "AR" | "global",                    # del spec
  "icon": "emoji",                                # del spec
  "formulaId": "<slug-sin-prefix-calculadora>",   # mismo basename que el archivo TS
  "intro": "Párrafo intro (200-400 chars) que abre el calc. Markdown light: **bold**, [links a calcs internas]. Mostrar el problema que resuelve.",
  "keyTakeaway": "Resumen one-liner con cifras concretas (>=80 chars con números).",
  "useCases": ["caso 1", "caso 2", "caso 3", "caso 4", "caso 5"],   # 4-6 items
  "fields": [                                     # inputs del usuario
    {"id": "monto", "label": "Monto", "type": "number", "placeholder": "10000", "default": 10000, "step": 0.01, "required": true},
    {"id": "categoria", "label": "Categoría", "type": "select", "options": [{"value":"a","label":"A"}], "default": "a", "required": true}
  ],
  "outputs": [                                    # qué devuelve el calc
    {"id": "resultado", "label": "Resultado", "primary": true, "format": "currency", "suffix": "ARS"},
    {"id": "extra", "label": "Detalle", "format": "text"}
  ],
  "explanation": "## Cómo se calcula\\n\\nMarkdown extenso, 1500-3000 chars. Incluir:\\n- ## Fórmula con bloque ```...```\\n- ## Ejemplo numérico\\n- Tabla markdown si aplica (referencias, tasas, factores)\\n- ## Cuándo NO aplica / limitaciones\\n- Citas a fuentes oficiales (sin URLs en explanation, esos van en sources).",
  "faq": [                                        # 7-10 preguntas concretas
    {"q": "¿Pregunta concreta y clara?", "a": "Respuesta directa con cifras y referencias normativas. 200-500 chars."}
  ],
  "sources": [                                    # 2-5 fuentes oficiales reales
    {"name": "Nombre de la fuente", "url": "https://url-real.gob.ar/path", "publisher": "Organismo", "date": "2026"}
  ],
  "dataUpdate": {
    "frequency": "as-needed|monthly|biannual|yearly",
    "lastUpdated": "2026-04-27",
    "updateType": "manual",
    "notes": "Qué se actualiza cuando cambian las normativas/tasas"
  },
  "lastReviewed": "2026-04-27"
}
```

`format` para outputs puede ser: `currency`, `percent`, `number`, `decimal`, `integer`, `time`, `date`, `text`.

`type` para fields: `number`, `select`, `date`, `radio`, `checkbox`.

# Código TypeScript — fórmula

```typescript
export interface Inputs {
  monto: number;
  categoria: string;
  // ... mismos `id` que en fields del JSON
}

export interface Outputs {
  resultado: number;
  extra: string;
  // ... mismos `id` que en outputs del JSON
}

export function compute(i: Inputs): Outputs {
  // Validar inputs (defensivo pero conciso).
  const monto = Number(i.monto) || 0;
  if (monto <= 0) {
    return { resultado: 0, extra: "Ingresá un monto válido" };
  }

  // Lógica del cálculo. Constantes con nombre claro.
  const TASA_2026 = 0.30;
  const resultado = monto * TASA_2026;

  return {
    resultado,
    extra: `Calculado al ${(TASA_2026 * 100).toFixed(0)}%`,
  };
}
```

Reglas TS:
- Solo standard library (sin imports externos).
- Función `compute(i: Inputs): Outputs` exportada.
- `Inputs` y `Outputs` interfaces exportadas con los MISMOS `id` que en el JSON.
- Manejar inputs inválidos devolviendo defaults sensatos, no throws.
- Constantes 2026 con nombre claro y comentario fuente cuando sea relevante.
- Para selects con `options`, los `value` del JSON deben mapear a casos en el TS.

# Output esperado

Devolvé EXCLUSIVAMENTE un JSON válido (sin markdown wrapper, sin ```json):

```
{
  "json": { ... el spec completo del calc ... },
  "formula_ts": "// código TypeScript completo aquí"
}
```

El campo `formula_ts` es un string — escapá saltos de línea como \\n y comillas como \\".

NO uses links internos a slugs que no existan. Si querés referenciar calcs relacionadas, mencionalas en prosa sin link, o usá fuentes externas reales en `sources`."""

# Nota: no usamos output_config.format json_schema porque la API exige
# additionalProperties:false recursivamente y el JSON interno tiene shape
# variable (fields, outputs, faq con tipos distintos). El system prompt
# instruye claramente "devolvé EXCLUSIVAMENTE JSON" — lo parseamos con
# json.loads y reintentamos extracción si viene envuelto en ```json...```.


# ---------------------------------------------------------------------------
# State management — para reanudar
# ---------------------------------------------------------------------------

def load_state() -> dict:
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text())
        except: pass
    return {"completed": [], "errors": {}}


def save_state(state: dict):
    STATE_FILE.write_text(json.dumps(state, indent=2, ensure_ascii=False))


# ---------------------------------------------------------------------------
# Generation
# ---------------------------------------------------------------------------

async def generate_one(client: anthropic.AsyncAnthropic, spec: dict, sem: asyncio.Semaphore) -> tuple[str, dict | None, str | None]:
    """Devuelve (slug, parsed_dict | None, error | None)."""
    slug = spec["slug"]
    user_prompt = (
        f"Generá la calculadora con estos datos:\n\n"
        f"slug: {slug}\n"
        f"h1: {spec['h1']}\n"
        f"category: {spec['category']}\n"
        f"audience: {spec['audience']}\n"
        f"icon: {spec['icon']}\n"
        f"brief: {spec['brief']}\n\n"
        f"Devolvé solo el JSON con `json` y `formula_ts`."
    )

    async with sem:
        try:
            response = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=[
                    {
                        "type": "text",
                        "text": SYSTEM_PROMPT,
                        "cache_control": {"type": "ephemeral"},
                    }
                ],
                messages=[{"role": "user", "content": user_prompt}],
            )
        except anthropic.APIError as e:
            return slug, None, f"API error: {e}"
        except Exception as e:
            return slug, None, f"Unexpected: {type(e).__name__}: {e}"

    # Estado del cache (útil para diagnóstico de la primera vs subsecuente)
    cache_read = response.usage.cache_read_input_tokens or 0
    cache_write = response.usage.cache_creation_input_tokens or 0

    text = next((b.text for b in response.content if b.type == "text"), None)
    if not text:
        return slug, None, "No text block in response"

    # Strip ```json ... ``` o ``` ... ``` wrapper si vino así.
    stripped = text.strip()
    if stripped.startswith("```"):
        # quitar primera línea (```json) y último cierre
        lines = stripped.split("\n")
        if lines[0].startswith("```"):
            lines = lines[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines)

    try:
        parsed = json.loads(stripped)
    except json.JSONDecodeError as e:
        return slug, None, f"JSON parse error: {e} | first 200 chars: {stripped[:200]}"

    if "json" not in parsed or "formula_ts" not in parsed:
        return slug, None, f"Missing keys (got {list(parsed.keys())})"

    # Log de costo a stderr
    print(
        f"  ✓ {slug} (cache_read={cache_read}, cache_write={cache_write}, "
        f"output={response.usage.output_tokens})",
        file=sys.stderr,
    )
    return slug, parsed, None


def write_calc(slug: str, data: dict):
    """Escribe JSON + TS files. Asume `data` es {json, formula_ts}."""
    calc_json = data["json"]
    formula_ts = data["formula_ts"]

    # Forzar consistencia: el slug del JSON debe coincidir.
    calc_json["slug"] = slug

    # formulaId derivado del slug (sin prefijo "calculadora-")
    formula_id = slug.removeprefix("calculadora-")
    calc_json.setdefault("formulaId", formula_id)

    # Asegurar lastReviewed presente
    calc_json.setdefault("lastReviewed", "2026-04-27")

    # Escribir JSON
    json_path = CALCS_DIR / f"{slug}.json"
    json_path.write_text(json.dumps(calc_json, ensure_ascii=False, indent=2) + "\n")

    # Escribir TS — usar el formulaId como filename
    ts_path = FORMULAS_DIR / f"{formula_id}.ts"
    ts_path.write_text(formula_ts.rstrip() + "\n")


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int, default=None, help="Solo primeras N specs (smoke test)")
    ap.add_argument("--resume", action="store_true", help="Saltar las ya completadas")
    ap.add_argument("--concurrency", type=int, default=8, help="Paralelismo (default 8)")
    ap.add_argument("--warm-cache", action="store_true", default=True,
                    help="Disparar 1 request primero para cachear el system prompt")
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        # Cargar de .env local
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
        print(f"[resume] saltando {len(completed)} ya completadas; quedan {len(specs)}", file=sys.stderr)

    if not specs:
        print("Nada para generar.", file=sys.stderr)
        return

    print(f"[batch] generando {len(specs)} calcs con {MODEL}, concurrency={args.concurrency}", file=sys.stderr)
    print(f"[batch] system prompt size: ~{len(SYSTEM_PROMPT)} chars", file=sys.stderr)

    client = anthropic.AsyncAnthropic()

    # Warm cache: 1ra request sola para cachear el system prompt
    if args.warm_cache and len(specs) > 1:
        print(f"[batch] warming cache con {specs[0]['slug']}...", file=sys.stderr)
        sem_warm = asyncio.Semaphore(1)
        slug, parsed, err = await generate_one(client, specs[0], sem_warm)
        if err:
            print(f"  ✗ {slug}: {err}", file=sys.stderr)
            state["errors"][slug] = err
        elif parsed:
            try:
                write_calc(slug, parsed)
                state["completed"].append(slug)
                state["completed"] = list(dict.fromkeys(state["completed"]))
                save_state(state)
                print(f"[batch] cache warm OK", file=sys.stderr)
            except Exception as e:
                err = f"write error: {e}"
                state["errors"][slug] = err
                print(f"  ✗ {slug}: {err}", file=sys.stderr)
        remaining = specs[1:]
    else:
        remaining = specs

    # Resto en paralelo
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [generate_one(client, spec, sem) for spec in remaining]
    ok = err_count = 0
    for fut in asyncio.as_completed(tasks):
        slug, parsed, err = await fut
        if err:
            err_count += 1
            state["errors"][slug] = err
            print(f"  ✗ {slug}: {err}", file=sys.stderr)
        elif parsed:
            try:
                write_calc(slug, parsed)
                state["completed"].append(slug)
                state["completed"] = list(dict.fromkeys(state["completed"]))
                ok += 1
                save_state(state)
            except Exception as e:
                err_count += 1
                err_msg = f"write error: {e}"
                state["errors"][slug] = err_msg
                print(f"  ✗ {slug}: {err_msg}", file=sys.stderr)

    save_state(state)
    total_ok = len(state["completed"])
    print(f"\n[batch] done — total completed: {total_ok}, este run: {ok} ok / {err_count} errores", file=sys.stderr)
    if state["errors"]:
        print(f"[batch] {len(state['errors'])} errores en state file: {STATE_FILE}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
