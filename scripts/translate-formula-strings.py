#!/usr/bin/env python3
"""
Traduce strings ES de las 157 fórmulas usadas por calcs EN.
Output: src/lib/formula-strings-i18n.json con { formulaId: { esString: enString } }

Haiku 4.5 via `claude -p` headless (suscripción Claude Code, sin costo extra).
"""
import argparse, json, re, subprocess, sys, time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

sys.stdout.reconfigure(line_buffering=True)

ROOT = Path('.')
FORMULAS_DIR = ROOT / 'src/lib/formulas'
CALCS_EN_DIR = ROOT / 'src/content/calcs-en'
OUT_FILE = ROOT / 'src/lib/formula-strings-i18n.json'


def get_en_formula_files():
    """Devuelve lista de (formulaId, archivo.ts path) para fórmulas usadas por calcs EN."""
    en_fids = set()
    for f in CALCS_EN_DIR.glob('*.json'):
        try:
            d = json.loads(f.read_text())
            fid = d.get('formulaId')
            if fid: en_fids.add(fid)
        except Exception:
            pass

    idx = (FORMULAS_DIR / 'index.ts').read_text()
    fid_to_fn = {}
    for m in re.finditer(r"'([a-z0-9-]+)':\s*([a-zA-Z0-9_]+)", idx):
        fid_to_fn[m.group(1)] = m.group(2)
    imports = {}
    for m in re.finditer(r"import\s*\{\s*([a-zA-Z0-9_]+)\s*\}\s*from\s*'\./([a-z0-9-]+)'", idx):
        imports[m.group(1)] = m.group(2)

    result = []
    for fid in sorted(en_fids):
        fn = fid_to_fn.get(fid)
        if not fn: continue
        fname = imports.get(fn)
        if not fname: continue
        fpath = FORMULAS_DIR / f'{fname}.ts'
        if not fpath.exists(): continue
        result.append((fid, fpath))
    return result


def extract_es_strings(ts_content):
    """Extrae strings ES únicas del contenido .ts de una fórmula.
    Detecta: accentos, palabras clave ES comunes, evita código.
    """
    # Match 'quoted strings' (single or double or backtick non-template parts)
    strings = set()
    # Strings con single quotes (no backslash-quote escapes por simplicidad)
    for m in re.finditer(r"'([^'\\\n]{2,200})'", ts_content):
        strings.add(m.group(1))
    # Double-quoted
    for m in re.finditer(r'"([^"\\\n]{2,200})"', ts_content):
        strings.add(m.group(1))
    # Filter to likely Spanish text
    es_strings = set()
    spanish_indicator = re.compile(
        r'[áéíóúñ¿¡]|\b(horas?|días?|meses?|años?|minutos?|segundos?|semanas?|siestas?|'
        r'personas?|hijos?|niños?|bebés?|adultos?|invitados?|veces|por\s+día|por\s+semana|'
        r'por\s+mes|por\s+año|por\s+hora|por\s+persona|por\s+kg|normal|alto|bajo|grave|'
        r'peligros|cuida|reposo|recomend|saludable|ideal|moderad|intens|ligero|sedentari|'
        r'con\s|sin\s|muy\s|más\s|menos\s|entre\s|desde\s|hasta\s|mayor\s+a|menor\s+a|'
        r'ovulación|embarazo|embarazada|lactancia|menstrua|recién|nacido|'
        r'aceptable|recomendable|necesario|opcional|importante|urgente|leve|mínim|máxim|'
        r'diari|semanal|mensual|anual|muscular|hipertrofia|fuerza|resistencia|calorías|'
        r'gramos|litros|metros|centímetros|kilómetros|kilos|dormir|rutina|despertar)\b',
        re.IGNORECASE
    )
    for s in strings:
        s = s.strip()
        if len(s) < 2: continue
        # Skip obvious code artifacts + template literal fragments
        if any(x in s for x in ['=>', '===', '++', '//', '$ {', '${', '\\n', '`', '?.', '!==', '==', '&&', '||']): continue
        if any(c in s for c in ['{', '}']): continue  # brace indicates template literal fragment
        if s.startswith('http') or s.startswith('/'): continue
        # Skip numeric/unit only (no letters)
        if not re.search(r'[a-zA-ZáéíóúñÁÉÍÓÚÑ]', s): continue
        # Skip single English words (these are often ids/keys)
        if re.match(r'^[a-zA-Z_]+$', s): continue
        # Skip strings that look like partial code (start/end mid-expression)
        if s.startswith(')') or s.endswith('?') or s.endswith('('): continue
        if not spanish_indicator.search(s):
            continue
        es_strings.add(s)
    return sorted(es_strings)


