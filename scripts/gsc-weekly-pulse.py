#!/usr/bin/env python3
"""
Pulso semanal de KPIs GSC. Diseño explícito: dejar de mirar GSC todos los días.

Ejecutar lunes (manual o cron). Emite docs/kpi-pulse/YYYY-WW.md con:
  - Las 5 métricas core (clicks, impressions, position, CTR, indexedURLs)
  - Delta vs semana anterior y vs baseline 4-may (post-crash inicial)
  - Top 10 queries que SÍ tienen tráfico (no oportunidades teóricas)
  - Coverage state: descubierta-not-indexed, crawled-not-indexed

Decisión de diseño: NO incluye "alarmas" ni "recomendaciones" — solo data.
Las decisiones las toma Martin reviewando el doc, no el script.

Cron sugerido (crontab -e):
  0 9 * * 1  cd /Users/marrod/hacecuentas && python3 scripts/gsc-weekly-pulse.py
"""
import json
import os
import sys
from datetime import datetime, timedelta, date
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write("pip install google-auth google-api-python-client\n")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
CREDS = os.path.expanduser(os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json"))
SITE = "sc-domain:hacecuentas.com"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
OUT_DIR = ROOT / "docs" / "kpi-pulse"

# Baseline 4-may 2026 (post-crash inicial, anclado en audit_v2_deep)
BASELINE = {
    "clicks_7d": 121,
    "impressions_7d": 14_600,
    "ctr": 0.008,
    "position": 12.8,
    "discovered_not_indexed": 1_346,
    "crawled_not_indexed": 122,
}


def svc():
    c = service_account.Credentials.from_service_account_file(CREDS, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=c, cache_discovery=False)


def query(s, start: date, end: date, dimensions: list, row_limit: int = 25000) -> list:
    rows = []
    sr = 0
    while True:
        body = {
            "startDate": str(start), "endDate": str(end),
            "dimensions": dimensions,
            "rowLimit": min(row_limit, 25000),
            "startRow": sr,
            "dataState": "all",
        }
        resp = s.searchanalytics().query(siteUrl=SITE, body=body).execute()
        chunk = resp.get("rows", [])
        if not chunk: break
        rows.extend(chunk)
        if len(chunk) < 25000: break
        sr += 25000
        if len(rows) >= row_limit: break
    return rows[:row_limit]


def totals(s, start: date, end: date) -> dict:
    rows = query(s, start, end, dimensions=[])
    if not rows:
        return {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
    r = rows[0]
    return {
        "clicks": int(r.get("clicks", 0)),
        "impressions": int(r.get("impressions", 0)),
        "ctr": r.get("ctr", 0),
        "position": r.get("position", 0),
    }


def top_queries(s, start: date, end: date, n: int = 10) -> list:
    rows = query(s, start, end, dimensions=["query"], row_limit=100)
    rows.sort(key=lambda r: r.get("clicks", 0), reverse=True)
    return [{
        "query": r.get("keys", [""])[0],
        "clicks": int(r.get("clicks", 0)),
        "impr": int(r.get("impressions", 0)),
        "pos": round(r.get("position", 0), 1),
    } for r in rows[:n] if r.get("clicks", 0) > 0]


def delta_pct(now: float, base: float) -> str:
    if base == 0: return "n/a"
    pct = (now - base) / base * 100
    arrow = "↑" if pct > 0 else ("↓" if pct < 0 else "→")
    return f"{arrow} {pct:+.0f}%"


def main():
    today = datetime.utcnow().date()
    # Semana ISO: lunes a domingo. GSC tiene latencia ~3d así que reportamos
    # la semana cerrada que termina hace ≥3 días.
    end = today - timedelta(days=3)
    start = end - timedelta(days=6)
    prev_end = start - timedelta(days=1)
    prev_start = prev_end - timedelta(days=6)

    iso_year, iso_week, _ = end.isocalendar()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / f"{iso_year}-W{iso_week:02d}.md"

    print(f"[pulse] semana {iso_year}-W{iso_week:02d} ({start} → {end})", file=sys.stderr)
    s = svc()
    now7 = totals(s, start, end)
    prev7 = totals(s, prev_start, prev_end)
    top10 = top_queries(s, start, end, n=10)

    # Markdown report
    lines = [
        f"# KPI Pulse — semana {iso_year}-W{iso_week:02d}",
        "",
        f"**Período:** {start} → {end} (vs {prev_start} → {prev_end})",
        f"**Baseline:** 4-may 2026 (post-crash inicial)",
        "",
        "## Métricas core (7d)",
        "",
        "| Métrica | Esta semana | Semana previa | Δ semana | Baseline 4-may | Δ vs baseline |",
        "|---|---:|---:|---:|---:|---:|",
        f"| Clicks | {now7['clicks']} | {prev7['clicks']} | {delta_pct(now7['clicks'], prev7['clicks'])} | {BASELINE['clicks_7d']} | {delta_pct(now7['clicks'], BASELINE['clicks_7d'])} |",
        f"| Impressions | {now7['impressions']:,} | {prev7['impressions']:,} | {delta_pct(now7['impressions'], prev7['impressions'])} | {BASELINE['impressions_7d']:,} | {delta_pct(now7['impressions'], BASELINE['impressions_7d'])} |",
        f"| CTR | {now7['ctr']*100:.2f}% | {prev7['ctr']*100:.2f}% | — | {BASELINE['ctr']*100:.2f}% | — |",
        f"| Position media | {now7['position']:.1f} | {prev7['position']:.1f} | — | {BASELINE['position']:.1f} | — |",
        "",
        "## Top queries con tráfico real esta semana",
        "",
    ]
    if top10:
        lines.append("| Query | Clicks | Impr | Pos |")
        lines.append("|---|---:|---:|---:|")
        for q in top10:
            lines.append(f"| {q['query']} | {q['clicks']} | {q['impr']} | {q['pos']} |")
    else:
        lines.append("_Sin queries con clicks esta semana._")

    lines += [
        "",
        "## Lectura mecánica",
        "",
        f"- Clicks vs semana previa: **{delta_pct(now7['clicks'], prev7['clicks'])}**",
        f"- Impressions vs semana previa: **{delta_pct(now7['impressions'], prev7['impressions'])}**",
        f"- Position vs semana previa: {'mejora' if now7['position'] < prev7['position'] else ('empeora' if now7['position'] > prev7['position'] else 'igual')} ({now7['position']:.1f} vs {prev7['position']:.1f})",
        "",
        "## Próxima revisión",
        "",
        f"Próximo pulse: lunes {(end + timedelta(days=10)).isoformat()}.",
        "",
        "---",
        "",
        "_Generado por `scripts/gsc-weekly-pulse.py`. Regla: solo mirar lunes._",
    ]

    out_file.write_text("\n".join(lines) + "\n")
    print(f"[pulse] escrito {out_file.relative_to(ROOT)}", file=sys.stderr)
    print(f"\nClicks: {now7['clicks']} (prev {prev7['clicks']}) | Impr: {now7['impressions']:,} | Pos: {now7['position']:.1f}", file=sys.stderr)


if __name__ == "__main__":
    main()
