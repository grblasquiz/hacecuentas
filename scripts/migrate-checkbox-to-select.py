#!/usr/bin/env python3
"""Migrate type=checkbox fields to type=select across src/content/calcs*/*.json.

Calculator.astro only renders 'select' and a generic <input> fallback; checkbox
fields fall to the input branch and render a tiny native checkbox inside a
full-width .input-wrap, producing a broken "long bar" UI.

Strategy:
  - Fields with options: change type → 'select', stringify default to match
    existing option values.
  - Fields without options: synthesize locale-aware [No, Sí] (or Não/Sim,
    No/Yes) options, default 'false'.

Usage:
  python3 scripts/migrate-checkbox-to-select.py            # dry-run
  python3 scripts/migrate-checkbox-to-select.py --apply    # write changes
"""
from __future__ import annotations

import argparse
import glob
import json
import os
import sys
from typing import Any

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

LOCALE_LABELS = {
    'calcs-en': ('No', 'Yes'),
    'calcs-pt': ('Não', 'Sim'),
}
DEFAULT_LABELS = ('No', 'Sí')


def locale_for(path: str) -> tuple[str, str]:
    parts = path.replace('\\', '/').split('/')
    for p in parts:
        if p in LOCALE_LABELS:
            return LOCALE_LABELS[p]
    return DEFAULT_LABELS


def normalize_default(default: Any, options: list[dict]) -> str:
    valid_values = {str(o.get('value')) for o in options}
    if isinstance(default, bool):
        s = 'true' if default else 'false'
        return s if s in valid_values else next(iter(options))['value']
    if default is None:
        # prefer the "No"/false option if present
        for o in options:
            if str(o.get('value')).lower() in ('false', 'no', '0', ''):
                return o['value']
        return options[0]['value']
    s = str(default)
    return s if s in valid_values else options[0]['value']


def normalize_options(opts: list) -> list[dict]:
    out = []
    for o in opts:
        if isinstance(o, dict):
            v = o.get('value')
            l = o.get('label', v)
            if v is None and l is not None:
                v = str(l).lower().strip()
            out.append({'value': v, 'label': l})
        else:
            s = str(o)
            out.append({'value': s.lower().strip(), 'label': s})
    return out


def synth_options(path: str) -> list[dict]:
    no_label, yes_label = locale_for(path)
    return [
        {'value': 'false', 'label': no_label},
        {'value': 'true', 'label': yes_label},
    ]


def migrate_field(field: dict, path: str) -> bool:
    """Mutate field in place; return True if changed."""
    if field.get('type') != 'checkbox':
        return False
    opts = field.get('options')
    if opts:
        normalized = normalize_options(opts)
        field['options'] = normalized
        field['default'] = normalize_default(field.get('default'), normalized)
    else:
        synthesized = synth_options(path)
        field['options'] = synthesized
        field['default'] = normalize_default(field.get('default'), synthesized)
    field['type'] = 'select'
    return True


def process_file(path: str, apply: bool) -> tuple[int, int]:
    """Return (fields_changed, file_changed_bool_as_int)."""
    with open(path, 'r', encoding='utf-8') as f:
        original = f.read()
    data = json.loads(original)
    changed = 0
    for field in data.get('fields', []) or []:
        if migrate_field(field, path):
            changed += 1
    if changed == 0:
        return 0, 0
    # Preserve trailing newline if original had one
    trailing_nl = '\n' if original.endswith('\n') else ''
    new_text = json.dumps(data, ensure_ascii=False, indent=2) + trailing_nl
    if apply:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(new_text)
    return changed, 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='write changes (default dry-run)')
    ap.add_argument('--glob', default='src/content/calcs*/*.json')
    args = ap.parse_args()

    pattern = os.path.join(ROOT, args.glob)
    paths = sorted(glob.glob(pattern))

    total_fields = 0
    total_files = 0
    changed_files: list[tuple[str, int]] = []
    for path in paths:
        try:
            fields_changed, file_changed = process_file(path, args.apply)
        except json.JSONDecodeError as e:
            print(f'[skip] {path}: invalid JSON ({e})', file=sys.stderr)
            continue
        if fields_changed:
            total_fields += fields_changed
            total_files += file_changed
            changed_files.append((os.path.relpath(path, ROOT), fields_changed))

    verb = 'will change' if not args.apply else 'changed'
    print(f'[migrate-checkbox] {verb} {total_fields} fields in {total_files} files')
    print(f'[migrate-checkbox] scanned {len(paths)} files via {args.glob}')
    if not args.apply:
        print('[migrate-checkbox] dry-run — re-run with --apply to write')
    # print top-10 sample
    for rel, n in changed_files[:10]:
        print(f'  • {rel} ({n} field{"s" if n != 1 else ""})')
    if len(changed_files) > 10:
        print(f'  ... and {len(changed_files) - 10} more')
    return 0


if __name__ == '__main__':
    sys.exit(main())
