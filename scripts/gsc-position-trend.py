#!/usr/bin/env python3
"""
Hipótesis Martin: NO es HCU clásico (no hay desindexación). Es "más cobertura
+ peor posición". Pull GSC para validar:
  - clicks + impressions + CTR + position por mes (últimos 90d)
  - distribución de queries por bucket de posición
"""
import sys
from datetime import date, timedelta
from collections import defaultdict
from google.oauth2 import service_account
from googleapiclient.discovery import build

SA = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
SITE = 'sc-domain:hacecuentas.com'

creds = service_account.Credentials.from_service_account_file(
    SA, scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
sc = build('searchconsole', 'v1', credentials=creds)

end = date.today() - timedelta(days=2)  # GSC tiene lag ~2 días
start_90 = end - timedelta(days=89)

def q(start, end, dims=None, row_limit=1):
    body = {'startDate': str(start), 'endDate': str(end), 'rowLimit': row_limit}
    if dims: body['dimensions'] = dims
    return sc.searchanalytics().query(siteUrl=SITE, body=body).execute()

# ─── 1) Trend mensual últimos 3 meses ──────────────────────────────────────
print(f'\n=== TREND mensual últimos 90d ({start_90} → {end}) ===\n')
print(f'{"Mes":<14} {"Clicks":>8} {"Impr":>9} {"CTR":>7} {"Pos":>6}')
for offset in range(2, -1, -1):
    m_end = end - timedelta(days=30*offset)
    m_start = m_end - timedelta(days=29)
    r = q(m_start, m_end)
    if r.get('rows'):
        row = r['rows'][0]
        clicks = int(row['clicks'])
        impr = int(row['impressions'])
        ctr = 100 * row['ctr']
        pos = row['position']
        print(f'{m_start} → {m_end}   {clicks:>4}  {impr:>7,}  {ctr:>5.2f}%  {pos:>5.1f}')

# ─── 2) Distribución de queries por bucket de posición (últimos 28d) ──────
print(f'\n=== DISTRIBUCIÓN posición (últimos 28d) ===\n')
r28 = q(end - timedelta(days=27), end, dims=['query'], row_limit=25000)
rows = r28.get('rows', [])
buckets = defaultdict(lambda: {'queries': 0, 'impr': 0, 'clicks': 0})
for row in rows:
    pos = row['position']
    impr = int(row['impressions'])
    clicks = int(row['clicks'])
    if pos <= 3: b = '1-3 (top)'
    elif pos <= 10: b = '4-10 (page 1)'
    elif pos <= 20: b = '11-20 (page 2)'
    elif pos <= 50: b = '21-50 (rescue zone)'
    else: b = '51+ (lost)'
    buckets[b]['queries'] += 1
    buckets[b]['impr'] += impr
    buckets[b]['clicks'] += clicks

print(f'{"Bucket":<24} {"Queries":>8} {"Impr":>10} {"Clicks":>7}')
order = ['1-3 (top)', '4-10 (page 1)', '11-20 (page 2)', '21-50 (rescue zone)', '51+ (lost)']
for b in order:
    d = buckets[b]
    print(f'{b:<24} {d["queries"]:>8,} {d["impr"]:>10,} {d["clicks"]:>7,}')

# ─── 3) Páginas indexadas crecimiento ──────────────────────────────────────
print(f'\n=== CRECIMIENTO de pages que reciben impresiones ===\n')
print(f'{"Período":<22} {"Pages únicas en SERP":>22}')
for offset in range(2, -1, -1):
    m_end = end - timedelta(days=30*offset)
    m_start = m_end - timedelta(days=29)
    pages_r = q(m_start, m_end, dims=['page'], row_limit=25000)
    n_pages = len(pages_r.get('rows', []))
    print(f'{m_start} → {m_end}    {n_pages:>22,}')

# ─── 4) Tipo de cambio: ganaron o perdieron impr vs hace 60d ──────────────
print(f'\n=== Páginas que MÁS PERDIERON impresiones (60d vs anterior 60d) ===\n')
hoy_60 = q(end - timedelta(days=59), end, dims=['page'], row_limit=25000).get('rows', [])
prev_60 = q(end - timedelta(days=119), end - timedelta(days=60), dims=['page'], row_limit=25000).get('rows', [])

hoy_map = {r['keys'][0]: int(r['impressions']) for r in hoy_60}
prev_map = {r['keys'][0]: int(r['impressions']) for r in prev_60}
all_pages = set(hoy_map) | set(prev_map)
diff = []
for p in all_pages:
    h = hoy_map.get(p, 0)
    pr = prev_map.get(p, 0)
    diff.append((p, h - pr, h, pr))
diff.sort(key=lambda x: x[1])  # más negativos primero

print(f'{"URL (top 10 perdedoras)":<55} {"Δ":>7} {"60d":>5} {"prev":>5}')
for p, d, h, pr in diff[:10]:
    short = p.replace('https://hacecuentas.com', '')[:53]
    print(f'{short:<55} {d:>+7,} {h:>5,} {pr:>5,}')

print(f'\n{"URL (top 10 ganadoras)":<55} {"Δ":>7} {"60d":>5} {"prev":>5}')
for p, d, h, pr in diff[-10:][::-1]:
    short = p.replace('https://hacecuentas.com', '')[:53]
    print(f'{short:<55} {d:>+7,} {h:>5,} {pr:>5,}')
