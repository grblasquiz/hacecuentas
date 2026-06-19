#!/usr/bin/env python3
"""Tráfico de las calculadoras por vertical de país, últimos 7 días vs 7 previos (WoW).

Agrupa pagePath por sección de país (/pt Brasil, /en inglés, /ec Ecuador, /pe Perú,
landings LATAM sueltas, y raíz = Argentina/ES) y compara dos ventanas de 7 días.
También imprime un corte por país del VISITANTE (dimensión country).
"""
import sys
from datetime import datetime, timedelta, timezone
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, OrderBy

creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

end = datetime.now(timezone.utc).date() - timedelta(days=1)        # ayer (último día completo)
cur_start = end - timedelta(days=6)                                # ventana actual = 7 días
prev_end = cur_start - timedelta(days=1)
prev_start = prev_end - timedelta(days=6)                          # ventana previa = 7 días

LATAM = ['chile', 'colombia', 'mexico', 'peru', 'ecuador', 'uruguay', 'bolivia', 'paraguay', 'venezuela']

def seccion(path):
    p = path.lower().split('?')[0].rstrip('/')
    if p.startswith('/pt/') or p == '/pt': return 'Brasil (/pt)'
    if p.startswith('/en/') or p == '/en': return 'Inglés (/en)'
    if p.startswith('/ec/') or p == '/ec': return 'Ecuador (/ec)'
    if p.startswith('/pe/') or p == '/pe': return 'Perú (/pe)'
    for c in LATAM:
        if f'-{c}' in p or f'/{c}-' in p or p.endswith(f'/{c}'):
            return f'Landing {c.capitalize()}'
    return 'Argentina / ES (raíz)'

def fetch(dim, start, end_, limit=10000):
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name=dim)],
        metrics=[Metric(name='screenPageViews'), Metric(name='sessions')],
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end_.isoformat())],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'), desc=True)],
        limit=limit))
    return [(r.dimension_values[0].value, int(r.metric_values[0].value), int(r.metric_values[1].value)) for r in resp.rows]

def pct(cur, prev):
    if prev == 0: return '  nuevo' if cur else '   0%'
    return f'{(cur-prev)/prev*100:+6.0f}%'

def comparativa(titulo, key_fn, cur_rows, prev_rows, top=None):
    from collections import defaultdict
    cur = defaultdict(lambda: [0, 0]); prev = defaultdict(lambda: [0, 0])
    for name, pv, ss in cur_rows:
        k = key_fn(name); cur[k][0] += pv; cur[k][1] += ss
    for name, pv, ss in prev_rows:
        k = key_fn(name); prev[k][0] += pv; prev[k][1] += ss
    keys = set(cur) | set(prev)
    rows = sorted(keys, key=lambda k: cur[k][0], reverse=True)
    if top: rows = rows[:top]
    print(f'\n{titulo}')
    print(f'  {"sección":24} {"pviews 7d":>11} {"prev 7d":>10} {"Δ":>8}   {"ses 7d":>8} {"prev":>8}')
    print('  ' + '─' * 74)
    tc = tp = tcs = tps = 0
    for k in rows:
        c, p = cur[k], prev[k]
        tc += c[0]; tp += p[0]; tcs += c[1]; tps += p[1]
        print(f'  {k:24} {c[0]:>11,} {p[0]:>10,} {pct(c[0],p[0]):>8}   {c[1]:>8,} {p[1]:>8,}')
    print('  ' + '─' * 74)
    print(f'  {"TOTAL":24} {tc:>11,} {tp:>10,} {pct(tc,tp):>8}   {tcs:>8,} {tps:>8,}')

print(f'Property {GA4_PROPERTY}')
print(f'  ACTUAL : {cur_start} .. {end}')
print(f'  PREVIO : {prev_start} .. {prev_end}')

cur_paths = fetch('pagePath', cur_start, end)
prev_paths = fetch('pagePath', prev_start, prev_end)
comparativa('═══ POR VERTICAL DE PAÍS (ruta de la URL) ═══', seccion, cur_paths, prev_paths)

cur_country = fetch('country', cur_start, end, limit=300)
prev_country = fetch('country', prev_start, prev_end, limit=300)
comparativa('═══ POR PAÍS DEL VISITANTE (top 15) ═══', lambda x: x or '(not set)', cur_country, prev_country, top=15)
