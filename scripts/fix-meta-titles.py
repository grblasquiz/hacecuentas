#!/usr/bin/env python3
"""
Fix meta titles masivo para mejorar CTR:
- Asegurar que todos los titles terminen en ' | Hacé Cuentas'
- Agregar 'Gratis' si no está (CTR booster)
- Agregar '2026' si la calc es AR y no lo tiene (freshness)
- Limitar a 60 caracteres antes del pipe (Google corta en ~60)
- Description: agregar emoji inicial si es YMYL (finanzas/salud) — más CTR
"""
import json
import re
from pathlib import Path

CALCS = Path('src/content/calcs')
AR_CATEGORIES = {'finanzas', 'negocios', 'familia'}

def fix_title(title, slug, category, audience):
    orig = title
    # Normalizar el sufijo al final
    t = re.sub(r'\s*\|\s*Hac[ée] Cuentas\s*$', '', title).strip()
    # Si title termina en — o –, sacalo
    t = re.sub(r'[\s\-–—]+$', '', t).strip()

    ar = audience == 'AR' or category in AR_CATEGORIES
    has_2026 = '2026' in t or '2025' in t
    has_gratis = 'gratis' in t.lower() or 'free' in t.lower()
    has_ar = 'argentina' in t.lower() or 'arg' in t.lower()

    # Si es AR y no tiene 2026, y es de categoría temporal, añadir
    if ar and not has_2026 and category in ('finanzas', 'negocios'):
        t = t + ' 2026'

    # Si el título quedó corto (< 40 chars) agregar "— Gratis"
    if len(t) < 40 and not has_gratis:
        t = t + ' — Gratis'

    # Trim a 60 chars máximo antes del pipe
    if len(t) > 60:
        t = t[:60].rstrip() + '…'

    new_title = f'{t} | Hacé Cuentas'
    return new_title, orig != new_title


def fix_description(desc, category):
    if not desc:
        return desc, False
    # Solo agregar emoji inicial si no lo tiene y es YMYL / popular
    emoji_map = {
        'finanzas': '💰',
        'salud': '🩺',
        'familia': '👶',
        'deportes': '🏋️',
        'cocina': '🍳',
        'negocios': '📊',
        'automotor': '🚗',
        'viajes': '✈️',
        'construccion': '🔨',
    }
    first_char = desc[:2].strip()
    # Heurística: si el primer "char" es emoji (código > 127), no tocar
    if len(first_char) > 0 and ord(first_char[0]) > 127:
        return desc, False
    emoji = emoji_map.get(category)
    if not emoji:
        return desc, False
    new_desc = f'{emoji} {desc}'
    # Límite 160 chars
    if len(new_desc) > 160:
        new_desc = new_desc[:157] + '...'
    return new_desc, True


stats = {'title_changed': 0, 'desc_changed': 0, 'total': 0}

for f in sorted(CALCS.glob('*.json')):
    stats['total'] += 1
    try:
        d = json.loads(f.read_text())
    except Exception:
        continue
    slug = d.get('slug', '')
    category = d.get('category', 'otros')
    audience = d.get('audience', 'global')
    title = d.get('title', '')
    desc = d.get('description', '')

    new_title, t_changed = fix_title(title, slug, category, audience)
    new_desc, d_changed = fix_description(desc, category)

    if t_changed or d_changed:
        if t_changed:
            d['title'] = new_title
            stats['title_changed'] += 1
        if d_changed:
            d['description'] = new_desc
            stats['desc_changed'] += 1
        f.write_text(json.dumps(d, ensure_ascii=False, indent=2))

print(f"✓ Total calcs: {stats['total']}")
print(f"✓ Titles modificados: {stats['title_changed']}")
print(f"✓ Descriptions modificadas: {stats['desc_changed']}")
