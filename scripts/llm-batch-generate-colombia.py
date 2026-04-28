#!/usr/bin/env python3
"""
Genera N calcs específicas para España. Output:
  src/content/calcs-co/{slug}.json   — con audience=CO, lang=es-CO
  src/lib/formulas/{slug}.ts

Uso:
  python3 scripts/llm-batch-generate-spain.py
  python3 scripts/llm-batch-generate-spain.py --limit 3 --concurrency 3
  python3 scripts/llm-batch-generate-spain.py --resume
"""
import argparse, asyncio, json, os, sys
from pathlib import Path
import anthropic

ROOT = Path(__file__).resolve().parent.parent
SPECS_FILE = ROOT / "scripts" / "calcs-colombia-specs.json"
CALCS_DIR = ROOT / "src" / "content" / "calcs-co"
FORMULAS_DIR = ROOT / "src" / "lib" / "formulas"
STATE_FILE = ROOT / "scripts" / ".batch-colombia-state.json"

MODEL = "claude-haiku-4-5"
MAX_TOKENS = 16000

SYSTEM_PROMPT = """Sos un generador de calculadoras para hacecuentas.com, sección Colombia.

Tu trabajo: producir el JSON spec + el código TypeScript de la fórmula para una calc nueva ESPECÍFICA PARA COLOMBIA.

# REGLA CRÍTICA: idioma y referencias

- TODO el output en ESPAÑOL DE COLOMBIA (tú/usted según corresponda, NO vos).
- Usar "tú" o construcciones impersonales — NUNCA "vos".
- Moneda: pesos mexicanos (\$), formato \,234.56.
- Referencias OFICIALES España: DIAN, Superfinanciera, Banco República, Min Hacienda, MinTrabajo, ICBF, Colpensiones, ICETEX.
- Tramos Renta Colombia cédulas, IVA 19%, EPS/pensión 4%/4%, NIT/cédula, departamentos (32).
- Datos vigentes 2026 Colombia.
- Tono: directo, técnicamente preciso, sin marketing fluff.
- Verbos de acción: "Calcula", "Estima", "Compara".

# JSON spec — campos requeridos

```
{
  "slug": "...",
  "title": "Título SEO 2026 | Hacé Cuentas",      # ≤70 chars
  "h1": "Título visible al usuario",
  "description": "Meta SEO 120-160 chars con cifra concreta Colombia",
  "category": "...",                              # del spec
  "audience": "CO",                               # FIJO: CO (Colombia)
  "icon": "emoji",                                # del spec
  "formulaId": "<slug-sin-prefix-calculadora>",
  "intro": "200-400 chars, español Colombia. Markdown light: **bold**.",
  "keyTakeaway": "One-liner cifras concretas (>=80 chars con números MXN/\$).",
  "useCases": ["caso 1", ...],                    # 4-6 items
  "fields": [...],                                # mismos `id` snake_case en TS
  "outputs": [...],
  "explanation": "## Cómo se calcula (markdown 1500-3000 chars con ## Fórmula, ## Ejemplo, tabla, ## Limitaciones).",
  "faq": [...],                                   # 7-10 preguntas concretas Colombia
  "sources": [                                    # 2-5 fuentes oficiales reales Colombia
    {"name": "DIAN - Renta", "url": "https://www.dian.gov.co/...", "publisher": "DIAN", "date": "2026"}
  ],
  "dataUpdate": {
    "frequency": "yearly|biannual|monthly|never",
    "lastUpdated": "2026-04-28",
    "source": "Nombre fuente",
    "sourceUrl": "https://...",
    "updateType": "manual",
    "notes": "Qué se actualiza"
  },
  "lastReviewed": "2026-04-28"
}
```

# TypeScript

```typescript
export interface Inputs { /* mismos id que fields */ }
export interface Outputs { /* mismos id que outputs */ }
export function compute(i: Inputs): Outputs {
  // lógica con constantes 2026 Colombia nombradas + comentario fuente
  // mensajes en strings TS en español de Colombia
  // returns con defaults sensatos, no throws
}
```

Solo standard library, sin imports externos.

# Output esperado

EXCLUSIVAMENTE JSON válido (sin markdown wrapper):

```
{ "json": { ...spec... }, "formula_ts": "// código TS escapado con \\n y \\\"" }
```"""


