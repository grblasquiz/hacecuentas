#!/usr/bin/env python3
"""
Genera post mensual auto para el blog con data fresca:
- Dólar (oficial, blue, MEP, CCL) del mes
- Inflación mensual AR
- Tasas de plazo fijo de bancos top
- Comparación y análisis

Se ejecuta vía GitHub Action el 1er lunes de cada mes.
Crea src/content/blog/YYYY-MM-informe-financiero-argentina.json
"""
import json
import urllib.request
import ssl
from datetime import datetime, timedelta
from pathlib import Path

try:
    import certifi
    _ssl_ctx = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _ssl_ctx = ssl.create_default_context()


def fetch_json(url):
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'hacecuentas-monthly-post/1.0'})
        with urllib.request.urlopen(req, timeout=15, context=_ssl_ctx) as resp:
            return json.loads(resp.read().decode('utf-8'))
    except Exception as e:
        print(f'⚠️  No se pudo fetch {url}: {e}')
        return None


def fetch_dolar():
    """Fetch cotizaciones del dólar desde dolarapi.com."""
    data = fetch_json('https://dolarapi.com/v1/dolares')
    if not data:
        return {}
    result = {}
    for d in data:
        result[d['casa']] = {
            'compra': d.get('compra'),
            'venta': d.get('venta'),
        }
    return result


def fetch_inflacion():
    """Inflación mensual últimos meses desde argentinadatos.com."""
    data = fetch_json('https://api.argentinadatos.com/v1/finanzas/indices/inflacion')
    if not data:
        return []
    return data[-6:]  # últimos 6 meses


def fetch_plazofijo():
    """Tasas de plazo fijo de bancos."""
    data = fetch_json('https://api.argentinadatos.com/v1/finanzas/tasas/plazoFijo')
    if not data:
        return []
    return sorted(data, key=lambda x: x.get('tnaClientes', 0), reverse=True)[:10]


def brecha_pct(oficial, otro):
    if not oficial or not otro:
        return None
    return round((otro / oficial - 1) * 100, 1)


