#!/usr/bin/env python3
"""Evaluación de visitantes recurrentes (new vs returning) + drill-down del cohorte returning."""
import sys
from datetime import datetime, timedelta, timezone
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, OrderBy, Filter, FilterExpression)

DAYS = int(sys.argv[sys.argv.index('--days')+1]) if '--days' in sys.argv else 90
creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
end = datetime.now(timezone.utc).date() - timedelta(days=1)
start = end - timedelta(days=DAYS-1)
P = f'properties/{GA4_PROPERTY}'
DR = [DateRange(start_date=start.isoformat(), end_date=end.isoformat())]
def secs(s):
    s=int(float(s)); return f'{s//60}m {s%60}s'
print(f'Property {GA4_PROPERTY} · {start} .. {end} ({DAYS} días)\n')

# 1) NEW vs RETURNING comparativa
resp = client.run_report(RunReportRequest(property=P,
    dimensions=[Dimension(name='newVsReturning')],
    metrics=[Metric(name=m) for m in ['activeUsers','sessions','engagementRate','averageSessionDuration','screenPageViewsPerSession','bounceRate']],
    date_ranges=DR))
print('── NEW vs RETURNING ──')
print(f'   {"tipo":12}{"usuarios":>10}{"%":>7}{"sesiones":>10}{"engmt%":>9}{"durSes":>9}{"PV/ses":>8}{"rebote%":>9}')
rows = {r.dimension_values[0].value: r.metric_values for r in resp.rows}
totu = sum(int(r[0].value) for r in rows.values()) or 1
for k in ['new','returning','(not set)']:
    if k not in rows: continue
    m = rows[k]
    print(f'   {k:12}{int(m[0].value):>10,}{int(m[0].value)/totu*100:>6.1f}%{int(m[1].value):>10,}{float(m[2].value)*100:>8.1f}%{secs(m[3].value):>9}{float(m[4].value):>8.2f}{float(m[5].value)*100:>8.1f}%')
print()

RET = FilterExpression(filter=Filter(field_name='newVsReturning',
    string_filter=Filter.StringFilter(value='returning')))
def drill(dim, label, n=8):
    resp = client.run_report(RunReportRequest(property=P,
        dimensions=[Dimension(name=dim)],
        metrics=[Metric(name='activeUsers'), Metric(name='sessions')],
        date_ranges=DR, dimension_filter=RET,
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='activeUsers'), desc=True)], limit=n))
    rows=[(r.dimension_values[0].value, int(r.metric_values[0].value), int(r.metric_values[1].value)) for r in resp.rows]
    tot=sum(u for _,u,_ in rows) or 1
    print(f'── RETURNING · {label} ──')
    for name,u,s in rows:
        print(f'   {(name or "(not set)")[:34]:36}{u:>8,}{u/tot*100:>6.1f}%  ({s:,} ses)')
    print()
for dim,label in [('sessionDefaultChannelGroup','CANAL'),('country','PAÍS'),('deviceCategory','DISPOSITIVO'),('landingPagePlusQueryString','LANDING PAGES')]:
    try: drill(dim,label)
    except Exception as e: print(f'── RETURNING · {label} ── ERROR: {e}\n')
