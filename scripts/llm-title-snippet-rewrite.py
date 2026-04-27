#!/usr/bin/env python3
"""
Para una lista de calcs (slugs), reescribe en una sola call LLM:
  - title (SEO-tuned, click-bait sin clickbaiteo)
  - description (meta description 120-160 chars)
  - H2 "¿Qué es X?" con respuesta de 40-60 palabras al inicio del explanation
    (si no existe ya).

Modelo: claude-haiku-4-5 (más barato, output relativamente corto).
Output esperado por calc: ~600 tokens. Costo 100 calcs: ~$0.30.

Uso:
  python3 scripts/llm-title-snippet-rewrite.py --from-file slugs.txt
  python3 scripts/llm-title-snippet-rewrite.py --slugs slug1 slug2
  python3 scripts/llm-title-snippet-rewrite.py --top 20  # primeras 20 del sitemap-priority
"""
import argparse
import asyncio
import json
import os
import re
import sys
from pathlib import Path

import anthropic

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / "src" / "content" / "calcs"
# También buscar en calcs locale (para fix EN/PT/MX titles)
LOCALE_DIRS = [
    ROOT / "src" / "content" / "calcs-en",
    ROOT / "src" / "content" / "calcs-pt",
    ROOT / "src" / "content" / "calcs-mx",
    ROOT / "src" / "content" / "calcs-co",
    ROOT / "src" / "content" / "calcs-cl",
    ROOT / "src" / "content" / "calcs-es",
]
MODEL = "claude-haiku-4-5"
MAX_TOKENS = 1500

SYSTEM_PROMPT = """Sos un SEO copywriter para hacecuentas.com.
Tu trabajo: optimizar title, meta description y agregar un featured-snippet block
("¿Qué es X?" con respuesta corta) a una calc existente.

# REGLA CRÍTICA: idioma

El user te va a indicar el `lang` de la calc. **TODO el output debe estar en
ese idioma**. NO mezcles idiomas:
- `lang=es-AR` → todo en español argentino (vos, fórmulas con "$", referencias AFIP/ANSES)
- `lang=es` → español neutro (tú/usted, tono LATAM)
- `lang=en` → todo en inglés (you, $, IRS/USD references si aplica)
- `lang=pt-BR` → todo en portugués brasileño
- `lang=es-MX` → español México (tú, tono MX, SAT references)

# Reglas comunes

**Title** (≤ 70 chars, en este orden):
- Empieza con la palabra clave principal en el idioma correcto.
- Incluye cifra concreta cuando aplique.
- Año "2026" obligatorio si la calc tiene datos vigentes.
- Termina con " | Hacé Cuentas".

**Meta description** (120-160 chars):
- 1 frase que resume la utilidad concreta — **EN EL IDIOMA INDICADO**.
- Incluí 1-2 cifras o datos concretos (no genéricos).
- Empieza con verbo de acción en el idioma correcto:
  - es-AR: "Calculá...", "Estimá...", "Compará..."
  - es: "Calcula...", "Estima...", "Compara..."
  - en: "Calculate...", "Estimate...", "Compare..."
  - pt-BR: "Calcule...", "Estime...", "Compare..."
- Termina con call to action o beneficio.

**Featured snippet block** (markdown):
Formato exacto:
```
## ¿Qué es {concepto principal}?

{respuesta de 40-60 palabras, dirigida a aparecer en featured snippet de Google.
Definición clara + cifra concreta cuando aplique. Tono directo, sin marketing
fluff. Termina con una oración corta que ancle el concepto.}
```

# Output esperado

Devolvé EXCLUSIVAMENTE este JSON:

```
{
  "title": "...",
  "description": "...",
  "snippet_block": "## ¿Qué es ...?\\n\\n..."
}
```

Sin markdown wrapper. Sin texto extra antes/después."""


