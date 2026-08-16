#!/usr/bin/env python3
"""Compara GA4 con Cloudflare Web Analytics (RUM) por día completo.

Usa el beacon JavaScript de Cloudflare, no requests HTTP de la zona. Un crawler
puede declarar Chrome/Safari en su User-Agent; por eso el User-Agent nunca se usa
para clasificar tráfico humano.
"""
import json
import os
import ssl
import sys
import urllib.request
from collections import defaultdict
from datetime import datetime, time, timedelta, timezone
from statistics import median
from zoneinfo import ZoneInfo

ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '.env')
if os.path.exists(ENV_PATH):
    for line in open(ENV_PATH):
        if '=' in line and not line.strip().startswith('#'):
            key, value = line.strip().split('=', 1)
            os.environ.setdefault(key, value.strip('"').strip("'"))

try:
    import certifi
    SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CONTEXT = ssl.create_default_context()

GA4_PROPERTY = '532962136'
GA4_SERVICE_ACCOUNT = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
# Web Analytics RUM vive a nivel cuenta. El token genérico tiene ese permiso;
# el token de zone analytics sólo sirve para httpRequests* y devuelve authz aquí.
CF_TOKEN = os.environ.get('CLOUDFLARE_API_TOKEN') or os.environ.get('CLOUDFLARE_ANALYTICS_TOKEN')
CF_ACCOUNT = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
CF_SITE_TAG = os.environ.get('CLOUDFLARE_WEB_ANALYTICS_SITE_TAG', 'ce0845da75154d84b6bb158c12daae09')
LOCAL_TZ = ZoneInfo('America/Argentina/Buenos_Aires')

days = 7
if '--days' in sys.argv:
    days = int(sys.argv[sys.argv.index('--days') + 1])
if days < 2:
    raise SystemExit('--days debe ser 2 o más para calcular una mediana confiable')
if not CF_TOKEN or not CF_ACCOUNT:
    raise SystemExit('Faltan el token o el account ID de Cloudflare')

# Días calendario completos en la zona horaria de la propiedad y del dashboard.
today_local = datetime.now(LOCAL_TZ).date()
start_date = today_local - timedelta(days=days)
end_date = today_local - timedelta(days=1)
start_utc = datetime.combine(start_date, time.min, LOCAL_TZ).astimezone(timezone.utc)
end_exclusive_utc = datetime.combine(today_local, time.min, LOCAL_TZ).astimezone(timezone.utc)


def cloudflare_graphql(query, variables):
    request = urllib.request.Request(
        'https://api.cloudflare.com/client/v4/graphql',
        data=json.dumps({'query': query, 'variables': variables}).encode(),
        headers={'Authorization': f'Bearer {CF_TOKEN}', 'Content-Type': 'application/json'},
    )
    response = json.loads(urllib.request.urlopen(request, timeout=30, context=SSL_CONTEXT).read())
    if response.get('errors'):
        raise RuntimeError(f"Cloudflare GraphQL: {response['errors']}")
    return response


cf_query = """
query CompareRUM($account: String!, $siteTag: String!, $start: Time!, $end: Time!) {
  viewer {
    accounts(filter: {accountTag: $account}) {
      rumPageloadEventsAdaptiveGroups(
        limit: 10000
        filter: {datetime_geq: $start, datetime_lt: $end, siteTag: $siteTag}
        orderBy: [datetimeHour_ASC]
      ) {
        count
        sum { visits }
        dimensions { datetimeHour siteTag }
      }
    }
  }
}
"""
cf_response = cloudflare_graphql(cf_query, {
    'account': CF_ACCOUNT,
    'siteTag': CF_SITE_TAG,
    'start': start_utc.isoformat().replace('+00:00', 'Z'),
    'end': end_exclusive_utc.isoformat().replace('+00:00', 'Z'),
})
accounts = cf_response['data']['viewer']['accounts']
if not accounts:
    raise SystemExit('Cloudflare no devolvió la cuenta solicitada')

cf_daily = defaultdict(lambda: {'visits': 0, 'pageviews': 0})
for group in accounts[0]['rumPageloadEventsAdaptiveGroups']:
    hour_utc = datetime.fromisoformat(group['dimensions']['datetimeHour'].replace('Z', '+00:00'))
    local_date = hour_utc.astimezone(LOCAL_TZ).date().isoformat()
    cf_daily[local_date]['pageviews'] += int(group['count'])
    cf_daily[local_date]['visits'] += int(group['sum']['visits'])

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

