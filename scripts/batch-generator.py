#!/usr/bin/env python3
"""
batch-generator.py

Generador de calcs nuevas a partir de specs compactos.
Cada spec produce: src/content/calcs/<slug>.json + src/lib/formulas/<slug>.ts

Uso:
    python3 scripts/batch-generator.py <batch_name>
    # corre el módulo batches.<batch_name> y genera todos sus calcs

El registro en formulas/index.ts se hace con scripts/register-formulas.py
al final de TODOS los batches (no por batch para evitar conflictos).
"""

import json
import os
import re
import sys
from pathlib import Path
from datetime import date

ROOT = Path(__file__).parent.parent
CALCS_DIR = ROOT / "src" / "content" / "calcs"
FORMULAS_DIR = ROOT / "src" / "lib" / "formulas"


def kebab_to_camel(slug: str) -> str:
    """resistencia-led-serie-paralelo -> resistenciaLedSerieParalelo"""
    parts = slug.split("-")
    return parts[0] + "".join(p.capitalize() for p in parts[1:])


def write_json(slug: str, data: dict):
    """Write a calc JSON file. Adds default fields if missing."""
    data.setdefault("slug", f"calculadora-{slug}")
    data.setdefault("category", "ciencia")
    data.setdefault("audience", "global")
    data.setdefault("icon", "🧮")
    data.setdefault("formulaId", slug)
    data.setdefault("dataUpdate", {
        "frequency": "never",
        "lastUpdated": str(date.today()),
        "updateType": "manual",
        "notes": "Fórmula fija, no requiere actualización de data externa"
    })
    # 2026 in title if not present
    if "title" in data and "2026" not in data["title"]:
        data["title"] = data["title"].replace(" | Hacé Cuentas", " 2026 | Hacé Cuentas")
    out_path = CALCS_DIR / f"{slug}.json"
    out_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def write_formula(slug: str, code: str):
    """Write a formula TypeScript file."""
    out_path = FORMULAS_DIR / f"{slug}.ts"
    out_path.write_text(code, encoding="utf-8")


def generate(spec: dict):
    """spec: { 'slug': str, 'json': dict, 'formula': str }"""
    slug = spec["slug"]
    write_json(slug, spec["json"])
    write_formula(slug, spec["formula"])
    return slug


def main():
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/batch-generator.py <module>")
        sys.exit(1)

    module_name = sys.argv[1]
    sys.path.insert(0, str(ROOT / "scripts" / "batches"))
    mod = __import__(module_name)
    created = []
    for spec in mod.SPECS:
        slug = generate(spec)
        created.append(slug)
    print(f"✓ Creadas {len(created)} calcs:")
    for s in created:
        print(f"  - {s}")
    # Register camelCase names for index.ts
    names = [(s, kebab_to_camel(s)) for s in created]
    regs_file = ROOT / "scripts" / "pending-registrations.json"
    existing = []
    if regs_file.exists():
        existing = json.loads(regs_file.read_text())
    existing.extend(names)
    regs_file.write_text(json.dumps(existing, indent=2))
    print(f"\nRegistros pendientes guardados en {regs_file.name}")


if __name__ == "__main__":
    main()
