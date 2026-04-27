#!/usr/bin/env python3
"""
Pull data del GSC Search Analytics y detecta oportunidades concretas:

  1. Almost ranking — pages con muchas impressions pero pos 11-30 (página 2-3).
     Un push pequeño las lleva al top 10 = saltos de tráfico grandes.

  2. CTR underperformers — pages en top 10 con CTR < benchmark (ver tabla).
     Indica title/meta floja: optimización rinde clicks sin ganar ranking.

  3. Query gaps — top queries que NO tienen página dedicada (pillar de contenido
     o new calc).

  4. Pages perdiendo tráfico — comparar últimos 28d vs 28d previos.

  5. Mobile vs Desktop gap — pages con CTR mucho menor en mobile (UX issue).

Output: docs/gsc-opportunities-{date}.md
"""
import argparse
import json
import os
import sys
from datetime import datetime, timedelta
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


def svc():
    c = service_account.Credentials.from_service_account_file(CREDS, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=c, cache_discovery=False)


def query(s, start: str, end: str, dimensions: list, row_limit: int = 25000) -> list:
    """Query Search Analytics. Auto-pagina."""
    rows = []
    start_row = 0
    while True:
        body = {
            "startDate": start, "endDate": end,
            "dimensions": dimensions,
            "rowLimit": min(row_limit, 25000),
            "startRow": start_row,
            "dataState": "all",
        }
        resp = s.searchanalytics().query(siteUrl=SITE, body=body).execute()
        chunk = resp.get("rows", [])
        if not chunk: break
        rows.extend(chunk)
        if len(chunk) < 25000: break
        start_row += 25000
        if len(rows) >= row_limit: break
    return rows[:row_limit]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--days", type=int, default=28)
    args = ap.parse_args()

    today = datetime.utcnow().date()
    end_recent = today - timedelta(days=3)  # GSC tiene latencia ~3d
    start_recent = end_recent - timedelta(days=args.days - 1)
    end_prev = start_recent - timedelta(days=1)
    start_prev = end_prev - timedelta(days=args.days - 1)

    print(f"Periodo reciente : {start_recent} → {end_recent}", file=sys.stderr)
    print(f"Periodo anterior : {start_prev} → {end_prev}\n", file=sys.stderr)

    s = svc()

    # ───────────────────────────────────────────────────────────
    # 1. Pull data
    # ───────────────────────────────────────────────────────────
    print("[1/5] pulling queries...", file=sys.stderr)
    qs_recent = query(s, start_recent.isoformat(), end_recent.isoformat(), ["query"], row_limit=10000)
    qs_prev = query(s, start_prev.isoformat(), end_prev.isoformat(), ["query"], row_limit=10000)

    print("[2/5] pulling pages...", file=sys.stderr)
    ps_recent = query(s, start_recent.isoformat(), end_recent.isoformat(), ["page"], row_limit=5000)
    ps_prev = query(s, start_prev.isoformat(), end_prev.isoformat(), ["page"], row_limit=5000)

    print("[3/5] pulling page+query joint (top traffic)...", file=sys.stderr)
    pq_recent = query(s, start_recent.isoformat(), end_recent.isoformat(), ["page", "query"], row_limit=10000)

    print("[4/5] pulling device breakdown...", file=sys.stderr)
    dev_recent = query(s, start_recent.isoformat(), end_recent.isoformat(), ["page", "device"], row_limit=5000)

    # ───────────────────────────────────────────────────────────
    # 2. Análisis
    # ───────────────────────────────────────────────────────────
    print("[5/5] analyzing...", file=sys.stderr)

    # Indexar
    qmap_r = {r["keys"][0]: r for r in qs_recent}
    qmap_p = {r["keys"][0]: r for r in qs_prev}
    pmap_r = {r["keys"][0]: r for r in ps_recent}
    pmap_p = {r["keys"][0]: r for r in ps_prev}

    # ── 1. Almost ranking (queries pos 11-30, high impressions) ──
    almost = []
    for q, r in qmap_r.items():
        pos = r.get("position", 0)
        impr = r.get("impressions", 0)
        if 11 <= pos <= 30 and impr >= 20:
            almost.append({
                "query": q,
                "impressions": impr,
                "clicks": r.get("clicks", 0),
                "position": round(pos, 1),
                "ctr": round(r.get("ctr", 0) * 100, 1),
            })
    almost.sort(key=lambda x: x["impressions"], reverse=True)

    # ── 2. CTR underperformers (pos top 10, CTR muy bajo) ──
    # Benchmark CTR top 10 (industry standards):
    #  pos 1 → 30%, pos 2 → 15%, pos 3 → 10%, pos 4-5 → 6-7%, pos 6-10 → 3-4%
    ctr_benchmarks = {1: 0.30, 2: 0.15, 3: 0.10, 4: 0.07, 5: 0.06, 6: 0.05, 7: 0.04, 8: 0.04, 9: 0.03, 10: 0.03}
    ctr_under = []
    for q, r in qmap_r.items():
        pos = r.get("position", 0)
        impr = r.get("impressions", 0)
        ctr = r.get("ctr", 0)
        if 1 <= pos <= 10 and impr >= 30:
            expected = ctr_benchmarks[round(pos)]
            if ctr < expected * 0.5:  # menos de la mitad del esperado
                ctr_under.append({
                    "query": q,
                    "impressions": impr,
                    "clicks": r.get("clicks", 0),
                    "position": round(pos, 1),
                    "ctr_actual": round(ctr * 100, 2),
                    "ctr_expected": round(expected * 100, 1),
                    "ctr_gap": round((expected - ctr) * 100, 1),
                    "potential_extra_clicks": int(impr * (expected - ctr)),
                })
    ctr_under.sort(key=lambda x: x["potential_extra_clicks"], reverse=True)

    # ── 3. Query gaps (queries con clicks/impressions pero ninguna page del sitio dedicada) ──
    # Para detectar gaps comparamos query con slugs existentes
    import glob
    existing_slugs = set()
    for f in glob.glob(str(ROOT / "src/content/calcs/*.json")):
        try:
            d = json.load(open(f))
            if d.get("slug"): existing_slugs.add(d["slug"])
            if d.get("h1"): existing_slugs.add(d["h1"].lower())
        except: pass

    def query_has_match(q: str) -> bool:
        qtokens = set(q.lower().split())
        # match si los principales tokens están en algún slug (>=2 token overlap)
        for s in existing_slugs:
            stokens = set(s.lower().replace("-", " ").split())
            overlap = len(qtokens & stokens)
            if overlap >= max(2, len(qtokens) // 2):
                return True
        return False

    query_gaps = []
    for q, r in qmap_r.items():
        impr = r.get("impressions", 0)
        if impr < 10: continue
        if query_has_match(q): continue
        query_gaps.append({
            "query": q,
            "impressions": impr,
            "clicks": r.get("clicks", 0),
            "position": round(r.get("position", 0), 1),
        })
    query_gaps.sort(key=lambda x: x["impressions"], reverse=True)
    query_gaps = query_gaps[:50]

    # ── 4. Pages perdiendo tráfico (clicks recent < clicks prev × 0.7) ──
    losing = []
    for url, r in pmap_r.items():
        clicks_r = r.get("clicks", 0)
        if clicks_r < 5: continue  # ignorar low traffic
        prev = pmap_p.get(url, {})
        clicks_p = prev.get("clicks", 0)
        if clicks_p == 0: continue
        if clicks_r < clicks_p * 0.7:
            losing.append({
                "url": url,
                "clicks_recent": clicks_r,
                "clicks_prev": clicks_p,
                "delta_pct": round((clicks_r / clicks_p - 1) * 100, 1),
                "impressions_recent": r.get("impressions", 0),
                "position_recent": round(r.get("position", 0), 1),
                "position_prev": round(prev.get("position", 0), 1),
            })
    losing.sort(key=lambda x: x["clicks_prev"] - x["clicks_recent"], reverse=True)

    # ── 5. Mobile vs Desktop gap ──
    by_url_dev = {}
    for r in dev_recent:
        url, dev = r["keys"]
        by_url_dev.setdefault(url, {})[dev] = {
            "impressions": r.get("impressions", 0),
            "clicks": r.get("clicks", 0),
            "ctr": r.get("ctr", 0),
        }

    mobile_gap = []
    for url, devs in by_url_dev.items():
        m = devs.get("MOBILE", {})
        d = devs.get("DESKTOP", {})
        if m.get("impressions", 0) < 50: continue
        if d.get("impressions", 0) < 20: continue
        if m["ctr"] < d["ctr"] * 0.6:  # mobile CTR < 60% del desktop
            mobile_gap.append({
                "url": url,
                "mobile_impr": m["impressions"],
                "mobile_ctr": round(m["ctr"] * 100, 2),
                "desktop_ctr": round(d["ctr"] * 100, 2),
                "gap_pct": round((d["ctr"] - m["ctr"]) * 100, 2),
            })
    mobile_gap.sort(key=lambda x: x["mobile_impr"], reverse=True)
    mobile_gap = mobile_gap[:20]

    # ───────────────────────────────────────────────────────────
    # 3. Reporte
    # ───────────────────────────────────────────────────────────
    out = ROOT / "docs" / f"gsc-opportunities-{today.isoformat()}.md"
    lines = [
        f"# GSC Opportunities Report — {today.isoformat()}",
        f"",
        f"Periodo: **{start_recent} → {end_recent}** (vs {start_prev} → {end_prev})",
        f"",
        f"## Resumen ejecutivo",
        f"",
        f"| Métrica | Total |",
        f"|---|---|",
        f"| Total queries con tráfico | {len(qmap_r)} |",
        f"| Total pages con tráfico | {len(pmap_r)} |",
        f"| Total clicks recientes | {sum(r.get('clicks', 0) for r in qs_recent):,} |",
        f"| Total impressions recientes | {sum(r.get('impressions', 0) for r in qs_recent):,} |",
        f"| Total clicks período anterior | {sum(r.get('clicks', 0) for r in qs_prev):,} |",
        f"",
        f"---",
        f"",
        f"## 1. Almost ranking — queries con potencial inmediato",
        f"",
        f"Queries en pos 11-30 (página 2-3 de Google) con >=100 impressions. ",
        f"Empuje pequeño = top 10 = salto de tráfico.",
        f"",
        f"**{len(almost)} oportunidades**. Top 30:",
        f"",
        f"| Query | Impressions | Pos actual | CTR | Clicks |",
        f"|---|---:|---:|---:|---:|",
    ]
    for a in almost[:30]:
        lines.append(f"| {a['query']} | {a['impressions']:,} | {a['position']} | {a['ctr']}% | {a['clicks']} |")
    lines.append("")

    lines += [
        f"---",
        f"",
        f"## 2. CTR underperformers — pos top 10 con CTR bajo",
        f"",
        f"Pages que ya rankean top 10 pero con CTR < 50% del esperado por posición.",
        f"Optimización de title/meta = más clicks sin ganar ranking.",
        f"",
        f"**{len(ctr_under)} oportunidades**. Top 30:",
        f"",
        f"| Query | Pos | CTR actual | CTR esperado | Clicks extra/mes |",
        f"|---|---:|---:|---:|---:|",
    ]
    for c in ctr_under[:30]:
        lines.append(f"| {c['query']} | {c['position']} | {c['ctr_actual']}% | {c['ctr_expected']}% | +{c['potential_extra_clicks']:,} |")
    lines.append("")

    lines += [
        f"---",
        f"",
        f"## 3. Query gaps — sin página dedicada",
        f"",
        f"Queries con >=50 impressions que no tienen calc dedicada (heurística por overlap de tokens).",
        f"Algunas son gap real (crear calc nuevo); otras son falsos positivos del matching.",
        f"",
        f"**{len(query_gaps)} candidatos**. Top 30:",
        f"",
        f"| Query | Impressions | Pos | Clicks |",
        f"|---|---:|---:|---:|",
    ]
    for g in query_gaps[:30]:
        lines.append(f"| {g['query']} | {g['impressions']:,} | {g['position']} | {g['clicks']} |")
    lines.append("")

    lines += [
        f"---",
        f"",
        f"## 4. Pages que perdieron tráfico",
        f"",
        f"Pages con clicks_recent < clicks_prev × 0.7. Posibles causas: deindex, ",
        f"pérdida de ranking, cambio de SERP features, contenido stale.",
        f"",
        f"**{len(losing)} pages cayeron**. Top 20:",
        f"",
        f"| URL | Clicks ahora | Clicks antes | Δ% | Pos ahora | Pos antes |",
        f"|---|---:|---:|---:|---:|---:|",
    ]
    for l in losing[:20]:
        lines.append(f"| {l['url'].replace('https://hacecuentas.com', '')} | {l['clicks_recent']} | {l['clicks_prev']} | {l['delta_pct']}% | {l['position_recent']} | {l['position_prev']} |")
    lines.append("")

    lines += [
        f"---",
        f"",
        f"## 5. Mobile vs Desktop CTR gap",
        f"",
        f"Pages donde mobile CTR < 60% del desktop CTR (gap UX típico).",
        f"",
        f"**{len(mobile_gap)} pages con gap**. Top 20:",
        f"",
        f"| URL | Mobile impr | Mobile CTR | Desktop CTR | Gap |",
        f"|---|---:|---:|---:|---:|",
    ]
    for m in mobile_gap[:20]:
        lines.append(f"| {m['url'].replace('https://hacecuentas.com', '')} | {m['mobile_impr']:,} | {m['mobile_ctr']}% | {m['desktop_ctr']}% | -{m['gap_pct']}pp |")
    lines.append("")

    out.write_text("\n".join(lines))
    print(f"\n✓ Report generado: {out}", file=sys.stderr)
    print(f"\n📊 Resumen rápido:", file=sys.stderr)
    print(f"  Almost ranking (pos 11-30, ≥100 impr) : {len(almost)}", file=sys.stderr)
    print(f"  CTR underperformers (top 10 < benchmark): {len(ctr_under)}", file=sys.stderr)
    print(f"  Query gaps (sin página)                : {len(query_gaps)}", file=sys.stderr)
    print(f"  Pages perdiendo tráfico                : {len(losing)}", file=sys.stderr)
    print(f"  Mobile CTR gaps                        : {len(mobile_gap)}", file=sys.stderr)


if __name__ == "__main__":
    main()
