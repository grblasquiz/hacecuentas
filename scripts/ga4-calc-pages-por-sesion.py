#!/usr/bin/env python3
"""Páginas de CALCULADORA distintas vistas por sesión (proxy de 'calcs distintas', vía pagePath estándar).

Σ sessions(pagePath que es calc) = total de pares (sesión × calc-distinta-vista).
  / sesiones del sitio        → calcs distintas vistas por sesión GLOBAL
Clasifica pagePath como calc si su slug ∈ set de slugs reales de src/content/calcs/.
Uso: python3 scripts/ga4-calc-pages-por-sesion.py [--days 28]
"""
import sys, glob, json
from datetime import datetime, timedelta, timezone
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, OrderBy)

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
DAYS = int(sys.argv[sys.argv.index('--days')+1]) if '--days' in sys.argv else 28
LOCALES = {'es','mx','cl','co','pe','ec','ve','py','uy','do','pt','pt-pt','pt-br','en'}

slugs = set()
for f in glob.glob('/Users/marrod/hacecuentas/src/content/calcs/*.json'):
    try: slugs.add(json.load(open(f))['slug'])
    except Exception: pass

def es_calc(path):
    p = path.lower().split('?')[0].split('#')[0].strip('/')
    if not p: return False
    parts = p.split('/')
    seg = parts[1] if (len(parts) > 1 and parts[0] in LOCALES) else parts[0]
    return seg in slugs

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

def window(days, label):
    end = (datetime.now(timezone.utc).date() - timedelta(days=1)).isoformat()
    start = (datetime.now(timezone.utc).date() - timedelta(days=days)).isoformat()
    tot = client.run_report(RunReportRequest(property=f'properties/{GA4_PROPERTY}',
        metrics=[Metric(name='sessions')], date_ranges=[DateRange(start_date=start, end_date=end)]))
    ses_tot = int(tot.rows[0].metric_values[0].value)
    rep = client.run_report(RunReportRequest(property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name='pagePath')],
        metrics=[Metric(name='sessions'), Metric(name='screenPageViews')],
        date_ranges=[DateRange(start_date=start, end_date=end)],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='sessions'), desc=True)], limit=100000))
    ses_calc_pairs = pv_calc = 0
    for r in rep.rows:
        if es_calc(r.dimension_values[0].value):
            ses_calc_pairs += int(r.metric_values[0].value)
            pv_calc += int(r.metric_values[1].value)
    print(f"\n  {label}: {start} → {end} ({days}d)")
    print(f"    Sesiones del sitio ............... {ses_tot:>9,}")
    print(f"    Σ sesiones×calc-distinta ......... {ses_calc_pairs:>9,}  (pares sesión × calc única vista)")
    print(f"    Vistas de páginas de calc ........ {pv_calc:>9,}")
    print(f"    → Calcs DISTINTAS vistas / sesión GLOBAL .... {ses_calc_pairs/ses_tot:5.2f}")
    print(f"    → Vistas de calc / sesión GLOBAL ........... {pv_calc/ses_tot:5.2f}")

print(f"Set de slugs de calc cargado: {len(slugs):,}")
window(DAYS, f"VENTANA {DAYS}d")
window(90, "CONTEXTO 90d")
