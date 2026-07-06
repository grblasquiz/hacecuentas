#!/usr/bin/env python3
"""Top calcs orgánicas de un país (carpeta dedicada /xx + calcs de raíz con ese audience). Last N días.
Uso: python3 scripts/ga4-top-calcs-pais.py --pais CO --days 28 --top 40
"""
import sys, glob, json
from datetime import datetime, timedelta, timezone
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest, OrderBy, Filter, FilterExpression

PAIS = sys.argv[sys.argv.index('--pais')+1].upper() if '--pais' in sys.argv else 'CO'
DAYS = int(sys.argv[sys.argv.index('--days')+1]) if '--days' in sys.argv else 28
TOP = int(sys.argv[sys.argv.index('--top')+1]) if '--top' in sys.argv else 40
PREFIX = {'MX': 'mx', 'CL': 'cl', 'CO': 'co', 'PE': 'pe', 'EC': 'ec', 'ES': 'es',
          'PY': 'py', 'UY': 'uy', 'VE': 've', 'DO': 'do'}[PAIS]

# slug→audience de la raíz, para capturar las calcs del país que viven sin prefijo
root2aud = {}
for f in glob.glob('/Users/marrod/hacecuentas/src/content/calcs/*.json'):
    try:
        d = json.load(open(f)); root2aud[d['slug']] = d.get('audience', 'global')
    except Exception:
        pass

def es_del_pais(path):
    p = path.lower().split('?')[0].strip('/'); head = p.split('/')[0]
    if head == PREFIX: return True
    return root2aud.get(head) == PAIS

creds = service_account.Credentials.from_service_account_file(SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)
end = datetime.now(timezone.utc).date() - timedelta(days=1); start = end - timedelta(days=DAYS-1)
org = FilterExpression(filter=Filter(field_name='sessionDefaultChannelGroup',
    string_filter=Filter.StringFilter(value='Organic Search', match_type=Filter.StringFilter.MatchType.EXACT)))
resp = client.run_report(RunReportRequest(property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='pagePath')], metrics=[Metric(name='screenPageViews'), Metric(name='sessions')],
    date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
    dimension_filter=org, order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name='screenPageViews'), desc=True)], limit=10000))
rows = [(r.dimension_values[0].value, int(r.metric_values[0].value), int(r.metric_values[1].value))
        for r in resp.rows if es_del_pais(r.dimension_values[0].value)]
print(f'TOP calcs orgánicas {PAIS} · {start}..{end} ({DAYS}d) · {len(rows)} URLs con tráfico')
print(f'  {"pviews":>7} {"ses":>6}  url')
for path, pv, ss in rows[:TOP]:
    print(f'  {pv:>7,} {ss:>6,}  {path}')
print(f'  {"─"*40}\n  TOTAL {sum(p for _,p,_ in rows):,} pviews en {len(rows)} URLs')
