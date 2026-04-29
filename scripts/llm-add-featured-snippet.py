#!/usr/bin/env python3
"""
Para cada calc Haiku-generated SIN featured snippet block, genera un bloque
"## ¿Qué es X?" (40-60 palabras) y lo prepende al explanation.

Detección: explanation NO tiene "## ¿Qué es" / "## What is" / "## O que" en
los primeros 400 chars.

Modelo: Haiku 4.5. Costo estimado: ~$0.003/calc × 446 = ~$1.50.

Uso:
  python3 scripts/llm-add-featured-snippet.py
  python3 scripts/llm-add-featured-snippet.py --limit 5  # smoke test
  python3 scripts/llm-add-featured-snippet.py --resume
"""
import argparse, asyncio, json, os, sys
from pathlib import Path
import anthropic

ROOT = Path(__file__).resolve().parent.parent
STATE_FILE = ROOT / "scripts" / ".batch-snippet-state.json"

LANG_DIRS = {
    'calcs': 'es-AR',
    'calcs-es': 'es-ES',
    'calcs-mx': 'es-MX',
    'calcs-co': 'es-CO',
    'calcs-cl': 'es-CL',
    'calcs-en': 'en',
    'calcs-pt': 'pt-BR',
}

MODEL = "claude-haiku-4-5"
MAX_TOKENS = 400

SYSTEM = """Sos un SEO copywriter especialista en featured snippets de Google.

Tu tarea: dado el contexto de una calculadora, generás UN bloque markdown
"## ¿Qué es X?" optimizado para que Google lo levante como featured snippet
(posición 0).

# Reglas

- Idioma: el user te indica `lang`. TODO el output en ese idioma:
  - es-AR/MX/ES/CO/CL: "## ¿Qué es ..."
  - en: "## What is ..."
  - pt-BR: "## O que é ..."
- Longitud respuesta: 40-60 palabras (NO menos, NO más).
- Estructura óptima:
  1. Definición clara en 1 oración (subject + verb + qué es)
  2. Cifra concreta o dato específico (porcentaje, fórmula simple, ejemplo)
  3. Una oración corta que cierre y ancle el concepto
- Tono: directo, técnicamente preciso, sin marketing fluff.
- NO usar "esta calculadora", NO referenciar la app. Hablar del CONCEPTO.
- NO incluir links ni emojis.

# Output

Devolvé EXCLUSIVAMENTE este formato (sin texto extra antes/después):

```
## ¿Qué es {concepto}?

{respuesta de 40-60 palabras}
```

(Para EN: "## What is X?", para PT: "## O que é X?")

Sin meta-comentarios, sin "Aquí está", sin "Espero que sirva". Solo el bloque."""


def load_state():
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text())
        except: pass
    return {"completed": [], "errors": {}}


def save_state(s): STATE_FILE.write_text(json.dumps(s, indent=2, ensure_ascii=False))


def needs_snippet(data):
    expl = data.get('explanation','') or ''
    head = expl[:400]
    if '## ¿Qué' in head: return False
    if '## What is' in head: return False
    if '## O que' in head: return False
    return True


async def gen_snippet(client, ctx, sem):
    slug = ctx['slug']
    user = (
        f"lang: {ctx['lang']}\n"
        f"slug: {slug}\n"
        f"category: {ctx.get('category','')}\n"
        f"h1: {ctx.get('h1','')}\n"
        f"description: {(ctx.get('description') or '')[:200]}\n"
        f"intro: {(ctx.get('intro') or '')[:300]}\n"
        f"keyTakeaway: {ctx.get('keyTakeaway','')}\n\n"
        f"Generá el bloque featured snippet en {ctx['lang']}."
    )
    async with sem:
        try:
            r = await client.messages.create(
                model=MODEL,
                max_tokens=MAX_TOKENS,
                system=[{"type":"text","text":SYSTEM,"cache_control":{"type":"ephemeral"}}],
                messages=[{"role":"user","content":user}],
            )
        except Exception as e:
            return slug, None, f"api: {type(e).__name__}: {e}"
    text = next((b.text for b in r.content if b.type=="text"), "").strip()
    # Strip markdown code fence wrapper if present
    if text.startswith('```'):
        lines = text.split('\n')
        if lines[0].startswith('```'): lines = lines[1:]
        if lines and lines[-1].strip() == '```': lines = lines[:-1]
        text = '\n'.join(lines).strip()
    if not text or not text.startswith('## '):
        return slug, None, f"invalid format: {text[:80]}"
    return slug, text, None


