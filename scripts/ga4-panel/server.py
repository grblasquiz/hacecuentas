#!/usr/bin/env python3
"""Panel de tráfico GA4 — sesiones por canal con drill-down a fuente/medio.

Servidor LOCAL. No se deploya: lee el service account de ~/.config/gcp.

    python3 scripts/ga4-panel/server.py [puerto]     # default 4399

Endpoints:
    GET /                                → panel
    GET /api/pulse?fresh=1               → hoy vs ayer vs mismo día semana pasada
    GET /api/report?start=&end=&fresh=1  → canales + fuente/medio del rango
"""
import sys
import time
import threading
from datetime import date, datetime, timedelta
from collections import defaultdict

from flask import Flask, jsonify, request, send_from_directory
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange, Dimension, Metric, RunReportRequest, RunRealtimeReportRequest)

GA4_PROPERTY = '532962136'
SA_PATH = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
CACHE_TTL = 300  # 5 min; el botón "Actualizar" manda fresh=1 y lo saltea

app = Flask(__name__, static_folder=None)
_creds = service_account.Credentials.from_service_account_file(
    SA_PATH, scopes=['https://www.googleapis.com/auth/analytics.readonly'])
_client = BetaAnalyticsDataClient(credentials=_creds)

_cache = {}
_cache_lock = threading.Lock()


def cached(key, fresh, producer):
    """Memo con TTL. fresh=True recalcula y pisa."""
    now = time.time()
    if not fresh:
        with _cache_lock:
            hit = _cache.get(key)
        if hit and now - hit[0] < CACHE_TTL:
            return hit[1], hit[0]
    value = producer()
    with _cache_lock:
        _cache[key] = (now, value)
    return value, now


def run(dimensions, metrics, start, end, limit=100000):
    resp = _client.run_report(RunReportRequest(
        property=f'properties/{GA4_PROPERTY}',
        dimensions=[Dimension(name=d) for d in dimensions],
        metrics=[Metric(name=m) for m in metrics],
        date_ranges=[DateRange(start_date=start, end_date=end)],
        limit=limit))
    return [([dv.value for dv in r.dimension_values],
             [int(mv.value) for mv in r.metric_values]) for r in resp.rows]


# ── pulso del día ────────────────────────────────────────────────────────────
def build_pulse():
    """Hoy vs ayer vs mismo día de la semana pasada, cortados a la misma hora.

    El corte es la última hora COMPLETA. La hora en curso está a medio llenar
    (si son las 14:37, la hora 14 tiene 37 min contra los 60 min de ayer), así
    que compararla produce una caída fantasma. Se devuelve aparte, marcada.
    """
    today = date.today()
    yesterday = today - timedelta(days=1)
    last_week = today - timedelta(days=7)

    rows = run(['date', 'hour', 'sessionDefaultChannelGroup'], ['sessions'],
               last_week.isoformat(), today.isoformat())

    # {'YYYYMMDD': {hour: {channel: sessions}}}
    by_day = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for dims, mets in rows:
        d, hr, ch = dims[0], int(dims[1]), dims[2]
        by_day[d][hr][ch] += mets[0]

    def key(d):
        return d.strftime('%Y%m%d')

    hours_today = by_day.get(key(today), {})
    last_hour = max(hours_today.keys(), default=0)          # hora en curso (parcial)
    cutoff = max(last_hour - 1, 0)                          # última hora completa

    def cumulative(d, upto):
        return sum(s for hr, chans in by_day.get(key(d), {}).items()
                   for s in chans.values() if hr <= upto)

    def channels(d, upto):
        acc = defaultdict(int)
        for hr, chans in by_day.get(key(d), {}).items():
            if hr <= upto:
                for ch, s in chans.items():
                    acc[ch] += s
        return acc

    def curve(d):
        h = by_day.get(key(d), {})
        return [sum(h.get(hr, {}).values()) for hr in range(24)]

    ch_today = channels(today, cutoff)
    ch_yest = channels(yesterday, cutoff)
    ch_week = channels(last_week, cutoff)
    all_ch = sorted(set(ch_today) | set(ch_yest) | set(ch_week),
                    key=lambda c: -ch_today.get(c, 0))

    total_today = cumulative(today, cutoff)
    unassigned = ch_today.get('Unassigned', 0)

    realtime = None
    try:
        rt = _client.run_realtime_report(RunRealtimeReportRequest(
            property=f'properties/{GA4_PROPERTY}', metrics=[Metric(name='activeUsers')]))
        realtime = sum(int(r.metric_values[0].value) for r in rt.rows) if rt.rows else 0
    except Exception:
        pass

    return {
        'cutoff': cutoff,
        'lastHour': last_hour,
        'dates': {'today': today.isoformat(), 'yesterday': yesterday.isoformat(),
                  'lastWeek': last_week.isoformat()},
        'totals': {
            'today': total_today,
            'yesterday': cumulative(yesterday, cutoff),
            'lastWeek': cumulative(last_week, cutoff),
        },
        'fullDay': {
            'yesterday': sum(curve(yesterday)),
            'lastWeek': sum(curve(last_week)),
        },
        'partialHour': {
            'hour': last_hour,
            'today': sum(hours_today.get(last_hour, {}).values()),
            'yesterday': sum(by_day.get(key(yesterday), {}).get(last_hour, {}).values()),
            'lastWeek': sum(by_day.get(key(last_week), {}).get(last_hour, {}).values()),
        },
        'curves': {'today': curve(today), 'yesterday': curve(yesterday),
                   'lastWeek': curve(last_week)},
        'channels': [{'channel': c, 'today': ch_today.get(c, 0),
                      'yesterday': ch_yest.get(c, 0), 'lastWeek': ch_week.get(c, 0)}
                     for c in all_ch],
        'unassignedShare': (unassigned / total_today) if total_today else 0,
        'realtimeUsers': realtime,
    }