def load_state():
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text())
        except: pass
    return {"completed": [], "errors": {}}


def save_state(s): STATE_FILE.write_text(json.dumps(s, indent=2, ensure_ascii=False))


async def generate_one(client, spec, sem):
    slug = spec["slug"]
    user = (
        f"IMPORTANTE: español de España. Datos DIAN/IRPF 2026.\n\n"
        f"slug: {slug}\n"
        f"h1: {spec['h1']}\n"
        f"category: {spec['category']}\n"
        f"audience: CO\n"
        f"icon: {spec['icon']}\n"
        f"brief: {spec['brief']}\n\n"
        f"Devolvé solo JSON con `json` y `formula_ts`. TODO en español Colombia."
    )
    async with sem:
        try:
            r = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=[{"type":"text","text":SYSTEM_PROMPT,"cache_control":{"type":"ephemeral"}}],
                messages=[{"role":"user","content":user}],
            )
        except Exception as e:
            return slug, None, f"api: {type(e).__name__}: {e}"

    text = next((b.text for b in r.content if b.type == "text"), None)
    if not text: return slug, None, "no text"
    s = text.strip()
    if s.startswith("```"):
        lines = s.split("\n")
        if lines[0].startswith("```"): lines = lines[1:]
        if lines and lines[-1].strip() == "```": lines = lines[:-1]
        s = "\n".join(lines)
    try: parsed = json.loads(s)
    except json.JSONDecodeError as e: return slug, None, f"json: {e} | head: {s[:150]}"
    if "json" not in parsed or "formula_ts" not in parsed:
        return slug, None, f"missing keys: {list(parsed.keys())}"
    print(f"  ✓ {slug} out={r.usage.output_tokens}", file=sys.stderr)
    return slug, parsed, None


def write_calc(slug, data):
    cj = data["json"]
    cj["slug"] = slug
    cj["audience"] = "CO"
    fid = slug.removeprefix("calculadora-")
    cj["formulaId"] = fid
    cj.setdefault("lastReviewed", "2026-04-28")
    CALCS_DIR.mkdir(parents=True, exist_ok=True)
    (CALCS_DIR / f"{slug}.json").write_text(json.dumps(cj, ensure_ascii=False, indent=2) + "\n")
    (FORMULAS_DIR / f"{fid}.ts").write_text(data["formula_ts"].rstrip() + "\n")


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--concurrency", type=int, default=10)
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        ef = ROOT/".env"
        if ef.exists():
            for l in ef.read_text().splitlines():
                if l.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"] = l.split("=",1)[1].strip().strip('"')

    specs = json.loads(SPECS_FILE.read_text())
    if args.limit: specs = specs[:args.limit]
    state = load_state()
    if args.resume:
        done = set(state.get("completed", []))
        specs = [s for s in specs if s["slug"] not in done]
        print(f"[resume] saltando {len(done)}, quedan {len(specs)}", file=sys.stderr)
    if not specs:
        print("Nada para generar.", file=sys.stderr); return

    print(f"[batch-colombia] {len(specs)} calcs con {MODEL}, conc={args.concurrency}", file=sys.stderr)
    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [generate_one(client, s, sem) for s in specs]
    ok = err = 0
    for fut in asyncio.as_completed(tasks):
        slug, parsed, e = await fut
        if e:
            err += 1; state["errors"][slug] = e
            print(f"  ✗ {slug}: {e}", file=sys.stderr)
        else:
            try:
                write_calc(slug, parsed)
                state["completed"].append(slug)
                state["completed"] = list(dict.fromkeys(state["completed"]))
                ok += 1
                save_state(state)
            except Exception as ex:
                err += 1; state["errors"][slug] = f"write: {ex}"
                print(f"  ✗ {slug}: write {ex}", file=sys.stderr)
    save_state(state)
    print(f"\n[batch-colombia] done: {ok} ok / {err} err", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
