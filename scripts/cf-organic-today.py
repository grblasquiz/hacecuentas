#!/usr/bin/env python3
"""
CF (zona) — tráfico ORGÁNICO de HOY por buscador, near-real-time. Esquiva el lag de GA4.
Compara HOY (00:00→ahora UTC) vs AYER al MISMO horario.

Dataset: httpRequestsAdaptiveGroups (zona) filtrado a HTML, dimensión clientRefererHost.
count de requests HTML con referer de buscador ≈ entradas orgánicas (≈ sesiones).

CAVEAT IMPORTANTE: el referer 'www.google.*' NO separa orgánico de Google Ads/Discover.
Como el sitio es ~70% Paid Google, ese número es CASI TODO ADS → se reporta aparte, NO
se suma al orgánico. El orgánico LIMPIO y confiable = Bing + Yahoo + DuckDuckGo + Brave + Ecosia + ...
"""
import os, ssl, json, urllib.request
from datetime import datetime, timedelta, timezone, time as dtime
from collections import defaultdict

for line in open(os.path.join(os.path.dirname(__file__), '..', '.env')):
    if '=' in line and not line.strip().startswith('#'):
        k, v = line.strip().split('=', 1)
        os.environ.setdefault(k, v.strip('"').strip("'"))
try:
    import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    ctx = ssl.create_default_context()
TOKEN = os.environ.get('CLOUDFLARE_ANALYTICS_TOKEN') or os.environ.get('CLOUDFLARE_API_TOKEN')
ZONE = os.environ.get('CLOUDFLARE_ZONE_ID')