credentials = service_account.Credentials.from_service_account_file(
    GA4_SERVICE_ACCOUNT, scopes=['https://www.googleapis.com/auth/analytics.readonly']
)
ga4_client = BetaAnalyticsDataClient(credentials=credentials)
ga4_report = ga4_client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='date')],
    metrics=[Metric(name='sessions'), Metric(name='screenPageViews')],
    date_ranges=[DateRange(start_date=start_date.isoformat(), end_date=end_date.isoformat())],
))
ga4_daily = {}
for row in ga4_report.rows:
    raw_date = row.dimension_values[0].value
    date_key = f'{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:8]}'
    ga4_daily[date_key] = {
        'sessions': int(row.metric_values[0].value),
        'pageviews': int(row.metric_values[1].value),
    }


def signed_pct(numerator, denominator):
    return None if not denominator else 100 * (numerator - denominator) / denominator


rows = []
current = start_date
while current <= end_date:
    key = current.isoformat()
    cf = cf_daily.get(key, {'visits': 0, 'pageviews': 0})
    ga = ga4_daily.get(key, {'sessions': 0, 'pageviews': 0})
    visit_ratio = cf['visits'] / ga['sessions'] if ga['sessions'] else float('inf')
    pageview_ratio = cf['pageviews'] / ga['pageviews'] if ga['pageviews'] else float('inf')
    rows.append({
        'date': key,
        'cf_visits': cf['visits'], 'ga_sessions': ga['sessions'],
        'visit_gap': signed_pct(cf['visits'], ga['sessions']),
        'cf_pageviews': cf['pageviews'], 'ga_pageviews': ga['pageviews'],
        'pageview_gap': signed_pct(cf['pageviews'], ga['pageviews']),
        'anomalous': visit_ratio > 3 or pageview_ratio > 3,
    })
    current += timedelta(days=1)

clean_rows = [r for r in rows if not r['anomalous'] and r['cf_visits'] and r['ga_sessions']]

print(f'\n{"=" * 86}')
print(f'  GA4 vs Cloudflare Web Analytics (RUM) · {start_date} a {end_date} · GMT-3')
print(f'{"=" * 86}')
print('  Fecha       CF visitas  GA sesiones    gap   CF páginas  GA páginas    gap  estado')
print('  ' + '─' * 82)
for row in rows:
    visit_gap = ' n/a' if row['visit_gap'] is None else f"{row['visit_gap']:+5.1f}%"
    pageview_gap = ' n/a' if row['pageview_gap'] is None else f"{row['pageview_gap']:+5.1f}%"
    status = 'ANOMALÍA (excluida)' if row['anomalous'] else 'ok'
    print(
        f"  {row['date']} {row['cf_visits']:>11,} {row['ga_sessions']:>12,} {visit_gap:>7}"
        f" {row['cf_pageviews']:>11,} {row['ga_pageviews']:>11,} {pageview_gap:>7}  {status}"
    )

print('\n[RESUMEN SIN DÍAS ANÓMALOS]')
if len(clean_rows) < 2:
    print('  ⚠️ No hay suficientes días comparables para emitir un veredicto.')
else:
    median_visit_gap = median(r['visit_gap'] for r in clean_rows)
    median_pageview_gap = median(r['pageview_gap'] for r in clean_rows)
    print(f'  Mediana CF visitas vs GA sesiones: {median_visit_gap:+.1f}%')
    print(f'  Mediana CF páginas vs GA páginas:  {median_pageview_gap:+.1f}%')
    bad_days = [r for r in clean_rows if r['visit_gap'] > 40 and r['pageview_gap'] > 40]
    if len(bad_days) >= 2:
        print('  ⚠️ POSIBLE FALLA: GA4 queda >40% debajo en visitas y páginas durante 2+ días.')
    else:
        print('  ✅ Sin evidencia de una falla sistemática del tag de GA4.')

anomalies = [r for r in rows if r['anomalous']]
if anomalies:
    print('\n[ANOMALÍAS]')
    for row in anomalies:
        print(
            f"  {row['date']}: CF {row['cf_visits']:,} visitas/{row['cf_pageviews']:,} páginas; "
            f"GA4 {row['ga_sessions']:,} sesiones/{row['ga_pageviews']:,} páginas. "
            'Revisar automatizaciones; no usar este día para diagnosticar el tag.'
        )

print('\nNotas: ambos sistemas requieren JavaScript, pero sessionizan distinto. Adblockers, ITP')
print('y consentimiento pueden producir brechas normales. Nunca se infieren humanos por User-Agent.\n')
