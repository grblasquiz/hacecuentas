#!/usr/bin/env python3
"""
Refresca src/lib/popular-curated.json con el top de calcs AR root por pageviews
de los últimos N días desde GA4.

Se usa para alimentar el rail "Las más buscadas en Argentina" de la home —
en vez de una lista hardcoded estática (que se desactualiza), refleja las
calcs que realmente están traccionando ahora.

Output:
  {
    "slugs": ["sueldo-en-mano-argentina", ...],
    "updatedAt": "2026-05-26",
    "source": "ga4-screenPageViews",
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
from datetime import datetime, timedelta, timezone
from pathlib import Path
from urllib.parse import unquote

try:
    from google.oauth2 import service_account
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, OrderBy, RunReportRequest
except ImportError:
    sys.stderr.write("pip install google-auth google-analytics-data\n")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CREDS = os.path.expanduser(os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"))
PROPERTY = "532962136"
SCOPES = ["https://www.googleapis.com/auth/analytics.readonly"]
OUT = ROOT / "src" / "lib" / "popular-curated.json"
CALCS_DIR = ROOT / "src" / "content" / "calcs"


def svc() -> BetaAnalyticsDataClient:
    c = service_account.Credentials.from_service_account_file(CREDS, scopes=SCOPES)
    return BetaAnalyticsDataClient(credentials=c)


def query_top_pages(s: BetaAnalyticsDataClient, start: str, end: str, row_limit: int = 1000) -> list[dict]:
    resp = s.run_report(RunReportRequest(
        property=f"properties/{PROPERTY}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[DateRange(start_date=start, end_date=end)],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="screenPageViews"), desc=True)],
        limit=row_limit,
    ))
    return [
        {"path": row.dimension_values[0].value, "views": int(row.metric_values[0].value or 0)}
        for row in resp.rows
    ]


def slug_from_path(raw_path: str) -> str | None:
    """Extrae el slug de un pagePath root /<slug>. Descarta locales y subdirs."""
    path = unquote(raw_path.split("?", 1)[0]).strip("/")
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

    today = datetime.now(timezone.utc).date()
    end = today - timedelta(days=1)  # evitar el parcial del día en curso
    start = end - timedelta(days=args.days - 1)

    print(f"[ga4] querying top pages {start} → {end}", file=sys.stderr)
    s = svc()
    rows = query_top_pages(s, start.isoformat(), end.isoformat(), row_limit=1000)
    print(f"[ga4] {len(rows)} rows", file=sys.stderr)

    valid = existing_ar_slugs()
    print(f"[ga4] {len(valid)} calcs AR válidos en content/calcs/", file=sys.stderr)

    rows.sort(key=lambda r: r.get("views", 0), reverse=True)

    picked: list[str] = []
    seen = set()
    for row in rows:
        slug = slug_from_path(row.get("path", ""))
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
        "source": "ga4-screenPageViews",
        "windowDays": args.days,
    }

    if args.dry_run:
        print(json.dumps(payload, indent=2))
        return

    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(payload, indent=2) + "\n")
    print(f"[ga4] escribí {OUT.relative_to(ROOT)} con {len(picked)} slugs", file=sys.stderr)


if __name__ == "__main__":
    main()
