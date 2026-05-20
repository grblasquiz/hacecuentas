#!/usr/bin/env python3
"""
PSI Batch — corre PageSpeed Insights API sobre top URLs de hacecuentas.com
y reporta Core Web Vitals (LCP, INP, CLS, FCP, TBT, performance score).

Strategy:
  - Mobile-first (default) — coincide con como Google evalua el sitio.
  - Optionalmente desktop con --strategy=both para comparar.
  - Field data (CrUX real users) priorizado sobre lab (Lighthouse local).

Input URLs (en orden de prioridad):
  1. --urls-file <path>  : una URL o path por linea
  2. --top-gsc <N>       : top N URLs por impressions GSC (requiere $GOOGLE_INDEXING_CREDS)
  3. Hardcoded list      : top calcs core conocidas

Output:
  - docs/psi-batch-<YYYY-MM-DD>.md   : reporte con tabla resumen + recommendations
  - scripts/psi-batch-<YYYY-MM-DD>.json : data cruda

Auth: PSI_API_KEY en .env (ya esta).

Ejemplo:
  python3 scripts/psi-batch.py
  python3 scripts/psi-batch.py --strategy=both --top-gsc 30
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote_plus

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
SCRIPTS_DIR = ROOT / "scripts"
BASE_URL = "https://hacecuentas.com"

# Hardcoded fallback: top 20 calcs core de hacecuentas (mix de AR + matematica)
DEFAULT_URLS = [
    "/calculadora-porcentajes",
    "/calculadora-aguinaldo",
    "/calculadora-iva-saldo-favor-contra-ri",
    "/calculadora-monotributo-2026",
    "/inflacion-argentina",
    "/calculadora-indemnizacion-despido",
    "/calculadora-horas-extras",
    "/calculadora-plazo-fijo",
    "/calculadora-interes-compuesto",
    "/calculadora-vacaciones-no-gozadas-indemnizacion-formula",
    "/calculadora-imc",
    "/calculadora-calorias-deficit-mantener-superavit",
    "/calculadora-fecha-probable-parto",
    "/calculadora-regla-de-tres",
    "/conversor-celsius-fahrenheit-temperatura",
    "/conversor-kilogramos-libras-onzas",
    "/calculadora-descuentos",
    "/calculadora-cripto-tax-espana-irpf",  # depruned hoy
    "/calculadora-edad-humana-conejo-anos",  # depruned 19/5
    "/",  # home
]

def _load_env(env_path: Path) -> None:
    if not env_path.exists():
        return
    for line in env_path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))

_load_env(ROOT / ".env")


def psi_query(url: str, strategy: str = "mobile", api_key: str = None) -> dict:
    """Llama a PSI API y devuelve dict normalizado."""
    try:
        import requests
    except ImportError:
        return {"error": "pip install requests"}

    params = {
        "url": url,
        "strategy": strategy,
        "category": "performance",
        "locale": "es",
    }
    if api_key:
        params["key"] = api_key

    try:
        r = requests.get(
            "https://www.googleapis.com/pagespeedonline/v5/runPagespeed",
            params=params,
            timeout=120,
        )
        if r.status_code != 200:
            return {"error": f"HTTP {r.status_code}: {r.text[:200]}", "url": url}
        body = r.json()
    except Exception as e:
        return {"error": str(e), "url": url}

    out = {
        "url": url,
        "strategy": strategy,
        "fetched_at": body.get("analysisUTCTimestamp"),
    }

    # Lab data (Lighthouse synthetic)
    lh = body.get("lighthouseResult", {})
    cats = lh.get("categories", {})
    perf = cats.get("performance", {}) or {}
    out["perf_score"] = round((perf.get("score") or 0) * 100)
    audits = lh.get("audits", {}) or {}

    def _audit_ms(key: str) -> float | None:
        a = audits.get(key, {})
        v = a.get("numericValue")
        return round(v, 1) if isinstance(v, (int, float)) else None

    def _audit_n(key: str) -> float | None:
        a = audits.get(key, {})
        v = a.get("numericValue")
        return round(v, 3) if isinstance(v, (int, float)) else None

    out["lab"] = {
        "lcp_ms": _audit_ms("largest-contentful-paint"),
        "fcp_ms": _audit_ms("first-contentful-paint"),
        "tbt_ms": _audit_ms("total-blocking-time"),
        "speed_index_ms": _audit_ms("speed-index"),
        "interactive_ms": _audit_ms("interactive"),
        "cls": _audit_n("cumulative-layout-shift"),
    }

    # Field data (CrUX real users) — solo aparece si hay suficiente trafico real
    le = body.get("loadingExperience") or {}
    le_metrics = le.get("metrics") or {}

    def _crux(key: str) -> dict | None:
        m = le_metrics.get(key)
        if not m:
            return None
        return {
            "p75": m.get("percentile"),
            "category": m.get("category"),  # FAST | AVERAGE | SLOW
        }

    out["field"] = {
        "lcp": _crux("LARGEST_CONTENTFUL_PAINT_MS"),
        "inp": _crux("INTERACTION_TO_NEXT_PAINT"),
        "cls": _crux("CUMULATIVE_LAYOUT_SHIFT_SCORE"),
        "fcp": _crux("FIRST_CONTENTFUL_PAINT_MS"),
        "ttfb": _crux("EXPERIMENTAL_TIME_TO_FIRST_BYTE"),
        "overall": le.get("overall_category"),  # FAST | AVERAGE | SLOW
    }

    # Origin-level CrUX (todo el sitio, no esta URL especifica)
    ole = body.get("originLoadingExperience") or {}
    out["origin"] = {
        "overall": ole.get("overall_category"),
    }

    return out


def get_top_urls_from_gsc(n: int) -> list[str]:
    """Pull top N URLs by impressions from GSC last 28d."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        sys.stderr.write("⚠️  pip install google-auth google-api-python-client para --top-gsc\n")
        return []

    creds_path = os.path.expanduser(
        os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json")
    )
    if not os.path.exists(creds_path):
        sys.stderr.write(f"⚠️  No existen creds GSC en {creds_path}, usando hardcoded\n")
        return []

    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    s = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    from datetime import timedelta
    today = datetime.now(timezone.utc).date()
    end = (today - timedelta(days=3)).isoformat()
    start = (today - timedelta(days=30)).isoformat()

    resp = s.searchanalytics().query(
        siteUrl="sc-domain:hacecuentas.com",
        body={
            "startDate": start, "endDate": end,
            "dimensions": ["page"],
            "rowLimit": n,
            "dataState": "all",
        },
    ).execute()

    urls = []
    for row in resp.get("rows", []):
        page = row["keys"][0]
        path = page.replace("https://hacecuentas.com", "").replace("https://www.hacecuentas.com", "")
        if path and path not in urls:
            urls.append(path)
    return urls[:n]


