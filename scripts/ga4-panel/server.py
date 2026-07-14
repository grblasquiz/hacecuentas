#!/usr/bin/env python3
"""Panel de tráfico GA4 — sesiones por canal con drill-down a fuente/medio.

Servidor LOCAL. No se deploya: lee el service account de ~/.config/gcp.

    python3 scripts/ga4-panel/server.py [puerto]     # default 4399

Endpoints:
    GET /                                → panel
    GET /api/pulse?fresh=1               → hoy vs ayer vs mismo día semana pasada
    GET /api/report?start=&end=&fresh=1  → canales + fuente/medio del rango
"""
import socket
import sys
import time
import threading
from concurrent.futures import ThreadPoolExecutor
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
ALL = '__all__'


def build_pulse():
    """Hoy vs ayer vs mismo día de la semana pasada, cortados a la misma hora.

    OJO con `sessions` en GA4: NO es aditiva sobre las dimensiones. Una sesión se
    cuenta en cada combinación que toca, así que sumar las filas de una query
    dimensionada infla el total. Medido en esta property:

        sin dimensiones (el número real) ....... 1040   ← el de la UI de GA4
        sumando hour ........................... 1069  (+3%, sesiones a caballo de dos horas)
        sumando canales ........................ 1535  (+48% HOY, 0% en días cerrados)

    El +48% es lag de atribución del día abierto (misma causa que el "Unassigned"
    al 50%): mientras no cierra, una sesión aparece en más de un canal. En días
    cerrados la suma por canal da exacto.

    Por eso van cuatro queries en vez de una: cada número sale de la query con la
    MÍNIMA dimensionalidad que lo responde, y nunca se suman canales para un total.
        credited  ← sin `hour`: el total acreditado, el que coincide con GA4
        series    ← con `hour`: sólo para la forma de la curva y el corte horario
    """
    today = date.today()
    yesterday = today - timedelta(days=1)
    last_week = today - timedelta(days=7)
    d1, d2 = last_week.isoformat(), today.isoformat()
    CH = 'sessionDefaultChannelGroup'

    with ThreadPoolExecutor(max_workers=4) as ex:
        f_curve_ch = ex.submit(run, ['date', 'hour', CH], ['sessions'], d1, d2)
        f_curve_all = ex.submit(run, ['date', 'hour'], ['sessions'], d1, d2)
        f_cred_all = ex.submit(run, ['date'], ['sessions'], d1, d2)
        f_cred_ch = ex.submit(run, ['date', CH], ['sessions'], d1, d2)
        rows_ch, rows_all = f_curve_ch.result(), f_curve_all.result()
        rows_cred, rows_cred_ch = f_cred_all.result(), f_cred_ch.result()

    # curvas: {'YYYYMMDD': {hour: {channel: sessions}}} y {'YYYYMMDD': {hour: s}}
    by_day = defaultdict(lambda: defaultdict(lambda: defaultdict(int)))
    for dims, mets in rows_ch:
        by_day[dims[0]][int(dims[1])][dims[2]] += mets[0]
    by_day_all = defaultdict(lambda: defaultdict(int))
    for dims, mets in rows_all:
        by_day_all[dims[0]][int(dims[1])] += mets[0]

    # acreditadas: {'YYYYMMDD': {channel|ALL: sessions}} — sin `hour`, no infladas
    cred = defaultdict(lambda: defaultdict(int))
    for dims, mets in rows_cred:
        cred[dims[0]][ALL] += mets[0]
    for dims, mets in rows_cred_ch:
        cred[dims[0]][dims[1]] += mets[0]

    def key(d):
        return d.strftime('%Y%m%d')

    hours_today = by_day_all.get(key(today), {})
    last_hour = max(hours_today.keys(), default=0)          # hora en curso (parcial)
    cutoff = max(last_hour - 1, 0)                          # última hora completa

    days = {'today': today, 'yesterday': yesterday, 'lastWeek': last_week}
    channels = set()
    for d in days.values():
        channels.update(k for k in cred.get(key(d), {}) if k != ALL)

    def curve(d, ch=None):
        if ch is None:
            h = by_day_all.get(key(d), {})
            return [h.get(hr, 0) for hr in range(24)]
        h = by_day.get(key(d), {})
        return [h.get(hr, {}).get(ch, 0) for hr in range(24)]

    series = {ALL: {k: curve(d) for k, d in days.items()}}
    for ch in channels:
        series[ch] = {k: curve(d, ch) for k, d in days.items()}

    credited = {slot: {k: cred.get(key(d), {}).get(slot, 0) for k, d in days.items()}
                for slot in [ALL] + list(channels)}

    upto = lambda arr: sum(arr[:cutoff + 1])
    order = sorted(channels, key=lambda c: -credited[c]['today'])

    # Unassigned sobre acreditadas (no sobre la curva: sería share de un inflado).
    # Si hoy está alto, el resto de los canales está subestimado — el front lo usa
    # para no pintar el delta.
    def unassigned(day):
        tot = credited[ALL][day]
        un = credited.get('Unassigned', {}).get(day, 0)
        return {'sessions': un, 'share': (un / tot) if tot else 0}

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
        'dates': {k: d.isoformat() for k, d in days.items()},
        'channels': order,
        'series': series,      # por hora: la forma de la curva y el corte
        'credited': credited,  # sin `hour`: el total que coincide con GA4
        'unassigned': {'today': unassigned('today'), 'yesterday': unassigned('yesterday')},
        'realtimeUsers': realtime,
    }