def gql(s, e):
    q = """query($z:String!,$s:Time!,$e:Time!){viewer{zones(filter:{zoneTag:$z}){
      httpRequestsAdaptiveGroups(limit:1000, orderBy:[count_DESC], filter:{
        datetime_geq:$s, datetime_leq:$e, edgeResponseContentTypeName:"html"}){
        count dimensions{clientRefererHost}}}}}"""
    req = urllib.request.Request('https://api.cloudflare.com/client/v4/graphql',
        data=json.dumps({'query': q, 'variables': {'z': ZONE,
            's': s.isoformat().replace('+00:00','Z'), 'e': e.isoformat().replace('+00:00','Z')}}).encode(),
        headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'})
    b = json.loads(urllib.request.urlopen(req, timeout=30, context=ctx).read())
    if b.get('errors'): raise SystemExit('CF error: ' + b['errors'][0].get('message',''))
    out = {}
    for r in b['data']['viewer']['zones'][0]['httpRequestsAdaptiveGroups']:
        out[r['dimensions']['clientRefererHost'] or ''] = r['count']
    return out

def classify(host):
    h = (host or '').lower().strip()
    if not h: return ('(directo / sin referer)', 'direct')
    if 'hacecuentas' in h: return ('(interno)', 'internal')
    if any(s in h for s in ('googleadservices','doubleclick','googlesyndication')):
        return ('Google Ads', 'google')
    if 'google.' in h or h == 'google': return ('Google (Ads/orgánico/Discover*)', 'google')
    if 'bing.' in h or h == 'bing': return ('Bing', 'organic')
    if 'yahoo' in h: return ('Yahoo', 'organic')
    if 'duckduckgo' in h: return ('DuckDuckGo', 'organic')
    if 'ecosia' in h: return ('Ecosia', 'organic')
    if 'brave' in h: return ('Brave', 'organic')
    if any(s in h for s in ('qwant','yandex','baidu','startpage','searx','ask.com','aol.','seznam','naver')):
        return ('Otro buscador', 'organic')
    return (host, 'referral')

# Día CALENDARIO argentino (UTC-3), que es el "hoy" mental de Martin y captura el día casi completo.
ART = timezone(timedelta(hours=-3))
now = datetime.now(timezone.utc)
now_art = now.astimezone(ART)
today0_art = datetime.combine(now_art.date(), dtime(0,0), tzinfo=ART)
elapsed = now_art - today0_art
today0 = today0_art.astimezone(timezone.utc)              # límites en UTC para el query
y_start = (today0_art - timedelta(days=1)).astimezone(timezone.utc)
y_end = y_start + elapsed                                 # ayer al mismo horario
w_start = (today0_art - timedelta(days=7)).astimezone(timezone.utc)
w_end = w_start + elapsed                                 # mismo día semana pasada (estacionalidad)

today = gql(today0, now)
yest  = gql(y_start, y_end)
week  = gql(w_start, w_end)

def agg(raw):
    by_label = defaultdict(int); by_kind = defaultdict(int)
    for host, c in raw.items():
        label, kind = classify(host)
        by_label[label] += c; by_kind[kind] += c
    return by_label, by_kind
tl, tk = agg(today)
yl, yk = agg(yest)
wl, wk = agg(week)
def pct(c, p): return f'{(c-p)/p*100:+.0f}%' if p else ('nuevo' if c else '—')

DOW = ['lun','mar','mié','jue','vie','sáb','dom']
d_t = now_art.date(); d_y = d_t - timedelta(days=1); d_w = d_t - timedelta(days=7)
hh = now_art.strftime('%H:%M')
print(f'\nCLOUDFLARE (zona) · requests HTML por referer ≈ entradas · hora ARG (UTC-3) · acum 00:00→{hh}')
print(f'HOY {d_t}({DOW[d_t.weekday()]}) · ayer {d_y}({DOW[d_y.weekday()]}) · hace 7d {d_w}({DOW[d_w.weekday()]})')
print(f'>> lectura válida = "Δ vs7d" (mismo día de semana; el sitio cae fuerte el finde)')
print('='*72)

kind_of = {}
for host in set(today)|set(yest)|set(week):
    lbl, k = classify(host); kind_of[lbl] = k
hdr = f'{"":<32}{"HOY":>7}{"ayer":>7}{"7dprev":>8}{"Δ vs7d":>9}'

print('\nORGÁNICO LIMPIO (buscadores no-Google)')
print(hdr); print('-'*63)
for l in sorted(set(tl)|set(wl), key=lambda l:-tl.get(l,0)):
    if kind_of.get(l) != 'organic': continue
    print(f'{l:<32}{tl.get(l,0):>7,}{yl.get(l,0):>7,}{wl.get(l,0):>8,}{pct(tl.get(l,0),wl.get(l,0)):>9}')
print('-'*63)
print(f'{"TOTAL ORGÁNICO LIMPIO":<32}{tk["organic"]:>7,}{yk["organic"]:>7,}{wk["organic"]:>8,}{pct(tk["organic"],wk["organic"]):>9}')

print('\nGOOGLE (referer — casi todo Ads*)')
print(hdr); print('-'*63)
print(f'{"Google (Ads/org/Discover)":<32}{tk["google"]:>7,}{yk["google"]:>7,}{wk["google"]:>8,}{pct(tk["google"],wk["google"]):>9}')

print('\nOTROS')
print(hdr); print('-'*63)
for k, lbl in [('direct','Directo / sin referer'),('referral','Referral (otros sitios)'),('internal','Interno (navegación)')]:
    print(f'{lbl:<32}{tk[k]:>7,}{yk[k]:>7,}{wk[k]:>8,}{pct(tk[k],wk[k]):>9}')
gt, gy, gw = sum(tk.values()), sum(yk.values()), sum(wk.values())
print('-'*63)
print(f'{"TOTAL requests HTML":<32}{gt:>7,}{gy:>7,}{gw:>8,}{pct(gt,gw):>9}')

print(f'\n* Google por referer mezcla Ads/orgánico/Discover y el sitio es ~70% Paid → NO es orgánico.')
print(f'  Orgánico real medible = Bing+Yahoo+DDG+Brave+Ecosia (donde de hecho vive el orgánico del sitio).')
