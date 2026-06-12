#!/usr/bin/env python3
"""
Motor Discover — pieza mensual "Inflación de {mes}: cuánto perdiste".

Por qué existe: Google Discover es el único canal de Google que NO depende de
autoridad de dominio (feed por interés + frescura + imagen). Lo que le faltaba a
hacecuentas era COMBUSTIBLE: notas noticiosas frescas pegadas al calendario de
plata argentino. Esta es la pieza recurrente más data-backed: cuando INDEC
publica el IPC del mes (~mediados de mes), generamos una nota fechada HOY con el
dato real y el ángulo "cuánto perdió tu plata".

Patrón idéntico a generate-monthly-post.py (data LIVE, cero alucinación):
fetch argentinadatos → cómputo → post JSON → commit/push (GitHub Action) → deploy.

Uso:
  python3 scripts/generate-inflacion-post.py            # último mes publicado
  python3 scripts/generate-inflacion-post.py --dry-run  # imprime sin escribir
"""
import json
import sys
import ssl
import urllib.request
from datetime import datetime
from pathlib import Path

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _SSL = ssl.create_default_context()

MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
         'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre']


def fetch_inflacion():
    url = 'https://api.argentinadatos.com/v1/finanzas/indices/inflacion'
    req = urllib.request.Request(url, headers={'User-Agent': 'hacecuentas-discover/1.0'})
    with urllib.request.urlopen(req, timeout=20, context=_SSL) as r:
        return json.loads(r.read().decode('utf-8'))


def accumulate(values):
    """Inflación acumulada (%) a partir de una lista de IPC mensuales (%)."""
    factor = 1.0
    for v in values:
        factor *= (1 + (v or 0) / 100)
    return round((factor - 1) * 100, 1)


