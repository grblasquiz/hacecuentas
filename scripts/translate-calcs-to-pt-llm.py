#!/usr/bin/env python3
"""
Traduce 500 calcs ES → EN usando Claude Haiku 4.5 vía `claude -p` headless.
Usa la suscripción Claude Code (no API key separada necesaria).

Uso:
  python3 scripts/translate-calcs-to-en-llm.py --pilot 10       # test 10 calcs
  python3 scripts/translate-calcs-to-en-llm.py --target 500     # batch completo
  python3 scripts/translate-calcs-to-en-llm.py --resume         # solo las faltantes

Paralelismo: 5 workers (ajustable con --workers).
"""
import argparse, json, re, subprocess, sys, os
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
import time

# Unbuffered stdout
sys.stdout.reconfigure(line_buffering=True)

CALCS_ES = Path('src/content/calcs')
CALCS_EN = Path('src/content/calcs-pt')

UNIVERSAL_CATEGORIES = {
    'salud', 'deportes', 'matematica', 'ciencia', 'cocina',
    'mascotas', 'familia', 'construccion', 'tecnologia',
    'educacion', 'jardineria', 'automotor', 'medio-ambiente',
    'idiomas', 'entretenimiento', 'electronica', 'finanzas',
}

# Exclusiones: slugs específicos AR
SKIP_SLUG_KEYWORDS = [
    'argentina', 'afip', 'arca', 'anses', 'monotributo', 'uva-',
    'caba', 'buenos-aires', 'provincial', 'iibb', 'vtv', 'bcra',
    'mep', 'ccl', 'ripte', 'sube', 'galicia', 'santander', 'icl',
    '-ar-', 'pesos-argentinos', '-mexico', '-espana', '-chile',
    '-colombia', '-peru', '-uruguay', '-brasil',
]

TARGETS_PER_CAT = {
    'salud': 25, 'matematica': 15, 'finanzas': 12, 'cocina': 10,
    'deportes': 10, 'mascotas': 8, 'ciencia': 6, 'construccion': 6,
    'educacion': 3, 'tecnologia': 3, 'familia': 2,
}


def select_calcs(target_total):
    """Selecciona calcs ES candidatas a traducir."""
    # Skip ones ya existentes
    existing = set()
    for f in CALCS_EN.glob('*.json'):
        try:
            d = json.loads(f.read_text())
            if d.get('esSlug'):
                existing.add(d['esSlug'])
        except Exception:
            pass

    candidates = []
    for f in CALCS_ES.glob('*.json'):
        try:
            d = json.loads(f.read_text())
        except Exception:
            continue
        slug = d.get('slug', '')
        if d.get('audience') == 'AR':
            continue
        if any(k in slug.lower() for k in SKIP_SLUG_KEYWORDS):
            continue
        cat = d.get('category', '')
        if cat not in UNIVERSAL_CATEGORIES:
            continue
        if slug in existing:
            continue
        # Score: longitud de explanation como proxy de richness
        score = len(d.get('explanation', ''))
        candidates.append((score, cat, f, d))

    # Sort ASC by size (smaller calcs first — they're faster to translate).
    candidates.sort(key=lambda x: x[0])

    selected, per_cat = [], {}
    for score, cat, f, d in candidates:
        tgt = TARGETS_PER_CAT.get(cat, 5)
        per_cat.setdefault(cat, 0)
        if per_cat[cat] >= tgt:
            continue
        selected.append((cat, f, d))
        per_cat[cat] += 1
        if len(selected) >= target_total:
            break

    return selected, per_cat


