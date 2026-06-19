#!/usr/bin/env python3
"""Diagnóstico: ¿por qué hoy marca menos sesiones de lo normal a esta hora?

- Realtime (últimos 30 min): confirma inflow actual.
- Sesiones HOY por hora vs mismo día de la semana pasado, en timezone de la propiedad.
- Acumulado hasta la hora actual (cutoff = última hora con datos hoy).
- Corte por canal hasta esa hora → ver si la caída está en Paid (Ads) o es pareja (tracking).
"""
from datetime import date, timedelta
from collections import defaultdict
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, RunRealtimeReportRequest)

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

today = date.today()
last_wk = today - timedelta(days=7)   # mismo día de la semana, semana pasada

def hourly_by_channel(d1, d2):
    """[(hour:int, channel:str, sessions:int)] para el rango d1..d2."""
    resp = client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='hour'), Dimension(name='sessionDefaultChannelGroup')],
        metrics=[Metric(name='sessions')],
        date_ranges=[DateRange(start_date=d1.isoformat(), end_date=d2.isoformat())]))
    return [(int(r.dimension_values[0].value), r.dimension_values[1].value,
             int(r.metric_values[0].value)) for r in resp.rows]

hoy = hourly_by_channel(today, today)
sem = hourly_by_channel(last_wk, last_wk)

# Curva por hora (totales)
def by_hour(rows):
    h = defaultdict(int)
    for hr, _, s in rows:
        h[hr] += s
    return h
hh, hs = by_hour(hoy), by_hour(sem)

cutoff = max([hr for hr in hh], default=0)   # última hora con datos hoy ≈ hora actual

print(f'Property {GA4_PROPERTY}  ·  HOY {today} (timezone de la propiedad)')
print(f'baseline = mismo día semana pasada: {last_wk}\n')

print(f'{"hora":>4}  {"HOY":>7}  {"sem.pas":>8}')
print('  ' + '─' * 22)
for hr in range(0, cutoff + 1):
    mark = '  <- hora actual' if hr == cutoff else ''
    print(f'{hr:>4}  {hh.get(hr,0):>7,}  {hs.get(hr,0):>8,}{mark}')

cum_hoy = sum(hh.get(hr, 0) for hr in range(0, cutoff + 1))
cum_sem = sum(hs.get(hr, 0) for hr in range(0, cutoff + 1))
full_sem = sum(hs.values())
def pct(c, p): return f'{(c-p)/p*100:+.0f}%' if p else 'n/a'
print('  ' + '─' * 22)
print(f'\nACUMULADO hasta hora {cutoff}:  HOY={cum_hoy:,}   sem.pas={cum_sem:,}   ({pct(cum_hoy,cum_sem)})')
print(f'(día completo sem.pasada para referencia: {full_sem:,})')

# Corte por canal hasta el cutoff
def chan_to_cutoff(rows):
    c = defaultdict(int)
    for hr, ch, s in rows:
        if hr <= cutoff:
            c[ch] += s
    return c
ch_hoy, ch_sem = chan_to_cutoff(hoy), chan_to_cutoff(sem)
print(f'\nPOR CANAL (acumulado hasta hora {cutoff}, hoy vs sem.pas):')
print(f'  {"canal":24} {"HOY":>7} {"sem.pas":>8} {"Δ":>7}')
print('  ' + '─' * 50)
for ch in sorted(set(ch_hoy) | set(ch_sem), key=lambda k: ch_sem.get(k, 0), reverse=True):
    print(f'  {ch:24} {ch_hoy.get(ch,0):>7,} {ch_sem.get(ch,0):>8,} {pct(ch_hoy.get(ch,0),ch_sem.get(ch,0)):>7}')

# Realtime: confirma inflow actual
print('\nREALTIME (últimos 30 min):')
try:
    rt = client.run_realtime_report(RunRealtimeReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        metrics=[Metric(name='activeUsers')]))
    total_rt = sum(int(r.metric_values[0].value) for r in rt.rows) if rt.rows else 0
    print(f'  activeUsers (30 min) = {total_rt}')
    rt_c = client.run_realtime_report(RunRealtimeReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='country')],
        metrics=[Metric(name='activeUsers')]))
    for r in rt_c.rows[:6]:
        print(f'    {r.dimension_values[0].value:20} {int(r.metric_values[0].value):>5}')
except Exception as e:
    print(f'  (realtime falló: {e})')
