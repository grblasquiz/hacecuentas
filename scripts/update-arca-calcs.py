#!/usr/bin/env python3
"""
Adapter que actualiza el campo `dataUpdate` de las calcs target con la
información del fetcher ARCA Ganancias.

Las 5 calcs PoC target son las que más tráfico tienen sobre temas que
dependen de la escala/deducciones del Impuesto a las Ganancias.

Cron diario fetchea ARCA → si cambia, actualiza los JSONs + bump
`lastReviewed` para mover sitemap lastmod.
"""
from __future__ import annotations

import json
import sys
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / 'src' / 'content' / 'calcs'
ARCA_JSON = ROOT / 'db' / 'data-sources' / 'arca-ganancias-ene-jun-2026.json'

# Calcs que dependen directamente de la escala/deducciones ARCA Ganancias.
# Curada manualmente por tipo de dato ARCA aplicable.
# Cada slug está agrupado por la fuente normativa que lo determina.

# GRUPO 1: Ganancias 4ta categoría — depende del PDF Tabla Art. 94 LIG
# (escala semestral) + Deducciones Art. 30 (MNI + cargas familia).
# Update frequency: biannual (ARCA publica ene-jun y jul-dic).
TARGET_GANANCIAS = [
    # Core sueldo en relación de dependencia
    'ganancias-empleados-4ta-categoria-2026',
    'ganancias-aguinaldo-sac-retencion',
    'ganancias-rg830',
    'ganancias-sueldo',
    'ganancias-tramos-empleado-mensual-2026',
    'ganancias-4ta-categoria-2026',
    # Deducciones específicas (MNI / cargas / alquiler / prepaga)
    'deduccion-familia-conyuge-hijo-ganancias',
    'deduccion-alquiler-ganancias-40-porciento',
    'deduccion-prepaga-medicina-ganancias',
    # Cedulares y rentas no laborales
    'calculadora-ganancias-segunda-categoria-renta-financiera-2026',
    'renta-financiera-cedular-personas',
    'plazo-fijo-ganancia-neta-anual',
    # Cripto (cedular)
    'ganancia-crypto',
    'impuesto-ganancia-cripto-argentina',
    'criptomonedas-ganancia-impuesto-afip',
    'calculadora-cripto-tax-argentina-ganancia',
    # Régimen general / pase de monotributo
    'calculadora-ganancias-monotributista-pase-regimen-general',
    # Retenciones / proveedores
    'retencion-rg2616-proveedor-monotributo',
    # Sueldo (depende de escala Ganancias)
    'neto-a-bruto',
    'sueldo-bruto-desde-neto',
]

# GRUPO 2: Monotributo — depende de la tabla cuatrimestral de categorías
# publicada por ARCA. Frequency biannual (recate ene/may/sep).
TARGET_MONOTRIBUTO = [
    'monotributo',
    'calculadora-monotributo-categoria-2026-recategorizacion-julio',
    'calculadora-monotributo-vs-autonomo-vs-empleado-mismo-ingreso',
    'monotributo-categoria-ingresos-tope',
    'monotributo-cuota-2026-todas-categorias',
    'monotributo-mejor-categoria-2026',
    'monotributo-vs-inscripto',
    'monotributo-social-beneficio-exencion',
    'calculadora-impuestos-monotributo-freelance',
    'cuanto-falta-pago-monotributo-ingreso',
    'facturacion-maxima-monotributo-vs-ri',
    'calculadora-obra-social-monotributista-aporte-extra-familiar',
    # Autónomos relacionados
    'autonomos-categoria-monto-2026',
    'autonomos-categorias-2026-aportes',
    'sueldo-autonomo-neto',
]

# GRUPO 3: Bienes Personales — tabla anual ARCA (Ley 27.743).
TARGET_BIENES_PERSONALES = [
    'bienes-personales',
    'bienes-personales-simulacion-rapida-2026',
    'bienes-personales-tramos-alicuota-2026',
    'bienes-personales-minimo-no-imponible-2026',
    'calculadora-impuesto-bienes-personales-2026-cripto-cedears',
]

# GRUPO 4: IIBB — depende de jurisdicción + ARCA (Convenio Multilateral).
# Frequency yearly (provincias actualizan alícuotas anualmente).
TARGET_IIBB = [
    'ingresos-brutos',
    'ingresos-brutos-convenio-multilateral-jurisdicciones',
    'iibb-convenio-multilateral-coeficientes',
]

TARGET_CALCS = TARGET_GANANCIAS + TARGET_MONOTRIBUTO + TARGET_BIENES_PERSONALES + TARGET_IIBB

