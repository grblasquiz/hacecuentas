#!/usr/bin/env python3
"""
Motor Discover — pieza de NEWSJACKING del dólar (cadencia entre eventos).

Por qué existe: Discover premia frescura CONSISTENTE; el motor cubría sólo
ventanas de evento (inflación día 14-17, finde largo, mundial) → gaps de 3+ días
sin nota → el sitemap-news se apagaba. El dólar es el tema plata-AR de mayor
interés y se mueve seguido: cuando hay un SALTO real, es noticia legítima (no
thin-content). Esta pieza publica SÓLO si el blue se movió ≥2,5% vs la última
cotización guardada Y no hubo nota de dólar en los últimos 2 días (cooldown).
Así da cadencia de calidad sin caer en notas diarias formulaicas.

Data LIVE de argentinadatos (cero alucinación). Patrón = generate-inflacion-post.py.

Uso:
  python3 scripts/generate-dolar-post.py            # publica si hubo salto
  python3 scripts/generate-dolar-post.py --dry-run  # imprime sin escribir
  python3 scripts/generate-dolar-post.py --force     # ignora umbral/cooldown
"""
import json
import sys
import ssl
import glob
import urllib.request
from datetime import datetime, date, timedelta
from pathlib import Path

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _SSL = ssl.create_default_context()

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']
UMBRAL_PCT = 2.5          # salto mínimo del blue para que sea noticia
COOLDOWN_DAYS = 2         # no publicar si ya hubo nota de dólar en estos días
STATE = Path('scripts/discover/.dolar-state.json')


def ars(n):
    return f'{round(n):,}'.replace(',', '.')


def fetch_dolares():
    url = 'https://api.argentinadatos.com/v1/cotizaciones/dolares'
    req = urllib.request.Request(url, headers={'User-Agent': 'hacecuentas-discover/1.0'})
    with urllib.request.urlopen(req, timeout=20, context=_SSL) as r:
        data = json.loads(r.read().decode('utf-8'))
    latest = {}
    for x in data:
        casa, fecha = x.get('casa'), x.get('fecha')
        if not casa or not fecha:
            continue
        if casa not in latest or fecha > latest[casa]['fecha']:
            latest[casa] = x
    return latest


def recent_dolar_note_exists():
    cutoff = date.today() - timedelta(days=COOLDOWN_DAYS)
    for f in glob.glob('src/content/blog/dolar-blue-*.json'):
        try:
            d = json.load(open(f))
            ds = (d.get('date') or '')[:10]
            y, m, dd = map(int, ds.split('-'))
            if date(y, m, dd) > cutoff:
                return True
        except Exception:
            pass
    return False