PROMPT_TEMPLATE = """You are translating a calculator website page from Argentine Spanish to Portuguese, optimized for search engine ranking in Brazil AND Portugal.

INPUT JSON (source Spanish calculator):
{input_json}

RULES:
1. Output ONLY valid JSON. No markdown fences, no commentary, no preamble. First char "{{" and last "}}".
2. PRESERVE EXACTLY (copy as-is, case-sensitive):
   - formulaId (this is a code key, math stays same)
   - category (internal taxonomy)
   - icon
   - Every "id" field inside fields[] and outputs[] (they are programmatic keys)
   - sources[] (academic/official URLs stay as-is; you may translate only the "name" if clearly ES)
   - Option "value" keys inside fields[].options[] (keep ES values like "perro", "gato" — ONLY translate the "label")
3. TRANSLATE to NEUTRAL Portuguese that works for BOTH Brazil and Portugal:
   - Use "você" (understood in both markets) NOT "tu"
   - Avoid Brazilian slang ("rolê", "massa", "beleza") AND Portugal-specific terms ("miúdo", "comboio")
   - Prefer standard vocabulary: "celular" (not "telemóvel"), "ônibus" OK but prefer neutral, "computador" OK
   - Use Brazilian spelling when it differs (-ção not -ção, both use the same here; "ação" same)
   - Unit metric (km, kg, m²) as in source
4. Natural translation (NOT word-for-word, use idiomatic SEO phrasing):
   - "title": max 62 chars total. End with " 2026 | Hacé Cuentas" OR " | Hacé Cuentas". Include a keyword users search in PT.
   - "h1": natural headline, usually different phrasing than title
   - "description": meta description, max 158 chars, compelling for CTR
   - "intro", "keyTakeaway", "useCases[]": natural, specific, with real numbers and examples
   - "explanation": natural Portuguese prose with proper headings (## and ###)
   - "faq[]": replace with 7-10 questions that REAL Portuguese speakers search (e.g., "quanto de água um cachorro deve beber", not translated Spanish questions)
   - fields[].label, fields[].help, fields[].options[].label: clear Portuguese labels
   - outputs[].label: concise Portuguese labels
   - example: translate title/steps/result to Portuguese
5. REPLACE seoKeywords with 8-14 PORTUGUESE keywords real users search in BR+PT (long-tail + short-tail mix).
6. ADD these fields:
   - "slug": remove "calculadora-" prefix from original Spanish slug, translate to Portuguese descriptive kebab-case (e.g., "calculadora-imc" → "imc-calculadora", "sueno-bebe-horas" → "sono-bebe-horas"). Keep SEO-friendly.
   - "esSlug": set to the original Spanish slug exactly as given (for hreflang alternate linking)
   - "audience": "global"
   - "relatedSlugs": []
7. Units: preserve metric as in source.
8. Don't hallucinate fields that didn't exist. Don't add optional ones not in input.
9. If a field is missing or empty in input, omit it from output (don't invent).

Original Spanish slug: {es_slug}

Output the JSON now (starts with {{):"""


