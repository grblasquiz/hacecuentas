#!/usr/bin/env python3
"""Patrón de clicks/impresiones de Google Search por día de la semana (GSC API).
Señal limpia de demanda orgánica real (sin bots de GA4)."""
import os, sys
from datetime import datetime, timedelta, timezone
from collections import defaultdict

env = os.path.join(os.path.dirname(__file__), '..', '.env')
for line in open(env):
    if '=' in line and not line.strip().startswith('#'):
        k, v = line.strip().split('=', 1)
        os.environ.setdefault(k, v.strip('"').strip("'"))

SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
days = 90
if '--days' in sys.argv:
    days = int(sys.argv[sys.argv.index('--days') + 1])

from google.oauth2 import service_account
from googleapiclient.discovery import build

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
sc = build('searchconsole', 'v1', credentials=creds)

start = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
end = (datetime.now(timezone.utc).date() - timedelta(days=2)).isoformat()  # GSC tiene ~2d lag

resp = sc.searchanalytics().query(
    siteUrl='sc-domain:hacecuentas.com',
    body={'startDate': start, 'endDate': end, 'dimensions': ['date'], 'rowLimit': 1000},
).execute()

WD = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
rows = resp.get('rows', [])
by_wd = defaultdict(lambda: {'c': [], 'i': []})
tot_c = tot_i = 0
dates = []
for r in rows:
    d = datetime.strptime(r['keys'][0], '%Y-%m-%d').date()
    dates.append(d)
    wd = d.weekday()
    by_wd[wd]['c'].append(r['clicks'])
    by_wd[wd]['i'].append(r['impressions'])
    tot_c += r['clicks']; tot_i += r['impressions']

avg = lambda l: sum(l)/len(l) if l else 0
print(f'\nGSC sc-domain:hacecuentas.com — {min(dates)} → {max(dates)} ({len(rows)} días)')
print(f'Total: {tot_c:.0f} clicks, {tot_i:.0f} impresiones  |  ~{tot_c/len(rows)*7:.0f} clicks/semana')
print(f'\n  {"Día":<11} {"#":>3} {"Clicks/día":>11} {"Impres/día":>11} {"CTR":>6}')
print(f'  {"-"*46}')
for wd in range(7):
    b = by_wd.get(wd)
    if not b: continue
    c, i = avg(b['c']), avg(b['i'])
    ctr = 100*c/i if i else 0
    mark = ' ◀' if wd >= 4 else ''
    print(f'  {WD[wd]:<11} {len(b["c"]):>3} {c:>11.1f} {i:>11.1f} {ctr:>5.1f}%{mark}')

we_c = [c for wd in (4,5,6) for c in by_wd[wd]['c']]
wk_c = [c for wd in (0,1,2,3) for c in by_wd[wd]['c']]
we_i = [c for wd in (4,5,6) for c in by_wd[wd]['i']]
wk_i = [c for wd in (0,1,2,3) for c in by_wd[wd]['i']]
print(f'  {"-"*46}')
print(f'  VIE+SAB+DOM  clicks/día: {avg(we_c):>6.1f}   impres/día: {avg(we_i):>7.1f}')
print(f'  LUN-JUE      clicks/día: {avg(wk_c):>6.1f}   impres/día: {avg(wk_i):>7.1f}')
if avg(wk_c):
    print(f'  Δ fin-de-semana vs semana (clicks):  {100*(avg(we_c)-avg(wk_c))/avg(wk_c):+.1f}%')
if avg(wk_i):
    print(f'  Δ fin-de-semana vs semana (impres):  {100*(avg(we_i)-avg(wk_i))/avg(wk_i):+.1f}%')
print()
