#!/usr/bin/env python3
"""
Cleanup final EN:
  1. Delete 5 archivos duplicados (slug repetido) — keep highest quality
  2. Fix audience: global → US en las salvables que quedaron sin cambio
  3. Idempotente
"""
from __future__ import annotations
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
CALCS_EN = ROOT / "src" / "content" / "calcs-en"

# --- 1) Detectar y eliminar dupes ---
by_slug = defaultdict(list)
for f in CALCS_EN.glob("*.json"):
    try:
        c = json.loads(f.read_text(encoding="utf-8"))
        slug = c.get("slug", "")
        quality = (
            len(c.get("explanation", "") or "")
            + len(c.get("sources") or []) * 100
            + (1000 if (c.get("audience") or "").upper() == "US" else 0)
        )
        by_slug[slug].append((f, quality))
    except Exception as e:
        print(f"  err parse {f.name}: {e}")

deleted = []
for slug, files in by_slug.items():
    if len(files) < 2:
        continue
    files.sort(key=lambda x: -x[1])
    for f, q in files[1:]:  # all except the best
        print(f"  DELETE {f.name} (slug={slug}, q={q})")
        f.unlink()
        deleted.append(str(f.relative_to(ROOT)))

# --- 2) Fix audience: global → US en KEEP set salvables ---
# Re-leer audit JSON
audit_path = ROOT / "scripts" / "audit-en-pt-2026-05-20.json"
audit = json.loads(audit_path.read_text(encoding="utf-8"))
keep_slugs = {r["slug"] for r in audit["results"] if r["locale"] == "en" and r["verdict"] in ("KEEP", "PROMOTE")}

fixed = 0
for f in CALCS_EN.glob("*.json"):
    try:
        c = json.loads(f.read_text(encoding="utf-8"))
    except Exception:
        continue
    slug = c.get("slug", "")
    if slug in keep_slugs and c.get("audience") == "global":
        c["audience"] = "US"
        f.write_text(json.dumps(c, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"  FIX audience global→US: {f.name}")
        fixed += 1

print(f"\nDeleted: {len(deleted)} dupes")
print(f"Fixed audience: {fixed} files")
