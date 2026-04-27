#!/usr/bin/env python3
"""
Escanea src/lib/formulas/*.ts y agrega los que falten en index.ts en orden
alfabético. Idempotente: si ya está registrado, lo saltea.

Uso:
  python3 scripts/auto-register-formulas.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).parent.parent
FORMULAS_DIR = ROOT / "src/lib/formulas"
INDEX = FORMULAS_DIR / "index.ts"


def kebab_to_camel(slug: str) -> str:
    parts = slug.split("-")
    out = parts[0]
    for p in parts[1:]:
        out += p[:1].upper() + p[1:] if p else ""
    return out


def detect_export(ts_content: str) -> str | None:
    """Detect the exported function/const name (excluding interfaces/types)."""
    # Buscar 'export function NAME' o 'export const NAME'
    for pat in [r"export\s+function\s+(\w+)", r"export\s+const\s+(\w+)"]:
        for m in re.finditer(pat, ts_content):
            name = m.group(1)
            # Saltear los tipos/interfaces accidentales
            if name in ("Inputs", "Outputs"): continue
            return name
    return None


def main():
    # Leer index actual
    content = INDEX.read_text()

    # Slugs ya registrados (parse de los imports)
    registered: set[str] = set()
    for m in re.finditer(r"^import \{[^}]+\} from '\./([^']+)';", content, re.M):
        registered.add(m.group(1))

    # Escanear filesystem
    all_files = [p for p in FORMULAS_DIR.iterdir() if p.suffix == ".ts" and p.name != "index.ts"]
    all_slugs = {p.stem for p in all_files}

    missing = sorted(all_slugs - registered)
    if not missing:
        print(f"[register] Nada nuevo. {len(registered)} formulas ya registradas.")
        return

    print(f"[register] Detectadas {len(missing)} formulas nuevas, agregando…")

    new_imports = []
    new_entries = []
    for slug in missing:
        ts_content = (FORMULAS_DIR / f"{slug}.ts").read_text()
        export_name = detect_export(ts_content)
        if not export_name:
            # Caer al kebab→camel default y esperar match
            export_name = kebab_to_camel(slug)
            print(f"  ! {slug}: no encontré export con regex, usando '{export_name}' por convención")
        new_imports.append(f"import {{ {export_name} }} from './{slug}';")
        new_entries.append(f"  '{slug}': {export_name},")

    # Insertar imports en orden alfabético entre los existentes
    lines = content.split("\n")

    # Encontrar índice del primer import y el último
    import_indices = [i for i, l in enumerate(lines) if l.startswith("import { ")]
    first_import = import_indices[0]
    last_import = import_indices[-1]

    # Mergear nuevos imports con existentes y reordenar todos alfabéticamente por slug
    all_imports = lines[first_import:last_import + 1] + new_imports
    # Ordenar por slug (parte después de "from './")
    def import_slug(line: str) -> str:
        m = re.search(r"from '\./([^']+)'", line)
        return m.group(1) if m else ""
    all_imports.sort(key=import_slug)

    # Reemplazar bloque de imports
    new_lines = lines[:first_import] + all_imports + lines[last_import + 1:]

    # Insertar entries en el registry, en orden alfabético
    # Encontrar el cierre del objeto `};`
    new_content = "\n".join(new_lines)
    # Encontrar el último entry antes del `};` final
    closing = new_content.rfind("\n};")
    if closing == -1:
        print("ERROR: no encontré el cierre del registry '};'")
        return

    # Insertar nuevas entries, después se reordenará todo
    # Por simplicidad: split por líneas, encontrar todas las entries del objeto, mergear, ordenar.
    lines2 = new_content.split("\n")
    obj_start = next(i for i, l in enumerate(lines2) if "export const formulas:" in l or "export const FORMULAS:" in l)
    # Buscar cierre desde obj_start
    obj_end = next(i for i in range(obj_start, len(lines2)) if lines2[i].strip() == "};")
    # entries son lines2[obj_start+1 : obj_end]
    entries = lines2[obj_start + 1:obj_end] + new_entries
    def entry_slug(line: str) -> str:
        m = re.match(r"\s*'([^']+)'", line)
        return m.group(1) if m else ""
    entries.sort(key=entry_slug)

    final_lines = lines2[:obj_start + 1] + entries + lines2[obj_end:]
    INDEX.write_text("\n".join(final_lines))

    print(f"[register] ✓ Agregadas {len(missing)} formulas. Total: {len(registered) + len(missing)}.")


if __name__ == "__main__":
    main()
