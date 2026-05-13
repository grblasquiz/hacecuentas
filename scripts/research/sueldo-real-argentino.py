#!/usr/bin/env python3
"""
Original Research — "El sueldo real argentino 1994-2026".

Cruza 3 fuentes oficiales para producir un dato propio que ningún sitio
de calcs argentino agrega sistemáticamente:

  - RIPTE (Subsecretaría de Seguridad Social — Ministerio de Trabajo)
    Salario imponible promedio AR mensual desde julio 1994.
  - IPC INDEC mensual desde 1943.
  - Dólar oficial + blue (diarios desde 2011, mensualizamos).

Métricas calculadas para cada mes:
  - ripte_nominal      — RIPTE en pesos del momento
  - ripte_real_base_ult — RIPTE deflactado por IPC, expresado en pesos
                          de poder adquisitivo del último mes disponible
  - ripte_usd_oficial   — RIPTE / cotización oficial venta promedio mes
  - ripte_usd_blue      — RIPTE / cotización blue venta promedio mes (post 2011)

Pitch hooks (ranking lines):
  - "Hace X años, el argentino promedio cobraba el equivalente a Y USD
     blue / Z USD oficial. Hoy cobra A USD blue / B USD oficial."
  - "El sueldo real argentino perdió X% desde 1994 / 2001 / 2017 / 2023."

Output:
  - docs/research/sueldo-real-argentino-<YYYY-MM>.json (data cruda)
  - docs/research/sueldo-real-argentino-<YYYY-MM>.md (insights + tabla)

Uso:
  python3 scripts/research/sueldo-real-argentino.py
"""
from __future__ import annotations

import json
import ssl
import urllib.request
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
DATASETS_DIR = ROOT / 'public' / 'datasets'
OUT_DIR = ROOT / 'docs' / 'research'

RIPTE_URL = ('https://infra.datos.gob.ar/catalog/sspm/dataset/158/'
             'distribution/158.1/download/'
             'remuneracion-imponible-promedio-trabajadores-estables-ripte-'
             'total-pais-pesos-serie-mensual.csv')


def _make_ssl_ctx() -> ssl.SSLContext:
    try:
        return ssl.create_default_context()
    except Exception:
        return ssl._create_unverified_context()


SSL_CTX = _make_ssl_ctx()


