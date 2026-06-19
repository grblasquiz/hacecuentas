#!/usr/bin/env python3
"""Dump de TODAS las páginas con tráfico (sessions + pageviews) últimos N días.
Pagina hasta traer todo. Salida JSON: { normalized_path: {sessions, views} }.
Uso: python3 scripts/ga4-all-pages-dump.py [--days 90] [--out /tmp/ga4_all.json]"""
import sys, json
from datetime import datetime, timedelta, timezone
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, OrderBy,
)

DAYS = int(sys.argv[sys.argv.index('--days') + 1]) if '--days' in sys.argv else 90
OUT = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else '/tmp/ga4_all.json'

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
end = datetime.now(timezone.utc).date() - timedelta(days=1)
start = end - timedelta(days=DAYS - 1)


def norm(p):
    if not p:
        return p
    p = p.split('?')[0].split('#')[0]
    if len(p) > 1 and p.endswith('/'):
        p = p.rstrip('/')
    return p


data = {}
offset = 0
PAGE = 100000
total_rows = None
while True:
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='pagePath')],
        metrics=[Metric(name='sessions'), Metric(name='screenPageViews')],
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='sessions'), desc=True)],
        limit=PAGE, offset=offset,
    ))
    if total_rows is None:
        total_rows = resp.row_count
    for r in resp.rows:
        path = norm(r.dimension_values[0].value)
        s = int(r.metric_values[0].value)
        v = int(r.metric_values[1].value)
        cur = data.get(path, {'sessions': 0, 'views': 0})
        cur['sessions'] += s
        cur['views'] += v
        data[path] = cur
    offset += PAGE
    if offset >= total_rows:
        break

with open(OUT, 'w') as f:
    json.dump(data, f)
print(f"days={DAYS} range={start}..{end}")
print(f"paths con tráfico: {len(data)} (GA4 rowCount={total_rows})")
print(f"sessions totales: {sum(d['sessions'] for d in data.values()):,}")
print(f"-> {OUT}")
