#!/usr/bin/env python3
"""
Cross-check GA4 vs Cloudflare Analytics — % mobile real de los HITS al server.

GA4 depende de gtag (client-side, puede fallar por CSP/SW/ITP/adblockers).
CF Analytics mide TODO el tráfico que llega al edge — números sin gap.

Uso:
  python3 scripts/cf-analytics-mobile.py             # últimos 7 días
  python3 scripts/cf-analytics-mobile.py --days 14   # últimos 14 días
"""
import os, sys, json, ssl, urllib.request, urllib.error
from datetime import datetime, timedelta, timezone

try:
    import certifi
    _ssl_ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    _ssl_ctx = ssl.create_default_context()

env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(env_path):
    for line in open(env_path):
        if '=' in line and not line.strip().startswith('#'):
            k, v = line.strip().split('=', 1)
            os.environ.setdefault(k, v.strip('"').strip("'"))

TOKEN = os.environ.get('CLOUDFLARE_ANALYTICS_TOKEN') or os.environ.get('CLOUDFLARE_API_TOKEN')
ZONE = os.environ.get('CLOUDFLARE_ZONE_ID')
if not TOKEN or not ZONE:
    print('ERROR: faltan CLOUDFLARE_ANALYTICS_TOKEN (o CLOUDFLARE_API_TOKEN) o CLOUDFLARE_ZONE_ID en .env')
    sys.exit(1)

days = 7
if '--days' in sys.argv:
    days = int(sys.argv[sys.argv.index('--days') + 1])

end = datetime.now(timezone.utc)
start = end - timedelta(days=days)

# CF GraphQL Analytics API. httpRequestsAdaptiveGroups con dim deviceType.
query = """
query Mobile($zoneTag: String!, $start: Date!, $end: Date!) {
  viewer {
    zones(filter: {zoneTag: $zoneTag}) {
      httpRequests1dGroups(
        limit: 1000,
        filter: {date_geq: $start, date_leq: $end}
      ) {
        sum {
          browserMap { uaBrowserFamily, pageViews }
        }
        uniq { uniques }
        dimensions { date }
      }
    }
  }
}
"""

payload = {
    'query': query,
    'variables': {
        'zoneTag': ZONE,
        'start': start.date().isoformat(),
        'end': end.date().isoformat(),
    },
}

req = urllib.request.Request(
    'https://api.cloudflare.com/client/v4/graphql',
    data=json.dumps(payload).encode(),
    headers={
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json',
    },
    method='POST',
)

try:
    resp = urllib.request.urlopen(req, timeout=30, context=_ssl_ctx)
    body = json.loads(resp.read())
except urllib.error.HTTPError as e:
    print(f'HTTP {e.code}:', e.read().decode())
    sys.exit(1)

if body.get('errors'):
    print('GraphQL errors:', json.dumps(body['errors'], indent=2))
    sys.exit(1)

groups = body['data']['viewer']['zones'][0]['httpRequests1dGroups']
if not groups:
    print('Sin datos en el período')
    sys.exit(0)

# Browser map → inferimos device por familia (Mobile Safari + Chrome Mobile etc.)
browser_totals = {}
total_uniques = 0
total_reqs = 0
for g in groups:
    total_uniques += g['uniq']['uniques']
    for b in g['sum']['browserMap']:
        fam = b['uaBrowserFamily'] or 'unknown'
        pv = b['pageViews']
        browser_totals[fam] = browser_totals.get(fam, 0) + pv
        total_reqs += pv

print(f'\n=== CF Analytics — últimos {days} días ===')
print(f'Uniques (unique IPs): {total_uniques:,}')
print(f'Total page views: {total_reqs:,}\n')

# Heurística: "Mobile" suele aparecer en uaBrowserFamily como "Mobile Safari", "Chrome Mobile", etc.
MOBILE_KEYWORDS = ('Mobile', 'iOS', 'Android', 'Samsung Internet', 'Opera Mini', 'WebView')
mobile_pv = 0
desktop_pv = 0
other_pv = 0
for fam, pv in browser_totals.items():
    if any(k in fam for k in MOBILE_KEYWORDS):
        mobile_pv += pv
    elif fam in ('unknown', ''):
        other_pv += pv
    else:
        desktop_pv += pv

classified = mobile_pv + desktop_pv
mobile_pct = 100 * mobile_pv / classified if classified else 0

print(f'Top 15 browsers por PV:')
for fam, pv in sorted(browser_totals.items(), key=lambda x: -x[1])[:15]:
    cls = 'mobile' if any(k in fam for k in MOBILE_KEYWORDS) else ('?' if fam in ('unknown','') else 'desktop')
    pct = 100 * pv / total_reqs if total_reqs else 0
    print(f'  [{cls:>7}] {fam:<35} {pv:>8,} ({pct:5.1f}%)')

print(f'\n→ Mobile (server-side, sin gtag): {mobile_pv:,} PV ({mobile_pct:.1f}% de los clasificados)')
print(f'  Desktop: {desktop_pv:,} PV')
print(f'  Other/unknown: {other_pv:,} PV')
print(f'\n  Si GA4 dice mucho menos que {int(mobile_pct - 5)}% → hay gap real de tracking mobile.')
