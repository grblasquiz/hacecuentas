#!/usr/bin/env python3
"""Registra formulas pendientes en src/lib/formulas/index.ts."""
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
IDX = ROOT / "src/lib/formulas/index.ts"
PEND = ROOT / "scripts/pending-registrations.json"

if not PEND.exists():
    print("No hay registros pendientes")
    exit(0)

pending = json.loads(PEND.read_text())
if not pending:
    print("Lista vacía")
    exit(0)

content = IDX.read_text()

# Insertar imports al final de la sección de imports
import_marker = "// imports end"
if import_marker not in content:
    # Encontrar última línea de import
    lines = content.split("\n")
    last_import = max(i for i, l in enumerate(lines) if l.startswith("import "))
    new_imports = []
    new_entries = []
    existing_camel = set()
    for line in lines:
        if line.startswith("import { "):
            camel = line.split("{")[1].split("}")[0].strip()
            existing_camel.add(camel)

    added = 0
    for slug, camel in pending:
        if camel in existing_camel:
            continue
        new_imports.append(f"import {{ {camel} }} from './{slug}';")
        new_entries.append(f"  '{slug}': {camel},")
        added += 1

    # Insertar imports
    lines = lines[:last_import+1] + new_imports + lines[last_import+1:]
    # Insertar entries antes del cierre
    new_content = "\n".join(lines)
    # Insertar entries antes del '};'
    new_content = new_content.replace(
        "  'carry-on-liquidos-100-ml-reglas-aeropuerto': carryOnLiquidos100MlReglasAeropuerto,\n};",
        "  'carry-on-liquidos-100-ml-reglas-aeropuerto': carryOnLiquidos100MlReglasAeropuerto,\n" + "\n".join(new_entries) + "\n};",
    )

    IDX.write_text(new_content)
    print(f"✅ Registradas {added} nuevas formulas")

    # Limpiar pending
    PEND.write_text("[]")
    print("pending-registrations.json limpiado")
