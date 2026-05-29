#!/usr/bin/env python3
"""
Cross-check: sesiones humanas reales (CF Analytics, sin gtag) vs GA4 reportadas.

Si CF dice X humanos y GA4 dice Y, la diferencia es:
  - ad-blockers
  - Safari ITP / private mode (no cookies)
  - browsers que bloquean googletagmanager.com
  - usuarios con JS deshabilitado
  - timing: el page_view se envía PERO el server no lo recibe (CSP/SW/etc.)

Esperable: GA4 sub-reporta 5-20% vs CF en sitios normales.
Si el gap es >40%, hay bug de tracking real.
"""
import os, sys, ssl, json, urllib.request
from datetime import datetime, timedelta, timezone

env = os.path.join(os.path.dirname(__file__), '..', '.env')
for line in open(env):
    if '=' in line and not line.strip().startswith('#'):
        k, v = line.strip().split('=', 1)
        os.environ.setdefault(k, v.strip('"').strip("'"))

try:
    import certifi
    ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    ctx = ssl.create_default_context()

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

# ─── CF ANALYTICS ───────────────────────────────────────────────────────────
CF_TOKEN = os.environ.get('CLOUDFLARE_ANALYTICS_TOKEN') or os.environ.get('CLOUDFLARE_API_TOKEN')
CF_ZONE = os.environ.get('CLOUDFLARE_ZONE_ID')

days = 7
if '--days' in sys.argv:
    days = int(sys.argv[sys.argv.index('--days') + 1])

end = datetime.now(timezone.utc)
start = end - timedelta(days=days)

cf_query = """
query M($zoneTag: String!, $start: Date!, $end: Date!) {
  viewer { zones(filter: {zoneTag: $zoneTag}) {
    httpRequests1dGroups(limit: 1000, filter: {date_geq: $start, date_leq: $end}) {
      sum {
        browserMap { uaBrowserFamily, pageViews }
        ipClassMap { ipType, requests }
      }
      uniq { uniques }
    }
  }}
}
"""
cf_payload = {'query': cf_query, 'variables': {
    'zoneTag': CF_ZONE,
    'start': start.date().isoformat(),
    'end': end.date().isoformat(),
}}
req = urllib.request.Request(
    'https://api.cloudflare.com/client/v4/graphql',
    data=json.dumps(cf_payload).encode(),
    headers={'Authorization': f'Bearer {CF_TOKEN}', 'Content-Type': 'application/json'},
)
body = json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())
groups = body['data']['viewer']['zones'][0]['httpRequests1dGroups']

BOT_KEYWORDS = ('Bot', 'bot', 'Headless', 'Curl', 'Spider', 'Crawler', 'Python', 'wget', 'AppleBot')
MOBILE_KEYWORDS = ('Mobile', 'iOS', 'Android', 'Samsung Internet', 'WebView')
HUMAN_DESKTOP = ('Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Internet Explorer')

cf_human_mobile = 0
cf_human_desktop = 0
cf_bot = 0
cf_unknown = 0
cf_total_uniques = sum(g['uniq']['uniques'] for g in groups)

ip_class_totals = {}
for g in groups:
    for ipc in g['sum']['ipClassMap']:
        t = ipc['ipType'] or 'unknown'
        ip_class_totals[t] = ip_class_totals.get(t, 0) + ipc['requests']
    for b in g['sum']['browserMap']:
        fam = b['uaBrowserFamily'] or ''
        pv = b['pageViews']
        if not fam or fam == 'Unknown':
            cf_unknown += pv
        elif any(k in fam for k in BOT_KEYWORDS):
            cf_bot += pv
        elif any(k in fam for k in MOBILE_KEYWORDS):
            cf_human_mobile += pv
        elif any(k in fam for k in HUMAN_DESKTOP) and not any(k in fam for k in MOBILE_KEYWORDS):
            cf_human_desktop += pv
        else:
            cf_unknown += pv

cf_human_total = cf_human_mobile + cf_human_desktop
cf_human_mobile_pct = 100 * cf_human_mobile / cf_human_total if cf_human_total else 0

# ─── GA4 DATA API ───────────────────────────────────────────────────────────
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly']
)
client = BetaAnalyticsDataClient(credentials=creds)

ga4_start = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
ga4_end = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()  # ayer (hoy es parcial)

# Sessions y users por deviceCategory
report = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='deviceCategory')],
    metrics=[Metric(name='sessions'), Metric(name='totalUsers'), Metric(name='screenPageViews')],
    date_ranges=[DateRange(start_date=ga4_start, end_date=ga4_end)],
))

ga4_data = {}
for row in report.rows:
    dev = row.dimension_values[0].value
    sessions = int(row.metric_values[0].value)
    users = int(row.metric_values[1].value)
    pv = int(row.metric_values[2].value)
    ga4_data[dev] = {'sessions': sessions, 'users': users, 'pv': pv}

# GA4 sessions por source (para cross-check vs GSC)
src_report = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='sessionSource'), Dimension(name='sessionMedium')],
    metrics=[Metric(name='sessions')],
    date_ranges=[DateRange(start_date=ga4_start, end_date=ga4_end)],
))
ga4_by_source = {}
for row in src_report.rows:
    src = row.dimension_values[0].value
    med = row.dimension_values[1].value
    ga4_by_source[f'{src}/{med}'] = int(row.metric_values[0].value)

ga4_google_organic = ga4_by_source.get('google/organic', 0)
ga4_bing_organic = ga4_by_source.get('bing/organic', 0)
ga4_direct = ga4_by_source.get('(direct)/(none)', 0)