def generate(dry_run=False, force=False):
    latest = fetch_dolares()
    blue = latest.get('blue')
    oficial = latest.get('oficial')
    if not blue or not oficial:
        print('✗ sin cotización blue/oficial'); sys.exit(1)
    blue_v = float(blue['venta'])
    oficial_v = float(oficial['venta'])
    mep_v = float(latest.get('bolsa', {}).get('venta') or 0)
    ccl_v = float(latest.get('contadoconliqui', {}).get('venta') or 0)
    tarjeta_v = float(latest.get('tarjeta', {}).get('venta') or 0)
    fecha = blue['fecha']                       # 'YYYY-MM-DD'
    brecha = round((blue_v / oficial_v - 1) * 100, 1)

    # Variación vs la última cotización guardada
    prev = None
    if STATE.exists():
        try:
            prev = json.load(open(STATE))
        except Exception:
            prev = None
    var_pct = None
    if prev and prev.get('blue'):
        var_pct = round((blue_v / float(prev['blue']) - 1) * 100, 1)

    # Guardar SIEMPRE el state nuevo (para la próxima comparación)
    STATE.parent.mkdir(parents=True, exist_ok=True)
    if not dry_run:
        STATE.write_text(json.dumps({'blue': blue_v, 'fecha': fecha}, ensure_ascii=False))

    # Gate: sólo publicamos si hubo salto real y no hay cooldown
    if not force:
        if var_pct is None:
            print(f'• primera corrida (state inicializado en ${ars(blue_v)}) — no publico'); return
        if abs(var_pct) < UMBRAL_PCT:
            print(f'• blue movió {var_pct:+}% (<{UMBRAL_PCT}%) — sin noticia, no publico'); return
        if recent_dolar_note_exists():
            print(f'• ya hubo nota de dólar en los últimos {COOLDOWN_DAYS} días (cooldown) — no publico'); return

    subio = (var_pct or 0) >= 0
    verbo = 'subió' if subio else 'bajó'
    y, m, dd = int(fecha[:4]), int(fecha[5:7]), int(fecha[8:10])
    mes = MESES[m - 1]
    slug = f'dolar-blue-{dd}-{mes}-{y}'
    abs_var = abs(var_pct or 0)

    tabla = (
        '<table><thead><tr><th>Tipo</th><th>Venta</th><th>Brecha vs oficial</th></tr></thead><tbody>'
        f'<tr><td>Oficial</td><td>${ars(oficial_v)}</td><td>—</td></tr>'
        f'<tr><td><strong>Blue</strong></td><td><strong>${ars(blue_v)}</strong></td><td>{brecha}%</td></tr>'
        + (f'<tr><td>MEP (bolsa)</td><td>${ars(mep_v)}</td><td>{round((mep_v/oficial_v-1)*100,1)}%</td></tr>' if mep_v else '')
        + (f'<tr><td>CCL</td><td>${ars(ccl_v)}</td><td>{round((ccl_v/oficial_v-1)*100,1)}%</td></tr>' if ccl_v else '')
        + (f'<tr><td>Tarjeta/Ahorro</td><td>${ars(tarjeta_v)}</td><td>{round((tarjeta_v/oficial_v-1)*100,1)}%</td></tr>' if tarjeta_v else '')
        + '</tbody></table>'
    )

    content = f'''<p>El <strong>dólar blue</strong> {verbo} <strong>{abs_var}%</strong> y cerró en <strong>${ars(blue_v)}</strong> para la venta. La brecha con el dólar oficial (${ars(oficial_v)}) quedó en <strong>{brecha}%</strong>. Te dejamos las cotizaciones del día, qué significa el movimiento para tu plata y cómo seguir el dólar al instante.</p>

<h2 id="cotizaciones">El dólar hoy: todas las cotizaciones</h2>
{tabla}
<p>Para seguir la brecha actualizada y convertir cualquier monto, usá la <a href="/calculadora-dolar-blue-vs-oficial-brecha">calculadora de brecha del dólar</a> y el <a href="/cambio-de-monedas">conversor de monedas</a>.</p>

<h2 id="que-significa">¿Qué significa este movimiento para tu plata?</h2>
<ul>
<li><strong>Ahorro en pesos</strong>: si tenés pesos quietos, un salto del blog del {abs_var}% licúa tu poder de compra medido en dólares. Conviene comparar contra la inflación del mes con la <a href="/calculadora-inflacion-acumulada-periodo">calculadora de inflación acumulada</a>.</li>
<li><strong>Sueldo</strong>: medido en dólares blue, tu sueldo en pesos {'cae' if subio else 'sube'} cuando el blue {verbo}. Mirá cuánto te queda en mano con la <a href="/sueldo-en-mano-argentina">calculadora de sueldo</a>.</li>
<li><strong>Brecha</strong>: una brecha del {brecha}% encarece lo importado y mete presión a precios. Es el número que más miran los analistas para anticipar movimientos.</li>
</ul>

<h2 id="cual-mirar">Blue, MEP o CCL: ¿cuál mirar?</h2>
<p>El <strong>blue</strong> es el informal (efectivo). El <strong>MEP</strong> y el <strong>CCL</strong> son legales vía cuenta comitente (bonos): el MEP deja los dólares en el país y el CCL los gira afuera. Para cobertura del ahorro, el MEP suele ser la vía más usada por ser legal y con costos bajos. La cotización relevante depende de para qué necesitás los dólares.</p>

<h2 id="que-hacer">Qué conviene hacer</h2>
<ol>
<li><strong>No reaccionar al ruido diario</strong>: el blue se mueve por noticias y estacionalidad; un día no define una tendencia.</li>
<li><strong>Cobertura legal</strong>: para dolarizar ahorros, MEP o CCL antes que el informal.</li>
<li><strong>Medí en términos reales</strong>: lo que importa es el dólar vs la inflación, no el número nominal solo.</li>
</ol>
<p>No es consejo financiero: es síntesis de datos públicos (argentinadatos). Para decisiones importantes, consultá con un asesor matriculado.</p>
'''

    post = {
        'slug': slug,
        'title': f'Dólar blue hoy {dd}/{m:02d}: {verbo} a ${ars(blue_v)} — brecha {brecha}% | Hacé Cuentas',
        'ogTitle': f'Dólar blue {verbo} a ${ars(blue_v)}: qué pasó y qué conviene',
        'description': (f'El dólar blue {verbo} {abs_var}% a ${ars(blue_v)} (brecha {brecha}% vs oficial). '
                        f'Todas las cotizaciones de hoy y qué significa el movimiento para tu plata.'),
        'seoKeywords': [
            'dolar blue hoy', 'dolar hoy argentina', f'dolar blue {dd} de {mes}',
            'cotizacion dolar blue', 'brecha dolar', 'dolar mep ccl hoy',
        ],
        'category': 'finanzas',
        'date': fecha,
        'updatedDate': fecha,
        'author': 'Hacé Cuentas',
        'readingTime': 3,
        'heroEmoji': '💵',
        'content': content,
        'relatedCalcs': [
            'calculadora-dolar-blue-vs-oficial-brecha',
            'cambio-de-monedas',
            'calculadora-inflacion-acumulada-periodo',
            'sueldo-en-mano-argentina',
        ],
        'faq': [
            {'q': f'¿A cuánto está el dólar blue hoy ({dd}/{m:02d})?',
             'a': f'El dólar blue cerró en ${ars(blue_v)} para la venta, {verbo} {abs_var}% respecto de la cotización previa. El oficial quedó en ${ars(oficial_v)}, con una brecha del {brecha}%.'},
            {'q': '¿Qué es la brecha cambiaria?',
             'a': f'Es la diferencia porcentual entre el dólar paralelo (blue) y el oficial. Hoy es del {brecha}%. Una brecha alta encarece lo importado y suele anticipar presión sobre los precios.'},
            {'q': '¿Cuál es la diferencia entre blue, MEP y CCL?',
             'a': 'El blue es el dólar informal en efectivo. El MEP (dólar bolsa) y el CCL son legales y se operan con bonos vía cuenta comitente: el MEP deja los dólares en el país y el CCL los transfiere al exterior.'},
            {'q': '¿Conviene comprar dólares cuando sube el blue?',
             'a': 'Depende de tu objetivo y horizonte. Comprar en pánico cuando ya saltó suele ser caro. Para ahorro de largo plazo, lo habitual es dolarizar de a poco por la vía legal (MEP) y mirar el dólar contra la inflación, no el número nominal.'},
            {'q': '¿Por qué el dólar tarjeta es más caro?',
             'a': f'El dólar tarjeta/ahorro (${ars(tarjeta_v)}) suma impuestos (PAIS y percepción de Ganancias) sobre el oficial, por eso suele estar por encima del blue y del MEP.'},
            {'q': '¿Dónde veo el dólar actualizado?',
             'a': 'En esta nota tenés el cierre del día; para convertir montos y ver la brecha al instante usá la calculadora de brecha del dólar y el conversor de monedas de Hacé Cuentas.'},
            {'q': '¿De dónde sale este dato?',
             'a': 'De las cotizaciones públicas de argentinadatos.com. La fecha de publicación de la nota indica el día del cierre.'},
        ],
    }

    if dry_run:
        _vp = f'{var_pct:+}%' if var_pct is not None else 'n/a'
        print(json.dumps(post, ensure_ascii=False, indent=2))
        print(f'\n--- {slug} | blue ${ars(blue_v)} {_vp} | brecha {brecha}%', file=sys.stderr)
        return

    out = Path('src/content/blog') / f'{slug}.json'
    if out.exists() and not force:
        print(f'• ya existe (skip, fecha preservada): {out}'); return
    out.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    print(f'✅ Post generado: {out}')
    print(f'   dólar blue ${ars(blue_v)} ({var_pct:+}%) | brecha {brecha}%')


if __name__ == '__main__':
    generate(dry_run='--dry-run' in sys.argv, force='--force' in sys.argv)
