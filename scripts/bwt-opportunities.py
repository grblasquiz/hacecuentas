#!/usr/bin/env python3
"""
Procesa un export de Bing Webmaster Tools > Search Performance.

Identifica oportunidades concretas para mover posiciones a top-5:

  - HIGH IMPRESSIONS + LOW CTR + LOW POSITION → title/meta opportunity
  - POSITION 5-15 + DECENT IMPRESSIONS → content/internal-link opportunity
  - POSITION 1-4 + LOW CTR → meta description opportunity
  - HIGH CLICKS + STABLE TREND → double down (más contenido relacionado)

Uso:
  1. En BWT → Search Performance > exportar últimos 30 días como CSV
  2. python3 scripts/bwt-opportunities.py /path/to/bwt-export.csv

Formato esperado de columnas (BWT export):
  Query, Clicks, Impressions, CTR, Position
  (o similar; el script normaliza headers comunes)
"""

import csv
import sys
from collections import defaultdict
from pathlib import Path

if len(sys.argv) < 2:
    print(__doc__)
    sys.exit(1)

csv_path = Path(sys.argv[1])
if not csv_path.exists():
    print(f"ERROR: archivo no existe: {csv_path}")
    sys.exit(1)

# Normalizar headers de BWT (varían según versión del export)
def norm(h):
    h = h.lower().strip().replace(' ', '_').replace('-', '_')
    aliases = {
        'queries': 'query', 'q': 'query', 'search_query': 'query',
        'clicks': 'clicks', 'click': 'clicks',
        'impr': 'impressions', 'imps': 'impressions', 'impressions': 'impressions',
        'ctr': 'ctr', 'click_through_rate': 'ctr',
        'pos': 'position', 'avg_pos': 'position', 'position': 'position', 'avg_position': 'position',
        'page': 'page', 'url': 'page', 'landing_page': 'page',
    }
    return aliases.get(h, h)

rows = []
with open(csv_path, encoding='utf-8-sig') as f:
    reader = csv.reader(f)
    raw_headers = next(reader)
    headers = [norm(h) for h in raw_headers]
    for row in reader:
        if len(row) != len(headers): continue
        d = dict(zip(headers, row))
        try:
            d['clicks'] = int(float(d.get('clicks', 0) or 0))
            d['impressions'] = int(float(d.get('impressions', 0) or 0))
            ctr_str = d.get('ctr', '0').replace('%','').strip()
            d['ctr'] = float(ctr_str) if ctr_str else 0.0
            d['position'] = float(d.get('position', 0) or 0)
            rows.append(d)
        except (ValueError, KeyError):
            continue

print(f"Total queries cargadas: {len(rows)}")
print(f"Headers detectados: {headers}")
print()

# Bucket A: HIGH IMP + LOW CTR + GOOD POSITION → meta description opportunity
bucket_a = [r for r in rows if r['impressions'] >= 50 and r['ctr'] < 3 and r['position'] <= 5]
bucket_a.sort(key=lambda r: -r['impressions'])

# Bucket B: POSITION 6-15 + DECENT IMP → ranking opportunity
bucket_b = [r for r in rows if r['impressions'] >= 30 and 6 <= r['position'] <= 15]
bucket_b.sort(key=lambda r: -r['impressions'] * (1/r['position']))

# Bucket C: POSITION 16-30 + HIGH IMP → "almost there"
bucket_c = [r for r in rows if r['impressions'] >= 100 and 16 <= r['position'] <= 30]
bucket_c.sort(key=lambda r: -r['impressions'])

# Bucket D: POSITION 1-3 + HIGH CLICKS → double down
bucket_d = [r for r in rows if r['clicks'] >= 5 and r['position'] <= 3]
bucket_d.sort(key=lambda r: -r['clicks'])

def show(name, bucket, n=15):
    print(f"\n{'='*60}\n{name} (top {n} de {len(bucket)})\n{'='*60}")
    for r in bucket[:n]:
        q = (r.get('query','')[:50]).ljust(52)
        page = (r.get('page','')[:50]).ljust(52) if 'page' in r else ''
        print(f"  {q} | clicks={r['clicks']:>4} imp={r['impressions']:>5} ctr={r['ctr']:>5.1f}% pos={r['position']:>5.1f}")

show("BUCKET A: posición ≤5 pero CTR <3% — fix meta description / title", bucket_a)
show("BUCKET B: posición 6-15 — fix content / internal links / schema", bucket_b)
show("BUCKET C: posición 16-30 con muchas imp — almost there", bucket_c)
show("BUCKET D: top-3 ganadoras — escalar con calcs relacionadas", bucket_d)

# Estimación de uplift
print(f"\n{'='*60}\nESTIMACIÓN DE UPLIFT POTENCIAL\n{'='*60}")
# Si moviera bucket B de pos~10 a pos~3, CTR pasaría de ~3% a ~15%
b_uplift = sum(r['impressions'] * 0.12 for r in bucket_b)  # +12pp CTR
c_uplift = sum(r['impressions'] * 0.08 for r in bucket_c)  # +8pp CTR
a_uplift = sum(r['impressions'] * 0.05 for r in bucket_a)  # +5pp CTR
print(f"  Bucket B (rank 6-15 → top-3): +{b_uplift:.0f} clicks/mes potenciales")
print(f"  Bucket C (rank 16-30 → top-10): +{c_uplift:.0f} clicks/mes potenciales")
print(f"  Bucket A (mejor meta CTR): +{a_uplift:.0f} clicks/mes potenciales")
print(f"  TOTAL upside: +{a_uplift+b_uplift+c_uplift:.0f} clicks/mes")
