#!/usr/bin/env python3
"""Uso del evento share_link (y otros eventos del calc) en GA4 — ¿lo clickea alguien?"""
import sys
from datetime import datetime, timedelta, timezone
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression, OrderBy
)

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

days = 90
end = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
start = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
start28 = (datetime.now(timezone.utc).date() - timedelta(days=28)).isoformat()
print(f"Rango: {start} → {end} ({days}d)\n")

# Denominador: sessions + page_view 90d
tot = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    metrics=[Metric(name='sessions'), Metric(name='totalUsers')],
    date_ranges=[DateRange(start_date=start, end_date=end)]))
if tot.rows:
    print(f"Sessions 90d: {tot.rows[0].metric_values[0].value} | Users 90d: {tot.rows[0].metric_values[1].value}\n")

# Tabla de eventos (top por count)
ev = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='eventName')],
    metrics=[Metric(name='eventCount')],
    date_ranges=[DateRange(start_date=start, end_date=end)],
    order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='eventCount'), desc=True)]))
print("=== Eventos 90d (todos) ===")
share_total = 0
for r in ev.rows:
    name = r.dimension_values[0].value
    cnt = int(r.metric_values[0].value)
    mark = '  ← interés' if name in ('share_link','print_pdf','copy_link','rail_click','calendar') else ''
    print(f"  {cnt:>8,}  {name}{mark}")
    if name == 'share_link':
        share_total = cnt
print()

# share_link 28d
def evcount(ev_name, s, e):
    rep = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='eventName')],
        metrics=[Metric(name='eventCount')],
        date_ranges=[DateRange(start_date=s, end_date=e)],
        dimension_filter=FilterExpression(filter=Filter(
            field_name='eventName', string_filter=Filter.StringFilter(value=ev_name)))))
    return int(rep.rows[0].metric_values[0].value) if rep.rows else 0

print(f"=== share_link ===")
print(f"  90d: {share_total}  |  28d: {evcount('share_link', start28, end)}")

# share_link por calc_slug (param custom; puede no estar registrado)
try:
    rep = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='customEvent:calc_slug')],
        metrics=[Metric(name='eventCount')],
        date_ranges=[DateRange(start_date=start, end_date=end)],
        dimension_filter=FilterExpression(filter=Filter(
            field_name='eventName', string_filter=Filter.StringFilter(value='share_link'))),
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='eventCount'), desc=True)]))
    print("\n  share_link por calc (top 15):")
    if not rep.rows:
        print("    (sin filas)")
    for r in rep.rows[:15]:
        print(f"    {int(r.metric_values[0].value):>5}  {r.dimension_values[0].value}")
except Exception as e:
    print(f"\n  (calc_slug no disponible como custom dimension: {type(e).__name__})")
