#!/usr/bin/env python3
"""Submit el sitemap.xml a Bing Webmaster vía SubmitFeed API.

Bing pide "Sitemaps should be updated at least once a day" — esto le envía
una señal de "vení a re-crawlear mi sitemap" sin tocar lastmods (que afectarían
crawl budget de Google).

A diferencia de bing-submit.py (SubmitUrl URL-por-URL), SubmitFeed pasa el
puntero del sitemap.xml — Bing pulls el contenido en su propio horario.

Uso:
  python3 scripts/bing-submit-feed.py                # submit sitemap.xml
  python3 scripts/bing-submit-feed.py --list         # lista feeds registrados

Requiere BING_WEBMASTER_API_KEY en .env o env var.
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

SITE = "https://hacecuentas.com/"
SITEMAP = "https://hacecuentas.com/sitemap.xml"
BASE = "https://ssl.bing.com/webmaster/api.svc/json"


def api_call(path: str, payload: dict | None = None, method: str = "POST"):
    url = f"{BASE}/{path}?apikey={API_KEY}"
    data = json.dumps(payload).encode("utf-8") if payload else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json; charset=utf-8"} if data else {},
        method=method,
    )
    with urllib.request.urlopen(req, timeout=30, context=_ssl) as resp:
        return resp.status, resp.read().decode("utf-8", errors="ignore")


def submit_feed() -> bool:
    status, body = api_call(
        "SubmitFeed",
        {"siteUrl": SITE, "feedUrl": SITEMAP},
    )
    if status in (200, 202):
        print(f"✓ SubmitFeed enviado a Bing: {SITEMAP} (status={status})")
        return True
    print(f"⚠️ SubmitFeed falló: status={status} body={body[:200]}", file=sys.stderr)
    return False


def list_feeds() -> None:
    status, body = api_call("GetFeeds", {"siteUrl": SITE}, method="POST")
    print(f"GetFeeds status={status}\n{body}")


def main() -> int:
    if "--list" in sys.argv:
        list_feeds()
        return 0
    return 0 if submit_feed() else 1


if __name__ == "__main__":
    sys.exit(main())
