#!/usr/bin/env python3
"""Pull Bing Search Performance via Bing Webmaster API.

Análogo a `gsc-emerging-queries.py` pero para Bing. Útil porque Bing
tiene queries únicas que Google no muestra (caso "categorías monotributo
2026" — 631 impr/mes en Bing, casi 0 en Google).

Output:
  data/bing-perf-latest.json  → snapshot completo (queries + páginas)
  data/bing-opportunities.txt → URLs prioritarias para Bing Submit
                                (pos 11-25 con +50 impr o CTR <2% pos 1-10)

Uso:
  python3 scripts/bing-perf-pull.py              # pull + write snapshots
  python3 scripts/bing-perf-pull.py --print      # print top 20 al stdout
"""
import json
import os
import ssl
import sys
import urllib.request
from pathlib import Path

try:
    import certifi
    _ssl = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _ssl = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
ENV_FILE = ROOT / ".env"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("BING_WEBMASTER_API_KEY="):
            os.environ.setdefault("BING_WEBMASTER_API_KEY", line.split("=", 1)[1].strip().strip('"').strip("'"))

API_KEY = os.environ.get("BING_WEBMASTER_API_KEY")
if not API_KEY:
    where = "GitHub Secrets" if os.environ.get("GITHUB_ACTIONS") == "true" else ".env"
    print(f"FATAL: Falta BING_WEBMASTER_API_KEY en {where}", file=sys.stderr)
    sys.exit(1)

SITE = "https://hacecuentas.com"
BASE = "https://ssl.bing.com/webmaster/api.svc/json"
DATA_DIR = ROOT / "data"
DATA_DIR.mkdir(exist_ok=True)


def api_get(path):
    url = f"{BASE}/{path}?siteUrl={SITE}&apikey={API_KEY}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=30, context=_ssl) as resp:
        return json.loads(resp.read().decode("utf-8", errors="ignore"))


def pull_queries():
    data = api_get("GetQueryStats")
    rows = data.get("d", []) or []
    out = []
    for r in rows:
        out.append({
            "query": r.get("Query", ""),
            "impressions": r.get("Impressions", 0) or 0,
            "clicks": r.get("Clicks", 0) or 0,
            "position": r.get("Position", 0) or 0,
            "avg_click_position": r.get("AvgClickPosition", 0) or 0,
        })
    out.sort(key=lambda x: -x["impressions"])
    return out


def pull_pages():
    data = api_get("GetPageStats")
    rows = data.get("d", []) or []
    out = []
    for r in rows:
        out.append({
            "page": r.get("Page", ""),
            "impressions": r.get("Impressions", 0) or 0,
            "clicks": r.get("Clicks", 0) or 0,
            "position": r.get("Position", 0) or 0,
        })
    out.sort(key=lambda x: -x["impressions"])
    return out


def pull_rank_traffic():
    data = api_get("GetRankAndTrafficStats")
    rows = data.get("d", []) or []
    return [{"date": r.get("Date"), "clicks": r.get("Clicks", 0), "impressions": r.get("Impressions", 0)} for r in rows]


def pull_crawl():
    data = api_get("GetCrawlStats")
    rows = data.get("d", []) or []
    return [{
        "date": r.get("Date"),
        "crawled": r.get("CrawledPages", 0),
        "in_index": r.get("InIndex", 0),
        "code_2xx": r.get("Code2xx", 0),
        "code_4xx": r.get("Code4xx", 0),
        "code_5xx": r.get("Code5xx", 0),
        "errors": r.get("CrawlErrors", 0),
        "inlinks": r.get("InLinks", 0),
    } for r in rows]


def compute_opportunities(queries, pages):
    """URLs prioritarias para empujar en Bing.

    Bing API GetPageStats no expone Position por page, así que usamos
    impressions + CTR como proxy:
    - Pages con +30 impr y CTR <3% → snippet o ranking enfermo
    - Pages con +100 impr y 0 clicks → CRÍTICO (Bing muestra pero no convierte)
    """
    opps = []
    for p in pages:
        if not p["page"]:
            continue
        if p["impressions"] < 30:
            continue
        ctr = p["clicks"] / p["impressions"] if p["impressions"] else 0
        if p["impressions"] >= 100 and p["clicks"] == 0:
            opps.append({**p, "ctr": ctr, "reason": "high-impr-zero-clicks"})
        elif ctr < 0.03:
            opps.append({**p, "ctr": ctr, "reason": "low-ctr"})
    opps.sort(key=lambda x: -x["impressions"])
    return opps


def main():
    print(f"INFO Pulling Bing Search Performance...", file=sys.stderr)
    snapshot = {
        "site": SITE,
        "queries": pull_queries(),
        "pages": pull_pages(),
        "rank_traffic_daily": pull_rank_traffic(),
        "crawl_daily": pull_crawl(),
    }
    snapshot["opportunities"] = compute_opportunities(snapshot["queries"], snapshot["pages"])

    # Save snapshot
    out_json = DATA_DIR / "bing-perf-latest.json"
    out_json.write_text(json.dumps(snapshot, indent=2, ensure_ascii=False))
    print(f"INFO Snapshot: {out_json}", file=sys.stderr)

    # Save opportunities list (URLs to push to Bing Submit)
    out_txt = DATA_DIR / "bing-opportunities.txt"
    opp_urls = []
    for o in snapshot["opportunities"][:200]:
        path = o["page"].replace("https://hacecuentas.com", "").replace("http://hacecuentas.com", "")
        if path and not path.startswith("http"):
            opp_urls.append(path if path.startswith("/") else f"/{path}")
    out_txt.write_text("\n".join(opp_urls) + "\n")
    print(f"INFO Opportunities: {out_txt} ({len(opp_urls)} URLs)", file=sys.stderr)

    if "--print" in sys.argv:
        print("\nTOP 20 QUERIES BY IMPRESSIONS:")
        for q in snapshot["queries"][:20]:
            print(f"  impr={q['impressions']:>5} clk={q['clicks']:>3} | {q['query']}")
        print(f"\nTOP {min(20, len(snapshot['opportunities']))} OPPORTUNITIES:")
        for o in snapshot["opportunities"][:20]:
            print(f"  impr={o['impressions']:>5} pos={o['position']:>5.1f} ctr={o['ctr']*100:>4.1f}% [{o['reason']}] {o['page']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
