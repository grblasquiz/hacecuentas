#!/usr/bin/env python3
"""Auditoría de indexación EN en Bing vía GetUrlInfo.

Pregunta que responde: ¿Bing crawleó/indexó las páginas /en/, o ni las descubrió?
Compara contra un control de URLs ES (sitemap-priority) que SÍ rankean, para
saber si un eventual "no crawleada" es real o un artefacto de la señal.

GetUrlInfo devuelve por URL: DiscoveryDate, LastCrawledDate, DocumentSize.
  - LastCrawledDate real (>2020) + DocumentSize>0  → CRAWLED (proxy fuerte de indexada)
  - DiscoveryDate real pero LastCrawled nulo        → DISCOVERED (en cola, no crawleada)
  - ambas nulas (año 0001 sentinel) / DocSize 0     → UNKNOWN (Bing no la tiene)

Uso:
  python3 scripts/bing-en-index-audit.py            # muestra: 80 EN + 20 ES control
  python3 scripts/bing-en-index-audit.py --all      # las 680 EN (lento, ~2min)
  python3 scripts/bing-en-index-audit.py --submit    # además force-submit EN faltantes (si hay quota)
"""
import os, sys, json, ssl, time, urllib.request, urllib.parse, urllib.error
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
for line in (ROOT / '.env').read_text().splitlines():
    if line.startswith('BING_WEBMASTER_API_KEY='):
        KEY = line.split('=', 1)[1].strip().strip('"').strip("'")
try:
    import certifi; CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    CTX = ssl.create_default_context()

SITE = "https://hacecuentas.com"
BASE = "https://ssl.bing.com/webmaster/api.svc/json"
NS = "{http://www.sitemaps.org/schemas/sitemap/0.9}"


def locs(name):
    p = ROOT / 'public' / name
    if not p.exists():
        return []
    return [el.text for el in ET.parse(p).getroot().iter(f"{NS}loc")]


def api_get(path, params):
    qs = "&".join(f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in params.items())
    url = f"{BASE}/{path}?apikey={KEY}&{qs}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url), timeout=30, context=CTX) as r:
            return json.loads(r.read().decode('utf-8', 'ignore'))
    except urllib.error.HTTPError as e:
        return {"_err": e.code, "_body": e.read().decode('utf-8', 'ignore')[:200]}
    except Exception as e:
        return {"_err": "EXC", "_body": str(e)[:200]}


def dotnet_ms(s):
    """/Date(1780488867000)/ o /Date(1778137200000-0700)/ → epoch ms (int) o None si sentinel."""
    if not s or 'Date(' not in s:
        return None
    inner = s.split('Date(')[1].split(')')[0]
    # quitar offset tz si está (-0700 / +0000) sin romper el signo del epoch
    num = inner
    for i in range(1, len(inner)):
        if inner[i] in '+-':
            num = inner[:i]; break
    try:
        ms = int(num)
    except ValueError:
        return None
    return ms if ms > 0 else None  # sentinel año 0001 = negativo enorme → None


def classify(info):
    d = info.get('d') or {}
    disc = dotnet_ms(d.get('DiscoveryDate'))
    crawl = dotnet_ms(d.get('LastCrawledDate'))
    size = d.get('DocumentSize', 0) or 0
    if crawl and size > 0:
        return 'CRAWLED', crawl
    if disc:
        return 'DISCOVERED', disc
    return 'UNKNOWN', None


def audit(urls, label):
    counts = {'CRAWLED': 0, 'DISCOVERED': 0, 'UNKNOWN': 0, 'ERR': 0}
    details = []
    for u in urls:
        info = api_get("GetUrlInfo", {"siteUrl": SITE, "url": u})
        if '_err' in info:
            counts['ERR'] += 1; details.append((u, 'ERR', info.get('_body', '')))
            time.sleep(0.1); continue
        st, ts = classify(info)
        counts[st] += 1
        when = time.strftime('%Y-%m-%d', time.gmtime(ts / 1000)) if ts else '-'
        details.append((u, st, when))
        time.sleep(0.1)
    n = max(len(urls), 1)
    print(f"\n=== {label} (n={len(urls)}) ===")
    print(f"  CRAWLED (indexable):   {counts['CRAWLED']:>4}  ({100*counts['CRAWLED']/n:.0f}%)")
    print(f"  DISCOVERED (en cola):  {counts['DISCOVERED']:>4}  ({100*counts['DISCOVERED']/n:.0f}%)")
    print(f"  UNKNOWN (Bing no la tiene): {counts['UNKNOWN']:>4}  ({100*counts['UNKNOWN']/n:.0f}%)")
    if counts['ERR']:
        print(f"  ERR: {counts['ERR']}")
    return counts, details


def main():
    all_flag = '--all' in sys.argv
    en = locs('sitemap-en.xml')
    es_ctrl = locs('sitemap-priority.xml')[:20]
    en_sample = en if all_flag else en[:: max(1, len(en) // 80)][:80]

    en_counts, en_details = audit(en_sample, "EN /en/")
    es_counts, _ = audit(es_ctrl, "ES control (sitemap-priority)")

    # URLs EN no crawleadas (para submit / inspección)
    not_crawled = [u for u, st, _ in en_details if st in ('DISCOVERED', 'UNKNOWN')]
    out = ROOT / 'data' / 'bing-en-index-audit.json'
    out.write_text(json.dumps({
        "en_sample_size": len(en_sample), "en_counts": en_counts,
        "es_control_counts": es_counts,
        "en_not_crawled": not_crawled,
        "details": [{"url": u, "status": s, "date": d} for u, s, d in en_details],
    }, ensure_ascii=False, indent=2))
    print(f"\n📄 Detalle → {out}")

    if not_crawled:
        print(f"\n{len(not_crawled)} EN no crawleadas (muestra). Ejemplos:")
        for u in not_crawled[:10]:
            print(f"   {u}")

    if '--submit' in sys.argv and not_crawled:
        q = api_get("GetUrlSubmissionQuota", {"siteUrl": SITE}).get('d', {})
        daily = q.get('DailyQuota', 0)
        print(f"\nQuota submit diaria: {daily}")
        if daily > 0:
            batch = not_crawled[:daily]
            url = f"{BASE}/SubmitUrlBatch?apikey={KEY}"
            req = urllib.request.Request(url, data=json.dumps({"siteUrl": SITE, "urlList": batch}).encode(),
                                         headers={"Content-Type": "application/json; charset=utf-8"}, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
                    print(f"Submit OK status={r.status} urls={len(batch)}")
            except urllib.error.HTTPError as e:
                print(f"Submit HTTP {e.code}: {e.read().decode('utf-8','ignore')[:200]}")
        else:
            print("Sin quota diaria → no se puede force-submit hoy (IndexNow es el canal alterno).")


if __name__ == '__main__':
    main()
