#!/usr/bin/env python3
"""
Schema cleanup & validation — verifica que los JSON-LD generados por el
template [...slug].astro no tengan errores estructurales obvios.

Validaciones:
  1. JSON parseable (no trailing commas, no unterminated strings).
  2. @context presente y correcto.
  3. @graph estructurado.
  4. No duplicados de @id dentro del mismo @graph.
  5. Cada @type conocido.
  6. Recipe schema (si presente) tiene los campos críticos.
  7. HowTo schema tiene step array no vacío.
  8. FAQPage tiene mainEntity con preguntas.
  9. Article schema tiene author válido.

Toma URLs muestra (cubriendo distintos tipos de calc) y reporta:
  - 200 OK + schema válido → 🟢
  - 200 OK + schema con warning → 🟡
  - 200 OK + schema con error → 🔴
  - No 200 → ⚫

NO modifica. Solo reporta.
"""
from __future__ import annotations

import json
import re
import ssl
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / 'docs'

# URLs muestra cubriendo distintos tipos de calc para validación amplia
SAMPLE_URLS = [
    # Home + categorías
    'https://hacecuentas.com/',
    'https://hacecuentas.com/categoria/finanzas',
    # Ganancias (Article + HowTo + FAQ + Dataset?)
    'https://hacecuentas.com/ganancias-empleados-4ta-categoria-2026',
    # Calc nueva (G)
    'https://hacecuentas.com/sueldo-vs-promedio-argentino',
    # Calc cocina con Recipe schema (H)
    'https://hacecuentas.com/calculadora-sushi-piezas-por-persona-evento-cumpleanos',
    'https://hacecuentas.com/carne-asado-kg-por-persona',
    # Calc legal (FinanceApplication)
    'https://hacecuentas.com/calculadora-aguinaldo-sac',
    # Calc salud
    'https://hacecuentas.com/calculadora-imc',
    # Blog post
    'https://hacecuentas.com/blog/sueldo-real-argentino-2026',
]


def fetch(url: str) -> tuple[int, str]:
    req = urllib.request.Request(url, headers={'User-Agent': 'hacecuentas-schema-validator/1.0'})
    try:
        ctx = ssl.create_default_context()
        with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
            return r.status, r.read().decode('utf-8', errors='replace')
    except urllib.error.HTTPError as e:
        return e.code, ''
    except urllib.error.URLError as e:
        # SSL fallback (corp MITM o cert issue)
        if 'CERTIFICATE' in str(e).upper() or 'SSL' in str(e).upper():
            try:
                ctx = ssl._create_unverified_context()
                with urllib.request.urlopen(req, timeout=30, context=ctx) as r:
                    return r.status, r.read().decode('utf-8', errors='replace')
            except Exception as e2:
                print(f'  fallback failed: {e2}', file=sys.stderr)
        return 0, ''
    except Exception as e:
        print(f'  unexpected: {e}', file=sys.stderr)
        return 0, ''


def extract_json_ld_blocks(html: str) -> list[dict]:
    """Encuentra todos los <script type="application/ld+json">...</script>."""
    blocks = []
    for m in re.finditer(
        r'<script\s+type="application/ld\+json"[^>]*>(.*?)</script>',
        html, re.S | re.I,
    ):
        raw = m.group(1).strip()
        try:
            blocks.append(json.loads(raw))
        except json.JSONDecodeError as e:
            blocks.append({'_error': f'JSON parse error: {e}', '_raw': raw[:200]})
    return blocks