def fetch_ripte() -> list[dict]:
    """Descarga el CSV de RIPTE y devuelve [{fecha, ripte}]."""
    req = urllib.request.Request(RIPTE_URL, headers={'User-Agent': 'hacecuentas-research/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as r:
            csv_text = r.read().decode('utf-8')
    except urllib.error.URLError as e:
        if 'CERTIFICATE' in str(e).upper() or 'SSL' in str(e).upper():
            with urllib.request.urlopen(req, timeout=30, context=ssl._create_unverified_context()) as r:
                csv_text = r.read().decode('utf-8')
        else:
            raise

    rows = []
    for line in csv_text.strip().split('\n')[1:]:  # skip header
        parts = line.split(',')
        if len(parts) < 2:
            continue
        try:
            rows.append({'fecha': parts[0].strip(), 'ripte': float(parts[1].strip())})
        except ValueError:
            continue
    return rows


def load_ipc() -> dict[str, float]:
    """Carga IPC mensual desde dataset local. Devuelve {YYYY-MM: var_pct}."""
    d = json.loads((DATASETS_DIR / 'inflacion-argentina-historica-mensual.json').read_text())
    out = {}
    for r in d['data']:
        fecha = r['fecha']  # 'YYYY-MM-DD' (último día del mes)
        key = fecha[:7]  # 'YYYY-MM'
        out[key] = float(r['inflacion_mensual_pct'])
    return out


def load_dolar_monthly(filename: str) -> dict[str, float]:
    """Carga dólar diario y promedia por mes."""
    d = json.loads((DATASETS_DIR / filename).read_text())
    by_month: dict[str, list[float]] = {}
    for r in d['data']:
        ym = r['fecha'][:7]
        # venta_ars es lo que pagás como comprador, lo más relevante para conversión real
        venta = r.get('venta_ars')
        if venta is None or venta <= 0:
            continue
        by_month.setdefault(ym, []).append(float(venta))
    return {ym: sum(v) / len(v) for ym, v in by_month.items()}


def build_cpi_factors(ipc_monthly: dict[str, float], base_month: str) -> dict[str, float]:
    """Calcula factores de deflactor: $1 de cada mes equivalente a $X del mes base."""
    # Ordenar meses
    months = sorted(ipc_monthly.keys())
    if base_month not in ipc_monthly:
        # buscar el último mes <= base_month
        base_month = max(m for m in months if m <= base_month)

    # Factor desde mes base hacia atrás: cada mes anterior, su poder adq. es menor.
    # Si IPC[mes+1] = 5%, entonces $1 del mes vale $1.05 del mes+1 (en términos nominales),
    # o equivalente: $1 del mes+1 vale 1/1.05 del mes.
    factors = {base_month: 1.0}
    base_idx = months.index(base_month)

    # Hacia el pasado: factor[mes-1] = factor[mes] * (1 + ipc[mes]/100)
    # Porque $1 de mes-1, después de inflar por IPC[mes], se convierte en (1 + IPC) del mes,
    # entonces para llevar mes-1 a base, hay que aplicar todos los IPCs hasta base.
    for i in range(base_idx - 1, -1, -1):
        m = months[i]
        next_m = months[i + 1]
        factors[m] = factors[next_m] * (1 + ipc_monthly[next_m] / 100)

    # Hacia el futuro (si existe data IPC post base)
    for i in range(base_idx + 1, len(months)):
        m = months[i]
        prev_m = months[i - 1]
        factors[m] = factors[prev_m] / (1 + ipc_monthly[m] / 100)

    return factors


def main() -> int:
    print('Fetcheando RIPTE...')
    ripte_raw = fetch_ripte()
    print(f'  {len(ripte_raw)} puntos mensuales (desde {ripte_raw[0]["fecha"]} hasta {ripte_raw[-1]["fecha"]})')

    print('Cargando IPC INDEC...')
    ipc = load_ipc()
    print(f'  {len(ipc)} meses')

    print('Cargando dólar oficial + blue...')
    dolar_oficial = load_dolar_monthly('dolar-oficial-argentina-historico.json')
    dolar_blue = load_dolar_monthly('dolar-blue-argentina-historico.json')
    print(f'  oficial: {len(dolar_oficial)} meses (desde {min(dolar_oficial)} hasta {max(dolar_oficial)})')
    print(f'  blue:    {len(dolar_blue)} meses')

    # Mes base = último mes con RIPTE
    last_month = ripte_raw[-1]['fecha'][:7]
    print(f'\nMes base para deflactor: {last_month}')

    cpi_factors = build_cpi_factors(ipc, last_month)
    print(f'  CPI factors construidos para {len(cpi_factors)} meses')

    # Build full series
    series = []
    for r in ripte_raw:
        ym = r['fecha'][:7]
        nominal = r['ripte']
        factor = cpi_factors.get(ym)
        real = nominal * factor if factor is not None else None
        usd_of = nominal / dolar_oficial[ym] if ym in dolar_oficial else None
        usd_bl = nominal / dolar_blue[ym] if ym in dolar_blue else None
        series.append({
            'mes': ym,
            'ripte_nominal': round(nominal, 2),
            'ripte_real_pesos_actuales': round(real, 2) if real else None,
            'ripte_usd_oficial': round(usd_of, 2) if usd_of else None,
            'ripte_usd_blue': round(usd_bl, 2) if usd_bl else None,
        })

    last = series[-1]
    print(f'\nÚltimo punto ({last["mes"]}):')
    print(f'  RIPTE nominal: ${last["ripte_nominal"]:,.0f}')
    print(f'  RIPTE real (pesos {last_month}): ${last["ripte_real_pesos_actuales"]:,.0f}')
    print(f'  RIPTE USD oficial: ${last["ripte_usd_oficial"]:,.0f}' if last["ripte_usd_oficial"] else '  USD oficial: n/a')
    print(f'  RIPTE USD blue: ${last["ripte_usd_blue"]:,.0f}' if last["ripte_usd_blue"] else '  USD blue: n/a')

    # Anchor points para insights
    anchors = {
        '1994-07': 'lanzamiento del RIPTE (julio 1994)',
        '2001-12': 'fin de la convertibilidad (diciembre 2001)',
        '2015-12': 'pre-cepo de Macri (diciembre 2015)',
        '2017-12': 'paritarias récord (diciembre 2017)',
        '2019-12': 'fin de Macri (diciembre 2019)',
        '2023-11': 'fin de Massa / pre-Milei (noviembre 2023)',
        '2025-12': 'fin del 2025 (diciembre 2025)',
    }
    by_month = {s['mes']: s for s in series}

    insights = []
    last_real = last['ripte_real_pesos_actuales']
    last_usd_of = last['ripte_usd_oficial']
    last_usd_bl = last['ripte_usd_blue']

    print(f'\n--- INSIGHTS ---')
    for anchor_month, label in anchors.items():
        a = by_month.get(anchor_month)
        if not a:
            continue
        if a['ripte_real_pesos_actuales'] and last_real:
            delta_real = (last_real / a['ripte_real_pesos_actuales'] - 1) * 100
            insights.append({
                'anchor': anchor_month, 'label': label,
                'metric': 'real',
                'delta_pct': round(delta_real, 1),
                'anchor_value_nominal': a['ripte_nominal'],
                'anchor_value_real_pesos_actuales': a['ripte_real_pesos_actuales'],
                'today_value_real_pesos_actuales': last_real,
            })
            print(f'  vs {anchor_month} ({label}): salario real {delta_real:+.1f}%')
        if a['ripte_usd_blue'] and last_usd_bl:
            delta_usd = (last_usd_bl / a['ripte_usd_blue'] - 1) * 100
            insights.append({
                'anchor': anchor_month, 'label': label,
                'metric': 'usd_blue',
                'delta_pct': round(delta_usd, 1),
                'anchor_value_usd_blue': a['ripte_usd_blue'],
                'today_value_usd_blue': last_usd_bl,
            })
            print(f'  vs {anchor_month} ({label}): USD blue {delta_usd:+.1f}% (de ${a["ripte_usd_blue"]:.0f} a ${last_usd_bl:.0f})')

    # Output
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_json = OUT_DIR / f'sueldo-real-argentino-{last_month}.json'
    out_md = OUT_DIR / f'sueldo-real-argentino-{last_month}.md'

    output = {
        'title': 'El sueldo real argentino: cuánto perdió desde 1994',
        'generated_at': datetime.utcnow().isoformat() + 'Z',
        'base_month': last_month,
        'sources': {
            'ripte': 'Subsecretaría de Seguridad Social — Ministerio de Trabajo (datos.gob.ar)',
            'ipc': 'INDEC',
            'dolar_oficial': 'Cotización promedio mensual (compilado por hacecuentas.com)',
            'dolar_blue': 'Cotización paralelo promedio mensual (compilado por hacecuentas.com)',
        },
        'sources_urls': {
            'ripte': RIPTE_URL,
            'ipc': 'https://www.indec.gob.ar/',
        },
        'metodologia': (
            'Serie mensual de RIPTE deflactada por IPC INDEC (base = mes más reciente). '
            'Conversión a USD usa cotización promedio mensual de venta (compra para usuario). '
            'Datos brutos de RIPTE: solo trabajadores estables con 13+ meses de antigüedad continua, '
            'sector privado y público; remuneraciones imponibles al SIPA.'
        ),
        'last_point': last,
        'insights': insights,
        'series': series,
    }
    out_json.write_text(json.dumps(output, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'\n✓ JSON: {out_json}')

    # Build Markdown
    md = [f'# El sueldo real argentino 1994-{last_month[:4]}']
    md.append(f'\n*Generado {datetime.utcnow().strftime("%Y-%m-%d")} a partir de RIPTE + IPC INDEC + cotizaciones del dólar.*\n')
    md.append('## Hallazgos principales\n')
    real_insights = [i for i in insights if i['metric'] == 'real']
    usd_insights = [i for i in insights if i['metric'] == 'usd_blue']
    for i in real_insights:
        sign = 'subió' if i['delta_pct'] > 0 else 'cayó'
        md.append(f'- Desde **{i["anchor"]}** ({i["label"]}), el salario real argentino **{sign} {abs(i["delta_pct"]):.1f}%**.')
    md.append('\n## Sueldo en dólar blue\n')
    for i in usd_insights:
        sign = 'subió' if i['delta_pct'] > 0 else 'cayó'
        md.append(f'- Hace **{i["anchor"]}** ({i["label"]}), el argentino promedio cobraba **USD {i["anchor_value_usd_blue"]:,.0f}** blue. Hoy cobra **USD {i["today_value_usd_blue"]:,.0f}** ({sign} {abs(i["delta_pct"]):.1f}%).')

    md.append('\n## Pitch lines para medios\n')
    md.append('Frases corta-y-pegables para emails a Infobae / Cronista / iProUP / Apertura:\n')
    if real_insights:
        worst_real = min(real_insights, key=lambda x: x['delta_pct'])
        md.append(f'> "El salario real argentino perdió **{abs(worst_real["delta_pct"]):.1f}%** desde {worst_real["anchor"]} ({worst_real["label"]}), según datos oficiales de RIPTE deflactados por IPC INDEC."')
    if usd_insights:
        worst_usd = min(usd_insights, key=lambda x: x['delta_pct'])
        md.append(f'\n> "En dólar blue, el argentino promedio pasó de cobrar **USD {worst_usd["anchor_value_usd_blue"]:,.0f}** ({worst_usd["anchor"]}) a **USD {worst_usd["today_value_usd_blue"]:,.0f}** hoy — una caída de **{abs(worst_usd["delta_pct"]):.1f}%**."')

    md.append('\n## Metodología')
    md.append(output['metodologia'])
    md.append('\n## Datos crudos')
    md.append(f'Descargá el JSON completo: [sueldo-real-argentino-{last_month}.json](./sueldo-real-argentino-{last_month}.json)')

    out_md.write_text('\n'.join(md), encoding='utf-8')
    print(f'✓ MD:   {out_md}')

    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
