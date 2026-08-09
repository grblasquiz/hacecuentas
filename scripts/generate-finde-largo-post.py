#!/usr/bin/env python3
"""
Motor Discover — pieza "Finde largo del {fecha}".

Alto interés en Discover (turismo/descanso) y no repetitivo: solo dispara cuando
hay un finde largo arrancando en los próximos ~7 días. Data 100% derivada de la
fuente única src/lib/data/feriados-ar-2026.ts (cero invención).

Auto-gateado: si no hay finde largo próximo, no escribe nada. skip-if-exists para
no re-fechar. Lo corre el launchd (discover-motor.sh) a diario.

  python3 scripts/generate-finde-largo-post.py
  python3 scripts/generate-finde-largo-post.py --date 2026-07-03   # simular (test)
  python3 scripts/generate-finde-largo-post.py --lead 9            # días de anticipación
"""
import re
import sys
import json
import datetime
from pathlib import Path

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
DIAS = ['lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado', 'domingo']
FERIADOS_TS = Path('src/lib/data/feriados-ar-2026.ts')
BLOG = Path('src/content/blog')


def parse_feriados():
    ts = FERIADOS_TS.read_text()
    fer = {}
    for m in re.finditer(r"fecha:\s*'(\d{4}-\d{2}-\d{2})',\s*nombre:\s*'([^']+)',\s*tipo:\s*'([^']+)'", ts):
        fer[m.group(1)] = {'nombre': m.group(2), 'tipo': m.group(3)}
    return fer


def long_weekends(fer, frm, horizon=230):
    """Runs de >=3 días no laborables (finde + feriados) desde `frm`."""
    days = [frm + datetime.timedelta(d) for d in range(horizon)]
    def nonwork(d):
        return d.weekday() >= 5 or d.isoformat() in fer
    runs, i = [], 0
    while i < len(days):
        if nonwork(days[i]):
            j = i
            while j < len(days) and nonwork(days[j]):
                j += 1
            if j - i >= 3:
                blk = days[i:j]
                fers = [(d, fer[d.isoformat()]) for d in blk if d.isoformat() in fer]
                runs.append({'start': blk[0], 'end': blk[-1], 'n': len(blk), 'fers': fers})
            i = j
        else:
            i += 1
    return runs


def get_arg(flag, default=None):
    if flag in sys.argv:
        return sys.argv[sys.argv.index(flag) + 1]
    return default


def fmt_rango(a, b):
    if a.month == b.month:
        return f'del {a.day} al {b.day} de {MESES[a.month-1]}'
    return f'del {a.day} de {MESES[a.month-1]} al {b.day} de {MESES[b.month-1]}'


