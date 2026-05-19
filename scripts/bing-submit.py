#!/usr/bin/env python3
"""Push URLs prioritarias al Bing Webmaster API.

Complementa IndexNow: IndexNow señala URLs (rápido pero pasivo),
Bing Webmaster Submit las mete directo al índice prioritario.

Quota: dinámica por sitio. Sitios nuevos arrancan con ~10 URLs/día
y sube hasta 10.000 con autoridad. Antes de pushear consultamos
GetUrlSubmissionQuota para usar el valor real y nunca pasarnos.

Uso:
  python3 scripts/bing-submit.py              # pushea sitemap-priority.xml
  python3 scripts/bing-submit.py --all        # todos los sitemaps (respeta quota)
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

# Cargar .env (solo local; en CI el secret se inyecta vía env).
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
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
PUBLIC = ROOT / "public"


def urls_from_sitemap(name: str) -> list:
    p = PUBLIC / name
    if not p.exists():
        return []
    tree = ET.parse(p)
    return [el.text for el in tree.getroot().iter(f"{NS}loc")]


def api_get(path: str, params: dict | None = None):
    qs = f"&{'&'.join(f'{k}={v}' for k, v in (params or {}).items())}" if params else ""
    url = f"{BASE}/{path}?apikey={API_KEY}{qs}"
    req = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(req, timeout=30, context=_ssl) as resp:
        return resp.status, resp.read().decode("utf-8", errors="ignore")


def api_post(path: str, payload: dict):
    url = f"{BASE}/{path}?apikey={API_KEY}"
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={"Content-Type": "application/json; charset=utf-8"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=30, context=_ssl) as resp:
        return resp.status, resp.read().decode("utf-8", errors="ignore")


def get_quota() -> int | None:
    """Consulta GetUrlSubmissionQuota. Devuelve URLs restantes hoy, o None si falla."""
    try:
        status, body = api_get("GetUrlSubmissionQuota", {"siteUrl": SITE})
        data = json.loads(body)
        # Forma de respuesta: {"d":{"DailyQuota":N,"MonthlyQuota":M}}
        d = data.get("d") or {}
        daily = d.get("DailyQuota")
        if isinstance(daily, int):
            print(f"INFO Bing quota disponible hoy: {daily} URLs")
            return daily
        print(f"WARN respuesta inesperada de GetUrlSubmissionQuota: {body[:200]}")
        return None
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        print(f"WARN HTTP {e.code} consultando quota body={body[:200]}")
        return None
    except Exception as e:
        print(f"WARN error consultando quota: {e}")
        return None


def submit(urls: list) -> tuple[bool, bool]:
    """Devuelve (ok, quota_exceeded). quota_exceeded=True NO se considera error fatal."""
    payload = {"siteUrl": SITE, "urlList": urls}
    try:
        status, body = api_post("SubmitUrlbatch", payload)
        ok = status in (200, 202)
        print(f"{'OK' if ok else 'WARN'} Bing submit status={status} urls={len(urls)} body={body[:200]}")
        return ok, False
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        # ErrorCode 2 + "Quota remaining" = rate limited, no es un fallo real
        quota_msg = "Quota remaining" in body or "quota" in body.lower()
        if e.code == 400 and quota_msg:
            print(f"INFO Bing rate-limit alcanzado urls={len(urls)} body={body[:200]}")
            return True, True
        print(f"FATAL HTTP {e.code} urls={len(urls)} body={body[:300]}")
        return False, False
    except Exception as e:
        print(f"FATAL Error: {e}")
        return False, False


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
        return 0

    # Quota real desde Bing API. Si no la podemos leer, caemos a 10 (sitio nuevo).
    daily_quota = get_quota()
    if daily_quota is None:
        daily_quota = int(os.environ.get("BING_DAILY_QUOTA", "10"))
        print(f"INFO usando quota fallback={daily_quota}")

    if daily_quota <= 0:
        print(f"INFO Bing quota agotada por hoy ({daily_quota}). Skip (no es error).")
        return 0

    if len(urls) > daily_quota:
        print(f"INFO {len(urls)} URLs disponibles, enviando top {daily_quota} (quota Bing).")
        urls = urls[:daily_quota]

    # Bing acepta hasta 500 URLs por batch, pero la quota diaria es el límite real.
    BATCH = 500
    any_fatal = False
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        print(f"→ Pusheando batch {i // BATCH + 1} ({len(chunk)} URLs)...")
        ok, quota_exceeded = submit(chunk)
        if quota_exceeded:
            print("INFO Detenemos resto de batches por quota.")
            break
        if not ok:
            any_fatal = True

    return 1 if any_fatal else 0


if __name__ == "__main__":
    sys.exit(main())
