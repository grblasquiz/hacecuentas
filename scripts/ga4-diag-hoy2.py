#!/usr/bin/env python3
"""Hora x canal: ¿el hueco de 9-11am es Paid que murió, o Unassigned sin atribuir (lag)?"""
from datetime import date, timedelta
from collections import defaultdict
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
today = date.today()
last_wk = today - timedelta(days=7)

def fetch(d1, d2):
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='hour'), Dimension(name='sessionDefaultChannelGroup')],
        metrics=[Metric(name='sessions')],
        date_ranges=[DateRange(start_date=d1.isoformat(), end_date=d2.isoformat())]))
    m = defaultdict(lambda: defaultdict(int))
    for r in resp.rows:
        m[int(r.dimension_values[0].value)][r.dimension_values[1].value] += int(r.metric_values[0].value)
    return m

H, S = fetch(today, today), fetch(last_wk, last_wk)
cutoff = max(H.keys(), default=0)
print(f'HOY {today}  vs  sem.pas {last_wk}   (sesiones)')
print(f'{"h":>3} | {"HOY tot":>7} {"Paid":>5} {"Org":>4} {"Unas":>5} | {"PAS tot":>7} {"Paid":>5} {"Org":>4}')
print('─' * 64)
for h in range(cutoff + 1):
    ht, st = H.get(h, {}), S.get(h, {})
    tot_h = sum(ht.values()); tot_s = sum(st.values())
    print(f'{h:>3} | {tot_h:>7} {ht.get("Paid Search",0):>5} {ht.get("Organic Search",0):>4} '
          f'{ht.get("Unassigned",0):>5} | {tot_s:>7} {st.get("Paid Search",0):>5} {st.get("Organic Search",0):>4}')
