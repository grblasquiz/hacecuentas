#!/usr/bin/env python3
"""CF pageViews SOLO humanos (UA de navegador real, sin bots) hora x hora, hoy vs días previos.
Es lo más cercano server-side a cómo cuenta GA4 (humanos con browser). Cruza contra GA4."""
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
cur = now.hour
today = now.date(); d1 = today - timedelta(days=1); d2 = today - timedelta(days=2)

BOT = ('Bot', 'bot', 'Headless', 'Curl', 'Spider', 'Crawler', 'Python', 'wget', 'AppleBot', 'Scrapy', 'HTTP')
MOBILE = ('Mobile', 'iOS', 'Android', 'Samsung Internet', 'WebView')
DESKTOP = ('Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Internet Explorer')

def classify(fam):
    if not fam or fam == 'Unknown': return 'unknown'
    if any(k in fam for k in BOT): return 'bot'
    if any(k in fam for k in MOBILE): return 'human'
    if any(k in fam for k in DESKTOP): return 'human'
    return 'unknown'

start = (now - timedelta(hours=71)).replace(minute=0, second=0, microsecond=0)
q = """query($z:String!,$s:Time!,$e:Time!){viewer{zones(filter:{zoneTag:$z}){
  httpRequests1hGroups(limit:1000,filter:{datetime_geq:$s,datetime_leq:$e},orderBy:[datetime_ASC]){
    dimensions{datetime} sum{ browserMap{uaBrowserFamily pageViews} pageViews }}}}}"""
req = urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',
    data=json.dumps({'query': q, 'variables': {'z': CF_ZONE,
        's': start.isoformat().replace('+00:00','Z'), 'e': now.isoformat().replace('+00:00','Z')}}).encode(),
    headers={'Authorization': f'Bearer {CF_TOKEN}', 'Content-Type': 'application/json'})
b = json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())
if b.get('errors'): print('CF errors:', b['errors'])
rows = b['data']['viewer']['zones'][0]['httpRequests1hGroups']

human = defaultdict(int); bot = defaultdict(int); unk = defaultdict(int); tot = defaultdict(int)
for r in rows:
    dt = datetime.fromisoformat(r['dimensions']['datetime'].replace('Z','+00:00'))
    key = (dt.date(), dt.hour)
    tot[key] += r['sum']['pageViews']
    for bm in r['sum']['browserMap']:
        c = classify(bm['uaBrowserFamily']); pvv = bm['pageViews']
        if c == 'human': human[key] += pvv
        elif c == 'bot': bot[key] += pvv
        else: unk[key] += pvv

print('CLOUDFLARE — pageViews HUMANOS (UA navegador real, sin bots) · hora UTC')
print(f'{"hUTC":>4} | {"HOY":>6} {"ayer":>6} {"-2d":>6}  | {"HOY tot":>7} {"%bot hoy":>8}')
print('─'*48)
for h in range(cur + 1):
    th = tot.get((today,h),0); bh = bot.get((today,h),0)
    botpct = f'{100*bh/th:.0f}%' if th else '-'
    print(f'{h:>4} | {human.get((today,h),0):>6,} {human.get((d1,h),0):>6,} {human.get((d2,h),0):>6,}  | {th:>7,} {botpct:>8}')

def cum(dd, m): return sum(m.get((dd,h),0) for h in range(cur+1))
hT, hY, h2 = cum(today,human), cum(d1,human), cum(d2,human)
def pct(c,p): return f'{(c-p)/p*100:+.0f}%' if p else 'n/a'
print('─'*48)
print(f'\nHUMANOS acum hasta {cur}:00 UTC:')
print(f'  HOY  {hT:,}')
print(f'  ayer {hY:,}  ({pct(hT,hY)})')
print(f'  -2d  {h2:,}  ({pct(hT,h2)})')
print(f'\nComposición HOY acum: humanos {cum(today,human):,} · bots {cum(today,bot):,} · unknown {cum(today,unk):,} · total {cum(today,tot):,}')

# GA4 contexto
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest
creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
gc = BetaAnalyticsDataClient(credentials=creds)
def ga4_today_total():
    r = gc.run_report(RunReportRequest(property=f'properties/{GA4_PROPERTY}',
        dimensions=[], metrics=[Metric(name='sessions'),Metric(name='screenPageViews')],
        date_ranges=[DateRange(start_date='today', end_date='today')]))
    return (int(r.rows[0].metric_values[0].value), int(r.rows[0].metric_values[1].value)) if r.rows else (0,0)
gs, gpv = ga4_today_total()
print(f'\nGA4 HOY (parcial): {gs:,} sesiones · {gpv:,} pageViews')
print('→ Comparable: CF-humano pageViews vs GA4 pageViews. Si CF-humano va normal/arriba y GA4 corto = GA4 sub-reporta.')