PROMPT_TEMPLATE = """You are a professional translator. Translate the following Argentine Spanish strings (from a calculator website) to natural US English.

CONTEXT: formulaId = "{fid}". These strings are OUTPUT VALUES shown to users after they run the calculation (health, finance, cooking, etc).

RULES:
1. Output ONLY valid JSON. No preamble, no markdown fences. First char {{ and last }}.
2. Preserve numbers, units, and punctuation structure.
3. Natural idiomatic English (not word-for-word). "por día" → "per day", not "by day".
4. Keep the same level of formality/brevity.
5. If the string contains embedded numbers or measurements, preserve them EXACTLY.

INPUT (JSON array of Spanish strings):
{strings}

OUTPUT FORMAT (JSON object, key = original ES string, value = EN translation):
{{
  "original spanish string 1": "english translation 1",
  "original spanish string 2": "english translation 2"
}}

Translate now:"""


def extract_json_from_output(text):
    """Extrae JSON del output de Claude (maneja fences, preamble)."""
    text = re.sub(r'^```(?:json)?\s*', '', text.strip())
    text = re.sub(r'\s*```\s*$', '', text.strip())
    start = text.find('{')
    if start == -1:
        raise ValueError('No { found')
    depth = 0
    for i in range(start, len(text)):
        if text[i] == '{': depth += 1
        elif text[i] == '}':
            depth -= 1
            if depth == 0:
                return text[start:i+1]
    raise ValueError('Unbalanced')


def translate_formula(fid, fpath, model='claude-haiku-4-5', timeout=180):
    """Traduce las strings ES de una fórmula. Returns (fid, dict_translations, elapsed)."""
    t0 = time.time()
    content = fpath.read_text()
    es_strings = extract_es_strings(content)
    if not es_strings:
        return (fid, {}, 0.0)
    prompt = PROMPT_TEMPLATE.format(
        fid=fid,
        strings=json.dumps(es_strings, ensure_ascii=False, indent=2)
    )
    proc = subprocess.run(
        ['claude', '-p', '--model', model,
         '--tools', '', '--disable-slash-commands', '--setting-sources', ''],
        input=prompt, capture_output=True, text=True, timeout=timeout,
    )
    if proc.returncode != 0:
        raise RuntimeError(f'claude exit {proc.returncode}: {proc.stderr[:200]}')
    js = extract_json_from_output(proc.stdout)
    d = json.loads(js)
    # Validate: keys should be subset of es_strings
    for k in list(d.keys()):
        if k not in es_strings:
            # Haiku might have paraphrased the key, skip
            pass
    return (fid, d, time.time() - t0)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--workers', type=int, default=5)
    ap.add_argument('--model', default='claude-haiku-4-5')
    ap.add_argument('--limit', type=int, default=0, help='limit formulas (0 = all)')
    ap.add_argument('--resume', action='store_true', help='skip formulas already in output file')
    args = ap.parse_args()

    formulas = get_en_formula_files()

    # Load existing translations for resume mode
    existing = {}
    if OUT_FILE.exists():
        try:
            existing = json.loads(OUT_FILE.read_text())
        except Exception:
            existing = {}

    # Filter for work to do
    pending = []
    skip_empty = 0
    for fid, fpath in formulas:
        content = fpath.read_text()
        es = extract_es_strings(content)
        if not es:
            skip_empty += 1
            continue
        if args.resume and fid in existing and len(existing[fid]) == len(es):
            continue
        pending.append((fid, fpath))

    if args.limit:
        pending = pending[:args.limit]

    print(f'EN-relevant formulas: {len(formulas)}')
    print(f'With ES strings: {len(formulas) - skip_empty}')
    print(f'To process: {len(pending)}')
    print(f'Workers: {args.workers}  Model: {args.model}')
    print()

    results = dict(existing)
    ok, errors = 0, []
    t_start = time.time()

    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        futs = {pool.submit(translate_formula, fid, fpath, args.model): fid for fid, fpath in pending}
        for i, fut in enumerate(as_completed(futs), 1):
            fid = futs[fut]
            try:
                fid_r, d, elapsed = fut.result()
                results[fid_r] = d
                ok += 1
                # Persist incrementally (crash-safe)
                OUT_FILE.write_text(json.dumps(results, ensure_ascii=False, indent=2, sort_keys=True))
                rate = i / max(time.time() - t_start, 1)
                eta = (len(pending) - i) / rate / 60
                print(f'[{i}/{len(pending)}] ✓ {fid}  ({len(d)} strings, {elapsed:.1f}s, ETA {eta:.1f}min)')
            except Exception as e:
                errors.append((fid, str(e)[:150]))
                print(f'[{i}/{len(pending)}] ✗ {fid}: {str(e)[:100]}')

    elapsed = time.time() - t_start
    print(f'\n✓ {ok} / {len(pending)} fórmulas traducidas en {elapsed/60:.1f} min')
    if errors:
        print(f'✗ {len(errors)} errores (guardados en /tmp/formula-errors.log):')
        Path('/tmp/formula-errors.log').write_text('\n'.join(f'{fid}: {err}' for fid, err in errors))
        for fid, err in errors[:10]:
            print(f'  {fid}: {err[:100]}')
    print(f'\nOutput: {OUT_FILE}')
    print(f'Total fórmulas con traducciones: {len(results)}')


if __name__ == '__main__':
    main()
