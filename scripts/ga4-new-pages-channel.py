#!/usr/bin/env python3
"""Tráfico por CANAL (pago vs orgánico) de las calcs/páginas publicadas en los
últimos N días. Cruza el slug REAL (campo `slug` del JSON, no filename) contra el
pagePath de GA4 y muestra el pagePath real que trajo tráfico.

Uso:
  python3 scripts/ga4-new-pages-channel.py            # últimos 8 días
  python3 scripts/ga4-new-pages-channel.py --days 4   # ventana custom
  python3 scripts/ga4-new-pages-channel.py --min 3    # oculta cola de <min sesiones
"""
import os, sys, json, subprocess
from datetime import datetime, timezone, timedelta

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag)+1]) if flag in sys.argv else default
DAYS = arg('--days', 8)
MIN_SHOW = arg('--min', 1)

today = datetime.now(timezone.utc).date()
start = (today - timedelta(days=DAYS)).isoformat()

# ---- 1. Archivos de calc/página AGREGADOS en la ventana (git) ----
out = subprocess.run(
    ['git', 'log', f'--since={start} 00:00', '--diff-filter=A', '--name-only',
     '--pretty=format:'], cwd=ROOT, capture_output=True, text=True).stdout
files = sorted({l.strip() for l in out.splitlines() if l.strip() and (
    (l.startswith('src/content/calcs') and l.endswith('.json')) or
    (l.startswith('src/pages/') and l.endswith('.astro')))})

slug_meta = {}
for rel in files:
    if rel.endswith('.astro'):
        slug = os.path.basename(rel)[:-6]
        slug_meta[slug] = {'loc': 'page'}
        continue
    d = rel.split('/')[2]
    loc = 'ar' if d == 'calcs' else d.replace('calcs-', '')
    try:
        with open(os.path.join(ROOT, rel)) as jf:
            slug = json.load(jf).get('slug') or os.path.basename(rel)[:-5]
    except Exception:
        slug = os.path.basename(rel)[:-5]
    slug_meta[slug] = {'loc': loc}
slugset = set(slug_meta)
print(f"Publicadas últimos {DAYS} días: {len(slugset)} slugs  ·  ventana GA4: {start}..hoy (hoy parcial)")

# ---- 2. GA4: pagePath x canal ----
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
resp = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='pagePath'), Dimension(name='sessionDefaultChannelGroup')],
    metrics=[Metric(name='sessions'), Metric(name='screenPageViews'), Metric(name='totalUsers')],
    date_ranges=[DateRange(start_date=start, end_date=today.isoformat())],
    limit=100000))

norm = lambda p: (p.split('?')[0].split('#')[0].rstrip('/') or '/')
PAID = {'Paid Search','Paid Social','Paid Shopping','Paid Video','Paid Other','Display','Cross-network'}
def bucket(ch):
    if ch in PAID or ch.startswith('Paid'): return 'PAGO'
    if ch.startswith('Organic'):            return 'ORGANICO'
    return ch or 'Other'

pages = {}
for row in resp.rows:
    path = norm(row.dimension_values[0].value); ch = row.dimension_values[1].value
    sess = int(row.metric_values[0].value); views = int(row.metric_values[1].value)
    if path.rsplit('/', 1)[-1] not in slugset:
        continue
    e = pages.setdefault(path, {'ch': {}, 'sess': 0, 'views': 0})
    e['ch'][ch] = e['ch'].get(ch, 0) + sess
    e['sess'] += sess; e['views'] += views

rows = sorted(pages.items(), key=lambda kv: kv[1]['sess'], reverse=True)
tp = to = too = ts = 0
print(f"\nPáginas nuevas CON tráfico: {len(rows)} de {len(slugset)}\n")
print(f"{'sess':>5} {'views':>6} {'PAGO':>5} {'ORG':>5} {'otro':>5}  página")
print('-'*92)
for path, e in rows:
    paid = sum(v for c,v in e['ch'].items() if bucket(c)=='PAGO')
    org  = sum(v for c,v in e['ch'].items() if bucket(c)=='ORGANICO')
    other = e['sess'] - paid - org
    tp += paid; to += org; too += other; ts += e['sess']
    if e['sess'] >= MIN_SHOW:
        print(f"{e['sess']:>5} {e['views']:>6} {paid:>5} {org:>5} {other:>5}  {path}")
print('-'*92)
pc = lambda x: f"{100*x//ts if ts else 0}%"
print(f"{ts:>5} {'':>6} {tp:>5} {to:>5} {too:>5}  TOTAL — pago {tp} ({pc(tp)}) · "
      f"orgánico {to} ({pc(to)}) · otro {too} ({pc(too)}, mayormente Unassigned/Directo)")
