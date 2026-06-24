#!/usr/bin/env python3
"""Rendimiento orgánico de las guías pilar (/guia/*) en GSC: por guía clicks,
impresiones, posición, CTR + top queries reales + clasificación de oportunidad.
Uso: python3 scripts/gsc-guias.py [--days 90]
"""
import os, sys, glob, json
from datetime import datetime, timedelta
from google.oauth2 import service_account
from googleapiclient.discovery import build

CREDS = os.path.expanduser("~/.config/gcp/hacecuentas-indexing.json")
SITE = "sc-domain:hacecuentas.com"
ROOT = os.path.join(os.path.dirname(__file__), "..")
DAYS = int(sys.argv[sys.argv.index('--days') + 1]) if '--days' in sys.argv else 90

s = build("searchconsole", "v1", credentials=service_account.Credentials.from_service_account_file(
    CREDS, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]), cache_discovery=False)

today = datetime.utcnow().date()
end = today - timedelta(days=3)
start = end - timedelta(days=DAYS - 1)

def gsc(dims):
    rows, sr = [], 0
    while True:
        body = {"startDate": start.isoformat(), "endDate": end.isoformat(), "dimensions": dims,
                "rowLimit": 25000, "startRow": sr, "dataState": "all",
                "dimensionFilterGroups": [{"filters": [
                    {"dimension": "page", "operator": "contains", "expression": "/guia/"}]}]}
        resp = s.searchanalytics().query(siteUrl=SITE, body=body).execute()
        ch = resp.get("rows", [])
        rows += ch
        if len(ch) < 25000:
            break
        sr += 25000
    return rows

def slug_of(url):
    return url.rstrip('/').split('/guia/')[-1]

# Inventario de guías (para listar las de 0 tráfico)
words = {}
for f in glob.glob(os.path.join(ROOT, "src/content/guias/*.json")):
    d = json.load(open(f))
    words[d['slug']] = sum(len(x.get('content', '').split()) for x in d.get('sections', []))

# Por página
pages = {slug_of(r["keys"][0]): r for r in gsc(["page"])}
# Por página+query (top queries)
pq = {}
for r in gsc(["page", "query"]):
    sl = slug_of(r["keys"][0])
    pq.setdefault(sl, []).append((r["keys"][1], int(r["impressions"]), int(r["clicks"]), round(r["position"], 1)))

print(f"GUÍAS · GSC sc-domain:hacecuentas.com · {start} → {end} ({DAYS}d)\n")
tot_c = sum(int(r["clicks"]) for r in pages.values())
tot_i = sum(int(r["impressions"]) for r in pages.values())
print(f"TOTAL guías: {tot_c:,} clicks · {tot_i:,} impresiones · {len(pages)}/{len(words)} guías con ≥1 impresión\n")

# Tabla por guía (ordenada por impresiones)
rows = []
for sl in words:
    r = pages.get(sl)
    if r:
        rows.append((sl, int(r["impressions"]), int(r["clicks"]), round(r["ctr"] * 100, 1), round(r["position"], 1), words[sl]))
    else:
        rows.append((sl, 0, 0, 0.0, 0.0, words[sl]))
rows.sort(key=lambda x: -x[1])

print(f'{"guía":34} {"impr":>6} {"clk":>4} {"ctr":>5} {"pos":>5} {"words":>6}  oportunidad')
for sl, impr, clk, ctr, pos, w in rows:
    if impr == 0:
        op = "INVISIBLE — no rankea (autoridad/indexación o intent)"
    elif pos > 20:
        op = "cola — pos >20, falta relevancia/autoridad"
    elif 10 < pos <= 20:
        op = "★ ALMOST — pág.2, empuje chico → top10"
    elif pos <= 10 and ctr < 3:
        op = "top10 CTR bajo — mejorar title/snippet"
    else:
        op = "rankea ok"
    print(f'{sl:34} {impr:>6,} {clk:>4} {ctr:>4}% {pos:>5} {w:>6}  {op}')

# Top queries por guía (las que más impresiones traen)
print("\n── Top queries por guía (impr) ──")
for sl, impr, *_ in rows:
    if sl not in pq:
        continue
    qs = sorted(pq[sl], key=lambda x: -x[1])[:6]
    print(f"\n  {sl}:")
    for query, qi, qc, qp in qs:
        print(f"     {qi:>5} impr · {qc:>3} clk · pos {qp:>5}  “{query}”")
