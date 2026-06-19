#!/usr/bin/env python3
"""Ground-truth CF (server-side) vs GA4 — resuelve TZ y mide hoy vs baseline real."""
import os, ssl, json, urllib.request
from datetime import datetime, timedelta, timezone
from collections import defaultdict

env = os.path.join(os.path.dirname(__file__), '..', '.env')
for line in open(env):
    if '=' in line and not line.strip().startswith('#'):
        k, v = line.strip().split('=', 1)
        os.environ.setdefault(k, v.strip('"').strip("'"))
try:
    import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    ctx = ssl.create_default_context()

CF_TOKEN = os.environ.get('CLOUDFLARE_ANALYTICS_TOKEN') or os.environ.get('CLOUDFLARE_API_TOKEN')
CF_ZONE = os.environ.get('CLOUDFLARE_ZONE_ID')
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
now = datetime.now(timezone.utc)
print(f'AHORA = {now.isoformat()}  (UTC)\n')

def cf_gql(q, variables):
    payload = {'query': q, 'variables': variables}
    req = urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',
        data=json.dumps(payload).encode(),
        headers={'Authorization': f'Bearer {CF_TOKEN}', 'Content-Type': 'application/json'})
    b = json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())
    if b.get('errors'): print('CF errors:', b['errors'])
    return b['data']['viewer']['zones'][0]

# ─── CF hourly, últimos 3 días (máximo permitido) ───
start = (now - timedelta(hours=71)).replace(minute=0, second=0, microsecond=0)
qh = """query($z:String!,$s:Time!,$e:Time!){viewer{zones(filter:{zoneTag:$z}){
  httpRequests1hGroups(limit:1000,filter:{datetime_geq:$s,datetime_leq:$e},orderBy:[datetime_ASC]){
    dimensions{datetime} sum{pageViews} uniq{uniques}}}}}"""
zh = cf_gql(qh, {'z': CF_ZONE, 's': start.isoformat().replace('+00:00','Z'), 'e': now.isoformat().replace('+00:00','Z')})
pv = defaultdict(int); uq = defaultdict(int)
for r in zh['httpRequests1hGroups']:
    dt = datetime.fromisoformat(r['dimensions']['datetime'].replace('Z','+00:00'))
    pv[(dt.date(), dt.hour)] += r['sum']['pageViews']
    uq[(dt.date(), dt.hour)] += r['uniq']['uniques']

today = now.date(); cur = now.hour
d1, d2 = today - timedelta(days=1), today - timedelta(days=2)
print('CLOUDFLARE — pageViews por hora UTC (server-side, sin gtag)')
print(f'{"hUTC":>4} | {"HOY":>6} | {"ayer":>6} | {"-2d":>6}')
print('─'*34)
for h in range(cur + 1):
    print(f'{h:>4} | {pv.get((today,h),0):>6,} | {pv.get((d1,h),0):>6,} | {pv.get((d2,h),0):>6,}')
def cum(d): return sum(pv.get((d,h),0) for h in range(cur+1)), sum(uq.get((d,h),0) for h in range(cur+1))
ct, cy, c2 = cum(today), cum(d1), cum(d2)
def pct(c,p): return f'{(c-p)/p*100:+.0f}%' if p else 'n/a'
print('─'*34)
print(f'ACUM hasta {cur}:00 UTC — pageViews:  HOY {ct[0]:,}  ayer {cy[0]:,} ({pct(ct[0],cy[0])})  -2d {c2[0]:,} ({pct(ct[0],c2[0])})')
print(f'ACUM hasta {cur}:00 UTC — uniques:    HOY {ct[1]:,}  ayer {cy[1]:,} ({pct(ct[1],cy[1])})  -2d {c2[1]:,} ({pct(ct[1],c2[1])})')

# ─── CF daily 14d → baseline incl. mismo día semana pasada ───
qd = """query($z:String!,$s:Date!,$e:Date!){viewer{zones(filter:{zoneTag:$z}){
  httpRequests1dGroups(limit:60,filter:{date_geq:$s,date_leq:$e},orderBy:[date_ASC]){
    dimensions{date} sum{pageViews} uniq{uniques}}}}}"""
zd = cf_gql(qd, {'z': CF_ZONE, 's': (today-timedelta(days=14)).isoformat(), 'e': today.isoformat()})
print('\nCF daily (pageViews / uniques) — últimos días:')
for r in zd['httpRequests1dGroups']:
    d = r['dimensions']['date']; tag = '  <- HOY (parcial)' if d == today.isoformat() else ('  <- mismo día sem.pas' if d == (today-timedelta(days=7)).isoformat() else '')
    print(f'  {d}  pv {r["sum"]["pageViews"]:>7,}  uniq {r["uniq"]["uniques"]:>7,}{tag}')

# ─── GA4: timezone + hoy por hora + realtime ───
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, RunRealtimeReportRequest
creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
gc = BetaAnalyticsDataClient(credentials=creds)
tz = '?'
try:
    from google.analytics.admin_v1beta import AnalyticsAdminServiceClient
    ac = AnalyticsAdminServiceClient(credentials=creds)
    tz = ac.get_property(name=f'properties/{GA4_PROPERTY}').time_zone
except Exception as e:
    tz = f'(admin no disp: {e})'
print(f'\nGA4 PROPERTY TIMEZONE = {tz}')

r = gc.run_report(RunReportRequest(property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='dateHour')], metrics=[Metric(name='sessions')],
    date_ranges=[DateRange(start_date='today', end_date='today')]))
gh = {int(row.dimension_values[0].value[8:10]): int(row.metric_values[0].value) for row in r.rows}
cutoff = max(gh, default=0)
print(f'GA4 sesiones HOY por hora (TZ propiedad)  ·  última hora con datos = {cutoff}')
for h in sorted(gh):
    print(f'  h{h:>2}: {gh[h]:>4}')
print(f'  TOTAL hoy hasta h{cutoff}: {sum(gh.values()):,}')
rt = gc.run_realtime_report(RunRealtimeReportRequest(property=f'properties/{GA4_PROPERTY}', metrics=[Metric(name='activeUsers')]))
print(f'GA4 Realtime activeUsers (30 min) = {sum(int(x.metric_values[0].value) for x in rt.rows) if rt.rows else 0}')