def find_haiku_calcs():
    """Identifica las calcs candidatas: las generadas por Haiku según specs files,
    QUE además no tienen featured snippet."""
    haiku_slugs = set()
    for spec_file in ['scripts/calcs-global-100-specs.json',
                      'scripts/calcs-spain-30-specs.json',
                      'scripts/calcs-spain-extra-specs.json',
                      'scripts/calcs-mexico-specs.json',
                      'scripts/calcs-colombia-specs.json',
                      'scripts/calcs-chile-specs.json',
                      'scripts/calcs-gsc-gaps-specs.json']:
        p = ROOT / spec_file
        if p.exists():
            for s in json.loads(p.read_text()):
                haiku_slugs.add(s['slug'])

    candidates = []
    for d, lang in LANG_DIRS.items():
        base = ROOT / 'src' / 'content' / d
        if not base.exists(): continue
        for f in base.iterdir():
            if not f.suffix == '.json': continue
            try: data = json.loads(f.read_text())
            except: continue
            slug = data.get('slug','')
            if slug not in haiku_slugs: continue
            if not needs_snippet(data): continue
            candidates.append({
                'path': str(f),
                'slug': slug,
                'lang': lang,
                'category': data.get('category',''),
                'h1': data.get('h1',''),
                'description': data.get('description',''),
                'intro': data.get('intro',''),
                'keyTakeaway': data.get('keyTakeaway',''),
            })
    return candidates


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--limit", type=int)
    ap.add_argument("--resume", action="store_true")
    ap.add_argument("--concurrency", type=int, default=10)
    args = ap.parse_args()

    if not os.environ.get("ANTHROPIC_API_KEY"):
        ef = ROOT / ".env"
        if ef.exists():
            for l in ef.read_text().splitlines():
                if l.startswith("ANTHROPIC_API_KEY="):
                    os.environ["ANTHROPIC_API_KEY"] = l.split("=",1)[1].strip().strip('"')

    candidates = find_haiku_calcs()
    print(f"[snippet] found {len(candidates)} Haiku calcs needing snippet", file=sys.stderr)
    if args.limit:
        candidates = candidates[:args.limit]

    state = load_state()
    if args.resume:
        done = set(state.get("completed", []))
        candidates = [c for c in candidates if c['slug'] not in done]
        print(f"[resume] saltando {len(done)}, quedan {len(candidates)}", file=sys.stderr)
    if not candidates:
        print("Nada para hacer.", file=sys.stderr); return

    print(f"[snippet] processing {len(candidates)} calcs with {MODEL} conc={args.concurrency}", file=sys.stderr)
    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [gen_snippet(client, c, sem) for c in candidates]

    by_slug = {c['slug']: c for c in candidates}
    ok = err = 0
    for fut in asyncio.as_completed(tasks):
        slug, snippet, e = await fut
        if e:
            err += 1
            state["errors"][slug] = e
            print(f"  ✗ {slug}: {e}", file=sys.stderr)
            continue
        try:
            ctx = by_slug[slug]
            data = json.loads(Path(ctx['path']).read_text())
            expl = data.get('explanation','') or ''
            data['explanation'] = snippet.rstrip() + '\n\n' + expl.lstrip()
            Path(ctx['path']).write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n')
            state["completed"].append(slug)
            state["completed"] = list(dict.fromkeys(state["completed"]))
            ok += 1
            save_state(state)
            if ok % 50 == 0:
                print(f"  ✓ {ok} done", file=sys.stderr)
        except Exception as ex:
            err += 1
            state["errors"][slug] = f"write: {ex}"
            print(f"  ✗ {slug}: write {ex}", file=sys.stderr)

    save_state(state)
    print(f"\n[snippet] done — ok={ok} err={err}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
