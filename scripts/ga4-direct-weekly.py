#!/usr/bin/env python3
"""
Tráfico DIRECTO de hacecuentas, semana a semana, con la foto completa de canales
y cortes por país y dispositivo. Para responder "¿cómo evoluciona el directo y de
dónde viene?".

GA4 property 532962136. Semanas de 7 días terminando ayer (último día completo).

Secciones (todas por defecto):
  1. Directo semanal: sesiones, WoW, usuarios, % del total.
  2. Mix de canales por semana (sesiones) — directo vs pago vs orgánico vs resto.
  3. Directo por PAÍS: últimas 4 semanas vs 4 previas.
  4. Directo por DISPOSITIVO: últimas 4 semanas vs 4 previas.

Uso:
  python3 scripts/ga4-direct-weekly.py
  python3 scripts/ga4-direct-weekly.py --weeks 8
  python3 scripts/ga4-direct-weekly.py --no-country --no-device   # solo 1 y 2

Notas:
  - GA4 puede no tener datos más allá de la retención del property (~2 meses);
    las semanas sin datos se marcan como "sin datos".
  - El último día puede seguir asentándose (latencia GA4 24-48h): la semana en
    curso se marca con * y puede ajustar para arriba.
"""
import sys
from datetime import datetime, timedelta, timezone
from collections import defaultdict

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression)


def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag) + 1]) if flag in sys.argv else default


WEEKS = arg('--weeks', 12)
DO_COUNTRY = '--no-country' not in sys.argv
DO_DEVICE = '--no-device' not in sys.argv

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

end = datetime.now(timezone.utc).date() - timedelta(days=1)        # ayer = último día completo
start = end - timedelta(days=WEEKS * 7 - 1)

DIRECT = FilterExpression(filter=Filter(
    field_name='sessionDefaultChannelGroup',
    string_filter=Filter.StringFilter(value='Direct', match_type=Filter.StringFilter.MatchType.EXACT)))


def run(dims, mets, filt=None, start_=None, end_=None):
    return client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name=d) for d in dims],
        metrics=[Metric(name=m) for m in mets],
        date_ranges=[DateRange(start_date=(start_ or start).isoformat(),
                               end_date=(end_ or end).isoformat())],
        dimension_filter=filt,
        limit=100000)).rows


def week_of(datestr):
    d = datetime.strptime(datestr, '%Y%m%d').date()
    delta = (end - d).days
    if delta < 0:
        return None
    w = delta // 7
    return w if w < WEEKS else None


def wk_label(w):
    s = end - timedelta(days=7 * w + 6)
    e = end - timedelta(days=7 * w)
    return f'{s.strftime("%m-%d")}..{e.strftime("%m-%d")}'


def window(weeks_back_start, nweeks):
    e = end - timedelta(days=7 * weeks_back_start)
    s = e - timedelta(days=7 * nweeks - 1)
    return s, e


# ---- datos diarios por canal (alimenta secciones 1 y 2) ----
wk_chan = defaultdict(lambda: defaultdict(lambda: [0, 0]))   # week -> channel -> [sessions, users]
wk_total = defaultdict(int)
for r in run(['date', 'sessionDefaultChannelGroup'], ['sessions', 'totalUsers']):
    w = week_of(r.dimension_values[0].value)
    if w is None:
        continue
    ch = r.dimension_values[1].value
    wk_chan[w][ch][0] += int(r.metric_values[0].value)
    wk_chan[w][ch][1] += int(r.metric_values[1].value)
    wk_total[w] += int(r.metric_values[0].value)

# ---- SECCIÓN 1: directo semanal ----
print(f'GA4 {GA4_PROPERTY} · TRÁFICO DIRECTO semanal · semanas terminando {end}')
print(f'{"semana":<17}{"sesiones":>9}{"WoW":>7}{"usuarios":>10}{"% total":>9}')
print('-' * 52)
prev = None
direct_weeks = []
for w in range(WEEKS - 1, -1, -1):
    tot = wk_total.get(w, 0)
    lbl = wk_label(w)
    if tot == 0:
        print(f'{lbl:<17}{"— sin datos —":>35}')
        continue
    s, u = wk_chan[w].get('Direct', [0, 0])
    wow = f'{((s - prev) / prev * 100):+.0f}%' if prev else '—'
    tag = ' *' if w == 0 else ''
    print(f'{lbl + tag:<17}{s:>9,}{wow:>7}{u:>10,}{s / tot * 100:>8.0f}%')
    prev = s
    direct_weeks.append(s)
print('  * semana en curso / recién cerrada (puede ajustar por latencia GA4)')

complete = direct_weeks[:-1]
if len(complete) >= 8:
    import statistics
    f4 = statistics.mean(complete[:4])
    l4 = statistics.mean(complete[-4:])
    print(f'  tendencia (sem. completas): media primeras 4 {f4:,.0f} → últimas 4 {l4:,.0f} = {((l4 - f4) / f4 * 100):+.0f}%')