def generate(dry_run=False):
    serie = fetch_inflacion()
    if not serie:
        print('✗ sin datos de inflación')
        sys.exit(1)

    serie = [x for x in serie if x.get('valor') is not None]
    target = serie[-1]
    fecha = target['fecha']                 # 'YYYY-MM-DD'
    year, month = int(fecha[:4]), int(fecha[5:7])
    mes_nombre = MESES[month - 1]
    ipc_mes = round(target['valor'], 1)

    # Acumulada del año en curso (meses del mismo año hasta el target inclusive)
    ytd_vals = [x['valor'] for x in serie if int(x['fecha'][:4]) == year and int(x['fecha'][5:7]) <= month]
    ytd = accumulate(ytd_vals)

    # Acumulada últimos 12 meses
    last12 = accumulate([x['valor'] for x in serie[-12:]])

    # "Cuánto perdiste": $100.000 de hace 12 meses hoy compran...
    poder_100k = round(100000 / (1 + last12 / 100))
    perdida_100k = 100000 - poder_100k
    cuesta_100k = round(100000 * (1 + last12 / 100))
    # Formato AR: punto como separador de miles ($75.075, no $75,075)
    def ars(n):
        return f'{n:,}'.replace(',', '.')
    poder_s, perdida_s, cuesta_s = ars(poder_100k), ars(perdida_100k), ars(cuesta_100k)

    # Tabla últimos 6 meses
    rows = []
    for x in serie[-6:]:
        f = x['fecha']
        m = MESES[int(f[5:7]) - 1].capitalize()
        rows.append(f'<tr><td>{m} {f[:4]}</td><td>{round(x["valor"], 1)}%</td></tr>')
    tabla = ('<table><thead><tr><th>Mes</th><th>IPC mensual (INDEC)</th></tr></thead><tbody>'
             + ''.join(rows) + '</tbody></table>')

    today = datetime.now()
    slug = f'inflacion-{mes_nombre}-{year}-cuanto-perdiste'

    content = f'''<p>El INDEC publicó el IPC de <strong>{mes_nombre} {year}</strong>: la inflación del mes fue del <strong>{ipc_mes}%</strong>. En lo que va del año acumula <strong>{ytd}%</strong> y en los últimos 12 meses, <strong>{last12}%</strong>. Traducido a tu bolsillo: <strong>$100.000</strong> que guardaste en pesos hace un año hoy tienen el poder de compra de apenas <strong>${poder_s}</strong> — perdiste cerca de <strong>${perdida_s}</strong> de valor real solo por la inflación. Visto al revés: lo que hace un año comprabas con $100.000, hoy te cuesta <strong>${cuesta_s}</strong>.</p>

<h2 id="dato">Inflación de {mes_nombre} {year}: el dato</h2>
<p>IPC mensual de los últimos 6 meses según INDEC:</p>
{tabla}
<p>Para ver cuánto perdió tu dinero en un período exacto, usá la <a href="/calculadora-inflacion-acumulada-periodo">calculadora de inflación acumulada</a>: ponés el monto y las fechas, y te dice el poder de compra real.</p>

<h2 id="que-significa">¿Qué significa para tus ahorros?</h2>
<p>La regla es simple: si tu plata rinde <em>menos</em> que la inflación, perdés poder de compra aunque el número nominal suba. Con una inflación mensual del {ipc_mes}%, cualquier instrumento en pesos tiene que superar ese piso solo para empatar.</p>
<ul>
<li><strong>Plazo fijo</strong>: compará la TNA mensual equivalente contra el {ipc_mes}% del mes. Si la tasa mensual es menor, perdés en términos reales. Simulalo en la <a href="/calculadora-plazo-fijo">calculadora de plazo fijo</a>.</li>
<li><strong>Sueldo</strong>: si tu aumento del mes fue menor al {ipc_mes}%, en la práctica cobrás menos. Mirá cuánto te queda en mano con la <a href="/sueldo-en-mano-argentina">calculadora de sueldo</a>.</li>
<li><strong>Dólar y cobertura</strong>: muchos comparan la inflación contra la suba del dólar para decidir dónde refugiarse. Mirá la <a href="/calculadora-dolar-blue-vs-oficial-brecha">brecha del dólar</a> actualizada.</li>
</ul>

<h2 id="como-cubrirte">Cómo cubrirte de la inflación</h2>
<ol>
<li><strong>No dejar pesos quietos</strong> en caja de ahorro a tasa 0: es donde la inflación pega más fuerte.</li>
<li><strong>Fondo de emergencia</strong> en FCI money market o plazo fijo corto, para no perder liquidez pero al menos devengar tasa.</li>
<li><strong>Mediano/largo plazo</strong>: cobertura en dólar MEP (legal vía cuenta comitente), CEDEARs u ONs en USD para diversificar.</li>
<li><strong>Medí el rendimiento REAL</strong>, no el nominal: usá la <a href="/calculadora-retorno-real-inversion-descontando-inflacion">calculadora de rendimiento real</a> que descuenta inflación.</li>
</ol>
<p>No es consejo financiero: es síntesis de datos públicos del INDEC. Para decisiones importantes, consultá con un contador o asesor matriculado.</p>
'''

    post = {
        'slug': slug,
        'title': f'Inflación de {mes_nombre} {year}: {ipc_mes}% — cuánto perdiste y cómo cubrirte | Hacé Cuentas',
        'ogTitle': f'Inflación de {mes_nombre} {year}: cuánto perdió tu plata',
        'description': (f'La inflación de {mes_nombre} {year} fue {ipc_mes}% (INDEC). Acumulada del año {ytd}%, '
                        f'12 meses {last12}%. Cuánto perdió tu poder de compra y cómo cubrirte en pesos.'),
        'seoKeywords': [
            f'inflacion {mes_nombre} {year}',
            f'inflacion argentina {year}',
            'ipc indec mensual',
            'inflacion acumulada argentina',
            'cuanto perdi por la inflacion',
            'inflacion vs plazo fijo',
        ],
        'category': 'finanzas',
        'date': today.strftime('%Y-%m-%d'),
        'updatedDate': today.strftime('%Y-%m-%d'),
        'author': 'Hacé Cuentas',
        'readingTime': 4,
        'heroEmoji': '📈',
        'content': content,
        'relatedCalcs': [
            'calculadora-inflacion-acumulada-periodo',
            'calculadora-plazo-fijo',
            'calculadora-retorno-real-inversion-descontando-inflacion',
            'calculadora-dolar-blue-vs-oficial-brecha',
        ],
        'faq': [
            {'q': f'¿Cuál fue la inflación de {mes_nombre} {year}?',
             'a': f'Según el INDEC, el IPC de {mes_nombre} {year} fue del {ipc_mes}%. En lo que va del año acumula {ytd}% y en los últimos 12 meses, {last12}%.'},
            {'q': '¿Cuánto perdió mi plata por la inflación?',
             'a': f'Con la inflación interanual del {last12}%, $100.000 de hace un año equivalen hoy a unos ${poder_s} de poder de compra: perdiste cerca de ${perdida_s} de valor real. Para tu monto exacto, usá la calculadora de inflación acumulada.'},
            {'q': '¿Cómo se calcula la inflación acumulada?',
             'a': 'No se suman los porcentajes: se multiplican los factores. Cada mes multiplica (1 + IPC/100); el acumulado es el producto menos 1. Por eso varios meses al 2-3% terminan dando un acumulado mayor a la suma simple.'},
            {'q': '¿El plazo fijo le gana a la inflación?',
             'a': f'Depende del mes. Hay que comparar la TNA mensual equivalente contra el IPC del mes ({ipc_mes}% en {mes_nombre}). Si la tasa mensual es menor, el plazo fijo pierde en términos reales aunque el saldo nominal crezca.'},
            {'q': '¿Qué conviene hacer con los pesos para no perder?',
             'a': 'No dejarlos quietos a tasa 0. Liquidez en FCI money market o plazo fijo corto; mediano/largo plazo con cobertura en dólar MEP, CEDEARs u ONs en USD. Siempre medir el rendimiento real (neto de inflación), no el nominal.'},
            {'q': '¿De dónde sale este dato?',
             'a': 'Del IPC oficial del INDEC, vía argentinadatos.com. La fecha de publicación arriba indica cuándo se actualizó esta nota.'},
            {'q': '¿Cada cuánto se actualiza esta nota?',
             'a': 'Se regenera cada mes cuando el INDEC publica el IPC del mes anterior (mediados de mes), con el dato más reciente.'},
        ],
    }

    if dry_run:
        print(json.dumps(post, ensure_ascii=False, indent=2))
        print(f'\n--- {slug} | IPC {mes_nombre} {ipc_mes}% | YTD {ytd}% | 12m {last12}% | $100k→${poder_s}', file=sys.stderr)
        return

    out = Path('src/content/blog') / f'{slug}.json'
    out.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    print(f'✅ Post generado: {out}')
    print(f'   {mes_nombre} {year}: {ipc_mes}% | YTD {ytd}% | 12m {last12}% | $100k hoy → ${poder_s}')


if __name__ == '__main__':
    generate(dry_run='--dry-run' in sys.argv)
