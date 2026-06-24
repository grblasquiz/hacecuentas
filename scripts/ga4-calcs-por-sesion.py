#!/usr/bin/env python3
"""¿Cuántas calculadoras usa un usuario por sesión? (evento calculator_used)

Dos métricas distintas:
  A) Cálculos por sesión   = eventCount(calculator_used) / sessions   (incluye recálculos de la misma calc)
  B) Calcs DISTINTAS/ses   = Σ sessions_por_calc_slug / sessions_con_evento
     (sumar `sessions` por calc_slug cuenta cada (sesión, slug-distinto) una vez → promedio de calcs únicas por sesión activa)

Uso: python3 scripts/ga4-calcs-por-sesion.py [--days 28]
"""
import sys
from datetime import datetime, timedelta, timezone
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, Filter, FilterExpression, OrderBy)

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
EVENT = 'calculator_used'
DAYS = int(sys.argv[sys.argv.index('--days')+1]) if '--days' in sys.argv else 28

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

def run(dims, metrics, start, end, evfilter=False, order_metric=None, limit=None):
    kw = dict(property=f'properties/{GA4_PROPERTY}',
              dimensions=[Dimension(name=d) for d in dims],
              metrics=[Metric(name=m) for m in metrics],
              date_ranges=[DateRange(start_date=start, end_date=end)])
    if evfilter:
        kw['dimension_filter'] = FilterExpression(filter=Filter(
            field_name='eventName', string_filter=Filter.StringFilter(value=EVENT)))
    if order_metric:
        kw['order_bys'] = [OrderBy(metric=OrderBy.MetricOrderBy(metric_name=order_metric), desc=True)]
    if limit:
        kw['limit'] = limit
    return client.run_report(RunReportRequest(**kw))

def window(days, label):
    end = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    start = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
    print(f"\n{'='*64}\n  {label}: {start} → {end} ({days}d)\n{'='*64}")

    # Totales del sitio
    tot = run([], ['sessions', 'totalUsers'], start, end)
    ses_tot = int(tot.rows[0].metric_values[0].value)
    usr_tot = int(tot.rows[0].metric_values[1].value)

    # Evento calculator_used: cálculos, sesiones con evento, usuarios con evento
    ev = run(['eventName'], ['eventCount', 'sessions', 'totalUsers'], start, end, evfilter=True)
    if not ev.rows:
        print("  Sin eventos calculator_used en el rango.")
        return
    calcs = int(ev.rows[0].metric_values[0].value)        # total cálculos ejecutados
    ses_ev = int(ev.rows[0].metric_values[1].value)       # sesiones que calcularon ≥1 vez
    usr_ev = int(ev.rows[0].metric_values[2].value)       # usuarios que calcularon

    # B) calcs distintas por sesión: Σ sessions por calc_slug
    distintas = None
    other_flag = False
    try:
        by = run(['customEvent:calc_slug'], ['sessions'], start, end, evfilter=True,
                 order_metric='sessions', limit=100000)
        suma_ses_slug = 0
        for r in by.rows:
            slug = r.dimension_values[0].value
            if slug in ('(other)', '(not set)', ''):
                other_flag = True
            suma_ses_slug += int(r.metric_values[0].value)
        if ses_ev:
            distintas = suma_ses_slug / ses_ev
        top = [(r.dimension_values[0].value, int(r.metric_values[0].value)) for r in by.rows[:12]]
    except Exception as e:
        top = []
        print(f"  (calc_slug no registrado como custom dimension: {type(e).__name__})")

    print(f"\n  Sitio total ...... {ses_tot:>9,} sesiones · {usr_tot:>9,} usuarios")
    print(f"  Calcularon ....... {ses_ev:>9,} sesiones ({ses_ev/ses_tot*100:4.1f}% de las sesiones) · {usr_ev:,} usuarios")
    print(f"  Cálculos totales . {calcs:>9,} eventos calculator_used")
    print(f"\n  ── Calculadoras por sesión ──")
    print(f"  A) Cálculos / sesión ACTIVA (incl. recálculos) ...... {calcs/ses_ev:5.2f}")
    print(f"     Cálculos / sesión GLOBAL (todo el tráfico) ....... {calcs/ses_tot:5.2f}")
    if distintas is not None:
        print(f"  B) Calcs DISTINTAS / sesión activa .................. {distintas:5.2f}{'   ⚠ hay (other), subestima cola' if other_flag else ''}")
        print(f"     Recálculo factor (A_activa / B) ................. {(calcs/ses_ev)/distintas:5.2f}x")
    print(f"  Cálculos / usuario ................................... {calcs/usr_tot:5.2f}")

    if top:
        print(f"\n  Top calcs por sesiones que la usaron:")
        for slug, s in top:
            print(f"    {s:>7,}  {slug}")

window(DAYS, f"VENTANA {DAYS}d")
window(90, "CONTEXTO 90d")