def generate_post():
    today = datetime.now()
    mes_es = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
              'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'][today.month - 1]
    month_slug = today.strftime('%Y-%m')
    slug = f'informe-financiero-argentina-{month_slug}'

    dolares = fetch_dolar()
    inflacion = fetch_inflacion()
    plazofijo = fetch_plazofijo()

    # --- Build content ---
    oficial_v = dolares.get('oficial', {}).get('venta', 0)
    blue_v = dolares.get('blue', {}).get('venta', 0)
    mep_v = dolares.get('bolsa', {}).get('venta', 0)
    ccl_v = dolares.get('contadoconliqui', {}).get('venta', 0)

    brecha_blue = brecha_pct(oficial_v, blue_v)
    brecha_mep = brecha_pct(oficial_v, mep_v)
    brecha_ccl = brecha_pct(oficial_v, ccl_v)

    # Tabla dólar
    dolar_rows = []
    for casa, label in [('oficial', 'Oficial'), ('blue', 'Blue'), ('bolsa', 'MEP'),
                         ('contadoconliqui', 'CCL'), ('tarjeta', 'Tarjeta'), ('cripto', 'Cripto')]:
        d = dolares.get(casa)
        if d:
            dolar_rows.append(f'<tr><td><strong>{label}</strong></td><td>${d.get("compra") or "—"}</td><td>${d.get("venta") or "—"}</td></tr>')
    dolar_table = '<table><thead><tr><th>Tipo</th><th>Compra</th><th>Venta</th></tr></thead><tbody>' + ''.join(dolar_rows) + '</tbody></table>'

    # Tabla inflación
    if inflacion:
        inf_rows = []
        for item in inflacion[-6:]:
            fecha = item.get('fecha', '')
            valor = item.get('valor', 0)
            inf_rows.append(f'<tr><td>{fecha}</td><td>{valor}%</td></tr>')
        inf_table = '<table><thead><tr><th>Mes</th><th>IPC mensual</th></tr></thead><tbody>' + ''.join(inf_rows) + '</tbody></table>'
        ultimo_ipc = inflacion[-1].get('valor', 0) if inflacion else 0
    else:
        inf_table = '<p><em>Datos de inflación no disponibles.</em></p>'
        ultimo_ipc = 0

    # Tabla plazo fijo top 10
    if plazofijo:
        pf_rows = []
        for pf in plazofijo[:10]:
            entidad = pf.get('entidad', '')
            tna = pf.get('tnaClientes', 0) or 0
            pf_rows.append(f'<tr><td>{entidad}</td><td>{round(tna * 100, 2)}%</td></tr>')
        pf_table = '<table><thead><tr><th>Banco</th><th>TNA clientes</th></tr></thead><tbody>' + ''.join(pf_rows) + '</tbody></table>'
    else:
        pf_table = '<p><em>Datos de plazo fijo no disponibles.</em></p>'

    # --- Narrative ---
    content_html = f'''<p>Informe mensual con la foto financiera de Argentina al comienzo de <strong>{mes_es} {today.year}</strong>: cotización del dólar en todas sus variantes, inflación reciente, tasas de plazo fijo y qué conviene hacer con tus pesos este mes. Datos actualizados desde fuentes oficiales (BCRA, INDEC, dolarapi).</p>

<h2 id="dolar">Dólar hoy: oficial, blue, MEP, CCL</h2>
<p>Al {today.strftime('%d de %B').lower()} la cotización del dólar en sus distintas variantes:</p>
{dolar_table}
'''

    if brecha_blue or brecha_mep:
        content_html += f'<h3>Brecha cambiaria</h3><ul>'
        if brecha_blue:
            content_html += f'<li><strong>Blue vs oficial</strong>: {brecha_blue}%</li>'
        if brecha_mep:
            content_html += f'<li><strong>MEP vs oficial</strong>: {brecha_mep}%</li>'
        if brecha_ccl:
            content_html += f'<li><strong>CCL vs oficial</strong>: {brecha_ccl}%</li>'
        content_html += '</ul>'
        content_html += '<p>Si la brecha está baja (menos del 15%), la presión cambiaria es contenida. Si está sobre el 40%, hay tensión acumulada. Para profundizar, consultá nuestra <a href="/brecha-dolar-blue-mep-ccl-oficial">calculadora de brecha</a> actualizada en tiempo real.</p>'

    content_html += f'''
<h2 id="inflacion">Inflación reciente</h2>
<p>El IPC mensual de los últimos 6 meses (INDEC):</p>
{inf_table}
<p>Si tu ahorro está en pesos, el interés tiene que <strong>superar la inflación</strong> para que realmente rinda. Usá nuestra <a href="/calculadora-inflacion-acumulada-periodo">calculadora de inflación acumulada</a> para ver cuánto perdió tu dinero.</p>

<h2 id="plazo-fijo">Plazo fijo: top 10 bancos</h2>
<p>Tasas TNA de plazo fijo tradicional a 30 días al {today.strftime('%d de %B').lower()}:</p>
{pf_table}
<p>Para simular tu rendimiento exacto con esta tasa, usá la <a href="/calculadora-plazo-fijo">calculadora de plazo fijo</a>. Comparalo con la inflación: si la TNA mensual equivalente es <em>menor</em> al IPC, tu dinero pierde poder adquisitivo aunque el saldo nominal crezca.</p>

<h2 id="recomendaciones">Qué hacer con tus pesos este mes</h2>
<p>Regla pragmática para el contexto actual:</p>
<ol>
<li><strong>Fondo de emergencia</strong> en pesos, plazo fijo corto (30 días) o FCI money market. Debe cubrir 3-6 meses de gastos.</li>
<li><strong>Ahorro de mediano plazo</strong> en dólar MEP (100% legal vía cuenta comitente). No es inversión, es cobertura anti-inflación.</li>
<li><strong>Ahorro de largo plazo</strong> en CEDEARs o ONs en USD. Diversificar emisores (YPF, Pampa, Telecom) baja el riesgo.</li>
<li><strong>Nunca</strong> dejar todo en pesos en caja de ahorro a tasa 0. Es el peor escenario.</li>
</ol>
<p>No es consejo financiero. Las decisiones importantes deberían consultarse con un contador o asesor.</p>

<h2 id="calcs">Calculadoras útiles para tu planificación</h2>
<ul>
<li><a href="/presupuesto-familiar">Presupuesto familiar 50/30/20</a></li>
<li><a href="/calculadora-interes-compuesto">Interés compuesto</a></li>
<li><a href="/calculadora-plazo-fijo">Plazo fijo — rendimiento real</a></li>
<li><a href="/brecha-dolar-blue-mep-ccl-oficial">Brecha del dólar</a></li>
<li><a href="/calculadora-inflacion-acumulada-periodo">Inflación acumulada</a></li>
<li><a href="/simulador-jubilacion-anses">Simulador de jubilación ANSES</a></li>
</ul>
'''

    post = {
        'slug': slug,
        'title': f'Informe financiero Argentina — {mes_es} {today.year} | Hacé Cuentas',
        'description': f'Cotización del dólar, inflación, plazo fijo y análisis financiero para Argentina en {mes_es} {today.year}. Datos oficiales de BCRA e INDEC, actualizados semanalmente.',
        'seoKeywords': [
            f'informe financiero {today.year}', 'dolar hoy', 'inflacion argentina', 'plazo fijo tasas', 'dolar blue', 'dolar mep',
            f'finanzas argentina {mes_es}', 'tasas plazo fijo bancos',
        ],
        'category': 'finanzas',
        'date': today.strftime('%Y-%m-%d'),
        'updatedDate': today.strftime('%Y-%m-%d'),
        'author': 'Hacé Cuentas',
        'readingTime': 6,
        'heroEmoji': '📊',
        'content': content_html,
        'relatedCalcs': [
            'brecha-dolar-blue-mep-ccl-oficial',
            'plazo-fijo',
            'interes-compuesto',
            'inflacion-acumulada-periodo',
        ],
        'faq': [
            {
                'q': '¿Con qué frecuencia se actualiza este informe?',
                'a': 'El informe se regenera el primer lunes de cada mes con los datos más recientes del BCRA, INDEC y dolarapi. La fecha de publicación arriba te indica cuándo fue la última actualización.',
            },
            {
                'q': '¿Esto es consejo financiero?',
                'a': 'No. Es información educativa y de síntesis de datos públicos. Las decisiones financieras importantes deberían tomarse consultando con un profesional idóneo.',
            },
            {
                'q': '¿De dónde vienen los datos?',
                'a': 'Cotizaciones del dólar de <strong>dolarapi.com</strong> (que agrega BCRA y fuentes del mercado). Inflación de <strong>INDEC</strong> vía argentinadatos.com. Plazo fijo de <strong>BCRA</strong> vía argentinadatos.com.',
            },
        ],
    }

    out = Path('src/content/blog') / f'{slug}.json'
    out.write_text(json.dumps(post, ensure_ascii=False, indent=2))
    print(f'✅ Post generado: {out}')
    print(f'   Dólar oficial: ${oficial_v}')
    print(f'   Dólar blue: ${blue_v} (brecha {brecha_blue}%)')
    print(f'   IPC último mes: {ultimo_ipc}%')
    print(f'   Top plazo fijo: {plazofijo[0].get("entidad") if plazofijo else "—"}')


if __name__ == '__main__':
    generate_post()
