#!/usr/bin/env python3
"""
KPI de citaciones IA (proxy): sesiones GA4 cuyo source es un asistente de IA.

Mide el tráfico que llega desde ChatGPT, Perplexity, Copilot, Gemini, Claude,
etc. Es el proxy medible de "nos están citando las IAs" (deep research 7-02:
las citas en AIO/ChatGPT se desacoplaron del ranking; hay que trackearlas
como KPI separado del ranking clásico).

Guarda serie semanal en data/ai-referrals-weekly.json (append por semana,
idempotente: re-correr la misma semana pisa la entrada).

Uso:
  python3 scripts/ai-referrals-pulse.py            # últimos 7 días cerrados
  python3 scripts/ai-referrals-pulse.py --days 28  # ventana más larga
"""
import os, sys, json
from datetime import datetime, timedelta, timezone

ROOT = os.path.join(os.path.dirname(__file__), '..')
GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
OUT = os.path.join(ROOT, 'data', 'ai-referrals-weekly.json')

# sources GA4 que identifican asistentes de IA (match por substring, lower)
AI_SOURCES = [
    'chatgpt', 'chat.openai', 'openai.com',
    'perplexity',
    'copilot',
    'gemini.google', 'bard.google',
    'claude.ai', 'anthropic',
    'you.com', 'poe.com', 'phind', 'kagi',
    'meta.ai', 'mistral', 'deepseek', 'grok', 'x.ai',
]

def arg(flag, default):
    return type(default)(sys.argv[sys.argv.index(flag)+1]) if flag in sys.argv else default
DAYS = arg('--days', 7)

from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest)

creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

today = datetime.now(timezone.utc).date()
end = today - timedelta(days=1)
start = end - timedelta(days=DAYS - 1)

resp = client.run_report(RunReportRequest(
    property=f'properties/{GA4_PROPERTY}',
    dimensions=[Dimension(name='sessionSource'), Dimension(name='landingPage')],
    metrics=[Metric(name='sessions'), Metric(name='totalUsers')],
    date_ranges=[DateRange(start_date=start.isoformat(), end_date=end.isoformat())],
    limit=100000,
))

by_source, by_page, total = {}, {}, 0
for row in resp.rows:
    src = row.dimension_values[0].value.lower()
    if not any(a in src for a in AI_SOURCES):
        continue
    page = row.dimension_values[1].value
    sess = int(row.metric_values[0].value)
    total += sess
    by_source[src] = by_source.get(src, 0) + sess
    by_page[page] = by_page.get(page, 0) + sess

entry = {
    'week_start': start.isoformat(),
    'week_end': end.isoformat(),
    'days': DAYS,
    'total_sessions': total,
    'by_source': dict(sorted(by_source.items(), key=lambda x: -x[1])),
    'top_pages': dict(sorted(by_page.items(), key=lambda x: -x[1])[:25]),
    'pulled_at': today.isoformat(),
}

series = []
if os.path.exists(OUT):
    series = json.load(open(OUT))
series = [e for e in series if e['week_start'] != entry['week_start']]
series.append(entry)
series.sort(key=lambda e: e['week_start'])
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(series, open(OUT, 'w'), ensure_ascii=False, indent=1)

print(f"AI referrals {start} → {end}: {total} sesiones")
for s, n in list(entry['by_source'].items())[:10]:
    print(f"  {n:5d}  {s}")
print("Top páginas citadas:")
for p, n in list(entry['top_pages'].items())[:10]:
    print(f"  {n:5d}  {p}")
if total == 0:
    print("  (0 es esperable hoy: el KPI arranca de cero — la señal es la pendiente)")
print(f"Serie guardada en {OUT} ({len(series)} semanas)")
