#!/usr/bin/env python3
"""Perfil demográfico de visitantes (género, edad, dispositivo, país). Last N días."""
import os, sys
from datetime import datetime, timedelta, timezone
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, OrderBy

DAYS = int(sys.argv[sys.argv.index('--days')+1]) if '--days' in sys.argv else 90
creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
end = datetime.now(timezone.utc).date() - timedelta(days=1)
start = end - timedelta(days=DAYS-1)
print(f'Property {GA4_PROPERTY} · {start} .. {end} ({DAYS} días)\n')

def report(dim, label, metric='activeUsers'):
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name=dim)],
        metrics=[Metric(name=metric), Metric(name='sessions')],
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name=metric), desc=True)],
        limit=20))
    rows = [(r.dimension_values[0].value, int(r.metric_values[0].value), int(r.metric_values[1].value)) for r in resp.rows]
    total = sum(u for _, u, _ in rows) or 1
    print(f'── {label} (por {metric}) ──')
    if not rows:
        print('   (sin datos)')
    for name, u, s in rows:
        print(f'   {name or "(not set)":22} {u:>8,}  {u/total*100:5.1f}%   ({s:,} ses)')
    print()

for dim, label in [('userGender','GÉNERO'), ('userAgeBracket','EDAD'),
                   ('deviceCategory','DISPOSITIVO'), ('country','PAÍS (top)')]:
    try:
        report(dim, label)
    except Exception as e:
        print(f'── {label} ── ERROR: {e}\n')
