#!/usr/bin/env python3
"""Detecta calcs SIMILARES dentro de cada locale y las clasifica por tráfico GA4.

Clusters por similitud de H1 (Jaccard de tokens) DENTRO de cada locale
(calcs de distinto país NO son duplicados). Refuerza con formulaId compartido.

Buckets:
  A (DECIDE MARTIN): >=2 calcs del cluster con tráfico >= T.
  B1 (AUTO: 1 con tráfico):  unificar las sin-tráfico -> la que tiene tráfico.
  B0 (AUTO: 0 con tráfico):  unificar -> la de contenido más rico (dedup puro).

Uso: python3 scripts/find-similar-calcs.py [--jaccard 0.7] [--traffic 10] [--ga4 /tmp/ga4_all.json]
"""
import json, sys, os, re
from pathlib import Path

ROOT = Path('/Users/marrod/hacecuentas/src/content')
JACCARD = float(sys.argv[sys.argv.index('--jaccard') + 1]) if '--jaccard' in sys.argv else 0.7
T = int(sys.argv[sys.argv.index('--traffic') + 1]) if '--traffic' in sys.argv else 10
GA4 = sys.argv[sys.argv.index('--ga4') + 1] if '--ga4' in sys.argv else '/tmp/ga4_all.json'
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else '/tmp/similar_calcs.json'

# dir -> (locale_code or None for root)
DIRS = {
    'calcs': None, 'calcs-en': 'en', 'calcs-pt': 'pt', 'calcs-mx': 'mx',
    'calcs-co': 'co', 'calcs-cl': 'cl', 'calcs-es': 'es', 'calcs-pe': 'pe',
    'calcs-ec': 'ec',
}

ga4 = json.load(open(GA4))
def traffic(path):
    p = path.rstrip('/') or '/'
    d = ga4.get(p) or ga4.get(p + '/') or {}
    return d.get('sessions', 0), d.get('views', 0)

STOP = set('para como hace cuentas calculadora calcular conversor convertir online gratis '
           'vida mejor cuanto cuantos cuanta cuantas que del las los una con por sin sobre '
           'how to calculate calculator convert converter free online your you the and for'.split())

def toks(s):
    s = (s or '').lower()
    s = s.replace('ñ', 'n')
    s = re.sub(r'[̀-ͯ]', '', s.encode('ascii', 'ignore').decode())
    s = re.sub(r'[^a-z0-9\s]', ' ', s)
    return set(w for w in s.split() if len(w) > 3 and w not in STOP)

def jac(a, b):
    if not a or not b:
        return 0.0
    return len(a & b) / len(a | b)

def score(d):
    s = len(d.get('explanation', '') or '') / 1000
    s += len(d.get('faq', []) or []) * 0.5
    s += len(d.get('sources', []) or []) * 0.3
    s += len(d.get('relatedSlugs', []) or []) * 0.1
    st = (d.get('slug', '') or '').split('-')
    if st:
        s += (len(set(st)) / len(st)) * 2 - len(st) * 0.1
    return s

# Load all calcs grouped by dir
by_dir = {}
for dname, loc in DIRS.items():
    d = ROOT / dname
    items = []
    for fp in sorted(d.glob('*.json')):
        try:
            data = json.load(open(fp))
        except Exception:
            continue
        slug = data.get('slug') or fp.stem
        path = f"/{loc}/{slug}" if loc else f"/{slug}"
        sess, views = traffic(path)
        items.append({
            'file': str(fp), 'fname': fp.name, 'dir': dname, 'locale': loc or 'ar',
            'slug': slug, 'path': path, 'h1': data.get('h1', ''),
            'title': data.get('title', ''), 'formulaId': data.get('formulaId', ''),
            'category': data.get('category', ''), 'sessions': sess, 'views': views,
            'score': round(score(data), 2), '_toks': toks(data.get('h1') or data.get('title')),
        })
    by_dir[dname] = items

# Cluster within each dir by H1 Jaccard (union-find-ish greedy)
clusters = []
for dname, items in by_dir.items():
    n = len(items)
    used = [False] * n
    for i in range(n):
        if used[i] or len(items[i]['_toks']) < 2:
            continue
        grp = [i]; used[i] = True
        for j in range(i + 1, n):
            if used[j] or len(items[j]['_toks']) < 2:
                continue
            same_formula = (items[i]['formulaId'] and items[i]['formulaId'] == items[j]['formulaId'])
            jv = jac(items[i]['_toks'], items[j]['_toks'])
            if jv >= JACCARD or (same_formula and jv >= 0.45):
                grp.append(j); used[j] = True
        if len(grp) > 1:
            members = [items[k] for k in grp]
            for m in members:
                m.pop('_toks', None)
            clusters.append({'dir': dname, 'locale': items[i]['locale'], 'members': members})

# Classify
A, B1, B0 = [], [], []
for c in clusters:
    ms = sorted(c['members'], key=lambda m: (-m['sessions'], -m['score']))
    withtraffic = [m for m in ms if m['sessions'] >= T]
    c['members'] = ms
    c['n_traffic'] = len(withtraffic)
    if len(withtraffic) >= 2:
        A.append(c)
    elif len(withtraffic) == 1:
        c['winner'] = withtraffic[0]['slug']
        B1.append(c)
    else:
        c['winner'] = max(ms, key=lambda m: m['score'])['slug']
        B0.append(c)

result = {'params': {'jaccard': JACCARD, 'traffic_threshold': T},
          'A_decide': A, 'B1_auto_one_traffic': B1, 'B0_auto_zero_traffic': B0}
json.dump(result, open(OUT, 'w'), ensure_ascii=False, indent=1)

def cnt(buckets):
    return sum(len(c['members']) for c in buckets)
print(f"jaccard>={JACCARD}  traffic>={T}/90d")
print(f"clusters totales: {len(clusters)}  (calcs involucradas: {cnt(clusters)})")
print(f"  A  DECIDE MARTIN  (>=2 con tráfico): {len(A):>4} clusters / {cnt(A)} calcs")
print(f"  B1 AUTO 1-con-tráfico            : {len(B1):>4} clusters / {cnt(B1)} calcs  ({cnt(B1)-len(B1)} a unificar)")
print(f"  B0 AUTO 0-tráfico (dedup puro)   : {len(B0):>4} clusters / {cnt(B0)} calcs  ({cnt(B0)-len(B0)} a unificar)")
print(f"-> {OUT}")
print("\nclusters por locale:")
from collections import Counter
print(dict(Counter(c['locale'] for c in clusters)))
