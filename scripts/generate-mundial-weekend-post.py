#!/usr/bin/env python3
"""
Motor Discover — pieza "Partidos del Mundial este fin de semana".

Ángulo de FIN DE SEMANA (cuando el tráfico del sitio baja pero el interés por el
fútbol sube): los partidos del Mundial son sáb/dom. Data 100% derivada de
src/lib/data/mundial-2026-fixture.json (cero invención) + nombres ES de TEAMS.

Auto-gateado: solo escribe si HOY cae dentro del Mundial (11-jun a 19-jul 2026)
y es de jueves a domingo (la previa del finde). skip-if-exists. Lo corre el
launchd discover-motor.sh a diario.

  python3 scripts/generate-mundial-weekend-post.py
  python3 scripts/generate-mundial-weekend-post.py --date 2026-06-19   # simular
  python3 scripts/generate-mundial-weekend-post.py --force             # re-generar
"""
import re
import sys
import json
import datetime
from pathlib import Path

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
FIXTURE = Path('src/lib/data/mundial-2026-fixture.json')
TEAMS_TS = Path('src/lib/data/mundial-2026.ts')
BLOG = Path('src/content/blog')
CUP_START = datetime.date(2026, 6, 11)
CUP_END = datetime.date(2026, 7, 19)


def get_arg(flag, default=None):
    return sys.argv[sys.argv.index(flag) + 1] if flag in sys.argv else default


def parse_teams():
    """{ openfootball_name: (es, flag) } desde la fuente canónica TS."""
    ts = TEAMS_TS.read_text(encoding='utf-8')
    teams = {}
    for m in re.finditer(r"(?:'([^']+)'|([A-Za-z][A-Za-z ]*?))\s*:\s*\{\s*es:\s*'([^']+)',\s*flag:\s*'([^']+)'\s*\}", ts):
        name = m.group(1) or (m.group(2) or '').strip()
        if name:
            teams[name] = (m.group(3), m.group(4))
    return teams


def label(teams, name):
    if not name:
        return ('A definir', '⚽')
    if name in teams:
        return teams[name]
    return (name, '🏳️')


def art_datetime(datestr, timestr):
    """(date 'YYYY-MM-DD', '13:00 UTC-6') → datetime en hora de Argentina (UTC-3).
    Cuida el cambio de día: un partido nocturno en zona Pacífico cae de madrugada
    del día siguiente en ARG."""
    if not datestr:
        return None
    m = re.match(r'(\d{1,2}):(\d{2})\s*UTC([+-]\d{1,2})?', timestr or '')
    if m:
        h, mn, zone = int(m.group(1)), int(m.group(2)), int(m.group(3) or -6)
    else:
        m2 = re.match(r'(\d{1,2}):(\d{2})', timestr or '')
        h, mn, zone = (int(m2.group(1)), int(m2.group(2)), -6) if m2 else (0, 0, -6)
    base = datetime.datetime.fromisoformat(datestr + 'T00:00:00') + datetime.timedelta(hours=h, minutes=mn)
    return base - datetime.timedelta(hours=zone) - datetime.timedelta(hours=3)  # local→UTC→ART


def art_time(datestr, timestr):
    dt = art_datetime(datestr, timestr)
    return dt.strftime('%H:%M') if dt else ''


def weekend_of(today):
    """Sábado y domingo del fin de semana relevante para `today`."""
    wd = today.weekday()  # Mon=0..Sun=6
    if wd <= 4:           # lun-vie → próximo sábado
        sat = today + datetime.timedelta(days=5 - wd)
    elif wd == 5:         # sábado
        sat = today
    else:                 # domingo
        sat = today - datetime.timedelta(days=1)
    return sat, sat + datetime.timedelta(days=1)


