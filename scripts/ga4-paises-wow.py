#!/usr/bin/env python3
"""Tráfico de las calculadoras por vertical de país, últimos 7 días vs 7 previos (WoW).

Agrupa pagePath por sección de país (/pt Brasil, /en inglés, /ec Ecuador, /pe Perú,
landings LATAM sueltas, y raíz = Argentina/ES) y compara dos ventanas de 7 días.
También imprime un corte por país del VISITANTE (dimensión country).
"""
import sys
from datetime import datetime, timedelta, timezone
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, OrderBy, Filter, FilterExpression

creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

# Por defecto: solo tráfico orgánico (Organic Search = Google + Bing + otros buscadores). --all = todos los canales.
ORGANIC = '--all' not in sys.argv
ORG_FILTER = FilterExpression(filter=Filter(
    field_name='sessionDefaultChannelGroup',
    string_filter=Filter.StringFilter(value='Organic Search', match_type=Filter.StringFilter.MatchType.EXACT))) if ORGANIC else None

end = datetime.now(timezone.utc).date() - timedelta(days=1)        # ayer (último día completo)
cur_start = end - timedelta(days=6)                                # ventana actual = 7 días
prev_end = cur_start - timedelta(days=1)
prev_start = prev_end - timedelta(days=6)                          # ventana previa = 7 días

import glob, json
# Mapa slug→audience de las calcs de la RAÍZ (calcs/), para separar AR/MX/CL/CO/PE/ES/global que viven sin prefijo.
root2aud = {}
for f in glob.glob('/Users/marrod/hacecuentas/src/content/calcs/*.json'):
    try:
        d = json.load(open(f)); root2aud[d['slug']] = d.get('audience', 'global')
    except Exception:
        pass

PREFIX2COUNTRY = {'mx': 'México', 'cl': 'Chile', 'co': 'Colombia', 'pe': 'Perú',
                  'ec': 'Ecuador', 'pt': 'Brasil', 'es': 'España', 'en': 'Inglés/US'}
AUD2COUNTRY = {'AR': 'Argentina', 'MX': 'México', 'CL': 'Chile', 'CO': 'Colombia', 'PE': 'Perú',
               'EC': 'Ecuador', 'ES': 'España', 'BO': 'Bolivia', 'BR': 'Brasil', 'US': 'Inglés/US',
               'EN': 'Inglés/US', 'global': 'Global (raíz, sin país)'}
LANDING = {'mexico': 'México', 'colombia': 'Colombia', 'chile': 'Chile', 'peru': 'Perú',
           'ecuador': 'Ecuador', 'bolivia': 'Bolivia', 'uruguay': 'Uruguay', 'venezuela': 'Venezuela'}

def clasifica(path):
    """→ (país, tipo)  tipo ∈ {calc, landing, otro}"""
    p = path.lower().split('?')[0].strip('/')
    parts = p.split('/')
    head = parts[0] if parts else ''
    if head in PREFIX2COUNTRY:                        # carpeta dedicada: /mx /cl /co /pe /ec /pt /es /en
        return PREFIX2COUNTRY[head], 'calc'
    if head in root2aud:                             # calc de la raíz → su audience
        return AUD2COUNTRY.get(root2aud[head], 'Global (raíz, sin país)'), 'calc'
    for k, v in LANDING.items():                     # landing de país suelta (dólar/feriados/datos)
        if f'-{k}' in p or p.endswith('/' + k) or f'{k}-' in p:
            return v, 'landing'
    return 'Otras (home/categorías/guías)', 'otro'

def pais(path):
    return clasifica(path)[0]

def fetch(dim, start, end_, limit=10000):
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name=dim)],
        metrics=[Metric(name='screenPageViews'), Metric(name='sessions')],
        date_ranges=[DateRange(start_date=start.isoformat(), end_date=end_.isoformat())],
        dimension_filter=ORG_FILTER,
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'), desc=True)],
        limit=limit))
    return [(r.dimension_values[0].value, int(r.metric_values[0].value), int(r.metric_values[1].value)) for r in resp.rows]

def pct(cur, prev):
    if prev == 0: return '  nuevo' if cur else '   0%'
    return f'{(cur-prev)/prev*100:+6.0f}%'

def comparativa(titulo, key_fn, cur_rows, prev_rows, top=None):
    from collections import defaultdict
    cur = defaultdict(lambda: [0, 0]); prev = defaultdict(lambda: [0, 0])
    for name, pv, ss in cur_rows:
        k = key_fn(name); cur[k][0] += pv; cur[k][1] += ss
    for name, pv, ss in prev_rows:
        k = key_fn(name); prev[k][0] += pv; prev[k][1] += ss
    keys = set(cur) | set(prev)
    rows = sorted(keys, key=lambda k: cur[k][0], reverse=True)
    if top: rows = rows[:top]
    print(f'\n{titulo}')
    print(f'  {"sección":24} {"pviews 7d":>11} {"prev 7d":>10} {"Δ":>8}   {"ses 7d":>8} {"prev":>8}')
    print('  ' + '─' * 74)
    tc = tp = tcs = tps = 0
    for k in rows:
        c, p = cur[k], prev[k]
        tc += c[0]; tp += p[0]; tcs += c[1]; tps += p[1]
        print(f'  {k:24} {c[0]:>11,} {p[0]:>10,} {pct(c[0],p[0]):>8}   {c[1]:>8,} {p[1]:>8,}')
    print('  ' + '─' * 74)
    print(f'  {"TOTAL":24} {tc:>11,} {tp:>10,} {pct(tc,tp):>8}   {tcs:>8,} {tps:>8,}')

print(f'Property {GA4_PROPERTY}  ·  canal: {"SOLO ORGÁNICO (Organic Search)" if ORGANIC else "TODOS"}')
print(f'  ACTUAL : {cur_start} .. {end}')
print(f'  PREVIO : {prev_start} .. {prev_end}')

cur_paths = fetch('pagePath', cur_start, end)
prev_paths = fetch('pagePath', prev_start, prev_end)
comparativa('═══ CALCULADORAS POR PAÍS (carpeta dedicada + audience de raíz) ═══', pais, cur_paths, prev_paths)

# Desglose calc-pura vs landing (dólar/feriados) para los países donde la landing pesa
from collections import defaultdict
def split_calc_landing(rows):
    agg = defaultdict(lambda: {'calc': 0, 'landing': 0})
    for name, pv, _ in rows:
        c, t = clasifica(name)
        if t in ('calc', 'landing'):
            agg[c][t] += pv
    return agg
sc, sp = split_calc_landing(cur_paths), split_calc_landing(prev_paths)
print('\n═══ COMPOSICIÓN: calc-pura vs landing dólar/feriados (pviews orgánico 7d, actual) ═══')
print(f'  {"país":24} {"calc 7d":>9} {"(prev)":>8}   {"landing 7d":>11} {"(prev)":>8}')
print('  ' + '─' * 66)
for k in sorted(sc, key=lambda k: sc[k]['calc'] + sc[k]['landing'], reverse=True):
    if 'Global' in k or 'Otras' in k: continue
    print(f'  {k:24} {sc[k]["calc"]:>9,} {sp[k]["calc"]:>8,}   {sc[k]["landing"]:>11,} {sp[k]["landing"]:>8,}')

cur_country = fetch('country', cur_start, end, limit=300)
prev_country = fetch('country', prev_start, prev_end, limit=300)
comparativa('═══ POR PAÍS DEL VISITANTE (top 15) ═══', lambda x: x or '(not set)', cur_country, prev_country, top=15)
