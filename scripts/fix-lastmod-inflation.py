#!/usr/bin/env python3
"""
Des-inflar el sitemap: rollback de `lastReviewed` a la fecha del último cambio
de CONTENIDO REAL (no metadata-only).

Contexto: backfills masivos (audience, seoKeywords, dataUpdate.source,
lastReviewed) bumpearon el lastReviewed de ~2300 calcs a fechas recientes sin
cambio de contenido visible → 71% del sitemap con lastmod de los últimos 9 días
→ señal de churn/inestabilidad para Google en plena democión HCU.

Método: parsear git log -p de src/content/calcs/ UNA vez. Para cada archivo,
la fecha más reciente en que un campo de CONTENIDO cambió (title/h1/description/
intro/explanation/answerSnippet/faq/steps/formula/inputs/presets). Si el
`lastReviewed` actual es MÁS reciente que esa fecha → era inflado → rollback.

Campos de contenido = lo que ve el usuario. Metadata (lastReviewed, seoKeywords,
audience, dataUpdate, noindex, related, mentions) NO cuenta como cambio real.

dataUpdate.lastUpdated NO se toca (freshness de data live es legítima).

  python3 scripts/fix-lastmod-inflation.py            # dry-run
  python3 scripts/fix-lastmod-inflation.py --apply
"""
from __future__ import annotations
import json, re, subprocess, sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALCS = ROOT / 'src/content/calcs'
APPLY = '--apply' in sys.argv

CONTENT_KEYS = re.compile(
    r'"(title|h1|description|intro|explanation|answerSnippet|question|answer|'
    r'faqs|steps|formula|inputs|label|options|presets|examples|howTo|method|'
    r'tip|note|placeholder|unit|resultLabel|interpretation)"\s*:'
)

# 1) parsear git log -p una sola vez → última fecha de cambio de contenido por file
print('[1/3] git log -p sobre calcs (una pasada)…', file=sys.stderr)
proc = subprocess.run(
    ['git', 'log', '--format=C|%H|%ad', '--date=short', '-p', '--', 'src/content/calcs/'],
    cwd=ROOT, capture_output=True, text=True, encoding='utf-8',
)
last_content_change: dict[str, str] = {}
cur_date = None
cur_file = None
for line in proc.stdout.splitlines():
    if line.startswith('C|'):
        _, _h, cur_date = line.split('|', 2)
        cur_file = None
    elif line.startswith('+++ b/src/content/calcs/'):
        cur_file = line[len('+++ b/'):].strip()
    elif line.startswith('--- ') or line.startswith('+++'):
        continue
    elif cur_file and cur_date and (line[:1] in '+-') and len(line) > 1 and line[1:2] not in '+-':
        if CONTENT_KEYS.search(line):
            # commits vienen de nuevo→viejo; el primero que veo es el más reciente
            if cur_file not in last_content_change:
                last_content_change[cur_file] = cur_date

print(f'  files con cambio de contenido detectado: {len(last_content_change)}', file=sys.stderr)

# 2) comparar lastReviewed actual vs fecha de contenido real
print('[2/3] comparando lastReviewed vs cambio real…', file=sys.stderr)
rollbacks = []   # (path, old_lr, new_lr)
kept = 0
no_content_hist = []
for fp in sorted(CALCS.glob('*.json')):
    rel = f'src/content/calcs/{fp.name}'
    try:
        d = json.loads(fp.read_text(encoding='utf-8'))
    except Exception:
        continue
    lr = d.get('lastReviewed')
    if not lr:
        continue
    real = last_content_change.get(rel)
    if real is None:
        no_content_hist.append(rel)
        continue
    if lr > real:           # lastReviewed inflado respecto al último cambio real
        rollbacks.append((fp, lr, real))
    else:
        kept += 1

# proyección distribución
from collections import Counter
proj = Counter()
for fp in CALCS.glob('*.json'):
    try:
        d = json.loads(fp.read_text(encoding='utf-8'))
    except Exception:
        continue
    lr = d.get('lastReviewed')
    rel = f'src/content/calcs/{fp.name}'
    new_lr = lr
    real = last_content_change.get(rel)
    if lr and real and lr > real:
        new_lr = real
    eff = max(x for x in [new_lr, (d.get('dataUpdate') or {}).get('lastUpdated')] if x) if (new_lr or (d.get('dataUpdate') or {}).get('lastUpdated')) else None
    if eff:
        proj[eff] += 1

recientes_now = sum(1 for fp in CALCS.glob('*.json') for d in [json.loads(fp.read_text(encoding='utf-8'))] if (d.get('lastReviewed') or '') >= '2026-05-20')
recientes_proj = sum(n for d, n in proj.items() if d >= '2026-05-20')
tot_proj = sum(proj.values())

print(f'\n{"="*64}')
print(f'ROLLBACKS (lastReviewed inflado → fecha real): {len(rollbacks)}')
print(f'Calcs con lastReviewed ya correcto (sin tocar): {kept}')
print(f'Calcs sin historial de contenido detectable: {len(no_content_hist)}')
print(f'{"="*64}')
print('Muestra de 15 rollbacks:')
for fp, old, new in rollbacks[:15]:
    print(f'  {fp.name[:48]:48}  {old} → {new}')
print(f'\nlastReviewed >= 2026-05-20 AHORA: ~{recientes_now}')
print(f'lastmod efectivo >= 2026-05-20 PROYECTADO: {recientes_proj}/{tot_proj} '
      f'({100*recientes_proj/tot_proj:.0f}%)  [incluye dataUpdate legítimo]')

if APPLY:
    n = 0
    for fp, old, new in rollbacks:
        d = json.loads(fp.read_text(encoding='utf-8'))
        d['lastReviewed'] = new
        fp.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        n += 1
    print(f'\n✅ APLICADO: {n} lastReviewed rolled back a fecha de contenido real')
else:
    print(f'\n(dry-run — --apply para rollback de {len(rollbacks)} calcs)')
