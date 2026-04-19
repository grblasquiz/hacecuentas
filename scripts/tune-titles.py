#!/usr/bin/env python3
"""Tuning de titles + descriptions para mejor CTR en SERP."""
import json
import re
from pathlib import Path

CALCS_DIR = Path('src/content/calcs')

def tune_title(title, h1, category):
    """Agrega 2026 al title si no tiene year."""
    # Si ya tiene año, skip
    if re.search(r'\b20(2[4-9]|3\d)\b', title):
        return title
    # Agregar 2026 antes del "| Hacé Cuentas" o al final
    if '| Hacé Cuentas' in title:
        return title.replace('| Hacé Cuentas', '2026 | Hacé Cuentas', 1)
    elif ' — ' in title:
        # Poner 2026 después del dash
        parts = title.split(' — ', 1)
        return f"{parts[0]} 2026 — {parts[1]}" if len(parts) > 1 else f"{title} 2026"
    else:
        return f"{title} 2026"


def tune_description(desc, h1):
    """Agrega power words si falta."""
    if not desc or len(desc) > 155:
        return desc
    # Si le cabe "Gratis" o similar, agregar
    if 'gratis' not in desc.lower() and 'rápido' not in desc.lower() and len(desc) < 140:
        if desc.endswith('.'):
            return desc[:-1] + ' · Gratis y rápido.'
        else:
            return desc + ' · Gratis y rápido.'
    return desc


def main():
    count = 0
    for f in sorted(CALCS_DIR.glob('*.json')):
        try:
            d = json.loads(f.read_text())
        except:
            continue
        modified = False
        old_title = d.get('title', '')
        new_title = tune_title(old_title, d.get('h1', ''), d.get('category', ''))
        if new_title != old_title and len(new_title) <= 75:
            d['title'] = new_title
            modified = True

        old_desc = d.get('description', '')
        new_desc = tune_description(old_desc, d.get('h1', ''))
        if new_desc != old_desc and len(new_desc) <= 160:
            d['description'] = new_desc
            modified = True

        if modified:
            f.write_text(json.dumps(d, ensure_ascii=False, indent=2))
            count += 1
    print(f"✅ Tuned {count} titles/descriptions")


if __name__ == "__main__":
    main()
