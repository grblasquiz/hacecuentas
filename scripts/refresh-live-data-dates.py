#!/usr/bin/env python3
"""
Actualiza lastReviewed en calcs con datos que cambian frecuentemente
(dólar, inflación, UVA, cripto, plazo fijo).

Correr semanal/diario vía cron para mantener contenido "fresco" en Google.
"""
import json
from datetime import datetime
from pathlib import Path

CALCS_DIR = Path('src/content/calcs')
FRESH_KEYWORDS = [
    'dolar', 'plazo-fijo', 'inflacion', 'uva', 'cripto', 'bitcoin',
    'cambio-moneda', 'ipc', 'cedear', 'mep', 'bcra', 'brecha',
]

today = datetime.now().strftime('%Y-%m-%d')
updated = 0

for f in CALCS_DIR.glob('*.json'):
    slug = f.stem
    if not any(kw in slug for kw in FRESH_KEYWORDS):
        continue
    try:
        d = json.loads(f.read_text())
    except:
        continue
    d['lastReviewed'] = today
    # También actualizar dataUpdate.lastUpdated si existe
    if 'dataUpdate' in d and isinstance(d['dataUpdate'], dict):
        d['dataUpdate']['lastUpdated'] = today
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2))
    updated += 1

print(f"✅ {updated} calcs con freshness actualizado a {today}")