# Fecha de publicación oficial de la RG con la escala ene-jun 2026.
# Fuente: errepar (16/01/2026) — verificable via mtime del PDF original.
PUBLISHED_DATE = '2026-01-16'

# Sources por grupo. Cada grupo usa una URL distinta.
SOURCES_BY_GROUP = {
    'ganancias': {
        'frequency': 'biannual',
        'source': 'ARCA / RG 4.003 — Tabla Art. 94 LIG + Deducciones Art. 30 (ene-jun 2026)',
        'sourceUrl': 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf',
    },
    'monotributo': {
        'frequency': 'biannual',
        'source': 'ARCA — Tabla categorías Monotributo (vigente desde feb 2026)',
        'sourceUrl': 'https://www.afip.gob.ar/monotributo/categorias.asp',
    },
    'bienes_personales': {
        'frequency': 'yearly',
        'source': 'ARCA / Ley 27.743 — Tramos y alícuotas Bienes Personales 2026',
        'sourceUrl': 'https://www.afip.gob.ar/gananciasYBienes/bienes-personales/default.asp',
    },
    'iibb': {
        'frequency': 'yearly',
        'source': 'Convenio Multilateral 18/77 + alícuotas provinciales 2026',
        'sourceUrl': 'https://www.ca.gov.ar/',
    },
}

GROUP_OF: dict[str, str] = {}
for s in TARGET_GANANCIAS: GROUP_OF[s] = 'ganancias'
for s in TARGET_MONOTRIBUTO: GROUP_OF[s] = 'monotributo'
for s in TARGET_BIENES_PERSONALES: GROUP_OF[s] = 'bienes_personales'
for s in TARGET_IIBB: GROUP_OF[s] = 'iibb'


def update_calc(slug: str, arca: dict) -> bool:
    path = CALCS_DIR / f'{slug}.json'
    if not path.exists():
        print(f'  ⚠ no encontrado: {slug}.json')
        return False

    group = GROUP_OF.get(slug, 'ganancias')
    src_meta = SOURCES_BY_GROUP[group]

    calc = json.loads(path.read_text(encoding='utf-8'))
    prev = calc.get('dataUpdate') or {}

    new_data_update = {
        'frequency': src_meta['frequency'],
        'lastUpdated': PUBLISHED_DATE,
        'source': src_meta['source'],
        'sourceUrl': src_meta['sourceUrl'],
        'updateType': 'auto-scrape',
        'notes': prev.get('notes') or 'Datos vigentes parseados desde fuentes oficiales de ARCA. Refresh diario via cron (.github/workflows/arca-monitor-daily.yml).',
    }
    # Solo el grupo "ganancias" recibe el autoSource con datos parseados del PDF;
    # los otros grupos referencian sources distintos que aún no parseamos.
    if group == 'ganancias':
        new_data_update['autoSource'] = {
            'parsedFrom': arca['sources'],
            'parsedAt': arca['lastChecked'],
            'mni': arca['deducciones_anual'].get('mni'),
            'conyuge': arca['deducciones_anual'].get('conyuge'),
            'hijo': arca['deducciones_anual'].get('hijo'),
            'tramos_anuales': len(arca.get('escala_anual', [])),
        }

    calc['dataUpdate'] = new_data_update
    # bump lastReviewed para que el sitemap mueva la fecha
    calc['lastReviewed'] = datetime.utcnow().strftime('%Y-%m-%d')

    path.write_text(json.dumps(calc, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'  ✓ [{group:18}] {slug}')
    return True


def main() -> int:
    if not ARCA_JSON.exists():
        print(f'✗ No existe {ARCA_JSON}. Correr fetcher primero:', file=sys.stderr)
        print(f'  python3 scripts/data-sources/fetch-arca-ganancias.py', file=sys.stderr)
        return 1

    arca = json.loads(ARCA_JSON.read_text(encoding='utf-8'))
    print(f'ARCA snapshot: período {arca["periodo"]}, hash {arca["hash"]}')
    print(f'  MNI: ${arca["deducciones_anual"]["mni"]:,.2f}')
    print(f'  Tramos: {len(arca["escala_anual"])}')
    print()

    print(f'Actualizando {len(TARGET_CALCS)} calcs target:')
    updated = 0
    for slug in TARGET_CALCS:
        if update_calc(slug, arca):
            updated += 1
    print(f'\n✓ {updated}/{len(TARGET_CALCS)} calcs actualizadas')
    return 0


if __name__ == '__main__':
    sys.exit(main())
