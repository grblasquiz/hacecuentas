#!/usr/bin/env python3
"""
Genera comparadores binarios/ternarios en src/content/comparaciones/ vía LLM.
Sigue el schema del template /comparar/[slug].astro.

Modelo: claude-sonnet-4-6 (output rico ~3K tokens).
Input: scripts/comparaciones-30-specs.json
Output: src/content/comparaciones/{slug}.json + state file

Costo estimado: 30 × 3K out × $15/M = $1.35 + ~$0.10 input.

Uso:
  python3 scripts/llm-comparaciones-batch.py --limit 3   # smoke test
  python3 scripts/llm-comparaciones-batch.py --resume    # solo faltantes
"""
import argparse
import asyncio
import json
import os
import sys
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parent.parent
SPECS = ROOT / "scripts" / "comparaciones-30-specs.json"
OUT_DIR = ROOT / "src" / "content" / "comparaciones"
STATE = ROOT / "scripts" / ".comparaciones-state.json"
MODEL = "claude-sonnet-4-6"
MAX_TOKENS = 16000

SYSTEM_PROMPT = """Sos un generador de páginas comparativas para hacecuentas.com.
Tu trabajo: producir un JSON con la comparativa de 2-4 opciones siguiendo
el schema exacto del template /comparar/[slug].astro.

# Reglas

- Audiencia AR cuando audience='AR', es neutro cuando 'global'.
- Datos vigentes 2026 (precios, alícuotas, tasas).
- Tono claro, objetivo, sin marketing fluff.
- Cada opción tiene pros/cons balanceados (3-5 cada uno) — NO favorecer.
- Tabla comparativa con métricas concretas (cifras, %, $).
- Verdict honesto al final: "depende del perfil". No decir "X es el mejor"
  salvo que sea objetivamente verdad.

# Schema JSON exacto

```json
{
  "slug": "<spec-slug>",
  "title": "<title 50-70 chars con año 2026 + | Hacé Cuentas>",
  "description": "<meta description 120-160 chars, con cifras concretas>",
  "seoKeywords": ["kw1", "kw2", ...],  // 6-10 long-tail
  "category": "<spec-category>",
  "heroEmoji": "<1 emoji>",
  "intro": "<2-3 párrafos HTML con <strong> tags. 400-600 chars total.>",
  "options": [
    {
      "name": "<nombre de la opción>",
      "icon": "<emoji>",
      "color": "<hex>",  // #2563eb, #16a34a, #ea580c, #9333ea para 4 opciones
      "pros": ["<pro 1>", "<pro 2>", "<pro 3>", "<pro 4>"],
      "cons": ["<con 1>", "<con 2>", "<con 3>", "<con 4>"],
      "bestFor": "<1 oración: para quién es ideal>",
      "metrics": {
        "<métrica 1>": "<valor concreto>",
        "<métrica 2>": "<valor>",
        "<métrica 3>": "<valor>",
        "<métrica 4>": "<valor>",
        "<métrica 5>": "<valor>",
        "<métrica 6>": "<valor>"
      }
    }
    // 2-4 options según spec
  ],
  "comparisonTable": {
    "headers": ["Criterio", "<Opción 1>", "<Opción 2>", "<Opción N>"],
    "rows": [
      ["<criterio>", "<valor A>", "<valor B>", "<valor C>"],
      // 6-10 rows con criterios distintos
    ]
  },
  "verdict": "<3-4 párrafos HTML con la conclusión final, who-should-pick-what. Termina con call to action implícito a una calc relacionada.>",
  "content": "<contenido extra HTML 800-1500 chars: cuándo NO conviene cada opción, errores típicos, contexto regulatorio AR si aplica.>",
  "relatedCalcs": ["<slug-existente-1>", "<slug-existente-2>", "<slug-existente-3>"],
  "faq": [
    {"q": "<pregunta>", "a": "<respuesta 200-400 chars con cifras>"}
    // 5-7 FAQs
  ],
  "sources": [
    {"name": "<fuente>", "url": "<URL real oficial>", "publisher": "<organismo>", "date": "2026"}
  ]
}
```

# Output esperado

JSON exclusivo, sin wrapper de markdown, sin texto antes/después."""


async def gen_one(client, spec, sem):
    slug = spec["slug"]
    user = (
        f"Spec:\n"
        f"  slug: {slug}\n"
        f"  title_hint: {spec['title_hint']}\n"
        f"  category: {spec['category']}\n"
        f"  audience: {spec['audience']}\n"
        f"  options: {spec['options']}\n"
        f"  brief: {spec['brief']}\n\n"
        f"Devolvé JSON exclusivo siguiendo el schema."
    )
    async with sem:
        try:
            r = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
                messages=[{"role": "user", "content": user}],
            )
        except Exception as e:
            return slug, None, f"API: {e}"

    text = next((b.text for b in r.content if b.type == "text"), None)
    if not text: return slug, None, "no text"

    s = text.strip()
    if s.startswith("```"):
        lines = s.split("\n")[1:]
        if lines and lines[-1].strip() == "```": lines = lines[:-1]
        s = "\n".join(lines)

    try:
        return slug, json.loads(s), None
    except json.JSONDecodeError as e:
        return slug, None, f"parse: {e}"


def write_one(spec, data):
    out = OUT_DIR / f"{spec['slug']}.json"
    # Forzar slug consistencia
    data["slug"] = spec["slug"]
    out.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def load_state():
    if STATE.exists():
        try: return json.loads(STATE.read_text())
        except: pass
    return {"completed": [], "errors": {}}


def save_state(s):
    STATE.write_text(json.dumps(s, indent=2, ensure_ascii=False))


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--concurrency", type=int, default=5)
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        env = ROOT / ".env"
        if env.exists():
            for line in env.read_text().splitlines():
                if line.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"] = line.split("=", 1)[1].strip().strip('"')

    specs = json.loads(SPECS.read_text())
    if args.limit: specs = specs[: args.limit]

    state = load_state()
    if args.resume:
        done = set(state["completed"])
        specs = [s for s in specs if s["slug"] not in done]
        print(f"[resume] saltando {len(done)} hechas; quedan {len(specs)}", file=sys.stderr)

    if not specs:
        print("Nada por hacer", file=sys.stderr); return

    print(f"[batch] {len(specs)} comparaciones, model={MODEL}, conc={args.concurrency}", file=sys.stderr)
    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [gen_one(client, s, sem) for s in specs]
    spec_by_slug = {s["slug"]: s for s in specs}

    ok = err = 0
    for fut in asyncio.as_completed(tasks):
        slug, data, e = await fut
        if e or not data:
            err += 1
            state["errors"][slug] = e or "no data"
            print(f"  ✗ {slug}: {e}", file=sys.stderr)
        else:
            try:
                write_one(spec_by_slug[slug], data)
                state["completed"].append(slug)
                state["completed"] = list(dict.fromkeys(state["completed"]))
                save_state(state)
                ok += 1
                print(f"  ✓ {slug}", file=sys.stderr)
            except Exception as e2:
                err += 1
                state["errors"][slug] = f"write: {e2}"
                print(f"  ✗ {slug}: write {e2}", file=sys.stderr)

    save_state(state)
    print(f"\n[batch] done — {ok} ok / {err} err", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
