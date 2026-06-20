#!/usr/bin/env python3
"""
Tráfico de GOOGLE ORGÁNICO día a día (último mes).

Filtra estricto sessionSource=google AND sessionMedium=organic (= "google / organic"),
NO el grupo "Organic Search" completo (que mezcla Bing/DuckDuckGo/Yahoo/etc).

Uso:
  python3 scripts/ga4-organic-google-daily.py
  python3 scripts/ga4-organic-google-daily.py --days 30
"""
import os, sys
from datetime import datetime, timedelta, timezone

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag)+1]) if flag in sys.argv else default
DAYS = arg('--days', 30)

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression,
    FilterExpressionList, OrderBy)

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

# Google orgánico estricto: source=google AND medium=organic
GOOGLE_ORGANIC = FilterExpression(and_group=FilterExpressionList(expressions=[
    FilterExpression(filter=Filter(field_name='sessionSource',
        string_filter=Filter.StringFilter(value='google'))),
    FilterExpression(filter=Filter(field_name='sessionMedium',
        string_filter=Filter.StringFilter(value='organic'))),
]))

today = datetime.now(timezone.utc).date()
end = today                       # incluye hoy (parcial)
start = today - timedelta(days=DAYS)   # DAYS días completos + hoy

resp = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='date')],
    metrics=[Metric(name='sessions'), Metric(name='screenPageViews'),
             Metric(name='totalUsers')],
    date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
    dimension_filter=GOOGLE_ORGANIC,
    order_bys=[OrderBy(dimension=OrderBy.DimensionOrderBy(dimension_name='date'))],
    limit=1000))

rows = []
for row in resp.rows:
    d = row.dimension_values[0].value  # YYYYMMDD
    dt = datetime.strptime(d, '%Y%m%d').date()
    rows.append((dt, int(row.metric_values[0].value),
                 int(row.metric_values[1].value), int(row.metric_values[2].value)))
rows.sort()

DOW = ['lun','mar','mié','jue','vie','sáb','dom']
mx = max((s for _, s, _, _ in rows), default=1) or 1

print(f'\nGOOGLE ORGÁNICO (source=google / medium=organic) · property {GA4_PROPERTY}')
print(f'rango: {start} .. {end}  (hoy {today} = parcial)\n')
print(f'{"fecha":<12}{"día":<5}{"sesiones":>9}{"usuarios":>9}{"vistas":>8}   barra (sesiones)')
print('-'*78)

tot_s = tot_u = tot_v = 0
for dt, s, v, u in rows:
    bar = '█' * round(40 * s / mx)
    wd = DOW[dt.weekday()]
    flag = ' ←hoy(parcial)' if dt == today else ('  ·fin' if dt.weekday() >= 5 else '')
    print(f'{dt.isoformat():<12}{wd:<5}{s:>9}{u:>9}{v:>8}   {bar}{flag}')
    if dt != today:
        tot_s += s; tot_u += u; tot_v += v

ndays = sum(1 for dt, *_ in rows if dt != today)
if ndays:
    print('-'*78)
    print(f'{"PROMEDIO/día (sin hoy)":<26}{tot_s/ndays:>8.1f} ses   {tot_u/ndays:>6.1f} usr   {tot_v/ndays:>6.1f} vistas')
    print(f'{"TOTAL "+str(ndays)+" días completos":<26}{tot_s:>8} ses   {tot_u:>6} usr   {tot_v:>6} vistas')

# tendencia: primera mitad vs segunda mitad (días completos)
full = [r for r in rows if r[0] != today]
if len(full) >= 6:
    h = len(full)//2
    a = sum(s for _, s, _, _ in full[:h]) / h
    b = sum(s for _, s, _, _ in full[len(full)-h:]) / h
    pct = (b-a)/a*100 if a else 0
    print(f'\nTENDENCIA  1ª mitad {a:.1f} ses/día → 2ª mitad {b:.1f} ses/día  ({pct:+.0f}%)')
