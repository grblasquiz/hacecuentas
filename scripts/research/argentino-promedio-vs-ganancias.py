#!/usr/bin/env python3
"""
Research #2 — "Cuándo el argentino promedio cae en Ganancias".

Cruza dos series oficiales argentinas:
  - RIPTE (Subsec. Seguridad Social) — salario promedio mensual histórico
  - Escala Art. 94 LIG (ARCA) — tramos mensuales del Impuesto a las Ganancias

Pregunta: en cada mes, ¿el salario promedio argentino entraba o no a
la escala de retención del Impuesto a las Ganancias? Y si sí, ¿en qué
tramo (5% / 9% / 12% / ... / 35%)?

Output:
  - Análisis publicable como blog post
  - Pitch lines para medios AR
  - Dataset descargable

Reusa código de sueldo-real-argentino.py + integra los datos ARCA
ya parseados (db/data-sources/arca-ganancias-ene-jun-2026.json).
"""
from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent.parent
RIPTE_DATASET = ROOT / 'docs' / 'research' / 'sueldo-real-argentino-2026-02.json'
ARCA_JSON = ROOT / 'db' / 'data-sources' / 'arca-ganancias-ene-jun-2026.json'
OUT_DIR = ROOT / 'docs' / 'research'


def cargar_data() -> tuple[dict, dict]:
    ripte = json.loads(RIPTE_DATASET.read_text(encoding='utf-8'))
    arca = json.loads(ARCA_JSON.read_text(encoding='utf-8'))
    return ripte, arca


def tramo_ganancias_mensual(salario_bruto_mensual: float, escala_mes: list[dict]) -> dict | None:
    """Dada un salario mensual y la escala mensual, devuelve el tramo aplicable.

    NOTA: este es un cálculo SIMPLIFICADO. La retención real depende de la
    base imponible (sueldo - aportes 17% - MNI - cargas familia), no del
    bruto directo. Acá usamos el bruto para ilustrar la diferencia macro.
    Para cálculo exacto, ver /calculadora-ganancias-empleados-4ta-categoria-2026.
    """
    if not escala_mes:
        return None
    # 17% aportes obligatorios (jubilación + obra social + PAMI)
    base_aprox = salario_bruto_mensual * (1 - 0.17)
    for tramo in escala_mes:
        hasta = tramo.get('hasta')
        if hasta is None or base_aprox <= hasta:
            return tramo
    return escala_mes[-1]