async def rewrite_one(client, calc_data: dict, sem: asyncio.Semaphore) -> dict | None:
    slug = calc_data['slug']
    # Detectar lang por path del archivo
    p = get_calc_path(slug)
    lang = 'es-AR'
    if p:
        if 'calcs-en' in str(p): lang = 'en'
        elif 'calcs-pt' in str(p): lang = 'pt-BR'
        elif 'calcs-mx' in str(p): lang = 'es-MX'
        elif 'calcs-co' in str(p): lang = 'es'
        elif 'calcs-cl' in str(p): lang = 'es'
        elif 'calcs-es' in str(p): lang = 'es'
    user = (
        f"lang: {lang}  (escribí TODO el output en este idioma)\n"
        f"slug: {slug}\n"
        f"category: {calc_data.get('category')}\n"
        f"audience: {calc_data.get('audience')}\n"
        f"h1 actual: {calc_data.get('h1')}\n"
        f"title actual: {calc_data.get('title')}\n"
        f"description actual: {calc_data.get('description')}\n"
        f"intro: {(calc_data.get('intro') or '')[:400]}\n"
        f"keyTakeaway: {calc_data.get('keyTakeaway')}\n\n"
        f"Reescribí title + description + agregá snippet block. JSON only. "
        f"Recordá: TODO en {lang}."
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
            return {"slug": slug, "error": str(e)[:200]}

    text = next((b.text for b in r.content if b.type == "text"), None)
    if not text:
        return {"slug": slug, "error": "no text"}

    stripped = text.strip()
    if stripped.startswith("```"):
        lines = stripped.split("\n")[1:]
        if lines and lines[-1].strip() == "```":
            lines = lines[:-1]
        stripped = "\n".join(lines)

    try:
        out = json.loads(stripped)
    except json.JSONDecodeError as e:
        return {"slug": slug, "error": f"parse: {e}"}

    if not all(k in out for k in ("title", "description", "snippet_block")):
        return {"slug": slug, "error": f"missing keys: {list(out.keys())}"}

    return {"slug": slug, "data": out, "usage": {"in": r.usage.input_tokens, "out": r.usage.output_tokens}}


_slug_to_path = None

def get_calc_path(slug: str) -> Path | None:
    """Convención mixta: archivos por formulaId o por slug. Buildeamos un index
    sobre src/content/calcs/ + todos los locales (calcs-en, calcs-pt, etc.)."""
    global _slug_to_path
    if _slug_to_path is None:
        _slug_to_path = {}
        all_dirs = [CALCS_DIR] + [d for d in LOCALE_DIRS if d.exists()]
        for cdir in all_dirs:
            for p in cdir.glob("*.json"):
                try:
                    d = json.loads(p.read_text())
                    if d.get('slug'):
                        _slug_to_path[d['slug']] = p
                except: pass
    return _slug_to_path.get(slug)


def apply_changes(slug: str, data: dict):
    p = get_calc_path(slug)
    if not p or not p.exists():
        return False
    d = json.loads(p.read_text())
    d['title'] = data['title']
    d['description'] = data['description']
    # Insertar snippet_block al inicio del explanation si no existe ya un "¿Qué es"
    expl = d.get('explanation') or ''
    if '¿Qué es' not in expl[:300] and 'Qué es ' not in expl[:200]:
        d['explanation'] = data['snippet_block'].rstrip() + '\n\n' + expl.lstrip()
    d['lastReviewed'] = '2026-04-27'
    p.write_text(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
    return True


async def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--from-file")
    ap.add_argument("--slugs", nargs="*")
    ap.add_argument("--top", type=int, help="Top N del sitemap-priority")
    ap.add_argument("--concurrency", type=int, default=6)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    slugs = []
    if args.from_file:
        slugs = [l.strip() for l in open(args.from_file) if l.strip()]
    elif args.slugs:
        slugs = args.slugs
    elif args.top:
        from xml.etree import ElementTree as ET
        NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
        tree = ET.parse(ROOT / 'public' / 'sitemap-priority.xml')
        urls = [el.text for el in tree.getroot().iter(f'{NS}loc')]
        for u in urls[: args.top]:
            slug = u.split('/')[-1]
            if slug:
                slugs.append(slug)

    if not slugs:
        print("No slugs", file=sys.stderr); sys.exit(2)

    if not os.environ.get('ANTHROPIC_API_KEY'):
        ef = ROOT / '.env'
        if ef.exists():
            for line in ef.read_text().splitlines():
                if line.startswith('ANTHROPIC_API_KEY='):
                    os.environ['ANTHROPIC_API_KEY'] = line.split('=', 1)[1].strip().strip('"')

    print(f"[rewrite] {len(slugs)} slugs (model={MODEL})", file=sys.stderr)

    # Cargar JSONs (lookup por slug, no por nombre de archivo)
    calcs = []
    for slug in slugs:
        p = get_calc_path(slug)
        if not p or not p.exists():
            print(f"  ! no existe: {slug}", file=sys.stderr)
            continue
        d = json.loads(p.read_text())
        d['slug'] = slug
        calcs.append(d)

    client = anthropic.AsyncAnthropic()
    sem = asyncio.Semaphore(args.concurrency)
    tasks = [rewrite_one(client, c, sem) for c in calcs]

    ok = err = 0
    total_in = total_out = 0
    for fut in asyncio.as_completed(tasks):
        r = await fut
        slug = r['slug']
        if 'error' in r:
            err += 1
            print(f"  ✗ {slug}: {r['error'][:100]}", file=sys.stderr)
            continue
        if args.dry_run:
            print(f"  ✓ {slug} (dry):", file=sys.stderr)
            print(f"    title: {r['data']['title']}", file=sys.stderr)
            print(f"    desc:  {r['data']['description']}", file=sys.stderr)
        else:
            applied = apply_changes(slug, r['data'])
            if applied:
                ok += 1
                if r.get('usage'):
                    total_in += r['usage']['in']
                    total_out += r['usage']['out']
                print(f"  ✓ {slug} (in={r['usage']['in']}, out={r['usage']['out']})", file=sys.stderr)
            else:
                err += 1

    print(f"\n[rewrite] {ok} ok / {err} errores", file=sys.stderr)
    cost = (total_in / 1_000_000 * 1.0) + (total_out / 1_000_000 * 5.0)  # haiku 4.5
    print(f"[rewrite] tokens: in={total_in}, out={total_out}, costo≈${cost:.3f}", file=sys.stderr)


if __name__ == "__main__":
    asyncio.run(main())