def _category_emoji(cat: str | None) -> str:
    return {"FAST": "🟢", "AVERAGE": "🟡", "SLOW": "🔴"}.get(cat or "", "—")


def _score_emoji(score: int) -> str:
    if score >= 90: return "🟢"
    if score >= 50: return "🟡"
    return "🔴"


def _format_ms(v) -> str:
    if v is None: return "—"
    return f"{int(v)}" if v >= 1000 else f"{v:.0f}"


def _format_cls(v) -> str:
    if v is None: return "—"
    return f"{v:.3f}"


def write_markdown(results: list[dict], out: Path, strategy: str) -> None:
    date = datetime.now(timezone.utc).date().isoformat()

    # Resumen
    valid = [r for r in results if "error" not in r]
    avg_perf = sum(r.get("perf_score", 0) for r in valid) / len(valid) if valid else 0
    poor_lcp = sum(1 for r in valid if (r.get("lab", {}).get("lcp_ms") or 0) > 2500)
    poor_cls = sum(1 for r in valid if (r.get("lab", {}).get("cls") or 0) > 0.1)
    poor_tbt = sum(1 for r in valid if (r.get("lab", {}).get("tbt_ms") or 0) > 200)

    field_data = [r for r in valid if r.get("field", {}).get("overall")]

    lines = [
        f"# PSI Batch — {date} ({strategy})",
        "",
        f"URLs analizadas: **{len(results)}** · Strategy: **{strategy}** · Locale: **es**",
        "",
        f"Score performance promedio: **{avg_perf:.0f}/100** "
        f"{'🟢' if avg_perf >= 90 else '🟡' if avg_perf >= 50 else '🔴'}",
        "",
        f"- LCP > 2.5s (lab):  **{poor_lcp}/{len(valid)} URLs** {'✗' if poor_lcp > 0 else '✓'}",
        f"- CLS > 0.1 (lab):   **{poor_cls}/{len(valid)} URLs** {'✗' if poor_cls > 0 else '✓'}",
        f"- TBT > 200ms (lab): **{poor_tbt}/{len(valid)} URLs** {'✗' if poor_tbt > 0 else '✓'}",
        f"- URLs con CrUX field data (suficiente trafico real): **{len(field_data)}/{len(valid)}**",
        "",
        "## Lab data (Lighthouse synthetic)",
        "",
        "| URL | Score | LCP | FCP | TBT | CLS | TTI |",
        "|-----|------:|----:|----:|----:|----:|----:|",
    ]
    for r in valid:
        lab = r.get("lab", {})
        e = _score_emoji(r["perf_score"])
        lines.append(
            f"| `{r['url'].replace(BASE_URL, '')[:50]}` | {e} {r['perf_score']} | "
            f"{_format_ms(lab.get('lcp_ms'))} | {_format_ms(lab.get('fcp_ms'))} | "
            f"{_format_ms(lab.get('tbt_ms'))} | {_format_cls(lab.get('cls'))} | "
            f"{_format_ms(lab.get('interactive_ms'))} |"
        )

    if field_data:
        lines.extend([
            "",
            "## Field data (CrUX p75 — usuarios reales últimos 28d)",
            "",
            "| URL | Overall | LCP p75 | INP p75 | CLS p75 | TTFB p75 |",
            "|-----|:-------:|--------:|--------:|--------:|---------:|",
        ])
        for r in field_data:
            f = r["field"]
            lcp = f.get("lcp") or {}
            inp = f.get("inp") or {}
            cls = f.get("cls") or {}
            ttfb = f.get("ttfb") or {}
            lines.append(
                f"| `{r['url'].replace(BASE_URL, '')[:50]}` | "
                f"{_category_emoji(f.get('overall'))} {f.get('overall', '—')} | "
                f"{_category_emoji(lcp.get('category'))} {_format_ms(lcp.get('p75'))} | "
                f"{_category_emoji(inp.get('category'))} {_format_ms(inp.get('p75'))} | "
                f"{_category_emoji(cls.get('category'))} {_format_cls((cls.get('p75') or 0) / 100)} | "
                f"{_category_emoji(ttfb.get('category'))} {_format_ms(ttfb.get('p75'))} |"
            )

    errors = [r for r in results if "error" in r]
    if errors:
        lines.extend(["", "## Errores", ""])
        for r in errors:
            lines.append(f"- `{r.get('url', '?')}`: {r['error'][:150]}")

    # Recomendaciones
    lines.extend([
        "",
        "## Recomendaciones automaticas",
        "",
    ])
    if poor_lcp > 0:
        worst_lcp = sorted(valid, key=lambda x: x.get("lab", {}).get("lcp_ms") or 0, reverse=True)[:3]
        lines.append("**LCP > 2.5s** — Largest Contentful Paint lento. Top 3 a revisar:")
        for r in worst_lcp:
            if (r.get("lab", {}).get("lcp_ms") or 0) > 2500:
                lines.append(f"- `{r['url'].replace(BASE_URL, '')}` : {r['lab']['lcp_ms']}ms")
        lines.append("Action: preload imagenes hero, optimizar CSS critico inline, defer no-critical JS.")
        lines.append("")

    if poor_cls > 0:
        worst_cls = sorted(valid, key=lambda x: x.get("lab", {}).get("cls") or 0, reverse=True)[:3]
        lines.append("**CLS > 0.1** — Layout shift. Top 3 a revisar:")
        for r in worst_cls:
            if (r.get("lab", {}).get("cls") or 0) > 0.1:
                lines.append(f"- `{r['url'].replace(BASE_URL, '')}` : {r['lab']['cls']}")
        lines.append("Action: reservar height en imagenes, ad slots, embeds.")
        lines.append("")

    if poor_tbt > 0:
        worst_tbt = sorted(valid, key=lambda x: x.get("lab", {}).get("tbt_ms") or 0, reverse=True)[:3]
        lines.append("**TBT > 200ms** — Total Blocking Time alto (mala señal INP). Top 3 a revisar:")
        for r in worst_tbt:
            if (r.get("lab", {}).get("tbt_ms") or 0) > 200:
                lines.append(f"- `{r['url'].replace(BASE_URL, '')}` : {r['lab']['tbt_ms']}ms")
        lines.append("Action: code-split JS, defer Adsense / analytics, reducir main thread work.")
        lines.append("")

    if len(field_data) < len(valid) / 2:
        lines.append(
            "**Pocas URLs con CrUX field data** — Google no tiene suficientes user samples para "
            "estas paginas. Indica trafico organíco bajo (consistente con HCU penalty)."
        )
        lines.append("")

    out.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--urls-file", type=Path, help="Archivo con URLs (paths o full URLs)")
    ap.add_argument("--top-gsc", type=int, default=0, help="Top N URLs por impressions GSC")
    ap.add_argument("--strategy", choices=["mobile", "desktop", "both"], default="mobile")
    ap.add_argument("--api-key", default=os.environ.get("PSI_API_KEY"), help="PSI API key (default $PSI_API_KEY)")
    args = ap.parse_args()

    # Resolver URLs
    if args.urls_file:
        urls = [u.strip() for u in args.urls_file.read_text().splitlines() if u.strip() and not u.startswith("#")]
    elif args.top_gsc:
        print(f"Pulling top {args.top_gsc} URLs from GSC...", file=sys.stderr)
        urls = get_top_urls_from_gsc(args.top_gsc)
        if not urls:
            print("⚠️  GSC vacio, usando hardcoded", file=sys.stderr)
            urls = DEFAULT_URLS
    else:
        urls = DEFAULT_URLS

    # Normalizar paths a full URLs
    urls = [u if u.startswith("http") else f"{BASE_URL}{u if u.startswith('/') else '/' + u}" for u in urls]

    strategies = ["mobile", "desktop"] if args.strategy == "both" else [args.strategy]
    print(f"Analizando {len(urls)} URLs en {len(strategies)} strategy(s) = {len(urls) * len(strategies)} calls", file=sys.stderr)
    print(f"PSI API key: {'configurada' if args.api_key else 'NO (rate limit bajo)'}\n", file=sys.stderr)

    all_results: list[dict] = []
    for strategy in strategies:
        for i, url in enumerate(urls, 1):
            print(f"  [{strategy} {i}/{len(urls)}] {url.replace(BASE_URL, '')[:60]}", file=sys.stderr)
            r = psi_query(url, strategy=strategy, api_key=args.api_key)
            all_results.append(r)
            time.sleep(0.5)  # ser amable con la API

    date = datetime.now(timezone.utc).date().isoformat()
    DOCS_DIR.mkdir(exist_ok=True)

    if args.strategy == "both":
        for strategy in strategies:
            results = [r for r in all_results if r.get("strategy") == strategy]
            md_path = DOCS_DIR / f"psi-batch-{date}-{strategy}.md"
            write_markdown(results, md_path, strategy)
            print(f"Reporte {strategy}: {md_path}", file=sys.stderr)
    else:
        md_path = DOCS_DIR / f"psi-batch-{date}-{args.strategy}.md"
        write_markdown(all_results, md_path, args.strategy)
        print(f"Reporte: {md_path}", file=sys.stderr)

    json_path = SCRIPTS_DIR / f"psi-batch-{date}.json"
    json_path.write_text(json.dumps({
        "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
        "strategy": args.strategy,
        "urls_count": len(urls),
        "results": all_results,
    }, indent=2), encoding="utf-8")
    print(f"Data:    {json_path}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