def main() -> int:
    ripte, arca = cargar_data()
    escala_anual = arca['escala_anual']
    escala_mensual_diciembre = arca['escalas_mensuales'].get('diciembre', [])

    # Para cada mes histórico del RIPTE, comparar contra la escala VIGENTE en ese mes.
    # Sin data histórica de escalas (solo tenemos las 2026), hacemos un proxy:
    # "Si la escala ARCA 2026 hubiera estado vigente cada mes histórico ajustada por
    # inflación, ¿el RIPTE de ese mes caería en Ganancias?"
    #
    # Simplificación robusta: usamos la escala anual 2026 y el RIPTE deflactado a
    # pesos actuales. Esto pregunta: "Con el poder adquisitivo del RIPTE histórico,
    # ¿la persona habría pagado Ganancias hoy?"

    # Tramo más bajo (5%) de la escala anual:
    primer_tramo = escala_anual[0]
    mni_anual = arca['deducciones_anual']['mni']
    cdo_anual = arca['deducciones_anual']['deduccion_especial_apartado_2'] or arca['deducciones_anual']['deduccion_especial_apartado_1'] or 0

    # Para empleado en relación de dependencia, la deducción especial Apartado 2 aplica
    deduccion_total_anual_soltero_sin_hijos = mni_anual + cdo_anual

    # Salario bruto anual que justo empieza a pagar Ganancias (umbral):
    # 17% aportes hace que el neto sea 83% del bruto.
    # Después de neto, restás MNI + Ded Esp = $X.
    # Si lo que queda > 0, pagás.
    # Bruto * 0.83 - deduccion_total = 0  →  Bruto = deduccion_total / 0.83
    umbral_bruto_anual = deduccion_total_anual_soltero_sin_hijos / 0.83
    umbral_bruto_mensual = umbral_bruto_anual / 12

    print(f'Escala anual ARCA 2026 (Art. 94 LIG):')
    print(f'  Tramos: {len(escala_anual)}')
    print(f'  MNI anual: ${mni_anual:,.0f}')
    print(f'  Ded. Especial Apartado 2 (rel.dep.): ${cdo_anual:,.0f}')
    print(f'  Deducción total soltero sin hijos: ${deduccion_total_anual_soltero_sin_hijos:,.0f}')
    print()
    print(f'Umbral salario bruto MENSUAL desde donde paga Ganancias:')
    print(f'  ${umbral_bruto_mensual:,.0f}')
    print()

    # Análisis histórico: por cada mes del RIPTE, ¿el bruto promedio supera el umbral?
    series = ripte['series']
    cruzaron = []
    anchors = ['2017-12', '2019-12', '2021-12', '2023-11', '2024-06', '2025-06', '2026-02']
    by_month = {s['mes']: s for s in series}

    print(f'Comparación con anchors históricos:')
    print(f'{"Mes":<10} {"RIPTE nominal":>15} {"Pagaba Ganancias?":>20}')
    for m in anchors:
        s = by_month.get(m)
        if not s:
            continue
        ripte_nominal = s['ripte_nominal']
        # Necesitaríamos el umbral VIGENTE en ese mes histórico (no tenemos).
        # Como proxy: comparamos contra el umbral 2026 deflactado, o más honestamente,
        # contra el RIPTE real ajustado a pesos actuales.
        ripte_real_hoy = s['ripte_real_pesos_actuales']
        paga = ripte_real_hoy > umbral_bruto_mensual if ripte_real_hoy else False
        marker = '✓ SÍ' if paga else '✗ NO'
        print(f'{m:<10} ${ripte_nominal:>13,.0f} | real hoy ${ripte_real_hoy:>10,.0f}  {marker}')

    # El argentino promedio ACTUAL (feb 2026)
    actual = by_month[ripte['base_month']]
    paga_actual = actual['ripte_nominal'] > umbral_bruto_mensual
    cuanto_mas_necesita = umbral_bruto_mensual / actual['ripte_nominal'] - 1

    print()
    print(f'=== DATO PUBLICABLE ===')
    print(f'RIPTE feb 2026: ${actual["ripte_nominal"]:,.0f} mensual')
    print(f'Umbral Ganancias 2026: ${umbral_bruto_mensual:,.0f} mensual')
    if paga_actual:
        diferencia = actual['ripte_nominal'] - umbral_bruto_mensual
        print(f'→ El argentino promedio YA paga Ganancias (cobra ${diferencia:,.0f} arriba del umbral)')
    else:
        diferencia = umbral_bruto_mensual - actual['ripte_nominal']
        pct = -cuanto_mas_necesita * 100
        print(f'→ El argentino promedio NO paga Ganancias. Necesitaría cobrar')
        print(f'  ${diferencia:,.0f} más/mes ({pct:.1f}% extra) para entrar al primer tramo')

    # Build markdown
    today = datetime.now().strftime('%Y-%m-%d')
    out_md = OUT_DIR / f'argentino-vs-ganancias-{today}.md'
    md = [
        f'# El argentino promedio y el Impuesto a las Ganancias 2026',
        f'',
        f'*Generado {today} cruzando RIPTE (Min. Trabajo) + Escala Art. 94 LIG (ARCA).*',
        f'',
        f'## Pregunta',
        f'¿El argentino que cobra el salario promedio (RIPTE) paga Impuesto a las Ganancias en 2026?',
        f'',
        f'## Respuesta directa',
        f'',
    ]
    if paga_actual:
        md.append(f'**SÍ.** El argentino promedio (RIPTE feb 2026 = ${actual["ripte_nominal"]:,.0f} mensual) supera el umbral mínimo de Ganancias 2026 (${umbral_bruto_mensual:,.0f} mensual) por ${diferencia:,.0f}.')
    else:
        md.append(f'**NO.** El argentino promedio (RIPTE feb 2026 = ${actual["ripte_nominal"]:,.0f} mensual) está por debajo del umbral mínimo de Ganancias 2026 (${umbral_bruto_mensual:,.0f} mensual). Necesitaría cobrar ${diferencia:,.0f} más por mes para entrar al primer tramo.')

    md.append('')
    md.append('## Metodología')
    md.append('')
    md.append('El umbral mínimo de Ganancias se calcula así:')
    md.append('')
    md.append('1. Aportes obligatorios al neto: 17% (jubilación 11% + obra social 3% + PAMI 3%)')
    md.append(f'2. Deducciones anuales acumuladas (soltero sin hijos, rel. dependencia):')
    md.append(f'   - MNI: ${mni_anual:,.0f}')
    md.append(f'   - Deducción Especial Apartado 2: ${cdo_anual:,.0f}')
    md.append(f'   - Total: ${deduccion_total_anual_soltero_sin_hijos:,.0f}')
    md.append(f'3. Umbral bruto anual: deducción / (1 - 0.17) = ${umbral_bruto_anual:,.0f}')
    md.append(f'4. Umbral bruto mensual: ${umbral_bruto_mensual:,.0f}')
    md.append('')
    md.append('Comparado contra RIPTE oficial (febrero 2026).')
    md.append('')
    md.append('## Datos crudos')
    md.append(f'- RIPTE: [serie completa 1994-2026](./sueldo-real-argentino-2026-02.json)')
    md.append(f'- Escala ARCA: [PDF oficial Art. 94 LIG]({arca["sources"]["escala_url"]})')
    md.append(f'- Deducciones: [PDF oficial Art. 30]({arca["sources"]["deducciones_url"]})')
    md.append('')
    md.append('## Pitch lines para medios')
    md.append('')
    if paga_actual:
        md.append(f'> "El argentino que cobra el salario promedio ya paga Impuesto a las Ganancias en 2026, según datos cruzados de RIPTE (Min. Trabajo) y la escala Art. 94 LIG vigente publicada por ARCA. El RIPTE feb 2026 (${actual["ripte_nominal"]:,.0f} mensual) supera el umbral mínimo (${umbral_bruto_mensual:,.0f}) por ${diferencia:,.0f}."')
    else:
        md.append(f'> "El argentino que cobra el salario promedio NO paga Ganancias en 2026: necesitaría cobrar ${diferencia:,.0f} más por mes para entrar al primer tramo, según datos cruzados RIPTE + ARCA. El último mes con argentino promedio pagando Ganancias fue [analizar histórico]."')
    md.append('')
    md.append('## Calculadora relacionada')
    md.append(f'- [Tu sueldo vs el promedio argentino](/sueldo-vs-promedio-argentino)')
    md.append(f'- [Ganancias 4ta categoría empleados 2026](/calculadora-ganancias-empleados-4ta-categoria-2026)')

    out_md.write_text('\n'.join(md), encoding='utf-8')
    print(f'\n✓ Análisis: {out_md}')
    return 0


if __name__ == '__main__':
    import sys
    sys.exit(main())
