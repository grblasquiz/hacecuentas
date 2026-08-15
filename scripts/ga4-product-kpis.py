#!/usr/bin/env python3
"""Tablero compacto de producto de Hacé Cuentas.

Mide el funnel resultado → guardado/segunda calculadora y el retorno propio.
No consulta ni imprime inputs, resultados, emails u otros datos personales.

Uso: python3 scripts/ga4-product-kpis.py [--days 28]
"""
import sys
from datetime import datetime, timedelta, timezone
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
DAYS = int(sys.argv[sys.argv.index('--days') + 1]) if '--days' in sys.argv else 28
EVENTS = [
    'hc_calculator_view', 'hc_calculator_success', 'hc_session_depth',
    'save_to_dashboard', 'hc_result_share', 'related_click', 'hc_return_visit',
]

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
end = datetime.now(timezone.utc).date() - timedelta(days=1)
start = end - timedelta(days=DAYS - 1)
report = client.run_report(RunReportRequest(
    property=f'properties/{PROPERTY}',
    dimensions=[Dimension(name='eventName')],
    metrics=[Metric(name='eventCount'), Metric(name='totalUsers')],
    date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
    limit=100000,
))
rows = {r.dimension_values[0].value: (int(r.metric_values[0].value), int(r.metric_values[1].value)) for r in report.rows}

def count(name): return rows.get(name, (0, 0))[0]
def pct(num, den): return f'{(num / den * 100):.1f}%' if den else '—'

success = count('hc_calculator_success')
print(f'Hacé Cuentas · KPIs de producto · {start} → {end}')
print(f'  Resultados completados ........ {success:>9,}')
print(f'  Guardados ...................... {count("save_to_dashboard"):>9,}  ({pct(count("save_to_dashboard"), success)})')
print(f'  Compartidos .................... {count("hc_result_share"):>9,}  ({pct(count("hc_result_share"), success)})')
print(f'  Siguiente calculadora .......... {count("related_click"):>9,}  ({pct(count("related_click"), success)})')
print(f'  Hitos de profundidad 2/3/5 .... {count("hc_session_depth"):>9,}')
print(f'  Retornos detectados ............ {count("hc_return_visit"):>9,}')
print('\nNota: calculator_count y return_window deben registrarse como dimensiones personalizadas de evento en GA4 para abrir el desglose 2/3/5 y 1–7/8–30/31+ días.')