# ---- SECCIÓN 1b: directo HUMANO (países target; excluye el ruido bot US/China/Singapur) ----
# KPI del plan de tráfico directo (2026-07-08): baseline ~15/día AR.
HUMAN_COUNTRIES = {
    'Argentina', 'Colombia', 'Mexico', 'Chile', 'Peru', 'Ecuador', 'Venezuela',
    'Paraguay', 'Uruguay', 'Bolivia', 'Dominican Republic', 'Spain', 'Portugal',
    'Brazil', 'Guatemala', 'Costa Rica', 'Panama', 'Honduras', 'Nicaragua', 'El Salvador'}
wk_human = defaultdict(int)
wk_ar = defaultdict(int)
for r in run(['date', 'country'], ['sessions'], filt=DIRECT):
    w = week_of(r.dimension_values[0].value)
    if w is None:
        continue
    c = r.dimension_values[1].value
    if c in HUMAN_COUNTRIES:
        wk_human[w] += int(r.metric_values[0].value)
    if c == 'Argentina':
        wk_ar[w] += int(r.metric_values[0].value)
print(f'\nDIRECTO HUMANO (países target, sin US/China/Singapur y demás ruido bot)')
print(f'{"semana":<17}{"target":>8}{"/día":>7}{"AR":>7}{"AR/día":>8}')
print('-' * 48)
for w in range(WEEKS - 1, -1, -1):
    if wk_total.get(w, 0) == 0:
        continue
    h, a = wk_human.get(w, 0), wk_ar.get(w, 0)
    tag = ' *' if w == 0 else ''
    print(f'{wk_label(w) + tag:<17}{h:>8,}{h / 7:>7.1f}{a:>7,}{a / 7:>8.1f}')

# ---- SECCIÓN 2: mix de canales por semana ----
chan_tot = defaultdict(int)
for w in wk_chan:
    for ch, (s, u) in wk_chan[w].items():
        chan_tot[ch] += s
top_ch = [c for c, _ in sorted(chan_tot.items(), key=lambda x: -x[1])][:6]
print(f'\nMIX DE CANALES (sesiones/semana) · top {len(top_ch)} canales')
print(f'{"semana":<17}' + ''.join(f'{c[:11]:>12}' for c in top_ch))
print('-' * (17 + 12 * len(top_ch)))
for w in range(WEEKS - 1, -1, -1):
    if wk_total.get(w, 0) == 0:
        continue
    print(f'{wk_label(w):<17}' + ''.join(f'{wk_chan[w].get(c, [0, 0])[0]:>12,}' for c in top_ch))

# ---- SECCIÓN 3: directo por país ----
if DO_COUNTRY:
    rs, re_ = window(0, 4)
    ps, pe = window(4, 4)

    def by_dim(dim, s, e):
        return {r.dimension_values[0].value: int(r.metric_values[0].value)
                for r in run([dim], ['sessions'], filt=DIRECT, start_=s, end_=e)}

    rec, pri = by_dim('country', rs, re_), by_dim('country', ps, pe)
    print(f'\nDIRECTO POR PAÍS · últimas 4 sem ({rs}..{re_}) vs 4 previas ({ps}..{pe})')
    print(f'{"país":<22}{"recién":>8}{"previo":>8}{"Δ":>8}')
    print('-' * 46)
    for c in sorted(rec, key=lambda c: -rec[c])[:12]:
        r, p = rec[c], pri.get(c, 0)
        d = f'{((r - p) / p * 100):+.0f}%' if p else ('nuevo' if r else '—')
        print(f'{c[:22]:<22}{r:>8,}{p:>8,}{d:>8}')

# ---- SECCIÓN 4: directo por dispositivo ----
if DO_DEVICE:
    rs, re_ = window(0, 4)
    ps, pe = window(4, 4)

    def by_dim(dim, s, e):
        return {r.dimension_values[0].value: int(r.metric_values[0].value)
                for r in run([dim], ['sessions'], filt=DIRECT, start_=s, end_=e)}

    rec, pri = by_dim('deviceCategory', rs, re_), by_dim('deviceCategory', ps, pe)
    print(f'\nDIRECTO POR DISPOSITIVO · últimas 4 sem vs 4 previas')
    print(f'{"dispositivo":<16}{"recién":>8}{"previo":>8}{"Δ":>8}')
    print('-' * 40)
    for c in sorted(rec, key=lambda c: -rec[c]):
        r, p = rec[c], pri.get(c, 0)
        d = f'{((r - p) / p * 100):+.0f}%' if p else '—'
        print(f'{c[:16]:<16}{r:>8,}{p:>8,}{d:>8}')