def generate():
    today_s = get_arg('--date')
    today = datetime.date.fromisoformat(today_s) if today_s else datetime.date.today()
    lead = int(get_arg('--lead', '7'))

    fer = parse_feriados()
    runs = long_weekends(fer, today)
    # próximo finde largo que arranca dentro de `lead` días (y no empezó aún)
    prox = next((r for r in runs if 0 <= (r['start'] - today).days <= lead), None)
    if not prox:
        nxt = runs[0]['start'].isoformat() if runs else 'n/d'
        print(f'• sin finde largo en los próximos {lead} días (próximo: {nxt}) — no escribo')
        return

    a, b, n = prox['start'], prox['end'], prox['n']
    feriado_nombres = []
    for d, info in prox['fers']:
        feriado_nombres.append(info['nombre'])
    feriado_str = ' y '.join(dict.fromkeys(feriado_nombres))
    mes_nombre = MESES[a.month - 1]
    slug = f'finde-largo-{a.day}-{mes_nombre}-{a.year}'

    # próximos findes largos (después de este) para la tabla
    siguientes = [r for r in runs if r['start'] > b][:5]
    filas = []
    for r in siguientes:
        nombres = ' / '.join(dict.fromkeys([x[1]['nombre'].split('(')[0].strip() for x in r['fers']])) or '—'
        filas.append(f'<tr><td>{fmt_rango(r["start"], r["end"])}</td><td>{r["n"]} días</td><td>{nombres}</td></tr>')
    tabla = ('<table><thead><tr><th>Finde largo</th><th>Duración</th><th>Motivo</th></tr></thead><tbody>'
             + ''.join(filas) + '</tbody></table>') if filas else ''

    dia_ini = DIAS[a.weekday()]
    dia_fin = DIAS[b.weekday()]
    rango = fmt_rango(a, b)

    content = f'''<p>Se viene un <strong>finde largo</strong>: del <strong>{dia_ini} {a.day}</strong> al <strong>{dia_fin} {b.day} de {mes_nombre}</strong> — son <strong>{n} días</strong> seguidos sin trabajar gracias a {feriado_str}. Si pensabas hacer una escapada o simplemente cortar, este es el momento de organizarte.</p>

<h2 id="dias">Qué días son</h2>
<ul>
<li>Arranca el <strong>{dia_ini} {a.day} de {mes_nombre}</strong> y termina el <strong>{dia_fin} {b.day}</strong>.</li>
<li>El feriado que lo arma: <strong>{feriado_str}</strong>.</li>
<li>Total: <strong>{n} días corridos</strong> de descanso.</li>
</ul>
<p>¿Querés saber exactamente cuánto falta para el próximo feriado o cuántos quedan en el año? Consultá el <a href="/feriados-2026">calendario de feriados y fines de semana largos 2026</a>.</p>

<h2 id="proximos">Próximos findes largos de 2026</h2>
{tabla}
<p>Planificá tus días con el <a href="/calculadora-feriados-argentina-2026-calendario">calendario completo de feriados 2026</a>.</p>

<h2 id="trabajo">¿Y si me toca trabajar?</h2>
<p>Si trabajás en un día feriado nacional, en general corresponde el pago del día <strong>al doble</strong> (el día trabajado más una vez su valor), según el régimen de la Ley de Contrato de Trabajo. La regla difiere de un "día no laborable", donde el pago es simple y la decisión de trabajar queda a criterio del empleador. Calculá cuánto te corresponde con la <a href="/calculadora-sueldo-hora-extra-nocturna-feriado">calculadora de horas extra y feriados</a>.</p>
<p>Datos de feriados según la Ley 27.399 y los puentes turísticos oficiales. Para tu situación laboral puntual, consultá con un profesional.</p>'''

    post = {
        'slug': slug,
        'title': f'Finde largo {rango} {a.year}: cuántos días y por qué | Hacé Cuentas',
        'ogTitle': f'Finde largo {rango}: son {n} días',
        'description': (f'Finde largo {rango} de {a.year}: {n} días por {feriado_str}. '
                        f'Qué días son, los próximos del año y cuánto se cobra si te toca trabajar.'),
        'seoKeywords': [
            f'finde largo {mes_nombre} {a.year}',
            f'feriado {mes_nombre} {a.year}',
            'fin de semana largo argentina',
            'proximos feriados argentina 2026',
            'feriado se cobra doble',
        ],
        'category': 'finanzas',
        'date': today.isoformat(),
        'updatedDate': today.isoformat(),
        'author': 'Hacé Cuentas',
        'readingTime': 3,
        'heroEmoji': '🏖️',
        'content': content,
        'relatedCalcs': [
            'fechas/feriados',
            'trabajo/horas-extra',
            'trabajo/sueldo-bruto-y-neto',
            'calculadora-sueldo-hora-extra-nocturna-feriado',
        ],
        'faq': [
            {'q': f'¿Cuándo es el finde largo de {mes_nombre} {a.year}?',
             'a': f'Es {rango}: del {dia_ini} {a.day} al {dia_fin} {b.day}, {n} días corridos, por {feriado_str}.'},
            {'q': '¿Cuántos días dura?',
             'a': f'{n} días seguidos sin trabajar (incluye el fin de semana y el/los feriado/s).'},
            {'q': '¿El feriado es inamovible o trasladable?',
             'a': 'Depende del feriado: los inamovibles caen siempre en la misma fecha; los trasladables se mueven al lunes según el Decreto 1584/2010. Los "puentes" turísticos los fija el Poder Ejecutivo cada año. El detalle de cada uno está en el calendario de feriados.'},
            {'q': '¿Cuáles son los próximos findes largos del año?',
             'a': 'Más abajo en la nota tenés la tabla con los próximos findes largos de 2026 y su duración. También podés verlos en el calendario de fines de semana largos.'},
            {'q': '¿Se cobra doble si trabajo en el feriado?',
             'a': 'En un feriado nacional, trabajar generalmente se paga al doble (día más una vez su valor) según la Ley de Contrato de Trabajo. En un "día no laborable" el pago es simple. Calculá tu caso con la calculadora de feriados y horas extra.'},
            {'q': '¿Conviene pedir días para estirarlo?',
             'a': 'Si el finde largo deja un día hábil "suelto" cerca (por ejemplo un martes después de un lunes feriado), pedir ese día puede convertir 3-4 días en una semana entera. Mirá el calendario para ver dónde conviene pedir vacaciones.'},
            {'q': '¿De dónde salen estas fechas?',
             'a': 'De la Ley 27.399 (régimen de feriados nacionales) y los días no laborables turísticos que fija el Poder Ejecutivo cada año. La nota se actualiza automáticamente con la fuente oficial.'},
        ],
    }

    out = BLOG / f'{slug}.json'
    if out.exists() and '--force' not in sys.argv:
        print(f'• ya existe (skip): {out}')
        return
    out.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    print(f'✅ Post generado: {out}  ({rango}, {n} días, {feriado_str})')


if __name__ == '__main__':
    generate()
