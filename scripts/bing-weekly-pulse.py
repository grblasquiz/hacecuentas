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
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from datetime import UTC, datetime, timedelta
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

# Activos con mayor upside Bing y páginas que concentran la autoridad del sitio.
# GetUrlInfo.AnchorCount es una señal propia de Bing; no equivale a dominios de
# referencia y puede incluir anclas que Bing conoce sin exponer su origen.
AUTHORITY_URLS = [
    ("Dominio", "domain:hacecuentas.com"),
    ("Home", f"{SITE}/"),
    ("Mundial 2026", f"{SITE}/fixture-mundial-2026"),
    ("Salario Colombia", f"{SITE}/co/datos-salario-minimo-colombia-2026"),
    ("Festivos Colombia", f"{SITE}/feriados-colombia-2026"),
    ("Salario México", f"{SITE}/mx/datos-salario-minimo-mexico-2026"),
    ("UMA México", f"{SITE}/mx/datos-uma-imss-2026"),
    ("Feriados Chile", f"{SITE}/feriados-chile-2026"),
    ("Tipo de cambio SUNAT", f"{SITE}/pe/calculadora-tipo-de-cambio-sunat-dolar-soles-peru"),
    ("Préstamo IESS", f"{SITE}/ec/calculadora-prestamo-quirografario-iess-ecuador"),
    ("TRM Colombia", f"{SITE}/co/calculadora-trm-dolar-hoy-pesos-colombianos"),
]


def call(endpoint: str, **params) -> dict:
    query = urllib.parse.urlencode({"siteUrl": SITE, "apikey": API_KEY, **params})
    url = f"{BASE}/{endpoint}?{query}"
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


def get_page_query_stats(page: str) -> dict:
    """Mapea una URL a las consultas reales que Bing le asignó."""
    try:
        resp = call("GetPageQueryStats", page=page)
        rows = aggregate_stats(resp.get("d", []))
        rows.sort(key=lambda row: row.get("Impressions", 0), reverse=True)
        return {"page": page, "queries": rows}
    except Exception as exc:
        sys.stderr.write(f"GetPageQueryStats warning ({page}): {exc}\n")
        return {"page": page, "queries": []}


def aggregate_stats(rows: list, key: str = "Query") -> list:
    """Bing devuelve una fila por fecha; consolida por query o URL."""
    grouped = {}
    for row in rows:
        value = row.get(key, "")
        if not value:
            continue
        item = grouped.setdefault(value, {
            key: value, "Impressions": 0, "Clicks": 0,
            "_position_weighted": 0.0, "_position_plain": 0.0, "_position_rows": 0,
        })
        impressions = row.get("Impressions", 0) or 0
        position = row.get("AvgImpressionPosition", row.get("Position", 0)) or 0
        item["Impressions"] += impressions
        item["Clicks"] += row.get("Clicks", 0) or 0
        item["_position_weighted"] += position * impressions
        item["_position_plain"] += position
        item["_position_rows"] += 1
    result = []
    for item in grouped.values():
        impressions = item["Impressions"]
        item["Position"] = (
            item["_position_weighted"] / impressions if impressions
            else item["_position_plain"] / max(item["_position_rows"], 1)
        )
        for temp in ("_position_weighted", "_position_plain", "_position_rows"):
            item.pop(temp, None)
        result.append(item)
    return result


def get_quota() -> dict:
    try:
        resp = call("GetUrlSubmissionQuota")
        d = resp.get("d", {})
        return {"daily": d.get("DailyQuota", 0), "monthly": d.get("MonthlyQuota", 0)}
    except Exception:
        return {"daily": "?", "monthly": "?"}


def get_url_info(label_url: tuple[str, str]) -> dict:
    """Lee señales de descubrimiento/autoridad para una URL prioritaria."""
    label, url = label_url
    try:
        d = call("GetUrlInfo", url=url).get("d", {})
        return {
            "label": label,
            "url": url,
            "anchors": d.get("AnchorCount", 0) or 0,
            "children": d.get("TotalChildUrlCount", 0) or 0,
        }
    except Exception as exc:
        sys.stderr.write(f"GetUrlInfo warning ({label}): {exc}\n")
        return {"label": label, "url": url, "anchors": None, "children": None}


def load_previous_anchor_counts(current_file: Path) -> dict[str, int]:
    """Recupera el último snapshot para calcular deltas semanales."""
    candidates = sorted((p for p in OUT_DIR.glob("????-W??.md") if p != current_file), reverse=True)
    if not candidates:
        return {}
    counts = {}
    in_section = False
    for line in candidates[0].read_text(encoding="utf-8").splitlines():
        if line == "## Señales de autoridad reconocidas por Bing":
            in_section = True
            continue
        if in_section and line.startswith("## "):
            break
        if not in_section or not line.startswith("|") or line.startswith("|---"):
            continue
        cells = [cell.strip() for cell in line.strip("|").split("|")]
        if len(cells) >= 3 and cells[0] != "Activo":
            try:
                counts[cells[0]] = int(cells[2].replace(",", ""))
            except ValueError:
                pass
    return counts


