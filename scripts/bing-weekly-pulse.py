#!/usr/bin/env python3
"""
Pulso semanal Bing — análogo a gsc-weekly-pulse.py pero contra Bing
Webmaster Tools API. Diseñado para correr lunes 10am AR junto al pulse GSC.

Por qué importa: Bing tiene queries de tráfico que GSC ni muestra
(ej. "categorías monotributo 2026" — 1.212 impr Bing, casi 0 en Google).
Bing convierte mejor en algunos verticals y Microsoft Copilot cita Bing.

Output: docs/kpi-pulse-bing/YYYY-WW.md con métricas core + top queries
+ opportunities (URLs pos 11-25 con +50 impr para CTR rescue).

Cron sugerido (crontab -e):
  0 10 * * 1  cd /Users/marrod/hacecuentas && python3 scripts/bing-weekly-pulse.py
"""
import json
import os
import ssl
import sys
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path

try:
    import certifi
    _ssl = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _ssl = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "docs" / "kpi-pulse-bing"
ENV_FILE = ROOT / ".env"

if ENV_FILE.exists():
    for line in ENV_FILE.read_text().splitlines():
        if line.startswith("BING_WEBMASTER_API_KEY="):
            os.environ.setdefault("BING_WEBMASTER_API_KEY", line.split("=", 1)[1].strip().strip('"').strip("'"))

API_KEY = os.environ.get("BING_WEBMASTER_API_KEY")
if not API_KEY:
    sys.stderr.write("BING_WEBMASTER_API_KEY no seteado\n")
    sys.exit(1)

SITE = "https://hacecuentas.com"
BASE = "https://ssl.bing.com/webmaster/api.svc/json"


def call(endpoint: str) -> dict:
    url = f"{BASE}/{endpoint}?siteUrl={SITE}&apikey={API_KEY}"
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, context=_ssl, timeout=60) as r:
        return json.loads(r.read())


def get_query_stats() -> list:
    """GetQueryStats devuelve queries + impressions + clicks + position."""
    try:
        resp = call("GetQueryStats")
        return resp.get("d", [])
    except Exception as e:
        sys.stderr.write(f"GetQueryStats error: {e}\n")
        return []


def get_page_stats() -> list:
    """GetPageStats devuelve top URLs + impressions + clicks."""
    try:
        resp = call("GetPageStats")
        return resp.get("d", [])
    except Exception as e:
        sys.stderr.write(f"GetPageStats error: {e}\n")
        return []


def aggregate_stats(rows: list, key: str = "Query") -> list:
    """Bing devuelve una fila por fecha; consolida por query o URL."""
    grouped = {}
    for row in rows:
        value = row.get(key, "")
        if not value:
            continue
        item = grouped.setdefault(value, {key: value, "Impressions": 0, "Clicks": 0})
        item["Impressions"] += row.get("Impressions", 0) or 0
        item["Clicks"] += row.get("Clicks", 0) or 0
    return list(grouped.values())


def get_quota() -> dict:
    try:
        resp = call("GetUrlSubmissionQuota")
        d = resp.get("d", {})
        return {"daily": d.get("DailyQuota", 0), "monthly": d.get("MonthlyQuota", 0)}
    except Exception:
        return {"daily": "?", "monthly": "?"}


def main():
    today = datetime.utcnow().date()
    iso_year, iso_week, _ = today.isocalendar()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / f"{iso_year}-W{iso_week:02d}.md"

    print(f"[bing-pulse] semana {iso_year}-W{iso_week:02d}", file=sys.stderr)
    queries = aggregate_stats(get_query_stats())
    # GetPageStats usa el campo Query para contener la URL (tipo QueryStats).
    pages = aggregate_stats(get_page_stats())
    quota = get_quota()

    # Bing API devuelve datos del último mes, no slice semanal puro.
    # Tomamos top 20 por impressions.
    queries.sort(key=lambda q: q.get("Impressions", 0), reverse=True)
    pages.sort(key=lambda p: p.get("Impressions", 0), reverse=True)

    total_impr = sum(q.get("Impressions", 0) for q in queries)
    total_clicks = sum(q.get("Clicks", 0) for q in queries)
    ctr = (total_clicks / total_impr * 100) if total_impr > 0 else 0

    # Opportunities: queries con ≥100 impressions y CTR <2%
    opps = [q for q in queries if q.get("Impressions", 0) >= 100 and q.get("Clicks", 0) <= 2]
    opps.sort(key=lambda q: q.get("Impressions", 0), reverse=True)

    lines = [
        f"# Bing KPI Pulse — semana {iso_year}-W{iso_week:02d}",
        "",
        f"**Período:** snapshot Bing Webmaster Tools al {today}",
        f"**Quota Bing Submit:** {quota['daily']}/día restantes · {quota['monthly']}/mes",
        "",
        "## Métricas core",
        "",
        f"- Total queries con tráfico: **{len(queries)}**",
        f"- Total pages con tráfico: **{len(pages)}**",
        f"- Total impressions: **{total_impr:,}**",
        f"- Total clicks: **{total_clicks}**",
        f"- CTR promedio: **{ctr:.2f}%**",
        "",
        "## Top 20 queries por impressions",
        "",
        "| Query | Impr | Clicks | CTR |",
        "|---|---:|---:|---:|",
    ]
    for q in queries[:20]:
        qctr = (q.get("Clicks", 0) / q.get("Impressions", 1) * 100) if q.get("Impressions", 0) > 0 else 0
        lines.append(f"| {q.get('Query','?')} | {q.get('Impressions',0)} | {q.get('Clicks',0)} | {qctr:.2f}% |")

    lines += [
        "",
        "## CTR Rescue Opportunities (≥100 impr, ≤2 clicks)",
        "",
        "Estas queries tienen volumen pero el title/meta no convierte. ROI alto editar.",
        "",
        "| Query | Impr | Clicks | CTR |",
        "|---|---:|---:|---:|",
    ]
    if opps:
        for q in opps[:15]:
            qctr = (q.get("Clicks", 0) / q.get("Impressions", 1) * 100) if q.get("Impressions", 0) > 0 else 0
            lines.append(f"| {q.get('Query','?')} | {q.get('Impressions',0)} | {q.get('Clicks',0)} | {qctr:.2f}% |")
    else:
        lines.append("_Sin opportunities esta semana (todas las queries con ≥100 impr ya tienen >2 clicks)._")

    lines += [
        "",
        "## Top 10 pages Bing",
        "",
        "| Page | Impr | Clicks |",
        "|---|---:|---:|",
    ]
    for p in pages[:10]:
        page = p.get("Query", "") or "(no URL reported)"
        if len(page) > 70: page = page[:70] + "..."
        lines.append(f"| {page} | {p.get('Impressions',0)} | {p.get('Clicks',0)} |")

    lines += [
        "",
        "---",
        "",
        "_Generado por `scripts/bing-weekly-pulse.py`. Regla: solo mirar lunes._",
    ]

    out_file.write_text("\n".join(lines) + "\n")
    print(f"[bing-pulse] escrito {out_file.relative_to(ROOT)}", file=sys.stderr)
    print(f"\nQueries: {len(queries)} | Impr: {total_impr:,} | Clicks: {total_clicks} | CTR: {ctr:.2f}%", file=sys.stderr)
    print(f"Opportunities (rescue CTR): {len(opps)}", file=sys.stderr)


if __name__ == "__main__":
    main()
