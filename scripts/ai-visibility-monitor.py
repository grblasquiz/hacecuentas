#!/usr/bin/env python3
"""AI visibility monitor — testea ranking en Brave, Bing y DuckDuckGo.

Brave Search es el proxy más cercano a lo que Claude.ai usa en web_search.
Bing es lo que ChatGPT/Copilot consumen.
DuckDuckGo es independiente y suma señal.

Output: CSV en docs/ai-visibility/YYYY-MM-DD.csv

Quita 20 prompts comunes Argentina contra cada engine, registra:
  - posición top-10 si está
  - cualquier URL hacecuentas mencionada
  - snippet text que cite hacecuentas

Uso:
  python3 scripts/ai-visibility-monitor.py             # corre hoy
  python3 scripts/ai-visibility-monitor.py --queries 5 # solo 5 queries (test)

Cron sugerido (1x semana, no overuse):
  0 9 * * 1 cd /path/hacecuentas && python3 scripts/ai-visibility-monitor.py
"""
from __future__ import annotations
import argparse
import base64
import csv
import html
import os
import re
import ssl
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path

try:
    import certifi
    _SSL = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _SSL = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "ai-visibility"
OUT_DIR.mkdir(parents=True, exist_ok=True)

UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.6 Safari/605.1.15"

# 20 queries comunes — cubren las top categorías que Martin quiere ranquear
QUERIES = [
    "calculadora sueldo neto argentina 2026",
    "calculadora aguinaldo sac 2026",
    "calculadora indemnizacion despido argentina",
    "calculadora monotributo 2026 categoria",
    "calculadora ganancias 4ta categoria 2026",
    "calculadora vacaciones argentina",
    "simulador jubilacion anses argentina",
    "calculadora iva 21 argentina",
    "calculadora porcentajes online",
    "calculadora plazo fijo argentina 2026",
    "calculadora imc indice masa corporal",
    "calculadora calorias diarias tdee",
    "calculadora semanas embarazo",
    "calculadora regla de tres",
    "calculadora interes compuesto argentina",
    "convertir tazas a gramos cocina",
    "calculadora edad perro años humanos",
    "calculadora roas marketing",
    "calculadora cac ltv",
    "cotizacion dolar blue mep ccl argentina",
]

# Patrones HTML para extraer URLs orgánicas (verificado 2026-05-17, frágil a changes)
# Brave: result anchors usan class="svelte-<hash> l1" para top-level orgánicos
BRAVE_RE = re.compile(r'<a\s+href="(https?://[^"]+)"[^>]*class="svelte-[a-z0-9]+\s+l1"', re.I)
# Bing: <h2><a target="_blank" href="https://www.bing.com/ck/a?...u=a1<base64>..."> (redirect wrapper)
BING_RE = re.compile(r'<h2[^>]*><a[^>]+href="(https://www\.bing\.com/ck/a\?[^"]+)"', re.I)
# DDG html endpoint: result__a class
DDG_RE = re.compile(r'<a[^>]+class="result__a"[^>]+href="(https?://[^"]+)"', re.I)


def decode_bing_url(bing_url: str) -> str:
    """Bing envuelve los resultados en /ck/a?u=a1<base64url>&ntb=1. Decodea u.
    Hay que html.unescape primero porque el HTML trae '&amp;' literal."""
    try:
        unescaped = html.unescape(bing_url)
        params = urllib.parse.parse_qs(urllib.parse.urlparse(unescaped).query)
        u = params.get("u", [""])[0]
        if u.startswith("a1"):
            padded = u[2:] + "=" * (-len(u[2:]) % 4)
            return base64.urlsafe_b64decode(padded).decode("utf-8", errors="ignore")
    except Exception:
        pass
    return bing_url


def fetch(url: str, timeout: int = 12) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "es-AR,es;q=0.9,en;q=0.7"})
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=_SSL) as resp:
            return resp.read().decode("utf-8", errors="ignore")
    except Exception as e:
        return f"<!-- fetch error: {e} -->"


