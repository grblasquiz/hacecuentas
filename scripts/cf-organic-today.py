#!/usr/bin/env python3
"""
CF Web Analytics (RUM) — tráfico ORGÁNICO de HOY por buscador, en near-real-time.
Esquiva el lag de GA4. Compara HOY vs AYER al MISMO horario (acum hasta la hora UTC actual).

'visits' de CF RUM ≈ sesiones (pageload con referer externo = una entrada al sitio).
CAVEAT: el referer 'google.*' puede mezclar algo de Google Ads/Discover (no siempre
separable por referer). Bing/Yahoo/DDG sí son orgánico limpio.
"""
import os, ssl, json, urllib.request
from datetime import datetime, timedelta, timezone, time as dtime
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
start = datetime.combine(d1, dtime(0, 0), tzinfo=timezone.utc)  # desde ayer 00:00 UTC

def classify(host):
    h = (host or '').lower().strip()
    if not h: return ('(directo / sin referer)', 'direct')
    if 'hacecuentas' in h: return ('(interno)', 'internal')
    if any(s in h for s in ('googleadservices', 'doubleclick', 'googlesyndication')):
        return ('Google Ads', 'paid')
    if 'google.' in h or h == 'google': return ('Google (orgánico*)', 'organic')
    if 'bing.' in h or h == 'bing': return ('Bing', 'organic')
    if 'yahoo' in h: return ('Yahoo', 'organic')
    if 'duckduckgo' in h: return ('DuckDuckGo', 'organic')
    if 'ecosia' in h: return ('Ecosia', 'organic')
    if any(s in h for s in ('qwant', 'yandex', 'baidu', 'brave', 'startpage',
                            'searx', 'ask.com', 'aol.', 'seznam', 'naver')):
        return ('Otro buscador', 'organic')
    return (host, 'referral')

acc = gql("{viewer{accounts{accountTag}}}", {})
if acc.get('errors'):
    print('No puedo listar accounts:', acc['errors']); raise SystemExit
accounts = [a['accountTag'] for a in acc['data']['viewer']['accounts']]

q = """query($acc:String!,$s:Time!,$e:Time!){viewer{accounts(filter:{accountTag:$acc}){
  rumPageloadEventsAdaptiveGroups(limit:10000, filter:{datetime_geq:$s, datetime_leq:$e}){
    count sum{visits} dimensions{datetimeHour refererHost siteTag}}}}}"""

found = False
for tag in accounts:
    r = gql(q, {'acc': tag, 's': start.isoformat().replace('+00:00','Z'),
                'e': now.isoformat().replace('+00:00','Z')})
    if r.get('errors'): continue
    groups = r['data']['viewer']['accounts'][0]['rumPageloadEventsAdaptiveGroups']
    if not groups: continue
    found = True

    # acumular por (label, día) hasta la hora UTC actual (comparación justa hoy vs ayer)
    vis = defaultdict(lambda: defaultdict(int))   # label -> {today: v, d1: v}
    kind = {}
    tot = defaultdict(lambda: defaultdict(int))
    for g in groups:
        dt = datetime.fromisoformat(g['dimensions']['datetimeHour'].replace('Z','+00:00'))
        if dt.hour > cur: continue                # solo hasta misma hora del día
        day = dt.date()
        if day not in (today, d1): continue
        label, k = classify(g['dimensions']['refererHost'])
        v = g['sum']['visits']
        vis[label][day] += v; kind[label] = k
        tot[k][day] += v

    def pct(c, p): return f'{(c-p)/p*100:+.0f}%' if p else ('nuevo' if c else '—')

    print(f'\nCLOUDFLARE RUM · visits (≈sesiones) · acum 00:00→{cur}:59 UTC · hoy {today} vs ayer {d1}')
    print('='*68)

    # ORGÁNICO desglosado
    org = sorted([l for l in vis if kind[l]=='organic'], key=lambda l:-vis[l][today])
    print(f'\n{"ORGÁNICO (buscadores)":<26}{"HOY":>7}{"ayer":>7}{"Δ%":>8}')
    print('-'*48)
    for l in org:
        print(f'{l:<26}{vis[l][today]:>7,}{vis[l][d1]:>7,}{pct(vis[l][today],vis[l][d1]):>8}')
    ot, oy = tot['organic'][today], tot['organic'][d1]
    print('-'*48)
    print(f'{"TOTAL ORGÁNICO":<26}{ot:>7,}{oy:>7,}{pct(ot,oy):>8}')

    # resto de canales para contexto
    print(f'\n{"OTROS CANALES":<26}{"HOY":>7}{"ayer":>7}{"Δ%":>8}')
    print('-'*48)
    for k, lbl in [('paid','Google Ads (referer)'), ('direct','Directo/sin referer'),
                   ('referral','Referral'), ('internal','Interno (navegación)')]:
        print(f'{lbl:<26}{tot[k][today]:>7,}{tot[k][d1]:>7,}{pct(tot[k][today],tot[k][d1]):>8}')

    grand_t = sum(tot[k][today] for k in tot)
    grand_y = sum(tot[k][d1] for k in tot)
    print('-'*48)
    print(f'{"TOTAL visits":<26}{grand_t:>7,}{grand_y:>7,}{pct(grand_t,grand_y):>8}')
    print(f'\nNota: hora UTC actual {cur}:xx → comparación a igual punto del día.')
    print('* "Google orgánico" por referer puede incluir algo de Ads/Discover. Bing/Yahoo/DDG = orgánico limpio.')
    break

if not found:
    print('Sin datos RUM en ninguna account (¿Web Analytics activo?). Probá scripts/cf-rum-human.py')
