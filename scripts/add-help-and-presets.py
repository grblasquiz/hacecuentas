#!/usr/bin/env python3
"""
Agrega tooltips (`help`) a fields comunes + `presets` (ejemplos típicos)
a las calcs financieras top.

1. Help: patrones por field.id / field.label. Tooltip explicativo.
2. Presets: ejemplos de valores realistas que el user puede clickear.
"""
import json
from pathlib import Path

CALCS = Path('src/content/calcs')

# Patterns field_id → help text (tooltip)
HELP_BY_ID = {
    'capital': 'Monto inicial del que partís. Ej: $100.000 de ahorro.',
    'capitalInicial': 'Lo que ya tenés ahorrado al empezar. Podés dejar en 0 si arrancás desde cero.',
    'aporte': 'Plata extra que sumás cada período (mes típico).',
    'aporteMensual': 'Monto fijo que agregás todos los meses. Clave para interés compuesto.',
    'tasa': 'Interés anual (TNA) en porcentaje. Ej: plazo fijo AR ~70%.',
    'tasaAnual': 'Tasa nominal anual esperada. En pesos puede ser 70%+, en dólares 6-10%.',
    'tna': 'Tasa Nominal Anual. La que publica el banco sin capitalizar intereses.',
    'tea': 'Tasa Efectiva Anual. La real, con capitalización de intereses (siempre > TNA).',
    'tnaPorcentaje': 'Tasa anual del banco. Buscá comparar con inflación para saber si ganás real.',
    'plazo': 'Cantidad de períodos (días, meses o años según la calc).',
    'plazoAnios': 'Cuántos años dejás el dinero. A más plazo, más crece por interés compuesto.',
    'plazoMeses': 'Cuántos meses dura la operación.',
    'dias': 'Plazo en días. Plazo fijo tradicional mínimo: 30 días.',
    'monto': 'Monto del préstamo o inversión.',
    'montoPrestamo': 'Capital que te presta el banco.',
    'inflacion': 'Inflación anual esperada (%). En AR 2026 ~30-50%.',
    'inflacionAnual': 'Inflación anual esperada en %. Usá proyecciones REM del BCRA.',
    'inflacionMensual': 'Inflación mensual. Si querés anual equivalente, anualizá.',
    'edad': 'Tu edad actual en años.',
    'edadJubilacion': 'Edad a la que planeás jubilarte. AR: mujer 60, varón 65.',
    'peso': 'Peso corporal en kg.',
    'pesoKg': 'Peso en kilogramos. Pesate sin ropa, en ayunas.',
    'altura': 'Altura en cm.',
    'alturaCm': 'Altura en centímetros (ej: 175).',
    'sueldo': 'Sueldo bruto mensual antes de descuentos.',
    'sueldoBruto': 'Sueldo antes de descuentos de jubilación, obra social, Ganancias.',
    'sueldoNeto': 'Sueldo después de todos los descuentos — lo que cobrás en mano.',
    'antiguedad': 'Años trabajando en la empresa.',
    'antiguedadMeses': 'Meses totales en el puesto.',
    'cantidadHijos': 'Número de hijos a cargo.',
    'hijos': 'Cantidad de hijos bajo tu responsabilidad económica.',
    'cotizacionDolar': 'Dólar al que calculás (oficial, blue, MEP, CCL).',
    'cotizacionMep': 'Dólar MEP — vía bonos, 100% legal. Típicamente entre oficial y blue.',
    'cotizacion': 'Cotización del tipo de cambio que apliques.',
    'dolar': 'Precio de 1 USD en pesos.',
}

# Patterns label keywords → help text (fallback)
HELP_BY_KEYWORD = [
    (['obra social', 'os'], 'Aporte a obra social (típicamente 3%).'),
    (['jubilación', 'jubilacion', 'sipa'], 'Aporte jubilatorio (típicamente 11%).'),
    (['tasa'], 'Interés expresado en porcentaje anual.'),
    (['porcentaje', 'percent', '%'], 'Valor en porcentaje.'),
    (['fecha'], 'Formato YYYY-MM-DD (año-mes-día).'),
    (['km', 'kilómetro', 'kilometro'], 'Distancia en kilómetros.'),
    (['hora'], 'Cantidad de horas.'),
    (['minuto', 'min'], 'Cantidad de minutos.'),
]

