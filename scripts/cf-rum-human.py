#!/usr/bin/env python3
"""CF Web Analytics (RUM beacon JS) = humanos reales que ejecutan JS, como GA4. Hoy vs ayer."""
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
TOKEN = os.environ.get('CLOUDFLARE_ANALYTICS_TOKEN') or os.environ.get('CLOUDFLARE_API_TOKEN')

def gql(q, variables):
    req = urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',
        data=json.dumps({'query': q, 'variables': variables}).encode(),
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
    return json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())

now = datetime.now(timezone.utc); cur = now.hour
today = now.date(); d1 = today - timedelta(days=1)

# 1) accounts disponibles
acc = gql("{viewer{accounts{accountTag}}}", {})
if acc.get('errors'):
    print('No puedo listar accounts:', acc['errors']); raise SystemExit
accounts = acc['data']['viewer']['accounts']
print('Accounts:', [a['accountTag'] for a in accounts])
for a in accounts: a.setdefault('name', a['accountTag'])

start = (now - timedelta(hours=47)).replace(minute=0, second=0, microsecond=0)
q = """query($acc:String!,$s:Time!,$e:Time!){viewer{accounts(filter:{accountTag:$acc}){
  rumPageloadEventsAdaptiveGroups(limit:2000, filter:{datetime_geq:$s, datetime_leq:$e}, orderBy:[datetimeHour_ASC]){
    count sum{visits} dimensions{datetimeHour siteTag}}}}}"""
for a in accounts:
    r = gql(q, {'acc': a['accountTag'], 's': start.isoformat().replace('+00:00','Z'), 'e': now.isoformat().replace('+00:00','Z')})
    if r.get('errors'):
        print(f"  {a['name']}: sin acceso RUM ({r['errors'][0].get('message')})"); continue
    groups = r['data']['viewer']['accounts'][0]['rumPageloadEventsAdaptiveGroups']
    if not groups:
        print(f"  {a['name']}: sin datos RUM (¿Web Analytics no activo en esta cuenta?)"); continue
    pv = defaultdict(int); vis = defaultdict(int); sites = set()
    for g in groups:
        dt = datetime.fromisoformat(g['dimensions']['datetimeHour'].replace('Z','+00:00'))
        sites.add(g['dimensions']['siteTag'])
        pv[(dt.date(), dt.hour)] += g['count']
        vis[(dt.date(), dt.hour)] += g['sum']['visits']
    print(f"\n  Account {a['name']} · siteTags: {sites}")
    print(f'  {"hUTC":>4} | {"HOY pv":>7} {"HOY vis":>8} | {"ayer pv":>8} {"ayer vis":>9}')
    print('  ' + '─'*46)
    for h in range(cur + 1):
        print(f'  {h:>4} | {pv.get((today,h),0):>7,} {vis.get((today,h),0):>8,} | {pv.get((d1,h),0):>8,} {vis.get((d1,h),0):>9,}')
    cpt = sum(pv.get((today,h),0) for h in range(cur+1)); cvt = sum(vis.get((today,h),0) for h in range(cur+1))
    cpy = sum(pv.get((d1,h),0) for h in range(cur+1)); cvy = sum(vis.get((d1,h),0) for h in range(cur+1))
    def pct(c,p): return f'{(c-p)/p*100:+.0f}%' if p else 'n/a'
    print('  ' + '─'*46)
    print(f'  ACUM hasta {cur}:00 UTC — pageloads: HOY {cpt:,} vs ayer {cpy:,} ({pct(cpt,cpy)})')
    print(f'  ACUM hasta {cur}:00 UTC — visits:    HOY {cvt:,} vs ayer {cvy:,} ({pct(cvt,cvy)})')