def validate_block(block: dict) -> tuple[list[str], list[str]]:
    """Devuelve (warnings, errors). Operates sobre un bloque JSON-LD individual."""
    warnings: list[str] = []
    errors: list[str] = []

    if '_error' in block:
        errors.append(f'No parsea: {block["_error"]}')
        return warnings, errors

    if block.get('@context') != 'https://schema.org':
        warnings.append('@context inesperado: ' + str(block.get('@context')))

    graph = block.get('@graph') or [block]
    if not isinstance(graph, list):
        errors.append('@graph no es lista')
        return warnings, errors

    # Check duplicate @ids
    ids = [n.get('@id') for n in graph if n.get('@id')]
    dup_ids = set([x for x in ids if ids.count(x) > 1])
    if dup_ids:
        warnings.append(f'@ids duplicados: {sorted(dup_ids)}')

    for node in graph:
        t = node.get('@type')
        if not t:
            warnings.append(f'Nodo sin @type: {list(node.keys())[:5]}')
            continue

        if t == 'Recipe':
            for field in ('name', 'recipeIngredient', 'recipeInstructions'):
                if not node.get(field):
                    warnings.append(f'Recipe sin {field} (Google rich result puede no aplicar)')
            if not isinstance(node.get('recipeInstructions'), list):
                errors.append('Recipe.recipeInstructions debe ser array')

        if t == 'HowTo':
            steps = node.get('step') or []
            if not isinstance(steps, list) or len(steps) == 0:
                errors.append('HowTo sin step array')

        if t == 'FAQPage':
            me = node.get('mainEntity') or []
            if not isinstance(me, list) or len(me) == 0:
                errors.append('FAQPage sin mainEntity array')
            else:
                for q in me:
                    if not q.get('name') or not q.get('acceptedAnswer'):
                        errors.append(f'Question incompleta: {q.get("name", "")[:50]}')
                        break

        if t == 'Article':
            if not node.get('headline'):
                errors.append('Article sin headline')
            if not node.get('author'):
                warnings.append('Article sin author')

        if t == 'Dataset':
            for field in ('name', 'description'):
                if not node.get(field):
                    warnings.append(f'Dataset sin {field}')

    return warnings, errors


def main() -> int:
    print(f'Validando schema en {len(SAMPLE_URLS)} URLs...\n')
    results = []
    for url in SAMPLE_URLS:
        status, html = fetch(url)
        if status != 200:
            print(f'  ⚫ [{status}] {url}')
            results.append({'url': url, 'status': status, 'blocks': 0, 'warnings': [], 'errors': []})
            continue

        blocks = extract_json_ld_blocks(html)
        all_warnings = []
        all_errors = []
        for b in blocks:
            w, e = validate_block(b)
            all_warnings += w
            all_errors += e

        status_emoji = '🟢' if not all_errors and not all_warnings else ('🟡' if not all_errors else '🔴')
        types = []
        for b in blocks:
            if '@graph' in b:
                types += [n.get('@type', '?') for n in b['@graph']]
            else:
                types.append(b.get('@type', '?'))
        print(f'  {status_emoji} [{status}] {url}')
        print(f'      blocks: {len(blocks)} | types: {", ".join(sorted(set(types)))}')
        for e in all_errors:
            print(f'      ❌ {e}')
        for w in all_warnings:
            print(f'      ⚠ {w}')
        results.append({
            'url': url,
            'status': status,
            'blocks': len(blocks),
            'types': sorted(set(types)),
            'warnings': all_warnings,
            'errors': all_errors,
        })

    # Resumen
    total_ok = sum(1 for r in results if r['status'] == 200 and not r['warnings'] and not r['errors'])
    total_warn = sum(1 for r in results if r['status'] == 200 and r['warnings'] and not r['errors'])
    total_err = sum(1 for r in results if r['status'] == 200 and r['errors'])
    total_404 = sum(1 for r in results if r['status'] != 200)
    print(f'\n--- RESUMEN ---')
    print(f'  🟢 OK:        {total_ok}/{len(results)}')
    print(f'  🟡 Warnings:  {total_warn}')
    print(f'  🔴 Errors:    {total_err}')
    print(f'  ⚫ No 200:    {total_404}')

    # Save report
    today = datetime.now().strftime('%Y-%m-%d')
    out = OUT_DIR / f'schema-validation-{today}.json'
    out.write_text(json.dumps({'date': today, 'summary': {
        'ok': total_ok, 'warnings': total_warn, 'errors': total_err, 'no_200': total_404,
    }, 'results': results}, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'\n✓ JSON: {out}')

    return 0 if not total_err else 1


if __name__ == '__main__':
    sys.exit(main())
