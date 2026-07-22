#!/usr/bin/env python3
"""Migra claves UX muertas en los JSON de calcs a las que FieldRow.astro realmente lee.

- hint/helpText/tooltip/description/info/helperText -> help (si no hay help); se borran siempre.
- defaultValue/value -> default (si no hay default); se borran siempre.
- placeholder numerico (!=0) en campo numerico sin default -> default.

Uso:
  python3 scripts/migrate-field-ux.py --dry-run
  python3 scripts/migrate-field-ux.py
"""
import argparse, glob, json, os, re, sys
from collections import Counter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HELP_KEYS = ["hint", "helpText", "tooltip", "description", "info", "helperText"]
DEFAULT_KEYS = ["defaultValue", "value"]
NUMERIC_TYPES = {"number", "currency", "percent", "integer", "float", "range", "slider"}

NUM_RE = re.compile(r"^[+-]?[\d.,]+$")

def parse_placeholder(s):
    """Devuelve numero (int o float) o None. Acepta 80, 80.5, 1.200.000, 1,200,000, 1.200.000,5 etc."""
    if not isinstance(s, str):
        if isinstance(s, (int, float)) and not isinstance(s, bool):
            return s
        return None
    t = s.strip()
    if not t or not NUM_RE.match(t):
        return None
    neg = t.startswith("-")
    t = t.lstrip("+-")
    if not t or not re.match(r"^\d", t):
        return None
    dots, commas = t.count("."), t.count(",")
    try:
        if dots and commas:
            # el ultimo separador es el decimal
            if t.rfind(".") > t.rfind(","):
                num = float(t.replace(",", ""))
            else:
                num = float(t.replace(".", "").replace(",", "."))
        elif commas:
            parts = t.split(",")
            if commas == 1 and len(parts[1]) != 3:
                num = float(t.replace(",", "."))  # decimal coma
            else:
                # separador de miles: grupos de 3 validos
                if all(len(p) == 3 for p in parts[1:]):
                    num = float(t.replace(",", ""))
                else:
                    return None
        elif dots:
            parts = t.split(".")
            if dots == 1 and len(parts[1]) != 3:
                num = float(t)  # decimal punto
            else:
                if all(len(p) == 3 for p in parts[1:]):
                    num = float(t.replace(".", ""))
                else:
                    return None
        else:
            num = float(t)
    except ValueError:
        return None
    if not (num == num and abs(num) != float("inf")):
        return None
    if neg:
        num = -num
    if num == int(num) and "." not in str(num).rstrip("0").rstrip("."):
        pass
    return int(num) if num == int(num) else num

def is_numeric_field(f):
    ftype = f.get("type", "number")
    if ftype in NUMERIC_TYPES:
        return True
    if ftype in ("select", "text", "date", "checkbox", "radio", "boolean", "string"):
        return False
    return False

def migrate_field(f, stats, changes):
    changed = False
    # a) help
    if "help" not in f:
        for k in HELP_KEYS:
            v = f.get(k)
            if isinstance(v, str) and v.strip():
                f["help"] = v
                stats["help_moved_from_" + k] += 1
                changes.append(("help<-" + k, v))
                changed = True
                break
    else:
        for k in HELP_KEYS:
            if k in f:
                stats["help_dead_dropped_kept_existing"] += 1
    for k in HELP_KEYS:
        if k in f:
            del f[k]
            changed = True
    # b) default from defaultValue/value
    if "default" not in f:
        for k in DEFAULT_KEYS:
            if k in f and f[k] is not None:
                f["default"] = f[k]
                stats["default_moved_from_" + k] += 1
                changes.append(("default<-" + k, f[k]))
                changed = True
                break
    for k in DEFAULT_KEYS:
        if k in f:
            del f[k]
            stats["dead_default_key_dropped"] += 1
            changed = True
    # c) placeholder -> default
    if "default" not in f and is_numeric_field(f) and "placeholder" in f:
        num = parse_placeholder(f["placeholder"])
        if num is not None and num != 0:
            f["default"] = num
            stats["default_from_placeholder"] += 1
            changes.append(("default<-placeholder", f"{f['placeholder']!r} -> {num!r}"))
            changed = True
    return changed

def iter_fields(data):
    for key in ("fields", "inputs"):
        v = data.get(key)
        if isinstance(v, list):
            for f in v:
                if isinstance(f, dict):
                    yield f

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dry-run", action="store_true")
    ap.add_argument("--sample", type=int, default=10)
    args = ap.parse_args()

    files = sorted(glob.glob(os.path.join(ROOT, "src/content/calcs*", "*.json")))
    stats = Counter()
    modified = []
    samples = []

    for path in files:
        with open(path, encoding="utf-8") as fh:
            try:
                data = json.load(fh)
            except json.JSONDecodeError as e:
                print(f"SKIP invalid JSON: {path}: {e}", file=sys.stderr)
                stats["invalid_json"] += 1
                continue
        changes = []
        changed = False
        for f in iter_fields(data):
            if migrate_field(f, stats, changes):
                changed = True
        if changed:
            modified.append(path)
            if len(samples) < args.sample and changes:
                samples.append((path, changes))
            if not args.dry_run:
                with open(path, "w", encoding="utf-8") as fh:
                    json.dump(data, fh, indent=2, ensure_ascii=False)
                    fh.write("\n")

    print(f"Archivos escaneados: {len(files)}")
    print(f"Archivos {'a modificar' if args.dry_run else 'modificados'}: {len(modified)}")
    for k, v in sorted(stats.items()):
        print(f"  {k}: {v}")
    print("\n--- Muestra de cambios ---")
    for path, changes in samples:
        print(os.path.relpath(path, ROOT))
        for tag, val in changes[:5]:
            print(f"    {tag}: {str(val)[:120]}")

if __name__ == "__main__":
    main()
