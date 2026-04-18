#!/usr/bin/env python3
"""Lee pending-registrations.json y registra las formulas en index.ts."""

import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
pending_file = ROOT / "scripts" / "pending-registrations.json"
index_file = ROOT / "src" / "lib" / "formulas" / "index.ts"

if not pending_file.exists():
    print("No hay registros pendientes.")
    exit(0)

registrations = json.loads(pending_file.read_text())
content = index_file.read_text()

# Quitar duplicados preservando orden
seen = set()
unique = []
for slug, camel in registrations:
    if slug not in seen:
        seen.add(slug)
        unique.append((slug, camel))

# Agregar imports después del último import existente
# Encontramos el final del bloque de imports
import_block_end = content.rfind("import ")
if import_block_end == -1:
    print("❌ No se encontró bloque de imports")
    exit(1)

# Find newline after last import
newline_after_imports = content.find("\n", import_block_end)
# Si la siguiente linea sigue con import, buscar hasta no
while True:
    next_line_start = newline_after_imports + 1
    # Check if next line is an import
    next_newline = content.find("\n", next_line_start)
    if next_newline == -1: break
    next_line = content[next_line_start:next_newline]
    if next_line.startswith("import ") or next_line.strip() == "":
        newline_after_imports = next_newline
    else:
        break

# Build imports to add
new_imports = []
for slug, camel in unique:
    import_line = f"import {{ {camel} }} from './{slug}';"
    if import_line not in content:
        new_imports.append(import_line)

# Build entries to add at the end of formulas map
# Find end of const formulas = { ... }
map_close = content.rfind("};")
# Before that, there's content. Find last entry.
# Just add before the closing brace
new_entries = []
for slug, camel in unique:
    entry = f"  '{slug}': {camel},"
    if entry not in content:
        new_entries.append(entry)

# Insert imports
if new_imports:
    imports_str = "\n".join(new_imports) + "\n"
    content = content[:newline_after_imports + 1] + imports_str + content[newline_after_imports + 1:]

# Insert entries
if new_entries:
    # Re-find the map close
    map_close = content.rfind("};")
    entries_str = "\n".join(new_entries) + "\n"
    content = content[:map_close] + entries_str + content[map_close:]

index_file.write_text(content)
print(f"✓ Registradas {len(unique)} formulas ({len(new_imports)} imports, {len(new_entries)} entries)")

# Clear pending
pending_file.write_text("[]")
print("✓ pending-registrations.json limpiado")
