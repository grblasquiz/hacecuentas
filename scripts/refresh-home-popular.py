#!/usr/bin/env python3
"""
Refresca src/lib/popular-curated.json con el top de calcs AR root por clicks
de los últimos N días desde GSC Search Analytics.

Se usa para alimentar el rail "Las más buscadas en Argentina" de la home —
en vez de una lista hardcoded estática (que se desactualiza), refleja las
calcs que realmente están traccionando ahora.

Output:
  {
    "slugs": ["sueldo-en-mano-argentina", ...],
    "updatedAt": "2026-05-26",
    "source": "gsc-28d",
    "windowDays": 28
  }

Reglas:
  - Solo paths /<slug> root (no /en/, /pt/, /buscar, etc — esas no van al rail AR)
  - Solo slugs que existan en src/content/calcs/*.json
  - Cap a top 12 (mismo tamaño que la lista hardcoded actual)
"""
import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path
from urllib.parse import urlparse, unquote

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write("pip install google-auth google-api-python-client\n")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CREDS = os.path.expanduser(os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"))
SITE = "sc-domain:hacecuentas.com"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
OUT = ROOT / "src" / "lib" / "popular-curated.json"
CALCS_DIR = ROOT / "src" / "content" / "calcs"


def svc():
    c = service_account.Credentials.from_service_account_file(CREDS, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=c, cache_discovery=False)


def query_top_pages(s, start: str, end: str, row_limit: int = 1000) -> list:
    body = {
        "startDate": start, "endDate": end,
        "dimensions": ["page"],
        "rowLimit": row_limit,
        "dataState": "all",
    }
    resp = s.searchanalytics().query(siteUrl=SITE, body=body).execute()
    return resp.get("rows", [])


def slug_from_url(url: str) -> str | None:
    """Extrae el slug de una URL root /<slug>. Descarta locales y subdirs."""
    p = urlparse(url)
    path = unquote(p.path).strip("/")
    if "/" in path:
        return None  # /en/foo, /argentina/x/y, etc — no es root
    if not path:
        return None
    return path


def existing_ar_slugs() -> set[str]:
    """Set de slugs válidos en content/calcs/ (AR root)."""
    out = set()
    for f in CALCS_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text())
            slug = data.get("slug")
            if slug:
                out.add(slug)
        except Exception:
            continue
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=28, help="ventana en días (default 28)")
    ap.add_argument("--top", type=int, default=12, help="cantidad de slugs a emitir")
    ap.add_argument("--dry-run", action="store_true", help="no escribe el JSON")
    args = ap.parse_args()

    today = datetime.utcnow().date()
    end = today - timedelta(days=3)  # latencia GSC ~3d
    start = end - timedelta(days=args.days - 1)

    print(f"[gsc] queryng top pages {start} → {end}", file=sys.stderr)
    s = svc()
    rows = query_top_pages(s, start.isoformat(), end.isoformat(), row_limit=1000)
    print(f"[gsc] {len(rows)} rows", file=sys.stderr)

    valid = existing_ar_slugs()
    print(f"[gsc] {len(valid)} calcs AR válidos en content/calcs/", file=sys.stderr)

    # Sort por clicks descendente (GSC ya viene ordenado pero forzamos)
    rows.sort(key=lambda r: r.get("clicks", 0), reverse=True)

    picked: list[str] = []
    seen = set()
    for row in rows:
        keys = row.get("keys") or []
        if not keys:
            continue
        slug = slug_from_url(keys[0])
        if not slug or slug in seen:
            continue
        if slug not in valid:
            continue
        picked.append(slug)
        seen.add(slug)
        if len(picked) >= args.top:
            break

    if not picked:
        print("[gsc] ERROR: no se pudo armar el top — abortando sin escribir", file=sys.stderr)
        sys.exit(1)

    payload = {
        "slugs": picked,
        "updatedAt": today.isoformat(),
        "source": "gsc",
        "windowDays": args.days,
    }

    if args.dry_run:
        print(json.dumps(payload, indent=2))
        return

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"[gsc] escribí {OUT.relative_to(ROOT)} con {len(picked)} slugs", file=sys.stderr)


if __name__ == "__main__":
    main()
