#!/usr/bin/env python3
"""
Análisis de tráfico por día de la semana (GA4).
Compara viernes/sábado/domingo vs resto de la semana (lun-jue).

Uso:
  python3 scripts/ga4-day-of-week.py            # últimos 90 días
  python3 scripts/ga4-day-of-week.py --days 56  # últimos 56 días
"""
import os, sys
from datetime import datetime, timedelta, timezone
from collections import defaultdict

env = os.path.join(os.path.dirname(__file__), '..', '.env')
for line in open(env):
    if '=' in line and not line.strip().startswith('#'):
        k, v = line.strip().split('=', 1)
        os.environ.setdefault(k, v.strip('"').strip("'"))

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

days = 90
if '--days' in sys.argv:
    days = int(sys.argv[sys.argv.index('--days') + 1])

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly']
)
client = BetaAnalyticsDataClient(credentials=creds)

start = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
end = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()  # ayer (hoy es parcial)

# ── Reporte 1: por fecha (sesiones, users, pv, engagement) ──────────────────
rep = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='date')],
    metrics=[Metric(name='sessions'), Metric(name='totalUsers'),
             Metric(name='screenPageViews'), Metric(name='engagementRate'),
             Metric(name='averageSessionDuration')],
    date_ranges=[DateRange(start_date=start, end_date=end)],
))

WD = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
rows = []
for r in rep.rows:
    d = r.dimension_values[0].value           # YYYYMMDD
    dt = datetime.strptime(d, '%Y%m%d').date()
    rows.append({
        'date': dt, 'wd': dt.weekday(),
        'sessions': int(r.metric_values[0].value),
        'users': int(r.metric_values[1].value),
        'pv': int(r.metric_values[2].value),
        'engr': float(r.metric_values[3].value),
        'dur': float(r.metric_values[4].value),
    })
rows.sort(key=lambda x: x['date'])

# ── Reporte 2: por fecha x canal (para aislar orgánico) ─────────────────────
rep2 = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='date'), Dimension(name='sessionDefaultChannelGroup')],
    metrics=[Metric(name='sessions')],
    date_ranges=[DateRange(start_date=start, end_date=end)],
))
organic_by_date = defaultdict(int)
for r in rep2.rows:
    d = r.dimension_values[0].value
    ch = r.dimension_values[1].value
    if ch == 'Organic Search':
        organic_by_date[datetime.strptime(d, '%Y%m%d').date()] += int(r.metric_values[0].value)


def agg(subset):
    """Promedios por día-tipo sobre un subconjunto de filas."""
    by_wd = defaultdict(lambda: {'sessions': [], 'users': [], 'pv': [], 'engr': [], 'dur': [], 'org': []})
    for x in subset:
        b = by_wd[x['wd']]
        b['sessions'].append(x['sessions'])
        b['users'].append(x['users'])
        b['pv'].append(x['pv'])
        b['engr'].append(x['engr'])
        b['dur'].append(x['dur'])
        b['org'].append(organic_by_date.get(x['date'], 0))
    return by_wd


def avg(lst):
    return sum(lst) / len(lst) if lst else 0


def report_block(subset, title):
    by_wd = agg(subset)
    print(f'\n{"="*72}')
    print(f'  {title}')
    print(f'  ({subset[0]["date"]} → {subset[-1]["date"]}, {len(subset)} días)')
    print(f'{"="*72}')
    print(f'  {"Día":<11} {"#sem":>4} {"Sesiones/día":>13} {"Users/día":>10} {"Orgánico/día":>13} {"Engag%":>7} {"Dur(s)":>7}')
    print(f'  {"-"*68}')
    for wd in range(7):
        b = by_wd.get(wd)
        if not b:
            continue
        n = len(b['sessions'])
        mark = ' ◀' if wd >= 4 else ''
        print(f'  {WD[wd]:<11} {n:>4} {avg(b["sessions"]):>13.1f} {avg(b["users"]):>10.1f} '
              f'{avg(b["org"]):>13.1f} {avg(b["engr"])*100:>6.1f}% {avg(b["dur"]):>7.0f}{mark}')

    # weekend-ish (vie/sab/dom) vs semana (lun-jue)
    we = [x for x in subset if x['wd'] >= 4]
    wk = [x for x in subset if x['wd'] < 4]
    we_s = avg([x['sessions'] for x in we]); wk_s = avg([x['sessions'] for x in wk])
    we_o = avg([organic_by_date.get(x['date'], 0) for x in we])
    wk_o = avg([organic_by_date.get(x['date'], 0) for x in wk])
    we_e = avg([x['engr'] for x in we]); wk_e = avg([x['engr'] for x in wk])
    print(f'  {"-"*68}')
    print(f'  VIE+SAB+DOM   sesiones/día: {we_s:>7.1f}   orgánico/día: {we_o:>6.1f}   engag: {we_e*100:>4.1f}%')
    print(f'  LUN-JUE       sesiones/día: {wk_s:>7.1f}   orgánico/día: {wk_o:>6.1f}   engag: {wk_e*100:>4.1f}%')
    if wk_s:
        diff = 100 * (we_s - wk_s) / wk_s
        print(f'  Δ fin-de-semana vs semana (sesiones): {diff:+.1f}%')
    if wk_o:
        diffo = 100 * (we_o - wk_o) / wk_o
        print(f'  Δ fin-de-semana vs semana (orgánico): {diffo:+.1f}%')

    # vie/sab/dom desglosado vs promedio lun-jue
    if wk_s:
        for wd in (4, 5, 6):
            b = by_wd.get(wd)
            if b:
                d = 100 * (avg(b['sessions']) - wk_s) / wk_s
                print(f'    · {WD[wd]:<9} vs prom. lun-jue: {d:+.1f}% sesiones')


print(f'\nProperty {GA4_PROPERTY} — ventana solicitada: {days} días (hasta ayer)')
print(f'Total días con datos: {len(rows)}')

report_block(rows, f'TODO EL PERÍODO ({days}d)')

# Post-crash steady state: últimos 28 días
recent = [x for x in rows if x['date'] >= (datetime.now(timezone.utc).date() - timedelta(days=28))]
if len(recent) >= 7:
    report_block(recent, 'ÚLTIMOS 28 DÍAS (estado post-crash)')

print()