def search_brave(query: str) -> list[str]:
    q = urllib.parse.quote_plus(query)
    html = fetch(f"https://search.brave.com/search?q={q}&country=ar&source=web")
    return _dedupe(BRAVE_RE.findall(html))[:10]


def search_bing(query: str) -> list[str]:
    q = urllib.parse.quote_plus(query)
    html = fetch(f"https://www.bing.com/search?q={q}&cc=AR")
    raw = BING_RE.findall(html)
    decoded = [decode_bing_url(u) for u in raw]
    return _dedupe(decoded)[:10]


def search_ddg(query: str) -> list[str]:
    q = urllib.parse.quote_plus(query)
    # DDG HTML endpoint (lite) — más estable que el JS-rendered
    html = fetch(f"https://html.duckduckgo.com/html/?q={q}&kl=ar-es")
    urls = DDG_RE.findall(html)
    # DDG redirect URLs: //duckduckgo.com/l/?uddg=...
    cleaned = []
    for u in urls:
        if "duckduckgo.com/l/?uddg=" in u:
            try:
                cleaned.append(urllib.parse.unquote(urllib.parse.parse_qs(urllib.parse.urlparse(u).query)["uddg"][0]))
            except Exception:
                continue
        else:
            cleaned.append(u)
    return _dedupe(cleaned)[:10]


def _dedupe(urls: list[str]) -> list[str]:
    seen, out = set(), []
    for u in urls:
        host_path = u.split("?")[0].split("#")[0]
        if host_path not in seen:
            seen.add(host_path)
            out.append(u)
    return out


def hc_rank(urls: list[str]) -> tuple[int | None, str | None]:
    for i, u in enumerate(urls, 1):
        if "hacecuentas.com" in u:
            return i, u
    return None, None


def run(queries: list[str], out_csv: Path):
    rows = []
    ts = datetime.now().isoformat(timespec="seconds")
    print(f"📊 Testing {len(queries)} queries en Brave + Bing + DDG...\n")
    for q in queries:
        for engine, fn in (("brave", search_brave), ("bing", search_bing), ("ddg", search_ddg)):
            urls = fn(q)
            rank, hc_url = hc_rank(urls)
            top1 = urls[0] if urls else ""
            rows.append({
                "timestamp": ts,
                "query": q,
                "engine": engine,
                "hc_rank": rank or "",
                "hc_url": hc_url or "",
                "top1_url": top1,
                "total_urls": len(urls),
            })
            print(f"  [{engine:5s}] '{q[:50]:50s}'  rank={rank or '—'}")
            time.sleep(2)  # politeness, evitar rate-limit

    with out_csv.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        w.writeheader()
        w.writerows(rows)

    # Resumen
    by_eng = {}
    for r in rows:
        e = r["engine"]
        by_eng.setdefault(e, {"total": 0, "in_top10": 0, "top3": 0, "top1": 0})
        by_eng[e]["total"] += 1
        if r["hc_rank"]:
            by_eng[e]["in_top10"] += 1
            if int(r["hc_rank"]) <= 3:
                by_eng[e]["top3"] += 1
            if int(r["hc_rank"]) == 1:
                by_eng[e]["top1"] += 1

    print(f"\n📈 Resumen ({len(queries)} queries):")
    for eng, s in by_eng.items():
        print(f"  {eng}: top10 {s['in_top10']}/{s['total']} ({s['in_top10']/s['total']*100:.0f}%) | top3 {s['top3']} | #1 {s['top1']}")
    print(f"\n💾 CSV: {out_csv}")


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--queries", type=int, default=0, help="Limitar n° de queries (0 = todas)")
    args = p.parse_args()

    qs = QUERIES[:args.queries] if args.queries > 0 else QUERIES
    out = OUT_DIR / f"{datetime.now():%Y-%m-%d}.csv"
    run(qs, out)


if __name__ == "__main__":
    sys.exit(main() or 0)
