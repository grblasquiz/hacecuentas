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
# Ampliar a 50+ después del PoC.
TARGET_CALCS = [
    'ganancias-empleados-4ta-categoria-2026',
    'ganancias-aguinaldo-sac-retencion',
    'deduccion-familia-conyuge-hijo-ganancias',
    'neto-a-bruto',
    # monotributo se maneja con un PDF aparte (no en este fetcher).
]

# Fecha de publicación oficial de la RG con la escala ene-jun 2026.
# Fuente: errepar (16/01/2026) — verificable via mtime del PDF original.
PUBLISHED_DATE = '2026-01-16'


def update_calc(slug: str, arca: dict) -> bool:
    path = CALCS_DIR / f'{slug}.json'
    if not path.exists():
        print(f'  ⚠ no encontrado: {slug}.json')
        return False

    calc = json.loads(path.read_text(encoding='utf-8'))
    prev = calc.get('dataUpdate') or {}

    new_data_update = {
        'frequency': 'biannual',
        'lastUpdated': PUBLISHED_DATE,
        'source': 'ARCA / RG 4.003 — Tabla Art. 94 LIG + Deducciones Art. 30 (ene-jun 2026)',
        'sourceUrl': arca['sources']['escala_url'],
        'updateType': 'auto',
        'notes': prev.get('notes') or 'Datos vigentes parseados desde PDFs oficiales de ARCA. Refresh diario via cron (.github/workflows/arca-monitor-daily.yml).',
        'autoSource': {
            'parsedFrom': arca['sources'],
            'parsedAt': arca['lastChecked'],
            'mni': arca['deducciones_anual'].get('mni'),
            'conyuge': arca['deducciones_anual'].get('conyuge'),
            'hijo': arca['deducciones_anual'].get('hijo'),
            'tramos_anuales': len(arca.get('escala_anual', [])),
        },
    }

    calc['dataUpdate'] = new_data_update
    # bump lastReviewed para que el sitemap mueva la fecha
    calc['lastReviewed'] = datetime.utcnow().strftime('%Y-%m-%d')

    path.write_text(json.dumps(calc, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'  ✓ {slug}: lastUpdated={PUBLISHED_DATE}, lastReviewed={calc["lastReviewed"]}')
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
