#!/usr/bin/env python3
"""
Calcs que EMPEZARON a tener tráfico en la última semana (que antes no tenían).

Compara dos ventanas en GA4 (property hacecuentas):
  - reciente:  últimos 7 días (hasta ayer; hoy es parcial)
  - baseline:  las 4 semanas previas a esa (28 días)

"Tráfico nuevo" = baseline ~0 (≤ BASE_MAX vistas) y reciente ≥ MIN vistas.
Cruza el pagePath de GA4 contra el catálogo real de calcs (calcs-index.json)
para excluir home/blog/categorías/guías.

Uso:
  python3 scripts/ga4-new-traffic-calcs.py
  python3 scripts/ga4-new-traffic-calcs.py --recent 7 --min 2 --base-max 0
"""
import os, sys, json
from datetime import datetime, timedelta, timezone

ROOT = os.path.join(os.path.dirname(__file__), '..')
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag)+1]) if flag in sys.argv else default

RECENT_DAYS = arg('--recent', 7)
BASE_DAYS   = arg('--base-days', 28)
MIN_RECENT  = arg('--min', 2)      # vistas mínimas en la ventana reciente (filtra ruido)
BASE_MAX    = arg('--base-max', 0) # vistas máximas en baseline para contar como "nuevo"

ORGANIC = '--organic' in sys.argv  # solo sesiones de Organic Search

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest,
    Filter, FilterExpression)

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

ORGANIC_FILTER = FilterExpression(filter=Filter(
    field_name='sessionDefaultChannelGroup',
    string_filter=Filter.StringFilter(value='Organic Search'))) if ORGANIC else None

today = datetime.now(timezone.utc).date()
recent_end   = today - timedelta(days=1)                       # ayer
recent_start = recent_end - timedelta(days=RECENT_DAYS - 1)
base_end     = recent_start - timedelta(days=1)
base_start   = base_end - timedelta(days=BASE_DAYS - 1)

def query(start, end):
    """{pagePath -> (views, sessions, users)} para una ventana."""
    out = {}
    req = RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='pagePath')],
        metrics=[Metric(name='screenPageViews'), Metric(name='sessions'),
                 Metric(name='totalUsers')],
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
        dimension_filter=ORGANIC_FILTER,
        limit=100000,
    )
    resp = client.run_report(req)
    for row in resp.rows:
        path = row.dimension_values[0].value.rstrip('/') or '/'
        v = int(row.metric_values[0].value)
        s = int(row.metric_values[1].value)
        u = int(row.metric_values[2].value)
        # acumular (rstrip puede colapsar /x y /x/)
        pv, ps, pu = out.get(path, (0,0,0))
        out[path] = (pv+v, ps+s, pu+u)
    return out

print(f'Property {GA4_PROPERTY}  ·  canal: {"ORGANIC SEARCH" if ORGANIC else "TODOS"}')
print(f'  reciente: {recent_start} .. {recent_end}  ({RECENT_DAYS} días)')
print(f'  baseline: {base_start} .. {base_end}  ({BASE_DAYS} días)')
print('  consultando GA4...', flush=True)

recent = query(recent_start, recent_end)
base   = query(base_start, base_end)

# catálogo de calcs: path canónico -> meta
calcs = json.load(open(os.path.join(ROOT, 'public/api/calcs-index.json')))['calculators']
def path_of(url):
    p = url.split('hacecuentas.com', 1)[-1]
    return (p.rstrip('/') or '/')
calc_meta = {path_of(c['url']): c for c in calcs}

# detectar tráfico nuevo SOLO sobre calcs reales
rows = []
for path, (v, s, u) in recent.items():
    meta = calc_meta.get(path)
    if not meta:
        continue
    if v < MIN_RECENT:
        continue
    bv, bs, bu = base.get(path, (0,0,0))
    if bv <= BASE_MAX:
        rows.append({
            'path': path, 'recent_views': v, 'recent_sessions': s, 'recent_users': u,
            'base_views': bv, 'category': meta.get('category'),
            'locale': meta.get('locale'), 'title': meta.get('h1') or meta.get('title'),
        })

rows.sort(key=lambda r: (-r['recent_views'], -r['recent_sessions']))

print(f'\n{"="*78}')
print(f'CALCS CON TRÁFICO NUEVO: {len(rows)} calcs (baseline ≤{BASE_MAX} vistas → reciente ≥{MIN_RECENT})')
print(f'{"="*78}\n')
print(f'{"#":>3}  {"vis":>4} {"ses":>4} {"usr":>4} {"base":>4}  {"loc":<4} {"categoría":<14} path')
print('-'*78)
for i, r in enumerate(rows, 1):
    print(f'{i:>3}  {r["recent_views"]:>4} {r["recent_sessions"]:>4} {r["recent_users"]:>4} '
          f'{r["base_views"]:>4}  {(r["locale"] or "-"):<4} {(r["category"] or "-")[:14]:<14} {r["path"]}')

# resumen por categoría y locale
from collections import Counter
print(f'\nPor categoría:', dict(Counter(r['category'] for r in rows).most_common()))
print(f'Por locale:   ', dict(Counter(r['locale'] for r in rows).most_common()))
tot = sum(r['recent_views'] for r in rows)
print(f'Vistas reciente sumadas (calcs nuevas): {tot}')

suffix = '-organic' if ORGANIC else ''
outfile = os.path.join(ROOT, 'data', f'ga4-new-traffic-calcs{suffix}.json')
json.dump(rows, open(outfile, 'w'), ensure_ascii=False, indent=1)
print(f'\nDetalle → data/ga4-new-traffic-calcs{suffix}.json')