# ── reporte por rango ────────────────────────────────────────────────────────
def build_report(start, end):
    """Canales + fuente/medio del rango, contra el rango previo del mismo largo."""
    s, e = date.fromisoformat(start), date.fromisoformat(end)
    span = (e - s).days + 1
    prev_e = s - timedelta(days=1)
    prev_s = prev_e - timedelta(days=span - 1)

    dims = ['sessionDefaultChannelGroup', 'sessionSourceMedium']
    cur = run(dims, ['sessions', 'totalUsers', 'engagedSessions'], start, end)
    prv = run(dims, ['sessions'], prev_s.isoformat(), prev_e.isoformat())

    # {channel: {sourceMedium: {...}}}
    tree = defaultdict(lambda: defaultdict(lambda: {'sessions': 0, 'users': 0,
                                                    'engaged': 0, 'prev': 0}))
    for dims_, mets in cur:
        node = tree[dims_[0]][dims_[1]]
        node['sessions'] += mets[0]
        node['users'] += mets[1]
        node['engaged'] += mets[2]
    for dims_, mets in prv:
        tree[dims_[0]][dims_[1]]['prev'] += mets[0]

    channels = []
    for ch, sources in tree.items():
        rows = [{'sourceMedium': sm, **v} for sm, v in sources.items()]
        rows.sort(key=lambda r: -r['sessions'])
        channels.append({
            'channel': ch,
            'sessions': sum(r['sessions'] for r in rows),
            'users': sum(r['users'] for r in rows),
            'engaged': sum(r['engaged'] for r in rows),
            'prev': sum(r['prev'] for r in rows),
            'sources': rows,
        })
    channels.sort(key=lambda c: -c['sessions'])

    return {
        'range': {'start': start, 'end': end},
        'prevRange': {'start': prev_s.isoformat(), 'end': prev_e.isoformat()},
        'includesToday': e >= date.today(),
        'channels': channels,
        'totals': {
            'sessions': sum(c['sessions'] for c in channels),
            'users': sum(c['users'] for c in channels),
            'prev': sum(c['prev'] for c in channels),
        },
    }


# ── rutas ────────────────────────────────────────────────────────────────────
@app.after_request
def no_store(resp):
    resp.headers['Cache-Control'] = 'no-store'
    return resp


@app.route('/')
def index():
    return send_from_directory(__file__.rsplit('/', 1)[0], 'index.html')


@app.route('/api/pulse')
def api_pulse():
    fresh = request.args.get('fresh') == '1'
    try:
        data, ts = cached('pulse', fresh, build_pulse)
        return jsonify({**data, 'fetchedAt': ts})
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


@app.route('/api/report')
def api_report():
    start = request.args.get('start')
    end = request.args.get('end')
    fresh = request.args.get('fresh') == '1'
    try:
        date.fromisoformat(start), date.fromisoformat(end)
    except (TypeError, ValueError):
        return jsonify({'error': 'start/end deben ser YYYY-MM-DD'}), 400
    if end < start:
        return jsonify({'error': 'el fin es anterior al inicio'}), 400
    try:
        data, ts = cached(f'report:{start}:{end}', fresh,
                          lambda: build_report(start, end))
        return jsonify({**data, 'fetchedAt': ts})
    except Exception as exc:
        return jsonify({'error': str(exc)}), 500


if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4399
    print(f'GA4 panel · property {GA4_PROPERTY} · http://127.0.0.1:{port}')
    app.run(host='127.0.0.1', port=port, debug=False, threaded=True)
