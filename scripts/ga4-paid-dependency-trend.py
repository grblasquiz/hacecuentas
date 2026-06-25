#!/usr/bin/env python3
"""Tendencia de dependencia de tráfico PAGO vs orgánico/otros, por semana,
desde el nacimiento del dominio (2026-04-14). Output: tabla + JSON para gráfico."""
import json
from datetime import datetime, timedelta, date, timezone
from collections import defaultdict

GA4 = '532962136'
SA = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

creds = service_account.Credentials.from_service_account_file(
    SA, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
client = BetaAnalyticsDataClient(credentials=creds)

START = date(2026, 4, 14)                                   # registro del dominio
END = datetime.now(timezone.utc).date() - timedelta(days=1)  # ayer (datos cerrados)

resp = client.run_report(RunReportRequest(
    property=f'properties/{GA4}',
    dimensions=[Dimension(name='date'), Dimension(name='sessionDefaultChannelGroup')],
    metrics=[Metric(name='sessions')],
    date_ranges=[DateRange(start_date=START.isoformat(), end_date=END.isoformat())],
    limit=100000))

# clasificación de canales
def is_paid(ch):
    c = ch.lower()
    return ('paid' in c) or ch in ('Display', 'Cross-network')

# bucket por semana (lunes) -> canal -> sesiones
weeks = defaultdict(lambda: defaultdict(int))
channels_seen = defaultdict(int)
for r in resp.rows:
    d = datetime.strptime(r.dimension_values[0].value, '%Y%m%d').date()
    ch = r.dimension_values[1].value or '(none)'
    s = int(r.metric_values[0].value)
    monday = d - timedelta(days=d.weekday())
    weeks[monday][ch] += s
    channels_seen[ch] += s

print(f"Canales vistos (total {START}..{END}):")
for ch, s in sorted(channels_seen.items(), key=lambda x: -x[1]):
    tag = 'PAGO' if is_paid(ch) else 'no-pago'
    print(f"  {ch:28} {s:>7}  [{tag}]")

rows = []
print(f"\n{'Semana (lun)':12} {'Total':>6} {'Pago':>6} {'Org':>6} {'Direct':>6} {'Otro':>6} {'%PAGO':>7}")
for monday in sorted(weeks):
    chs = weeks[monday]
    tot = sum(chs.values())
    paid = sum(v for k, v in chs.items() if is_paid(k))
    org = sum(v for k, v in chs.items() if 'organic' in k.lower())
    direct = chs.get('Direct', 0)
    other = tot - paid - org - direct
    pct = round(100 * paid / tot, 1) if tot else 0
    partial = ' *' if (monday < START - timedelta(days=START.weekday()) + timedelta(days=7) or monday + timedelta(days=6) > END) else ''
    print(f"{monday.isoformat():12} {tot:>6} {paid:>6} {org:>6} {direct:>6} {other:>6} {pct:>6}%{partial}")
    rows.append({'week': monday.isoformat(), 'total': tot, 'paid': paid,
                 'organic': org, 'direct': direct, 'other': other, 'paidPct': pct})

# resumen tendencia: primeras 3 vs últimas 3 semanas COMPLETAS
full = [r for r in rows if r['total'] >= 20]  # ignorar semanas casi vacías
if len(full) >= 4:
    first3 = full[:3]; last3 = full[-3:]
    a = round(sum(r['paid'] for r in first3) / max(1, sum(r['total'] for r in first3)) * 100, 1)
    b = round(sum(r['paid'] for r in last3) / max(1, sum(r['total'] for r in last3)) * 100, 1)
    print(f"\n→ %PAGO primeras 3 sem ({first3[0]['week']}..): {a}%")
    print(f"→ %PAGO últimas 3 sem (..{last3[-1]['week']}): {b}%")
    print(f"→ cambio: {b-a:+.1f} pts ({'BAJANDO dependencia' if b<a else 'SUBIENDO dependencia'})")

json.dump(rows, open('/tmp/paid-trend.json', 'w'))
print("\n[json → /tmp/paid-trend.json]  (* = semana parcial)")
