#!/usr/bin/env python3
"""
Agrega config `interactive` (sliders "¿qué pasa si?") a calcs financieras top.

El Calculator.astro lee `config.interactive.sliders` y renderiza un panel que,
al mover un slider, re-ejecuta la fórmula en vivo y actualiza outputs + chart.
"""
import json
from pathlib import Path

CALCS_DIR = Path('src/content/calcs')

# Lista curada con fieldIds verificados contra cada JSON.
CONFIGS = {
    'interes-compuesto': {
        'sliders': [
            {'fieldId': 'plazoAnios', 'min': 1, 'max': 50, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'aporteMensual', 'min': 0, 'max': 500000, 'step': 5000, 'label': 'Aporte mensual', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'tasaAnual', 'min': 1, 'max': 100, 'step': 0.5, 'label': 'Tasa anual (TNA)', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'interes-compuesto-aporte-mensual-crecimiento': {
        'sliders': [
            {'fieldId': 'plazo', 'min': 1, 'max': 50, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'monto', 'min': 0, 'max': 10000000, 'step': 50000, 'label': 'Aporte mensual', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'tasa', 'min': 1, 'max': 100, 'step': 0.5, 'label': 'Tasa anual', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'plazo-fijo': {
        'sliders': [
            {'fieldId': 'capital', 'min': 10000, 'max': 10000000, 'step': 50000, 'label': 'Capital', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'tna', 'min': 10, 'max': 100, 'step': 0.5, 'label': 'TNA', 'suffix': '%', 'format': 'percentage'},
            {'fieldId': 'dias', 'min': 30, 'max': 365, 'step': 1, 'label': 'Plazo', 'suffix': ' días', 'format': 'number'},
        ]
    },
    'plazo-fijo-ganancia-neta-anual': {
        'sliders': [
            {'fieldId': 'monto', 'min': 10000, 'max': 10000000, 'step': 50000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'tasa', 'min': 10, 'max': 100, 'step': 0.5, 'label': 'TNA', 'suffix': '%', 'format': 'percentage'},
            {'fieldId': 'plazo', 'min': 30, 'max': 365, 'step': 1, 'label': 'Plazo', 'suffix': ' días', 'format': 'number'},
        ]
    },
    'prestamo-cuota': {
        'sliders': [
            {'fieldId': 'capital', 'min': 100000, 'max': 50000000, 'step': 100000, 'label': 'Monto préstamo', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazoMeses', 'min': 3, 'max': 120, 'step': 1, 'label': 'Plazo', 'suffix': ' meses', 'format': 'number'},
            {'fieldId': 'tasaAnual', 'min': 10, 'max': 200, 'step': 1, 'label': 'Tasa anual', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'cuota-prestamo-auto-frances-argentino': {
        'sliders': [
            {'fieldId': 'v', 'min': 500000, 'max': 100000000, 'step': 500000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'meses', 'min': 6, 'max': 84, 'step': 1, 'label': 'Plazo', 'suffix': ' meses', 'format': 'number'},
            {'fieldId': 'tna', 'min': 10, 'max': 150, 'step': 1, 'label': 'TNA', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'credito-uva': {
        'sliders': [
            {'fieldId': 'monto', 'min': 1000000, 'max': 200000000, 'step': 1000000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazoAnos', 'min': 5, 'max': 30, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'tasaUVA', 'min': 3, 'max': 15, 'step': 0.25, 'label': 'Tasa UVA', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'dca-dollar-cost-averaging-acciones-cripto': {
        'sliders': [
            {'fieldId': 'monto', 'min': 10, 'max': 5000, 'step': 10, 'label': 'Aporte mensual', 'prefix': 'USD ', 'format': 'currency'},
            {'fieldId': 'plazo', 'min': 1, 'max': 40, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'tasa', 'min': 1, 'max': 30, 'step': 0.5, 'label': 'Retorno anual esperado', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'calculadora-fire-retiro-temprano': {
        'sliders': [
            {'fieldId': 'aporteMensual', 'min': 100, 'max': 10000, 'step': 100, 'label': 'Aporte mensual', 'prefix': 'USD ', 'format': 'currency'},
            {'fieldId': 'rendimientoAnual', 'min': 2, 'max': 15, 'step': 0.25, 'label': 'Retorno real', 'suffix': '%', 'format': 'percentage'},
            {'fieldId': 'gastosMensuales', 'min': 500, 'max': 20000, 'step': 100, 'label': 'Gasto mensual objetivo', 'prefix': 'USD ', 'format': 'currency'},
        ]
    },
    'ahorro-objetivo-mensual': {
        'sliders': [
            {'fieldId': 'metaTotal', 'min': 100000, 'max': 100000000, 'step': 100000, 'label': 'Meta', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazoMeses', 'min': 6, 'max': 240, 'step': 1, 'label': 'Plazo', 'suffix': ' meses', 'format': 'number'},
            {'fieldId': 'ahorroActual', 'min': 0, 'max': 50000000, 'step': 100000, 'label': 'Ahorro actual', 'prefix': '$', 'format': 'currency'},
        ]
    },
    'regla-72-duplicar-capital-anos': {
        'sliders': [
            {'fieldId': 'tasa', 'min': 1, 'max': 200, 'step': 0.5, 'label': 'Tasa anual', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'inflacion-poder-compra': {
        'sliders': [
            {'fieldId': 'montoOriginal', 'min': 1000, 'max': 100000000, 'step': 10000, 'label': 'Monto hoy', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'inflacionAnual', 'min': 1, 'max': 300, 'step': 1, 'label': 'Inflación anual', 'suffix': '%', 'format': 'percentage'},
            {'fieldId': 'anios', 'min': 1, 'max': 30, 'step': 1, 'label': 'Años', 'suffix': ' años', 'format': 'number'},
        ]
    },
    'rendimiento-anualizado-inversion': {
        'sliders': [
            {'fieldId': 'valorInicial', 'min': 1000, 'max': 10000000, 'step': 10000, 'label': 'Valor inicial', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'valorFinal', 'min': 1000, 'max': 50000000, 'step': 10000, 'label': 'Valor final', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'periodoAnios', 'min': 0.5, 'max': 40, 'step': 0.5, 'label': 'Años', 'suffix': ' años', 'format': 'number'},
        ]
    },
    'amortizacion-prestamo-frances-aleman': {
        'sliders': [
            {'fieldId': 'monto', 'min': 100000, 'max': 100000000, 'step': 500000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazoMeses', 'min': 6, 'max': 360, 'step': 1, 'label': 'Plazo', 'suffix': ' meses', 'format': 'number'},
            {'fieldId': 'tna', 'min': 5, 'max': 200, 'step': 1, 'label': 'TNA', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'tarjeta-credito-minimo': {
        'sliders': [
            {'fieldId': 'saldoActual', 'min': 10000, 'max': 10000000, 'step': 10000, 'label': 'Saldo', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'minimoPct', 'min': 1, 'max': 100, 'step': 1, 'label': 'Pagás este %', 'suffix': '%', 'format': 'percentage'},
            {'fieldId': 'tnaAnual', 'min': 10, 'max': 400, 'step': 1, 'label': 'TNA anual', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'tir-van': {
        'sliders': [
            {'fieldId': 'tasaDescuento', 'min': 1, 'max': 100, 'step': 0.5, 'label': 'Tasa descuento', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'cuota-credito-hipotecario-uva-banco-nacion': {
        'sliders': [
            {'fieldId': 'monto', 'min': 1000000, 'max': 500000000, 'step': 1000000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazoAnios', 'min': 5, 'max': 30, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'tnaReal', 'min': 3, 'max': 15, 'step': 0.25, 'label': 'TNA real (UVA)', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'credito-uva-cuota-actual': {
        'sliders': [
            {'fieldId': 'montoPrestamoUVAs', 'min': 1000, 'max': 100000, 'step': 1000, 'label': 'Monto en UVAs', 'suffix': ' UVA', 'format': 'number'},
            {'fieldId': 'plazoAnios', 'min': 5, 'max': 30, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'tasaAnual', 'min': 3, 'max': 15, 'step': 0.25, 'label': 'Tasa', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'prestamo-personal-galicia-vs-santander-cuota': {
        'sliders': [
            {'fieldId': 'monto', 'min': 100000, 'max': 50000000, 'step': 100000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazo', 'min': 6, 'max': 72, 'step': 1, 'label': 'Plazo', 'suffix': ' meses', 'format': 'number'},
            {'fieldId': 'tasa', 'min': 20, 'max': 200, 'step': 1, 'label': 'Tasa anual', 'suffix': '%', 'format': 'percentage'},
        ]
    },
    'prestamo-hipotecario-fijo-variable-comparativa': {
        'sliders': [
            {'fieldId': 'monto', 'min': 1000000, 'max': 500000000, 'step': 1000000, 'label': 'Monto', 'prefix': '$', 'format': 'currency'},
            {'fieldId': 'plazo', 'min': 5, 'max': 30, 'step': 1, 'label': 'Plazo', 'suffix': ' años', 'format': 'number'},
            {'fieldId': 'tasa', 'min': 3, 'max': 15, 'step': 0.25, 'label': 'Tasa', 'suffix': '%', 'format': 'percentage'},
        ]
    },
}

updated = 0
skipped = []
missing_field = []

for slug, cfg in CONFIGS.items():
    f = CALCS_DIR / f'{slug}.json'
    if not f.exists():
        skipped.append(slug)
        continue
    d = json.loads(f.read_text())
    # Validar que cada fieldId del slider exista en `fields`
    field_ids = {fld.get('id') for fld in d.get('fields', [])}
    invalid = [s['fieldId'] for s in cfg['sliders'] if s['fieldId'] not in field_ids]
    if invalid:
        missing_field.append((slug, invalid, sorted(field_ids)))
        continue
    d['interactive'] = cfg
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2))
    updated += 1
    print(f"✓ {slug} ({len(cfg['sliders'])} sliders)")

print(f"\n{'='*60}")
print(f"Actualizadas: {updated}")
if skipped:
    print(f"No encontradas ({len(skipped)}): {skipped}")
if missing_field:
    print(f"\nFieldIds inválidos ({len(missing_field)}):")
    for slug, invalid, fields in missing_field:
        print(f"  · {slug}: sliders apuntan a {invalid}")
        print(f"    fields disponibles: {fields}")