# GSC clicks para comparar contra ga4_google_organic
gsc_clicks = None
try:
    from googleapiclient.discovery import build
    gsc_creds = service_account.Credentials.from_service_account_file(
        SA_PATH, scopes=['https://www.googleapis.com/auth/webmasters.readonly']
    )
    sc = build('searchconsole', 'v1', credentials=gsc_creds)
    resp = sc.searchanalytics().query(
        siteUrl='sc-domain:hacecuentas.com',
        body={'startDate': ga4_start, 'endDate': ga4_end, 'dimensions': [], 'rowLimit': 1}
    ).execute()
    if resp.get('rows'):
        gsc_clicks = int(resp['rows'][0]['clicks'])
        gsc_impr = int(resp['rows'][0]['impressions'])
except Exception as e:
    print(f'(GSC no disponible: {e})')

ga4_mobile_s = ga4_data.get('mobile', {}).get('sessions', 0)
ga4_desktop_s = ga4_data.get('desktop', {}).get('sessions', 0)
ga4_tablet_s = ga4_data.get('tablet', {}).get('sessions', 0)
ga4_total_s = ga4_mobile_s + ga4_desktop_s + ga4_tablet_s
ga4_total_users = sum(d['users'] for d in ga4_data.values())
ga4_total_pv = sum(d['pv'] for d in ga4_data.values())
ga4_mobile_pct = 100 * ga4_mobile_s / ga4_total_s if ga4_total_s else 0

# ─── REPORTE ────────────────────────────────────────────────────────────────
print(f'\n{"="*60}')
print(f'  CROSS-CHECK GA4 vs CF Analytics — últimos {days} días')
print(f'{"="*60}')
print(f'\n[CF Analytics] (server-side, sin gtag)')
print(f'  Uniques (IPs distintas):  {cf_total_uniques:>10,}')
print(f'  Page views total:         {cf_human_total + cf_bot + cf_unknown:>10,}')
print(f'  ├─ Humanos mobile (UA):   {cf_human_mobile:>10,}  ({cf_human_mobile_pct:.1f}% de humanos)')
print(f'  ├─ Humanos desktop (UA):  {cf_human_desktop:>10,}')
print(f'  ├─ Bots identificados:    {cf_bot:>10,}')
print(f'  └─ Unknown/otros:         {cf_unknown:>10,}')

print(f'\n[CF — clasif IP por tipo]')
total_ipc = sum(ip_class_totals.values())
for t, c in sorted(ip_class_totals.items(), key=lambda x: -x[1]):
    pct = 100 * c / total_ipc if total_ipc else 0
    print(f'  {t:<25} {c:>10,} ({pct:5.1f}%)')

print(f'\n[GA4] (client-side, requiere gtag)')
print(f'  Sesiones totales:         {ga4_total_s:>10,}')
print(f'  Usuarios totales:         {ga4_total_users:>10,}')
print(f'  Page views totales:       {ga4_total_pv:>10,}')
print(f'  ├─ Sesiones mobile:       {ga4_mobile_s:>10,}  ({ga4_mobile_pct:.1f}%)')
print(f'  ├─ Sesiones desktop:      {ga4_desktop_s:>10,}')
print(f'  └─ Sesiones tablet:       {ga4_tablet_s:>10,}')

# Comparativa humanos
print(f'\n[COMPARATIVA HUMANOS]')
print(f'  CF dice humanos PV:       {cf_human_total:>10,}')
print(f'  GA4 dice PV:              {ga4_total_pv:>10,}')
gap = 100 * (cf_human_total - ga4_total_pv) / cf_human_total if cf_human_total else 0
print(f'  GA4 sub-reporta vs CF:    {gap:>9.1f}%')
print(f'  (esperable 5-20% en sitios normales; >40% = bug real)\n')

print(f'[MOBILE: CF vs GA4]')
print(f'  CF humanos mobile:        {cf_human_mobile:>10,}  ({cf_human_mobile_pct:.1f}%)')
print(f'  GA4 sessions mobile:      {ga4_mobile_s:>10,}  ({ga4_mobile_pct:.1f}%)')
if cf_human_mobile and ga4_mobile_s:
    mobile_gap = 100 * (cf_human_mobile - ga4_mobile_s) / cf_human_mobile
    print(f'  GA4 mobile sub-reporta:   {mobile_gap:>9.1f}%')

print(f'\n[GSC clicks vs GA4 google/organic sessions]')
print(f'  (el test más limpio: NO afectado por scrapers, NO afectado por mix CF/GA4)')
if gsc_clicks is not None:
    print(f'  GSC clicks (Google):      {gsc_clicks:>10,}')
    print(f'  GSC impressions:          {gsc_impr:>10,}')
    print(f'  GA4 sessions google/organic: {ga4_google_organic:>7,}')
    if gsc_clicks > 0:
        google_gap = 100 * (gsc_clicks - ga4_google_organic) / gsc_clicks
        print(f'  GA4 vs GSC gap:           {google_gap:>9.1f}%')
        print(f'  (esperable -5 a +10% — GA4 puede tener algo más por sesiones que se quedan abiertas)')
        if google_gap > 30:
            print(f'  ⚠️ GAP >30%: BUG REAL de tracking confirmado.')
        elif google_gap < -30:
            print(f'  ⚠️ GA4 reporta MÁS sesiones que GSC clicks — posible sobre-attribution o spam.')
        else:
            print(f'  ✅ Tracking razonable.')

print(f'\n[GA4 — top sources últimos 7d]')
for src, s in sorted(ga4_by_source.items(), key=lambda x: -x[1])[:8]:
    print(f'  {src:<40} {s:>8,}')
print()
