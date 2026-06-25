#!/usr/bin/env python3
"""Calcs 'almost-ranking': páginas de CALCULADORA con impresiones pero en pos
5-25 (tienen demanda, un empujón las sube al top). Por calc: impr, clicks, pos,
CTR + la query que más impresiones le trae. Ordena por impresiones.
Uso: python3 scripts/gsc-calcs-almost.py [--days 90] [--min-impr 15]
"""
import os, sys, glob, json
from datetime import datetime, timedelta, timezone
from google.oauth2 import service_account
from googleapiclient.discovery import build

CREDS = os.path.expanduser("~/.config/gcp/hacecuentas-indexing.json")
SITE = "sc-domain:hacecuentas.com"
ROOT = os.path.join(os.path.dirname(__file__), "..")
DAYS = int(sys.argv[sys.argv.index('--days') + 1]) if '--days' in sys.argv else 90
MIN_IMPR = int(sys.argv[sys.argv.index('--min-impr') + 1]) if '--min-impr' in sys.argv else 15
LOCALES = {'es', 'mx', 'cl', 'co', 'pe', 'ec', 've', 'py', 'uy', 'do', 'pt', 'pt-pt', 'pt-br', 'en'}

slugs = set()
for d in ['calcs', 'calcs-es', 'calcs-en', 'calcs-pt', 'calcs-pt-pt', 'calcs-mx', 'calcs-co',
          'calcs-cl', 'calcs-pe', 'calcs-ec', 'calcs-ve', 'calcs-py', 'calcs-uy', 'calcs-do']:
    for f in glob.glob(os.path.join(ROOT, f"src/content/{d}/*.json")):
        try:
            slugs.add(json.load(open(f))['slug'])
        except Exception:
            pass

def is_calc(path):
    path = path.replace("https://hacecuentas.com", "")
    p = path.split('?')[0].strip('/')
    if not p:
        return False
    parts = p.split('/')
    seg = parts[1] if (len(parts) > 1 and parts[0] in LOCALES) else parts[0]
    return seg in slugs

s = build("searchconsole", "v1", credentials=service_account.Credentials.from_service_account_file(
    CREDS, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]), cache_discovery=False)
end = datetime.now(timezone.utc).date() - timedelta(days=3)
start = end - timedelta(days=DAYS - 1)

rows, sr = [], 0
while True:
    body = {"startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": ["page", "query"],
            "rowLimit": 25000, "startRow": sr, "dataState": "all"}
    resp = s.searchanalytics().query(siteUrl=SITE, body=body).execute()
    ch = resp.get("rows", [])
    rows += ch
    if len(ch) < 25000:
        break
    sr += 25000

# Agregar por página de calc
agg = {}
for r in rows:
    url, query = r["keys"]
    if not is_calc(url):
        continue
    impr, clk = int(r["impressions"]), int(r["clicks"])
    pos = r["position"]
    a = agg.setdefault(url, {"impr": 0, "clk": 0, "wpos": 0.0, "best_q": None, "best_qi": 0})
    a["impr"] += impr
    a["clk"] += clk
    a["wpos"] += pos * impr  # posición ponderada por impresiones
    if impr > a["best_qi"]:
        a["best_qi"] = impr
        a["best_q"] = (query, impr, round(pos, 1))

out = []
for url, a in agg.items():
    pos = a["wpos"] / a["impr"] if a["impr"] else 0
    if a["impr"] >= MIN_IMPR and 5 <= pos <= 25:
        out.append((url.replace("https://hacecuentas.com", ""), a["impr"], a["clk"],
                    round(a["clk"] / a["impr"] * 100, 1), round(pos, 1), a["best_q"]))
out.sort(key=lambda x: -x[1])

print(f"CALCS ALMOST-RANKING · {start} → {end} ({DAYS}d) · impr≥{MIN_IMPR}, pos 5-25 · {len(out)} calcs\n")
print(f'{"impr":>5} {"clk":>4} {"ctr":>5} {"pos":>5}  url  ◂ top query')
for path, impr, clk, ctr, pos, bq in out:
    q = f'“{bq[0]}” ({bq[1]}impr pos{bq[2]})' if bq else ''
    print(f'{impr:>5} {clk:>4} {ctr:>4}% {pos:>5}  {path}\n              ◂ {q}')
print(f"\nTOTAL impresiones en juego: {sum(x[1] for x in out):,} · clicks actuales: {sum(x[2] for x in out)}")
