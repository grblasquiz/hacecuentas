#!/usr/bin/env python3
"""
Calcs que MÁS CRECIERON en orgánico la última semana (vs la semana previa).

Delta = vistas orgánicas (últimos 7 días) - vistas orgánicas (7 días previos).
A diferencia de ga4-new-traffic-calcs.py (que busca 0→algo), acá rankea por
CRECIMIENTO absoluto, incluyendo calcs que ya tenían tráfico y subieron.

Uso:
  python3 scripts/ga4-organic-growth.py
  python3 scripts/ga4-organic-growth.py --days 7 --min 2 --top 60
"""
import os, sys, json
from datetime import datetime, timedelta, timezone

ROOT = os.path.join(os.path.dirname(__file__), '..')
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag)+1]) if flag in sys.argv else default
DAYS = arg('--days', 7)
MIN_RECENT = arg('--min', 2)   # vistas mínimas recientes para considerar
TOP = arg('--top', 60)

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression)

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
ORGANIC = FilterExpression(filter=Filter(
    field_name='sessionDefaultChannelGroup',
    string_filter=Filter.StringFilter(value='Organic Search')))

today = datetime.now(timezone.utc).date()
r_end = today - timedelta(days=1)
r_start = r_end - timedelta(days=DAYS-1)
p_end = r_start - timedelta(days=1)
p_start = p_end - timedelta(days=DAYS-1)

def query(start, end):
    out = {}
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='pagePath')],
        metrics=[Metric(name='screenPageViews'), Metric(name='sessions')],
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
        dimension_filter=ORGANIC, limit=100000))
    for row in resp.rows:
        path = row.dimension_values[0].value.rstrip('/') or '/'
        v, s = int(row.metric_values[0].value), int(row.metric_values[1].value)
        pv, ps = out.get(path, (0,0)); out[path] = (pv+v, ps+s)
    return out

print(f'Property {GA4_PROPERTY}  ·  canal: ORGANIC SEARCH  ·  crecimiento semana vs semana')
print(f'  reciente: {r_start} .. {r_end}   previa: {p_start} .. {p_end}')
print('  consultando GA4...', flush=True)
recent = query(r_start, r_end)
prior  = query(p_start, p_end)

calcs = json.load(open(os.path.join(ROOT, 'public/api/calcs-index.json')))['calculators']
meta = {(c['url'].split('hacecuentas.com',1)[-1].rstrip('/') or '/'): c for c in calcs}

rows = []
for path, (rv, rs) in recent.items():
    m = meta.get(path)
    if not m or rv < MIN_RECENT:
        continue
    pv, ps = prior.get(path, (0,0))
    delta = rv - pv
    if delta <= 0:
        continue  # solo las que crecieron
    pct = '∞ (0→)' if pv == 0 else f'+{round((rv-pv)/pv*100)}%'
    rows.append({'path': path, 'recent_views': rv, 'prior_views': pv, 'delta': delta,
                 'recent_sessions': rs, 'prior_sessions': ps, 'pct': pct,
                 'category': m.get('category'), 'locale': m.get('locale'),
                 'title': m.get('h1') or m.get('title')})

rows.sort(key=lambda r: (-r['delta'], -r['recent_views']))
loc = {'es':'AR','es-CL':'CL','es-MX':'MX','es-CO':'CO','en':'EN'}

print(f'\n{"="*84}')
print(f'CALCS QUE MÁS CRECIERON EN ORGÁNICO: {len(rows)} con delta>0 (mostrando top {TOP})')
print(f'{"="*84}\n')
print(f'{"#":>3} {"now":>4} {"prev":>4} {"Δ":>4} {"%":>8}  {"loc":<3} {"cat":<13} calc')
print('-'*84)
for i, r in enumerate(rows[:TOP], 1):
    print(f'{i:>3} {r["recent_views"]:>4} {r["prior_views"]:>4} {r["delta"]:>+4} {r["pct"]:>8}  '
          f'{loc.get(r["locale"], r["locale"]):<3} {(r["category"] or "-")[:13]:<13} '
          f'{r["path"].split("/")[-1].replace("calculadora-","")}')

json.dump(rows, open(os.path.join(ROOT,'data','ga4-organic-growth.json'),'w'), ensure_ascii=False, indent=1)
import csv
with open(os.path.join(ROOT,'data','ga4-organic-growth.csv'),'w',newline='') as f:
    w=csv.writer(f); w.writerow(['rank','views_now','views_prev','delta','pct','sessions_now','sessions_prev','locale','category','path','title'])
    for i,r in enumerate(rows,1): w.writerow([i,r['recent_views'],r['prior_views'],r['delta'],r['pct'],r['recent_sessions'],r['prior_sessions'],r['locale'],r['category'],r['path'],r['title']])
print(f'\nDetalle → data/ga4-organic-growth.json / .csv ({len(rows)} filas)')
