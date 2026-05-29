#!/usr/bin/env python3
"""
Desprune zombies: calcs con noindex:true que SIGUEN recibiendo impresiones GSC.
Patrón validado 20/5, 27/5 — sacar noindex + bump lastReviewed los recupera.

  - Matchea por campo `slug` del JSON (NO por filename).
  - GSC 90d (mismo window que prune-audit-full-site.py).
  - Dry-run por defecto; --apply edita los JSON (del noindex + lastReviewed=hoy).

Idempotente: si ya no tiene noindex, lo saltea.
"""
from __future__ import annotations
import json, glob, sys
from datetime import date, timedelta
from pathlib import Path
from google.oauth2 import service_account
from googleapiclient.discovery import build

ROOT = Path(__file__).resolve().parent.parent
SA = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
SITE = 'sc-domain:hacecuentas.com'
TODAY = date.today().isoformat()
APPLY = '--apply' in sys.argv

# 1) noindex calcs por slug
noindex = {}  # slug -> path
for fp in glob.glob(str(ROOT / 'src/content/calcs/*.json')):
    try:
        d = json.loads(Path(fp).read_text(encoding='utf-8'))
        if d.get('noindex') is True and d.get('slug'):
            noindex[d['slug']] = fp
    except Exception:
        pass
print(f'noindex calcs: {len(noindex)}', file=sys.stderr)

# 2) GSC 90d page-level
creds = service_account.Credentials.from_service_account_file(
    SA, scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
sc = build('searchconsole', 'v1', credentials=creds)
end = date.today() - timedelta(days=2)
start = end - timedelta(days=89)
gsc = {}
start_row = 0
while True:
    r = sc.searchanalytics().query(siteUrl=SITE, body={
        'startDate': str(start), 'endDate': str(end),
        'dimensions': ['page'], 'rowLimit': 25000, 'startRow': start_row,
    }).execute()
    rows = r.get('rows', [])
    if not rows:
        break
    for row in rows:
        url = row['keys'][0].replace('https://hacecuentas.com', '')
        gsc[url] = {'impr': int(row['impressions']), 'clicks': int(row['clicks']),
                    'pos': round(row['position'], 1)}
    if len(rows) < 25000:
        break
    start_row += 25000
print(f'GSC pages 90d: {len(gsc)}', file=sys.stderr)

# 3) zombies = noindex con impr > 0
zombies = []
for slug, fp in noindex.items():
    m = gsc.get('/' + slug)
    if m and m['impr'] > 0:
        zombies.append((slug, fp, m))
zombies.sort(key=lambda x: -x[2]['impr'])

print(f'\n{"="*70}\nZOMBIES A DESPRUNE: {len(zombies)} calcs '
      f'· {sum(z[2]["impr"] for z in zombies)} impr · '
      f'{sum(z[2]["clicks"] for z in zombies)} clicks (90d)\n{"="*70}')
for slug, fp, m in zombies:
    print(f'  {m["impr"]:>4} impr  {m["clicks"]:>2} clk  pos {m["pos"]:>5}  /{slug}')

# 4) aplicar
if APPLY:
    n = 0
    for slug, fp, m in zombies:
        p = Path(fp)
        d = json.loads(p.read_text(encoding='utf-8'))
        d.pop('noindex', None)
        d['lastReviewed'] = TODAY
        p.write_text(json.dumps(d, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
        n += 1
    print(f'\n✅ APLICADO: {n} calcs despruneadas (noindex removido + lastReviewed={TODAY})')
else:
    print(f'\n(dry-run — corré con --apply para editar los {len(zombies)} JSON)')
