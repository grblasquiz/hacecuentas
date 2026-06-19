#!/usr/bin/env python3
"""Aplica las unificaciones desde /tmp/merges_full.json:
  - edita _redirects para aplanar cadenas entrantes (X→loser → X→winner)
  - appendea sección nueva con loser→winner (idempotente: salta los que ya existen)
  - borra los JSON de los perdedores (NO borra fórmulas: pueden estar importadas)
Después: correr extract-pruning-redirects.py + npm run related + build/deploy.
"""
import json, re, sys
from pathlib import Path

ROOT = Path('/Users/marrod/hacecuentas')
REDIR = ROOT / 'public' / '_redirects'
IN = sys.argv[1] if len(sys.argv) > 1 else '/tmp/merges_full.json'
LABEL = sys.argv[2] if len(sys.argv) > 2 else 'Unificación calcs similares (2026-06-19)'
merges = json.load(open(IN))

def url(loc, slug):
    return f"/{slug}" if loc == 'ar' else f"/{loc}/{slug}"

lw = {}  # loser_url -> winner_url
for m in merges:
    lw[url(m['loc'], m['l_slug'])] = url(m['loc'], m['w_slug'])

lines = REDIR.read_text(encoding='utf-8').split('\n')

# parse existing sources
existing = {}
for ln in lines:
    s = ln.strip()
    if s.startswith('/') and len(s.split()) >= 3:
        existing[s.split()[0]] = s.split()[1]

# 1) EDIT: cualquier línea cuyo TARGET sea un loser → reapuntar al winner (flatten)
edited = 0
for i, ln in enumerate(lines):
    s = ln.strip()
    if not (s.startswith('/') and len(s.split()) >= 3):
        continue
    parts = s.split()
    src, dst, status = parts[0], parts[1], parts[2]
    if dst in lw:
        lines[i] = f"{src}  {lw[dst]}  {status}"
        edited += 1

# 2) APPEND: losers que NO son ya source en _redirects
appends = []
idempotent = 0
for loser_url, winner_url in lw.items():
    if loser_url in existing:
        # ya redirigido. Si apunta distinto, la edición de arriba NO lo cubre
        # (eso edita por target, no por source). Forzamos corrección por source:
        if existing[loser_url] != winner_url:
            for i, ln in enumerate(lines):
                p = ln.strip().split()
                if len(p) >= 3 and p[0] == loser_url:
                    lines[i] = f"{loser_url}  {winner_url}  301"
        else:
            idempotent += 1
        continue
    appends.append((loser_url, winner_url))

# armar sección nueva
section = ['', f'# Pruning batch — {LABEL}']
for src, dst in sorted(appends):
    section.append(f"{src}  {dst}  301")

# insertar antes de la última línea vacía final, o al final
while lines and lines[-1].strip() == '':
    lines.pop()
lines.extend(section)
lines.append('')
REDIR.write_text('\n'.join(lines), encoding='utf-8')

# 3) borrar JSON de perdedores
deleted, missing = 0, []
for m in merges:
    fp = Path(m['l_file'])
    if fp.exists():
        fp.unlink(); deleted += 1
    else:
        missing.append(str(fp))

print(f"_redirects: {len(appends)} nuevos | {edited} líneas aplanadas (cadenas) | {idempotent} idempotentes")
print(f"JSON borrados: {deleted} | no encontrados: {len(missing)}")
for x in missing: print("   ?", x)
# manifest para revert fácil
json.dump({'deleted_json': [m['l_file'] for m in merges], 'appends': appends},
          open('/tmp/applied_manifest.json', 'w'), ensure_ascii=False, indent=1)
print("-> /tmp/applied_manifest.json")