def extract_json(text):
    """Extrae JSON del output de Claude (maneja fences, preamble)."""
    # Strip markdown fences
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```\s*$', '', text.strip())
    # Find first { and matching last }
    start = text.find('{')
    if start == -1:
        raise ValueError('No { found in output')
    # Count braces to find matching close
    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{':
            depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                return text[start:i+1]
    raise ValueError('Unbalanced braces')


def translate_one(calc_d, model='claude-haiku-4-5', timeout=300):
    """Llama a claude -p y devuelve el JSON traducido como dict."""
    # Trim unnecessary fields from input para ahorrar tokens
    payload = {k: v for k, v in calc_d.items() if k in (
        'slug', 'title', 'h1', 'description', 'category', 'icon', 'formulaId',
        'seoKeywords', 'intro', 'keyTakeaway', 'useCases', 'fields', 'outputs',
        'example', 'explanation', 'faq', 'sources', 'dataUpdate'
    )}
    prompt = PROMPT_TEMPLATE.format(
        input_json=json.dumps(payload, ensure_ascii=False, indent=2),
        es_slug=calc_d['slug'],
    )
    proc = subprocess.run(
        ['claude', '-p', '--model', model,
         '--tools', '',
         '--disable-slash-commands',
         '--setting-sources', ''],
        input=prompt,
        capture_output=True,
        text=True,
        timeout=timeout,
    )
    if proc.returncode != 0:
        raise RuntimeError(f'claude exited {proc.returncode}: {proc.stderr[:300]}')
    raw = proc.stdout
    json_str = extract_json(raw)
    return json.loads(json_str)


def validate(new_calc, orig):
    """Valida que el JSON traducido tenga campos clave y IDs preservados."""
    required = ['slug', 'title', 'h1', 'description', 'category', 'formulaId',
                'fields', 'outputs', 'esSlug']
    for r in required:
        if r not in new_calc:
            raise ValueError(f'Missing required field: {r}')
    # Fallback seoKeywords si faltaron
    if not new_calc.get('seoKeywords'):
        base = new_calc['h1'].lower()
        new_calc['seoKeywords'] = [
            base, f'{base} calculator', f'free {base} calculator',
            f'{base} online', f'calculate {base}',
        ]
    # Fallback relatedSlugs
    if 'relatedSlugs' not in new_calc:
        new_calc['relatedSlugs'] = []
    if 'audience' not in new_calc:
        new_calc['audience'] = 'global'
    if new_calc.get('formulaId') != orig.get('formulaId'):
        raise ValueError(f'formulaId changed: {orig.get("formulaId")} → {new_calc.get("formulaId")}')
    if new_calc.get('esSlug') != orig['slug']:
        raise ValueError(f'esSlug mismatch: {new_calc.get("esSlug")} vs {orig["slug"]}')
    # Verificar que los IDs de fields se preservaron
    orig_field_ids = {f.get('id') for f in orig.get('fields', []) if f.get('id')}
    new_field_ids = {f.get('id') for f in new_calc.get('fields', []) if f.get('id')}
    if orig_field_ids != new_field_ids:
        missing = orig_field_ids - new_field_ids
        extra = new_field_ids - orig_field_ids
        raise ValueError(f'Field IDs differ. Missing: {missing}. Extra: {extra}')
    # Same for outputs
    orig_out_ids = {o.get('id') for o in orig.get('outputs', []) if o.get('id')}
    new_out_ids = {o.get('id') for o in new_calc.get('outputs', []) if o.get('id')}
    if orig_out_ids != new_out_ids:
        raise ValueError(f'Output IDs differ')
    return True


def process_calc(cat, f, d, model, retries=2):
    """Procesa una calc con retries."""
    last_err = None
    for attempt in range(retries + 1):
        try:
            t0 = time.time()
            new_calc = translate_one(d, model=model)
            validate(new_calc, d)
            elapsed = time.time() - t0
            # Preservar dataUpdate si existía
            if 'dataUpdate' in d and 'dataUpdate' not in new_calc:
                new_calc['dataUpdate'] = d['dataUpdate']
            return ('ok', cat, d['slug'], new_calc, elapsed)
        except Exception as e:
            last_err = e
            if attempt < retries:
                time.sleep(2 ** attempt)
    return ('error', cat, d['slug'], str(last_err), 0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--target', type=int, default=500, help='total calcs a traducir')
    ap.add_argument('--pilot', type=int, help='modo piloto: solo N calcs')
    ap.add_argument('--workers', type=int, default=5, help='workers paralelos')
    ap.add_argument('--model', default='claude-haiku-4-5')
    ap.add_argument('--resume', action='store_true', help='skip ones already in calcs-en')
    args = ap.parse_args()

    target = args.pilot if args.pilot else args.target
    selected, per_cat = select_calcs(target)

    print(f'Seleccionadas {len(selected)} calcs:')
    for c, n in sorted(per_cat.items(), key=lambda x: -x[1]):
        print(f'  {c}: {n}')
    print(f'\nModelo: {args.model}  |  Workers: {args.workers}')
    print(f'Procesando...\n')

    ok, errors = 0, []
    t_start = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = [pool.submit(process_calc, cat, f, d, args.model) for cat, f, d in selected]
        for i, fut in enumerate(as_completed(futs), 1):
            status, cat, slug, payload, elapsed = fut.result()
            if status == 'ok':
                new_calc = payload
                en_slug = new_calc['slug']
                # Evitar colisiones
                out_file = CALCS_EN / f'{en_slug}.json'
                counter = 2
                while out_file.exists():
                    out_file = CALCS_EN / f'{en_slug}-{counter}.json'
                    counter += 1
                out_file.write_text(json.dumps(new_calc, ensure_ascii=False, indent=2))
                ok += 1
                rate = i / (time.time() - t_start)
                eta_s = (len(futs) - i) / rate if rate > 0 else 0
                print(f'[{i}/{len(futs)}] ✓ {slug} → {en_slug}  ({elapsed:.1f}s, ETA {eta_s/60:.1f}min)')
            else:
                errors.append((slug, payload))
                print(f'[{i}/{len(futs)}] ✗ {slug}: {str(payload)[:120]}')

    elapsed_total = time.time() - t_start
    print(f'\n{"="*60}')
    print(f'✓ {ok}/{len(selected)} traducidas en {elapsed_total/60:.1f} min')
    if errors:
        print(f'✗ {len(errors)} errores:')
        for slug, err in errors[:20]:
            print(f'   {slug}: {err[:150]}')


if __name__ == '__main__':
    main()
