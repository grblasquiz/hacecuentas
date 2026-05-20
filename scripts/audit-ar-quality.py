#!/usr/bin/env python3
"""
Audit AR locale (calcs/) + genera batches para 15 agentes paralelos.
Foco: top URLs por impressions GSC que pueden mejorar (no noindex, contenido
mejorable). Skip las que ya están en perfecto estado.
"""
from __future__ import annotations
import json
import os
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path
from collections import defaultdict

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / "src" / "content" / "calcs"

def _load_env(env_path: Path) -> None:
    if not env_path.exists(): return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line: continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
_load_env(ROOT / ".env")


def pull_gsc():
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    creds_path = os.path.expanduser(os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"))
    creds = service_account.Credentials.from_service_account_file(creds_path, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    s = build("searchconsole", "v1", credentials=creds, cache_discovery=False)
    today = datetime.now(timezone.utc).date()
    end = (today - timedelta(days=3)).isoformat()
    start = (today - timedelta(days=30)).isoformat()
    rows, start_row = [], 0
    while True:
        resp = s.searchanalytics().query(siteUrl="sc-domain:hacecuentas.com", body={
            "startDate": start, "endDate": end, "dimensions": ["page"],
            "rowLimit": 25000, "startRow": start_row, "dataState": "all",
        }).execute()
        chunk = resp.get("rows", [])
        if not chunk: break
        rows.extend(chunk)
        if len(chunk) < 25000: break
        start_row += 25000
    out = {}
    for r in rows:
        page = r["keys"][0].replace("https://hacecuentas.com", "").replace("https://www.hacecuentas.com", "")
        # Solo AR (sin prefix /en/, /pt/, /mx/, etc.)
        if any(page.startswith(p) for p in ("/en/", "/pt/", "/mx/", "/es/", "/co/", "/cl/", "/embed/")): continue
        out[page] = {
            "clicks": int(r.get("clicks", 0)),
            "impressions": int(r.get("impressions", 0)),
            "position": float(r.get("position", 0)),
        }
    return out


def needs_improvement(calc: dict, stats: dict) -> tuple[bool, str]:
    """Detecta si vale la pena mejorar esta calc. Retorna (True/False, razon)."""
    # No tocar noindex
    if calc.get("noindex"): return False, "noindex"
    # Solo las con tráfico real (impressions >= 20)
    if stats["impressions"] < 20: return False, "low_impr"

    issues = []
    # audience global en calc claramente AR-specific
    aud = (calc.get("audience") or "").upper()
    title = (calc.get("title") or "").lower()
    if aud in ("GLOBAL", "") and any(k in title for k in ["argentina", "afip", "arca", "anses", "indec", "bcra", "ar 2026", "monotributo", "ganancias", "aguinaldo"]):
        issues.append("aud_global_should_AR")

    # intro corto
    intro_len = len(calc.get("intro", "") or "")
    if intro_len < 300: issues.append(f"intro_short_{intro_len}c")

    # sources count
    if len(calc.get("sources") or []) < 2: issues.append("low_sources")

    # keyTakeaway corto o ausente
    kt = calc.get("keyTakeaway", "") or ""
    if len(kt) < 80: issues.append("keytakeaway_weak")

    # lastReviewed viejo
    last = calc.get("lastReviewed")
    if last:
        try:
            d = datetime.strptime(last, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            if (datetime.now(timezone.utc) - d).days > 60: issues.append("stale_review")
        except: pass

    return (bool(issues), ",".join(issues))


def main():
    print("Pulling GSC AR data...", file=sys.stderr)
    gsc = pull_gsc()
    print(f"  {len(gsc)} AR URLs con GSC data", file=sys.stderr)

    # Load AR calcs
    candidates = []
    for f in sorted(CALCS_DIR.glob("*.json")):
        try:
            calc = json.loads(f.read_text(encoding="utf-8"))
        except: continue
        slug = calc.get("slug") or f.stem
        path = f"/{slug}"
        stats = gsc.get(path, {"clicks": 0, "impressions": 0, "position": 0})
        improvable, reason = needs_improvement(calc, stats)
        if not improvable: continue
        candidates.append({
            "path": str(f.relative_to(ROOT)),
            "slug": slug,
            "title": calc.get("title", "")[:80],
            "audience": calc.get("audience"),
            "category": calc.get("category"),
            "impressions": stats["impressions"],
            "clicks": stats["clicks"],
            "position": stats["position"],
            "intro_len": len(calc.get("intro", "") or ""),
            "sources_count": len(calc.get("sources") or []),
            "issues": reason,
        })

    # Sort by impressions desc
    candidates.sort(key=lambda x: -x["impressions"])
    print(f"\nTotal candidates AR a mejorar: {len(candidates)}", file=sys.stderr)
    print(f"Top 5: {[c['slug'][:50] for c in candidates[:5]]}", file=sys.stderr)

    # Split into 15 batches
    n = 15
    batches = [[] for _ in range(n)]
    for i, c in enumerate(candidates):
        batches[i % n].append(c)

    out_dir = Path("/tmp/agent-batches-ar")
    out_dir.mkdir(exist_ok=True)
    for i, batch in enumerate(batches, 1):
        out_path = out_dir / f"ar-{i:02d}.txt"
        with out_path.open("w") as f:
            for c in batch:
                f.write(f"{c['path']}\t{c['impressions']}\t{c['category']}\t{c['issues']}\n")
        print(f"  {out_path}: {len(batch)} calcs ({sum(c['impressions'] for c in batch)} impr total)", file=sys.stderr)

    # JSON output
    out_json = ROOT / "scripts" / "audit-ar-2026-05-20.json"
    out_json.write_text(json.dumps({"total": len(candidates), "results": candidates}, indent=2), encoding="utf-8")
    print(f"\nData: {out_json}", file=sys.stderr)


if __name__ == "__main__":
    main()
