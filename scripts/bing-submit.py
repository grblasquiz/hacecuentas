#!/usr/bin/env python3
"""Push URLs prioritarias al Bing Webmaster API.

Complementa IndexNow: IndexNow señala URLs (rápido pero pasivo),
Bing Webmaster Submit las mete directo al índice prioritario.

Quota: 10.000 URLs/día (verificar tier actual).

Uso:
  python3 scripts/bing-submit.py              # pushea sitemap-priority.xml
  python3 scripts/bing-submit.py --all        # pushea todos los sitemaps (cuidado quota)
  python3 scripts/bing-submit.py /url1 /url2  # URLs específicas
"""
import json
import os
import ssl
import sys
import urllib.request
from pathlib import Path
from xml.etree import ElementTree as ET

try:
    import certifi
    _ssl = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _ssl = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent

# Cargar .env
ENV_FILE = ROOT / ".env"
if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("BING_WEBMASTER_API_KEY="):
            os.environ.setdefault("BING_WEBMASTER_API_KEY", line.split("=", 1)[1].strip().strip('"').strip("'"))

API_KEY = os.environ.get("BING_WEBMASTER_API_KEY")
if not API_KEY:
    # En GH Actions el .env no existe — el secret se inyecta via env.
    # Local: faltaría en .env.
    where = "GitHub Secrets" if os.environ.get("GITHUB_ACTIONS") == "true" else ".env"
    print(f"❌ Falta BING_WEBMASTER_API_KEY en {where}", file=sys.stderr)
    sys.exit(1)

SITE = "https://hacecuentas.com"
ENDPOINT = f"https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={API_KEY}"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
PUBLIC = ROOT / "public"


def urls_from_sitemap(name: str) -> list:
    p = PUBLIC / name
    if not p.exists():
        return []
    tree = ET.parse(p)
    return [el.text for el in tree.getroot().iter(f"{NS}loc")]


def submit(urls: list) -> bool:
    payload = {"siteUrl": SITE, "urlList": urls}
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=30, context=_ssl) as resp:
            body = resp.read().decode("utf-8", errors="ignore")
            ok = resp.status in (200, 202)
            print(f"{'✅' if ok else '⚠️'} Bing submit status={resp.status} urls={len(urls)} body={body[:200]}")
            return ok
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        print(f"❌ HTTP {e.code} urls={len(urls)} body={body[:300]}")
        return False
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def main():
    args = sys.argv[1:]
    if args and args[0] == "--all":
        urls = []
        for f in PUBLIC.glob("sitemap-*.xml"):
            urls.extend(urls_from_sitemap(f.name))
        urls = list(dict.fromkeys(urls))
    elif args and (args[0].startswith("/") or args[0].startswith("http")):
        urls = [u if u.startswith("http") else f"{SITE}{u}" for u in args]
    else:
        urls = urls_from_sitemap("sitemap-priority.xml")

    if not urls:
        print("Sin URLs.")
        return 1

    # Bing Webmaster API quota: 100 URLs/día para tier free.
    # Cortamos a 90 por seguridad y ordenamos por prioridad (sitemap-priority
    # ya viene ordenado por prioridad descendente).
    DAILY_QUOTA = int(os.environ.get("BING_DAILY_QUOTA", "90"))
    if len(urls) > DAILY_QUOTA:
        print(f"⚠️  {len(urls)} URLs exceden quota diaria ({DAILY_QUOTA}). Tomando las top {DAILY_QUOTA}.")
        urls = urls[:DAILY_QUOTA]

    # Bing acepta hasta 500 URLs por batch en SubmitUrlbatch, pero el límite real
    # es la quota diaria, así que un solo batch alcanza.
    BATCH = 500
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        print(f"→ Pusheando batch {i // BATCH + 1} ({len(chunk)} URLs)...")
        submit(chunk)
    return 0


if __name__ == "__main__":
    sys.exit(main())