def generate():
    today = datetime.date.fromisoformat(get_arg('--date', datetime.date.today().isoformat()))
    force = '--force' in sys.argv

    if not (CUP_START <= today <= CUP_END):
        print(f'• fuera de la ventana del Mundial ({today}) → no genero')
        return
    if today.weekday() < 3:   # solo jue(3)–dom(6): la previa del finde
        print(f'• {DIAS[today.weekday()]}: muy temprano para la previa del finde → no genero')
        return

    data = json.loads(FIXTURE.read_text(encoding='utf-8'))
    teams = parse_teams()
    sat, sun = weekend_of(today)
    wkset = {sat, sun}

    # Seleccionar por DÍA ARGENTINO real (no la fecha nominal US).
    wk = []
    for m in data['matches']:
        dt = art_datetime(m.get('date'), m.get('time'))
        if dt and dt.date() in wkset:
            wk.append((dt, m))
    if not wk:
        print(f'• sin partidos el finde {sat}..{sun} → no genero')
        return
    wk.sort(key=lambda x: x[0])

    mes = MESES[sat.month - 1]
    rango = f'{sat.day} y {sun.day} de {mes}' if sat.month == sun.month else f'{sat.day} de {MESES[sat.month-1]} y {sun.day} de {MESES[sun.month-1]}'
    slug = f'partidos-mundial-finde-{sat.day}-{mes}-{sat.year}'
    out = BLOG / f'{slug}.json'
    if out.exists() and not force:
        print(f'• ya existe (skip): {out}')
        return

    # Agrupar por día argentino real
    by_day = {}
    for dt, m in wk:
        by_day.setdefault(dt.date(), []).append((dt, m))

    bloques = []
    for d in sorted(by_day):
        items = []
        for dt, m in by_day[d]:
            e1, f1 = label(teams, m.get('team1'))
            e2, f2 = label(teams, m.get('team2'))
            grupo = (m.get('group') or m.get('round') or '').replace('Group', 'Grupo')
            hora = dt.strftime('%H:%M')
            sede = m.get('ground') or ''
            items.append(f'<li><strong>{hora}</strong> — {f1} {e1} vs {e2} {f2}'
                         f'{" · " + grupo if grupo else ""}{" · " + sede if sede else ""}</li>')
        bloques.append(f'<h3>{DIAS[d.weekday()].capitalize()} {d.day}</h3>\n<ul>\n' + '\n'.join(items) + '\n</ul>')
    lista = '\n'.join(bloques)
    n = len(wk)

    content = f'''<p>Este fin de semana ({rango}) se juegan <strong>{n} partidos</strong> del Mundial 2026. Te dejamos todos los horarios en <strong>hora de Argentina</strong> y el funnel para seguirlos en vivo y armar el prode.</p>

<p>👉 Mirá los <a href="/partidos-hoy-mundial-2026">partidos de hoy con resultados en vivo</a> — se actualiza solo durante los partidos.</p>

<h2 id="partidos">Partidos del fin de semana</h2>
{lista}

<h2 id="seguir">Cómo seguir el Mundial</h2>
<ul>
<li>📊 <a href="/posiciones-mundial-2026">Posiciones de cada grupo</a>, actualizadas partido a partido.</li>
<li>⚽ <a href="/goleadores-mundial-2026">Tabla de goleadores</a>.</li>
<li>🇦🇷 <a href="/cuando-juega-argentina-mundial-2026">Cuándo juega Argentina</a> y a qué hora.</li>
<li>📅 <a href="/fixture-mundial-2026">Fixture completo</a> de los 104 partidos.</li>
</ul>

<h2 id="prode">Armá el prode del finde</h2>
<p>Antes de que ruede la pelota, calculá las chances reales de cada selección y armá tu quiniela con amigos: el <a href="/calculadora-mundial-2026-quiniela-pool-probabilidad">prode del Mundial</a> y el <a href="/calculadora-mundial-2026-predictor-campeon-ranking">predictor de campeón</a> te dan una mano. Todas las calculadoras están en el <a href="/mundial-2026">hub del Mundial 2026</a>.</p>

<p>Horarios convertidos a hora de Argentina (UTC-3) desde el calendario oficial. Los resultados se actualizan en vivo en la página de partidos de hoy.</p>'''

    post = {
        'slug': slug,
        'title': f'Partidos del Mundial 2026 este fin de semana ({rango}): horarios | Hacé Cuentas',
        'ogTitle': f'Mundial: los {n} partidos de este fin de semana',
        'description': (f'Qué partidos del Mundial 2026 se juegan este fin de semana ({rango}), con '
                        f'horario en hora argentina. Seguilos en vivo y armá el prode con amigos.'),
        'seoKeywords': [
            'partidos mundial este fin de semana',
            'partidos mundial 2026 hoy',
            f'partidos mundial {sat.day} {mes}',
            'mundial 2026 horarios hora argentina',
            'que partidos hay este finde mundial',
        ],
        'category': 'deportes',
        'date': today.isoformat(),
        'updatedDate': today.isoformat(),
        'author': 'Hacé Cuentas',
        'readingTime': 3,
        'heroEmoji': '⚽',
        'content': content,
        'relatedCalcs': [
            'calculadora-mundial-2026-quiniela-pool-probabilidad',
            'calculadora-mundial-2026-predictor-campeon-ranking',
            'calculadora-mundial-2026-probabilidad-clasificacion-ranking-fifa',
            'calculadora-mundial-2026-horario-partido-zona-horaria',
        ],
        'faq': [
            {'q': '¿Qué partidos del Mundial hay este fin de semana?',
             'a': f'Este finde ({rango}) se juegan {n} partidos. Arriba están todos con el horario en hora de Argentina, agrupados por día.'},
            {'q': '¿A qué hora juegan en hora argentina?',
             'a': 'Todos los horarios de la nota ya están convertidos a la hora de Argentina (UTC-3).'},
            {'q': '¿Dónde veo los resultados en vivo?',
             'a': 'En la página de partidos de hoy, que actualiza los marcadores automáticamente mientras se juegan, sin recargar.'},
            {'q': '¿Juega Argentina este fin de semana?',
             'a': 'Fijate en la lista de arriba si aparece Argentina. Para su próximo partido exacto, mirá la página de cuándo juega Argentina.'},
            {'q': '¿Cómo armo el prode con amigos?',
             'a': 'Con la calculadora de prode del Mundial estimás probabilidades y repartís los puntos. Está enlazada más abajo, junto al predictor de campeón.'},
            {'q': '¿Dónde veo el fixture completo?',
             'a': 'En el fixture del Mundial 2026 está el calendario día por día de los 104 partidos, con resultados.'},
            {'q': '¿De dónde salen los horarios?',
             'a': 'Del calendario oficial (proyecto de código abierto openfootball y FIFA), con los horarios convertidos a hora de Argentina.'},
        ],
    }

    out.write_text(json.dumps(post, ensure_ascii=False, indent=2), encoding='utf-8')
    print(f'✅ Post generado: {out}  ({n} partidos, finde {rango})')


if __name__ == '__main__':
    generate()
