#!/usr/bin/env python3
"""
Aplica los 3 cambios del audit EN/PT:
  1. KILL_410: agrega paths con verdict=KILL_410 a src/lib/gone-410.ts
  2. PT normalize: audience "br"→"BR" + global→BR (salvables) + remove noindex (UNINDEX)
  3. EN normalize: audience global→US en KEEP/PROMOTE + remove noindex (PROMOTE)

Idempotente: si se corre 2 veces, no duplica.
Dry run: --dry-run muestra lo que haria sin escribir.
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
AUDIT_FILE = ROOT / "scripts" / "audit-en-pt-2026-05-20.json"
GONE_410_FILE = ROOT / "src" / "lib" / "gone-410.ts"


def parse_gone_410() -> set[str]:
    """Parse current gone-410.ts to get existing URL set."""
    if not GONE_410_FILE.exists():
        return set()
    txt = GONE_410_FILE.read_text(encoding="utf-8")
    return set(re.findall(r'"(/[^"]+)"', txt))


def write_gone_410(urls: set[str]) -> None:
    """Rewrite gone-410.ts with sorted URLs."""
    sorted_urls = sorted(urls)
    date = datetime.now(timezone.utc).date().isoformat()
    body = (
        "/**\n"
        " * Lista de URLs zombie con verdadero 0-trafico (0 impressions, 0 clicks)\n"
        " * que devuelven HTTP 410 Gone en el middleware.\n"
        " *\n"
        " * Estrategia post-Core Update Abril 2026:\n"
        " *   - 301 a categoria mantiene la URL en queue de re-crawl de Google.\n"
        " *   - 410 le dice \"removida permanentemente\" -> Google la saca del index mas\n"
        " *     rapido (confirmado por John Mueller multiple veces).\n"
        " *   - Aplicar 410 solo cuando NO hay riesgo de perder link equity:\n"
        " *       clicks == 0 AND impressions == 0 AND target_clicks == 0 AND\n"
        " *       target_impressions <= 5.\n"
        " *\n"
        " * Esta lista se genera/actualiza con:\n"
        " *   python3 scripts/audit-pruning-vs-gsc.py --emit-gone-410\n"
        " *   python3 scripts/apply-en-pt-audit.py (para calcs-en/pt KILL_410)\n"
        " *\n"
        f" * Generated: {date} ({len(sorted_urls)} URLs)\n"
        " */\n"
        "export const GONE_410_URLS: ReadonlySet<string> = new Set<string>([\n"
    )
    for u in sorted_urls:
        body += f'  "{u}",\n'
    body += "]);\n"
    GONE_410_FILE.write_text(body, encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__)
    ap.add_argument("--dry-run", action="store_true")
    args = ap.parse_args()

    if not AUDIT_FILE.exists():
        sys.exit(f"No existe {AUDIT_FILE}. Corre antes audit-en-pt-quality.py")

    audit = json.loads(AUDIT_FILE.read_text(encoding="utf-8"))
    results = audit["results"]

    # --- 1) KILL_410 ---
    kill = [r for r in results if r["verdict"] == "KILL_410"]
    existing_gone = parse_gone_410()
    new_paths = {r["path"] for r in kill}
    merged = existing_gone | new_paths
    added = merged - existing_gone

    print(f"KILL_410:", file=sys.stderr)
    print(f"  Existing in gone-410.ts: {len(existing_gone)}", file=sys.stderr)
    print(f"  Audit KILL_410 candidates: {len(new_paths)}", file=sys.stderr)
    print(f"  New to add: {len(added)}", file=sys.stderr)
    print(f"  Total after merge: {len(merged)}", file=sys.stderr)

    if not args.dry_run and added:
        write_gone_410(merged)
        print(f"  ✓ Wrote {GONE_410_FILE}", file=sys.stderr)

    # --- 2) PT normalize ---
    pt_aud_changes = 0
    pt_noindex_removed = 0
    pt_global_to_br = 0

    for r in results:
        if r["locale"] != "pt": continue
        verdict = r["verdict"]
        if verdict == "KILL_410": continue  # ya killed
        slug = r["slug"]
        path = ROOT / "src" / "content" / "calcs-pt" / f"{slug}.json"
        if not path.exists():
            # try by filename match (slug != filename a veces)
            candidates = list((ROOT / "src" / "content" / "calcs-pt").glob("*.json"))
            for c in candidates:
                try:
                    j = json.loads(c.read_text(encoding="utf-8"))
                    if j.get("slug") == slug:
                        path = c
                        break
                except Exception:
                    pass
            if not path.exists():
                continue

        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        changed = False

        # br lowercase → BR uppercase (sin importar verdict)
        if data.get("audience") == "br":
            data["audience"] = "BR"
            pt_aud_changes += 1
            changed = True

        # global → BR para calcs salvables (KEEP/PROMOTE/IMPROVE/UNINDEX)
        if data.get("audience") == "global" and verdict in ("KEEP", "PROMOTE", "IMPROVE", "UNINDEX"):
            data["audience"] = "BR"
            pt_global_to_br += 1
            changed = True

        # remove noindex en UNINDEX/PROMOTE (score>=60 + noindex)
        if verdict in ("UNINDEX", "PROMOTE") and data.get("noindex"):
            del data["noindex"]
            pt_noindex_removed += 1
            changed = True

        if changed and not args.dry_run:
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nPT normalize:", file=sys.stderr)
    print(f"  br -> BR: {pt_aud_changes}", file=sys.stderr)
    print(f"  global -> BR (salvables): {pt_global_to_br}", file=sys.stderr)
    print(f"  noindex removed: {pt_noindex_removed}", file=sys.stderr)

    # --- 3) EN normalize ---
    en_global_to_us = 0
    en_noindex_removed = 0

    for r in results:
        if r["locale"] != "en": continue
        verdict = r["verdict"]
        if verdict not in ("KEEP", "PROMOTE"): continue  # solo las con trafico
        slug = r["slug"]
        path = ROOT / "src" / "content" / "calcs-en" / f"{slug}.json"
        if not path.exists():
            candidates = list((ROOT / "src" / "content" / "calcs-en").glob("*.json"))
            for c in candidates:
                try:
                    j = json.loads(c.read_text(encoding="utf-8"))
                    if j.get("slug") == slug:
                        path = c
                        break
                except Exception:
                    pass
            if not path.exists():
                continue

        try:
            data = json.loads(path.read_text(encoding="utf-8"))
        except Exception:
            continue
        changed = False

        # global -> US (mantener AR como esta, son AR-specific calcs en EN)
        if data.get("audience") == "global":
            data["audience"] = "US"
            en_global_to_us += 1
            changed = True

        # remove noindex en PROMOTE
        if verdict == "PROMOTE" and data.get("noindex"):
            del data["noindex"]
            en_noindex_removed += 1
            changed = True

        if changed and not args.dry_run:
            path.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

    print(f"\nEN normalize:", file=sys.stderr)
    print(f"  global -> US (KEEP/PROMOTE): {en_global_to_us}", file=sys.stderr)
    print(f"  noindex removed: {en_noindex_removed}", file=sys.stderr)

    if args.dry_run:
        print(f"\n[DRY RUN] No files modified.", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
