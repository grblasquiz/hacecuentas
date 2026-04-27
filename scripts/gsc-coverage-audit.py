#!/usr/bin/env python3
"""
Pull URL Inspection results de GSC para detectar calcs no-indexadas.

Limitaciones de GSC API:
- urlInspection.index.inspect() devuelve estado de indexación por URL
- 2000 inspecciones/día por property (limit gratuito)
- Resultado: indexStatusResult con verdict (PASS/FAIL/NEUTRAL/PARTIAL),
  coverageState, lastCrawlTime, etc.

Output:
  scripts/gsc-coverage-report.json   — { url, verdict, coverage_state, last_crawl }
  Filtra los que NO están indexados para acción posterior.

Uso:
  python3 scripts/gsc-coverage-audit.py --top 200            # top 200 URLs por priority
  python3 scripts/gsc-coverage-audit.py --slugs slug1 slug2  # URLs específicas
  python3 scripts/gsc-coverage-audit.py --from-sitemap       # todas del sitemap-priority
"""
import argparse
import json
import os
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from xml.etree import ElementTree as ET

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
    from googleapiclient.errors import HttpError
except ImportError:
    sys.stderr.write("pip install google-auth google-api-python-client\n")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CREDS_PATH = os.path.expanduser(
    os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json")
)
SITE_URL = "sc-domain:hacecuentas.com"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
OUT_FILE = ROOT / "scripts" / "gsc-coverage-report.json"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def get_service():
    creds = service_account.Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=creds, cache_discovery=False)


def inspect_url(svc, full_url: str, retries: int = 2) -> dict | None:
    last_err = None
    for attempt in range(retries + 1):
        try:
            resp = svc.urlInspection().index().inspect(
                body={"inspectionUrl": full_url, "siteUrl": SITE_URL, "languageCode": "es-AR"}
            ).execute()
            ir = resp.get("inspectionResult", {})
            idx = ir.get("indexStatusResult", {})
            return {
                "url": full_url,
                "verdict": idx.get("verdict", "UNKNOWN"),
                "coverage_state": idx.get("coverageState", ""),
                "last_crawl": idx.get("lastCrawlTime"),
                "robots_txt_state": idx.get("robotsTxtState"),
                "indexing_state": idx.get("indexingState"),
                "page_fetch_state": idx.get("pageFetchState"),
                "google_canonical": idx.get("googleCanonical"),
                "user_canonical": idx.get("userCanonical"),
            }
        except HttpError as e:
            if e.resp.status == 429:
                last_err = "rate_limit"
                time.sleep(2 ** attempt)
                continue
            return {"url": full_url, "error": f"{e.resp.status}: {e._get_reason()[:80]}"}
        except Exception as e:
            last_err = str(e)[:100]
            time.sleep(1)
    return {"url": full_url, "error": last_err}


def urls_from_priority_sitemap() -> list[str]:
    p = ROOT / "public" / "sitemap-priority.xml"
    tree = ET.parse(p)
    return [el.text for el in tree.getroot().iter(f"{NS}loc")]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--top", type=int, default=None, help="Top N URLs del sitemap-priority")
    ap.add_argument("--slugs", nargs="*", help="Slugs específicos (e.g. calculadora-aguinaldo-sac)")
    ap.add_argument("--from-sitemap", action="store_true", default=False)
    ap.add_argument("--concurrency", type=int, default=4)
    args = ap.parse_args()

    if args.slugs:
        urls = [f"https://hacecuentas.com/{s.lstrip('/')}" for s in args.slugs]
    else:
        urls = urls_from_priority_sitemap()
        if args.top:
            urls = urls[: args.top]

    print(f"[gsc] Inspeccionando {len(urls)} URLs (concurrency={args.concurrency})", file=sys.stderr)
    svc = get_service()

    results = []
    with ThreadPoolExecutor(max_workers=args.concurrency) as ex:
        futures = {ex.submit(inspect_url, svc, u): u for u in urls}
        for i, fut in enumerate(as_completed(futures), 1):
            r = fut.result()
            results.append(r)
            if i % 25 == 0:
                print(f"  {i}/{len(urls)}", file=sys.stderr)

    # Categorize
    indexed = [r for r in results if r.get("verdict") == "PASS"]
    not_indexed = [r for r in results if r.get("verdict") in ("FAIL", "NEUTRAL", "PARTIAL")]
    errors = [r for r in results if "error" in r]

    print(f"\n[gsc] === Resumen ===", file=sys.stderr)
    print(f"  ✓ Indexadas:  {len(indexed)}", file=sys.stderr)
    print(f"  ✗ No indexadas: {len(not_indexed)}", file=sys.stderr)
    print(f"  ! Errores:    {len(errors)}", file=sys.stderr)

    # Coverage states distribution
    from collections import Counter
    states = Counter(r.get("coverage_state", "?") for r in not_indexed)
    print(f"\n  Coverage states (no indexadas):", file=sys.stderr)
    for st, n in states.most_common():
        print(f"    {n:>4}  {st}", file=sys.stderr)

    # Save
    OUT_FILE.write_text(json.dumps({
        "generated_at": time.strftime("%Y-%m-%dT%H:%M:%S"),
        "total": len(results),
        "indexed_count": len(indexed),
        "not_indexed_count": len(not_indexed),
        "not_indexed": not_indexed,
        "errors": errors,
    }, indent=2, ensure_ascii=False))
    print(f"\n[gsc] Guardado en {OUT_FILE}", file=sys.stderr)


if __name__ == "__main__":
    main()