def resolve_final_url(url: str) -> str:
    """Sigue redirects para no confundir aliases históricos con oportunidades CTR."""
    try:
        req = urllib.request.Request(url, method="HEAD", headers={"User-Agent": "HacéCuentas-BingPulse/1.0"})
        with urllib.request.urlopen(req, context=_ssl, timeout=10) as response:
            return response.geturl().rstrip("/")
    except Exception as exc:
        # Una falla temporal de red no debe sacar una URL del análisis.
        sys.stderr.write(f"URL status warning ({url}): {exc}\n")
        return url.rstrip("/")


def main():
    today = datetime.now(UTC).date()
    iso_year, iso_week, _ = today.isocalendar()
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_file = OUT_DIR / f"{iso_year}-W{iso_week:02d}.md"

    print(f"[bing-pulse] semana {iso_year}-W{iso_week:02d}", file=sys.stderr)
    queries = aggregate_stats(get_query_stats())
    # GetPageStats usa el campo Query para contener la URL (tipo QueryStats).
    pages = aggregate_stats(get_page_stats())
    quota = get_quota()
    with ThreadPoolExecutor(max_workers=6) as pool:
        authority = list(pool.map(get_url_info, AUTHORITY_URLS))
    previous_anchors = load_previous_anchor_counts(out_file)

    # Bing API devuelve datos del último mes, no slice semanal puro.
    # Tomamos top 20 por impressions.
    queries.sort(key=lambda q: q.get("Impressions", 0), reverse=True)
    pages.sort(key=lambda p: p.get("Impressions", 0), reverse=True)

    total_impr = sum(q.get("Impressions", 0) for q in queries)
    total_clicks = sum(q.get("Clicks", 0) for q in queries)
    ctr = (total_clicks / total_impr * 100) if total_impr > 0 else 0

    # Query candidates: Bing no expone query→page en esta API. Sirven para
    # detectar demanda, pero NO alcanzan para diagnosticar un problema de title.
    opps = [q for q in queries if q.get("Impressions", 0) >= 100 and q.get("Clicks", 0) <= 2]
    opps.sort(key=lambda q: q.get("Impressions", 0), reverse=True)

    # URL-level opportunities: primero separamos aliases 301 que Bing todavía
    # reporta. Editar su snippet sería inútil; deben consolidarse en la canónica.
    page_candidates = []
    for p in pages:
        impressions = p.get("Impressions", 0) or 0
        clicks = p.get("Clicks", 0) or 0
        position = p.get("Position", 0) or 0
        page = p.get("Query", "") or ""
        page_ctr = clicks / impressions * 100 if impressions else 0
        gain_at_2pct = max(0, round(impressions * 0.02 - clicks))
        if impressions >= 500 and 3 <= position <= 10 and page_ctr < 2 and gain_at_2pct > 0:
            page_candidates.append({"page": page, "impressions": impressions, "clicks": clicks,
                                    "ctr": page_ctr, "position": position, "gain_at_2pct": gain_at_2pct})

    with ThreadPoolExecutor(max_workers=10) as pool:
        final_urls = list(pool.map(resolve_final_url, [p["page"] for p in page_candidates]))
    redirects = []
    page_opps = []
    for p, final_url in zip(page_candidates, final_urls):
        if final_url != p["page"].rstrip("/"):
            redirects.append({**p, "target": final_url})
        else:
            page_opps.append(p)
    redirects.sort(key=lambda p: p["impressions"], reverse=True)
    page_opps.sort(key=lambda p: p["gain_at_2pct"], reverse=True)
    # La API sí permite mapear página→consulta. Enriquecemos solo las 20 URLs
    # accionables para no multiplicar llamadas sobre aliases o páginas menores.
    with ThreadPoolExecutor(max_workers=8) as pool:
        page_query_rows = list(pool.map(get_page_query_stats, [p["page"] for p in page_opps[:20]]))
    page_queries = {item["page"]: item["queries"] for item in page_query_rows}

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
        "## Consultas de demanda a investigar (≥100 impr, ≤2 clicks)",
        "",
        "Son consultas globales para descubrir demanda. La sección por página más abajo usa `GetPageQueryStats` para confirmar qué URL respondió antes de cambiar title o contenido.",
        "",
        "| Query | Impr | Clicks | CTR |",
        "|---|---:|---:|---:|",
    ]
    if opps:
        for q in opps[:15]:
            qctr = (q.get("Clicks", 0) / q.get("Impressions", 1) * 100) if q.get("Impressions", 0) > 0 else 0
            lines.append(f"| {q.get('Query','?')} | {q.get('Impressions',0)} | {q.get('Clicks',0)} | {qctr:.2f}% |")
    else:
        lines.append("_Sin consultas candidatas esta semana._")

    lines += ["", "## Consolidación de redirects observados por Bing", "",
              "Estas URLs todavía reciben impresiones en Bing pero hoy redirigen. No se optimiza su snippet: se reenvían alias y canónica por IndexNow.", "",
              "| Alias observado | Impr | Clicks | Destino canónico |",
              "|---|---:|---:|---|"]
    if redirects:
        for p in redirects:
            lines.append(f"| {p['page']} | {p['impressions']} | {p['clicks']} | {p['target']} |")
    else:
        lines.append("_Sin aliases redirigidos dentro del set prioritario._")

    lines += ["", "## Oportunidades CTR por página (posición 3-10)", "",
              "Ordenadas por clics mensuales incrementales estimados si cada URL alcanza un CTR conservador de 2%.", "",
              "| Page | Impr | Clicks | CTR | Pos | Upside a 2% |",
              "|---|---:|---:|---:|---:|---:|"]
    if page_opps:
        for p in page_opps[:20]:
            path = urllib.parse.urlparse(p["page"]).path or "/"
            lines.append(f"| [{path}]({p['page']}) | {p['impressions']} | {p['clicks']} | {p['ctr']:.2f}% | {p['position']:.1f} | +{p['gain_at_2pct']} |")
    else:
        lines.append("_Sin URLs que cumplan los umbrales esta semana._")

    lines += [
        "",
        "## Consultas reales por oportunidad",
        "",
        "Top consultas de cada URL según `GetPageQueryStats`. Esto permite alinear snippets con demanda demostrada y detectar intención cruzada sin inferencias.",
        "",
        "| Página | Query | Impr | Clicks | CTR | Pos |",
        "|---|---|---:|---:|---:|---:|",
    ]
    query_detail_count = 0
    for p in page_opps[:20]:
        path = urllib.parse.urlparse(p["page"]).path or "/"
        for query in page_queries.get(p["page"], [])[:5]:
            impressions = query.get("Impressions", 0) or 0
            clicks = query.get("Clicks", 0) or 0
            qctr = clicks / impressions * 100 if impressions else 0
            lines.append(
                f"| [{path}]({p['page']}) | {query.get('Query','?')} | {impressions} | {clicks} | {qctr:.2f}% | {query.get('Position',0):.1f} |"
            )
            query_detail_count += 1
    if not query_detail_count:
        lines.append("_Bing no devolvió consultas por URL esta semana._")

    lines += [
        "",
        "## Señales de autoridad reconocidas por Bing",
        "",
        "`AnchorCount` es una señal interna de Bing, no un conteo de dominios de referencia. El objetivo es ver si la autoridad deja de concentrarse en la home y empieza a llegar a las páginas prioritarias.",
        "",
        "| Activo | URL | AnchorCount | Δ semanal |",
        "|---|---|---:|---:|",
    ]
    for item in authority:
        anchors = item["anchors"]
        previous = previous_anchors.get(item["label"])
        if anchors is None:
            anchor_text, delta_text = "?", "?"
        else:
            anchor_text = f"{anchors:,}"
            delta_text = "—" if previous is None else f"{anchors - previous:+,}"
        lines.append(f"| {item['label']} | {item['url']} | {anchor_text} | {delta_text} |")

    lines += [
        "",
        "## Top 10 pages Bing",
        "",
        "| Page | Impr | Clicks |",
        "|---|---:|---:|",
    ]
    for p in pages[:10]:
        page = p.get("Query", "") or "(no URL reported)"
        path = urllib.parse.urlparse(page).path or "/"
        lines.append(f"| [{path}]({page}) | {p.get('Impressions',0)} | {p.get('Clicks',0)} |")

    lines += [
        "",
        "---",
        "",
        "_Generado por `scripts/bing-weekly-pulse.py`. Regla: solo mirar lunes._",
    ]

    out_file.write_text("\n".join(lines) + "\n")
    print(f"[bing-pulse] escrito {out_file.relative_to(ROOT)}", file=sys.stderr)
    print(f"\nQueries: {len(queries)} | Impr: {total_impr:,} | Clicks: {total_clicks} | CTR: {ctr:.2f}%", file=sys.stderr)
    print(f"Query candidates: {len(opps)} | Redirect aliases: {len(redirects)} | Page CTR opportunities: {len(page_opps)}", file=sys.stderr)


if __name__ == "__main__":
    main()