# Presets para calcs top (slug_sin_prefijo: {title, items: [{label, values, note}]})
PRESETS = {
    'interes-compuesto': {
        'title': 'Ejemplos típicos',
        'items': [
            {'label': '💵 Ahorro modesto', 'values': {'capitalInicial': 100000, 'aporteMensual': 20000, 'tasaAnual': 40, 'plazoAnios': 10}, 'note': '$100k inicial + $20k/mes al 40% TNA, 10 años'},
            {'label': '💰 Ahorro medio', 'values': {'capitalInicial': 500000, 'aporteMensual': 50000, 'tasaAnual': 50, 'plazoAnios': 15}, 'note': '$500k + $50k/mes, 15 años, 50% TNA'},
            {'label': '🚀 Plan FIRE', 'values': {'capitalInicial': 2000000, 'aporteMensual': 150000, 'tasaAnual': 60, 'plazoAnios': 20}, 'note': '$2M + $150k/mes, 20 años (retiro temprano)'},
        ],
    },
    'interes-compuesto-aporte-mensual-crecimiento': {
        'title': 'Ejemplos',
        'items': [
            {'label': 'Aporte chico', 'values': {'monto': 50000, 'tasa': 40, 'plazo': 10}, 'note': '$50k/mes, 40% TNA, 10 años'},
            {'label': 'Aporte medio', 'values': {'monto': 100000, 'tasa': 50, 'plazo': 15}, 'note': '$100k/mes, 50% TNA, 15 años'},
            {'label': 'Aporte alto', 'values': {'monto': 300000, 'tasa': 55, 'plazo': 20}, 'note': '$300k/mes, 55% TNA, 20 años'},
        ],
    },
    'plazo-fijo': {
        'title': 'Valores típicos',
        'items': [
            {'label': '$100k / 30 días', 'values': {'capital': 100000, 'tna': 70, 'dias': 30}, 'note': 'Mínimo habitual'},
            {'label': '$500k / 90 días', 'values': {'capital': 500000, 'tna': 75, 'dias': 90}, 'note': 'Plazo medio'},
            {'label': '$1M / 180 días', 'values': {'capital': 1000000, 'tna': 80, 'dias': 180}, 'note': 'Plazo largo'},
        ],
    },
    'prestamo-cuota': {
        'title': 'Ejemplos',
        'items': [
            {'label': 'Personal chico', 'values': {'capital': 500000, 'plazoMeses': 12, 'tasaAnual': 150}, 'note': '$500k, 12 meses'},
            {'label': 'Auto usado', 'values': {'capital': 5000000, 'plazoMeses': 48, 'tasaAnual': 130}, 'note': '$5M, 48 meses'},
            {'label': 'Auto 0km', 'values': {'capital': 20000000, 'plazoMeses': 60, 'tasaAnual': 120}, 'note': '$20M, 60 meses'},
        ],
    },
    'cuota-prestamo-auto-frances-argentino': {
        'title': 'Ejemplos',
        'items': [
            {'label': 'Auto usado', 'values': {'v': 8000000, 'meses': 36, 'tna': 130}, 'note': '$8M, 3 años'},
            {'label': 'Auto 0km nacional', 'values': {'v': 18000000, 'meses': 48, 'tna': 120}, 'note': '$18M, 4 años'},
            {'label': 'Auto premium', 'values': {'v': 40000000, 'meses': 60, 'tna': 110}, 'note': '$40M, 5 años'},
        ],
    },
    'credito-uva': {
        'title': 'Ejemplos hipoteca',
        'items': [
            {'label': '60 m² CABA', 'values': {'monto': 60000000, 'plazoAnos': 20, 'tasaUVA': 5.5}, 'note': '2 ambientes barrio medio'},
            {'label': '80 m² GBA', 'values': {'monto': 85000000, 'plazoAnos': 25, 'tasaUVA': 5}, 'note': '3 ambientes zona norte'},
            {'label': 'Casa 120 m²', 'values': {'monto': 150000000, 'plazoAnos': 30, 'tasaUVA': 4.5}, 'note': 'Casa con terreno'},
        ],
    },
    'calculadora-fire-retiro-temprano': {
        'title': 'Escenarios FIRE',
        'items': [
            {'label': '🟢 Conservador', 'values': {'aporteMensual': 300, 'rendimientoAnual': 5, 'gastosMensuales': 1500}, 'note': 'USD 300/mes, 5% real, gasto USD 1500'},
            {'label': '🟡 Moderado', 'values': {'aporteMensual': 800, 'rendimientoAnual': 7, 'gastosMensuales': 2500}, 'note': 'USD 800/mes, 7% real'},
            {'label': '🔴 Agresivo', 'values': {'aporteMensual': 2000, 'rendimientoAnual': 9, 'gastosMensuales': 3500}, 'note': 'USD 2000/mes, 9% real'},
        ],
    },
    'dca-dollar-cost-averaging-acciones-cripto': {
        'title': 'Planes DCA',
        'items': [
            {'label': 'DCA básico', 'values': {'monto': 50, 'plazo': 10, 'tasa': 8}, 'note': 'USD 50/mes, 10 años, 8%'},
            {'label': 'DCA medio', 'values': {'monto': 200, 'plazo': 15, 'tasa': 8}, 'note': 'USD 200/mes, 15 años'},
            {'label': 'DCA alto', 'values': {'monto': 500, 'plazo': 20, 'tasa': 10}, 'note': 'USD 500/mes, 20 años'},
        ],
    },
    'calculadora-imc': {
        'title': 'Perfiles típicos',
        'items': [
            {'label': 'Mujer adulta promedio', 'values': {'peso': 65, 'altura': 165}, 'note': '65 kg / 1.65m'},
            {'label': 'Hombre adulto promedio', 'values': {'peso': 80, 'altura': 178}, 'note': '80 kg / 1.78m'},
            {'label': 'Adolescente', 'values': {'peso': 55, 'altura': 170}, 'note': '55 kg / 1.70m'},
        ],
    },
    'calculadora-aguinaldo-sac': {
        'title': 'Sueldos típicos',
        'items': [
            {'label': 'Categoría junior', 'values': {'sueldoBruto': 900000}, 'note': '$900k bruto'},
            {'label': 'Categoría semi senior', 'values': {'sueldoBruto': 1500000}, 'note': '$1.5M bruto'},
            {'label': 'Categoría senior', 'values': {'sueldoBruto': 2500000}, 'note': '$2.5M bruto'},
        ],
    },
    'sueldo-en-mano-argentina': {
        'title': 'Sueldos tipo',
        'items': [
            {'label': 'Básico', 'values': {'sueldoBruto': 800000, 'cargasFamiliares': 0}, 'note': '$800k sin cargas'},
            {'label': 'Intermedio', 'values': {'sueldoBruto': 1500000, 'cargasFamiliares': 1}, 'note': '$1.5M, 1 hijo'},
            {'label': 'Alto', 'values': {'sueldoBruto': 3000000, 'cargasFamiliares': 2}, 'note': '$3M, 2 hijos'},
        ],
    },
    'calculadora-monotributo-2026': {
        'title': 'Casos típicos',
        'items': [
            {'label': 'Freelance inicial', 'values': {'facturacionAnual': 8000000}, 'note': '$8M anual (Categoría A-B)'},
            {'label': 'Profesional consolidado', 'values': {'facturacionAnual': 30000000}, 'note': '$30M (Categoría G-H)'},
            {'label': 'Tope monotributo', 'values': {'facturacionAnual': 70000000}, 'note': '$70M (límite sup)'},
        ],
    },
}


added_help = 0
added_presets = 0

for f in sorted(CALCS.glob('*.json')):
    slug = f.stem
    changed = False
    try:
        d = json.loads(f.read_text())
    except Exception:
        continue

    # 1. Add help a fields que no lo tengan
    for fld in d.get('fields', []):
        if fld.get('help'):
            continue
        fid = fld.get('id', '')
        label = (fld.get('label') or '').lower()
        help_text = HELP_BY_ID.get(fid)
        if not help_text:
            for keywords, txt in HELP_BY_KEYWORD:
                if any(k in label or k in fid.lower() for k in keywords):
                    help_text = txt
                    break
        if help_text:
            fld['help'] = help_text
            added_help += 1
            changed = True

    # 2. Add presets si aplica
    if slug in PRESETS and not d.get('presets'):
        d['presets'] = PRESETS[slug]
        added_presets += 1
        changed = True

    if changed:
        f.write_text(json.dumps(d, ensure_ascii=False, indent=2))

print(f'✓ Fields con help agregado: {added_help}')
print(f'✓ Calcs con presets: {added_presets}')
