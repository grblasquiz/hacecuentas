#!/usr/bin/env python3
"""Drip diario de URLs EN sin-crawlear a Bing Webmaster (SubmitUrlBatch).

Lever #2 del plan de crecimiento EN: forzar crawl de las /en/ encoladas.
Bing crawleó solo 26% de las 680 EN (504 sin crawlear). La cuota de submit
es chica (DailyQuota dinámica, 2500/mes). Este script mete cada día tantas
como permita la cuota, ROTANDO por el pool para no repetir hasta agotarlo,
y ahí reinicia el ciclo.

Pool: data/bing-en-index-audit.json → en_not_crawled (regenerar con
      scripts/bing-en-index-audit.py --all cada ~2-3 semanas).
Estado: data/.bing-drip-state.json (URLs ya enviadas en el ciclo actual).

Uso:
  python3 scripts/bing-en-drip-submit.py           # drip del día (respeta cuota)
  python3 scripts/bing-en-drip-submit.py --status   # ver pool/estado/cuota sin enviar
Cron sugerido (local, la Mac tiene que estar despierta):
  0 11 * * *  cd /Users/marrod/hacecuentas && python3 scripts/bing-en-drip-submit.py >> /tmp/bing-drip.log 2>&1
"""
import os, sys, json, ssl, urllib.request, urllib.error
from pathlib import Path

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
AUDIT = ROOT / 'data' / 'bing-en-index-audit.json'
STATE = ROOT / 'data' / '.bing-drip-state.json'
HARD_CAP = 100  # nunca más de esto por día aunque la cuota diga más


def get_quota():
    url = f"{BASE}/GetUrlSubmissionQuota?siteUrl={SITE}&apikey={KEY}"
    try:
        with urllib.request.urlopen(urllib.request.Request(url), timeout=30, context=CTX) as r:
            return (json.loads(r.read().decode()).get('d') or {}).get('DailyQuota', 0)
    except Exception as e:
        print(f"WARN quota: {e}"); return 0


def submit(urls):
    url = f"{BASE}/SubmitUrlBatch?apikey={KEY}"
    req = urllib.request.Request(url, data=json.dumps({"siteUrl": SITE, "urlList": urls}).encode(),
                                 headers={"Content-Type": "application/json; charset=utf-8"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=30, context=CTX) as r:
            return r.status, ""
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', 'ignore')[:200]


def main():
    if not AUDIT.exists():
        sys.exit("Falta data/bing-en-index-audit.json — correr bing-en-index-audit.py --all")
    pool = json.load(open(AUDIT)).get('en_not_crawled', [])
    state = json.load(open(STATE)) if STATE.exists() else {"sent": []}
    sent = set(state.get("sent", []))
    pending = [u for u in pool if u not in sent]
    if not pending:  # ciclo completo → reiniciar
        print(f"Ciclo completo ({len(sent)} enviadas). Reiniciando drip.")
        sent = set(); pending = list(pool)

    quota = get_quota()
    print(f"Pool sin-crawlear: {len(pool)} | ya enviadas en ciclo: {len(sent)} | pendientes: {len(pending)} | quota hoy: {quota}")
    if '--status' in sys.argv:
        return
    n = min(quota, HARD_CAP, len(pending))
    if n <= 0:
        print("Cuota 0 hoy — nada que enviar (no es error; reintenta mañana).")
        return
    batch = pending[:n]
    status, body = submit(batch)
    ok = status in (200, 202)
    print(f"{'✅' if ok else '⚠️'} SubmitUrlBatch status={status} urls={len(batch)} {body}")
    if ok:
        sent |= set(batch)
        STATE.write_text(json.dumps({"sent": sorted(sent)}, indent=2))
        print(f"Estado actualizado: {len(sent)}/{len(pool)} del ciclo enviadas.")


if __name__ == '__main__':
    main()