# ── reporte por rango ────────────────────────────────────────────────────────
def build_report(start, end):
    """Canales + fuente/medio del rango, contra el rango previo comparable.

    El período previo se desplaza un múltiplo de 7 días, no el largo del rango:
    así siempre caen los MISMOS días de la semana. Un lunes contra el domingo
    anterior no es comparable — el día de la semana manda más que la tendencia.

    Se redondea para arriba (`ceil`) para que el desplazamiento nunca sea menor
    que el rango, si no los períodos se solaparían:
        1 día  → 7   (mismo día, semana pasada)
        7 / 28 → 7 / 28  (ya alineados: el mix de días se repite)
        10     → 14  (7 solaparía)
        90     → 91  (90 no es múltiplo de 7 y desalinearía)
    """
    s, e = date.fromisoformat(start), date.fromisoformat(end)
    span = (e - s).days + 1
    shift = (span + 6) // 7 * 7
    prev_s, prev_e = s - timedelta(days=shift), e - timedelta(days=shift)

    dims = ['sessionDefaultChannelGroup', 'sessionSourceMedium']
    with ThreadPoolExecutor(max_workers=4) as ex:
        f_cur = ex.submit(run, dims, ['sessions', 'totalUsers', 'engagedSessions'], start, end)
        f_prv = ex.submit(run, dims, ['sessions'], prev_s.isoformat(), prev_e.isoformat())
        # sin dimensiones: el total acreditado. Sumar canales lo infla (+48% con
        # el día abierto), así que el total NUNCA sale de la tabla.
        f_tot = ex.submit(run, [], ['sessions', 'totalUsers'], start, end)
        f_tot_prv = ex.submit(run, [], ['sessions'], prev_s.isoformat(), prev_e.isoformat())
        cur, prv = f_cur.result(), f_prv.result()
        tot, tot_prv = f_tot.result(), f_tot_prv.result()

    credited = {'sessions': tot[0][1][0] if tot else 0,
                'users': tot[0][1][1] if tot else 0,
                'prev': tot_prv[0][1][0] if tot_prv else 0}

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
        'shiftDays': shift,
        'includesToday': e >= date.today(),
        'channels': channels,
        # acreditado (query sin dimensiones) — el número que coincide con GA4
        'totals': credited,
        # lo que suman las filas de la tabla: con el día abierto es mayor que el
        # acreditado porque una sesión cae en más de un canal. El front avisa.
        'channelSum': {
            'sessions': sum(c['sessions'] for c in channels),
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

    # El puerto puede quedar tomado unos segundos por la instancia anterior
    # (restart, o el socket en TIME_WAIT). Esperar a que se libere en vez de
    # rendirse: salir con 0 acá haría que launchd lo diera por terminado bien y
    # el panel quedaría muerto hasta el próximo login.
    for attempt in range(15):
        with socket.socket() as probe:
            probe.settimeout(1)
            if probe.connect_ex(('127.0.0.1', port)) != 0:
                break
        if attempt == 0:
            print(f'[{datetime.now():%Y-%m-%d %H:%M:%S}] puerto {port} ocupado, '
                  f'esperando que se libere…', flush=True)
        time.sleep(2)
    else:
        # exit != 0 → con KeepAlive:true launchd reintenta en ThrottleInterval
        print(f'[{datetime.now():%Y-%m-%d %H:%M:%S}] el puerto {port} sigue ocupado '
              f'tras 30s; salgo con 1 para que launchd reintente', flush=True)
        sys.exit(1)

    print(f'[{datetime.now():%Y-%m-%d %H:%M:%S}] GA4 panel · property '
          f'{GA4_PROPERTY} · http://127.0.0.1:{port}', flush=True)
    app.run(host='127.0.0.1', port=port, debug=False, threaded=True)
