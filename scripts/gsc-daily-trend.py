#!/usr/bin/env python3
"""
GSC día a día: impresiones / clicks / CTR / posición — para juzgar recuperación.

Marca los últimos 3 días como posiblemente parciales (lag GSC).
Agrega bloques de 7 días para ver tendencia limpia de ruido diario.

Uso:
  python3 scripts/gsc-daily-trend.py
  python3 scripts/gsc-daily-trend.py --days 56
"""
import sys
from datetime import date, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

SA = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
SITE = 'sc-domain:hacecuentas.com'

def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag)+1]) if flag in sys.argv else default
DAYS = arg('--days', 56)

creds = service_account.Credentials.from_service_account_file(
    SA, scopes=['https://www.googleapis.com/auth/webmasters.readonly'])
sc = build('searchconsole', 'v1', credentials=creds)

end = date.today()
start = end - timedelta(days=DAYS)
r = sc.searchanalytics().query(siteUrl=SITE, body={
    'startDate': str(start), 'endDate': str(end),
    'dimensions': ['date'], 'rowLimit': 1000}).execute()

rows = [(date.fromisoformat(x['keys'][0]), int(x['clicks']),
         int(x['impressions']), x['ctr']*100, x['position'])
        for x in r.get('rows', [])]
rows.sort()
if not rows:
    print('Sin datos.'); sys.exit()

last_data = rows[-1][0]
partial_from = last_data - timedelta(days=2)   # últimos ~3 días = lag/parcial
DOW = ['lun','mar','mié','jue','vie','sáb','dom']
mx = max(i for _, _, i, _, _ in rows) or 1

print(f'\nGSC DIARIO · {SITE}')
print(f'rango {rows[0][0]} .. {last_data}  (últimos 3 días pueden estar incompletos por lag)\n')
print(f'{"fecha":<12}{"día":<5}{"impr":>7}{"clicks":>7}{"CTR":>7}{"pos":>6}   barra impresiones')
print('-'*84)
for d, c, i, ctr, pos in rows:
    bar = '█' * round(46 * i / mx)
    wd = DOW[d.weekday()]
    tag = ' ⚠parcial' if d >= partial_from else (' ·fin' if d.weekday() >= 5 else '')
    print(f'{d.isoformat():<12}{wd:<5}{i:>7,}{c:>7}{ctr:>6.1f}%{pos:>6.1f}   {bar}{tag}')

# ── Bloques de 7 días (tendencia limpia), excluyendo días parciales ──
full = [r for r in rows if r[0] < partial_from]
print('\n' + '='*68)
print('BLOQUES DE 7 DÍAS (excluye los 3 días parciales del final)')
print('='*68)
print(f'{"semana":<26}{"impr":>9}{"clicks":>8}{"CTR":>7}{"pos":>7}')
blocks = []
i = len(full)
while i - 7 >= 0:
    wk = full[i-7:i]
    imp = sum(x[2] for x in wk); cl = sum(x[1] for x in wk)
    ctr = cl/imp*100 if imp else 0
    pos = sum(x[4] for x in wk)/len(wk)
    blocks.append((wk[0][0], wk[-1][0], imp, cl, ctr, pos))
    i -= 7
blocks.reverse()
prev_imp = None
for s, e, imp, cl, ctr, pos in blocks:
    delta = f'  ({(imp-prev_imp)/prev_imp*100:+.0f}%)' if prev_imp else ''
    print(f'{s.isoformat()}..{e.isoformat()[5:]:<10}{imp:>9,}{cl:>8}{ctr:>6.1f}%{pos:>7.1f}{delta}')
    prev_imp = imp
