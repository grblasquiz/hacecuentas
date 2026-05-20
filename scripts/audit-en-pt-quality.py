#!/usr/bin/env python3
"""
Audit calcs-en y calcs-pt: quality score + GSC traffic + accion recomendada.

Strategy: cada calc se evalua en 8 dimensiones que predicen si Google la
considera valuable o thin content. El score (0-100) + el trafico real GSC
determinan el verdict:

  - PROMOTE       : tiene trafico, hay que mejorarla y des-noindexarla
  - KEEP          : contenido solido aunque sin trafico, vale apostar
  - IMPROVE       : tiene potencial pero falta angle local fuerte
  - KILL_410      : thin content + 0 trafico, candidata a 410 Gone

Criterios de quality score (cada uno suma puntos):

  1. Audience especifico (US/UK para EN, BR para PT) (+20)
     vs audience: global (penaliza, suma 0)
  2. Explanation >= 1500 chars (+15) o >= 800 (+8)
  3. FAQ count >= 5 (+10) o >= 3 (+5)
  4. Sources con URLs locales (.gov/.org del pais) (+15)
  5. HowTo steps >= 4 (+5)
  6. Reviewer profesional (no "Equipo Hacé Cuentas") (+10)
  7. dataUpdate.frequency != 'never' (+10)
  8. lastReviewed dentro de 90 dias (+5)

Output:
  - docs/audit-en-pt-<YYYY-MM-DD>.md   : reporte con tabla + recomendaciones
  - scripts/audit-en-pt-<YYYY-MM-DD>.json : data cruda

Ejemplo:
  python3 scripts/audit-en-pt-quality.py
"""
from __future__ import annotations

import json
import os
import sys
from collections import Counter
from datetime import datetime, timedelta, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
SCRIPTS_DIR = ROOT / "scripts"

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


# ---- Quality scoring -----------------------------------------------------

LOCAL_DOMAINS_BY_LOCALE = {
    "en": [".gov", ".edu", "irs.gov", "cdc.gov", "fda.gov", "ssa.gov", "bls.gov"],
    "pt": [".gov.br", ".org.br", ".com.br", "anvisa.gov.br", "ibge.gov.br", "receita.fazenda.gov.br"],
}

VALID_AUDIENCE_BY_LOCALE = {
    "en": {"EN", "US", "UK"},  # NO global
    "pt": {"BR", "PT"},        # NO global, NO lowercase br ideal
}


def score_calc(calc: dict, locale: str) -> dict:
    score = 0
    signals = {}

    # 1. Audience especifico
    aud = calc.get("audience", "")
    if aud.upper() in VALID_AUDIENCE_BY_LOCALE.get(locale, set()):
        score += 20
        signals["audience_local"] = True
    elif aud and aud != "global":
        score += 5
        signals["audience_partial"] = aud
    else:
        signals["audience_global"] = True

    # 2. Explanation length
    explanation = calc.get("explanation", "") or ""
    if len(explanation) >= 1500:
        score += 15
        signals["explanation_long"] = True
    elif len(explanation) >= 800:
        score += 8
    else:
        signals["explanation_short"] = len(explanation)

    # 3. FAQ count
    faq = calc.get("faq") or []
    if len(faq) >= 5:
        score += 10
        signals["faq_strong"] = len(faq)
    elif len(faq) >= 3:
        score += 5
    else:
        signals["faq_weak"] = len(faq)

    # 4. Sources locales
    sources = calc.get("sources") or []
    local_sources = 0
    for s in sources:
        url = (s.get("url") or "").lower() if isinstance(s, dict) else ""
        for d in LOCAL_DOMAINS_BY_LOCALE.get(locale, []):
            if d in url:
                local_sources += 1
                break
    if local_sources >= 2:
        score += 15
        signals["sources_local"] = local_sources
    elif local_sources >= 1:
        score += 8
        signals["sources_local"] = local_sources
    elif sources:
        signals["sources_non_local"] = len(sources)

    # 5. HowTo
    howto = calc.get("howToSteps") or []
    if len(howto) >= 4:
        score += 5
        signals["howto_strong"] = len(howto)

    # 6. Reviewer profesional
    reviewer = calc.get("reviewer") or {}
    if isinstance(reviewer, dict) and reviewer.get("name") and "equipo" not in reviewer.get("name", "").lower():
        score += 10
        signals["reviewer_pro"] = reviewer.get("name")

    # 7. Data live
    du = calc.get("dataUpdate") or {}
    if du.get("frequency") and du["frequency"] != "never":
        score += 10
        signals["data_live"] = du.get("frequency")

    # 8. lastReviewed reciente
    last = calc.get("lastReviewed")
    if last:
        try:
            d = datetime.strptime(last, "%Y-%m-%d").replace(tzinfo=timezone.utc)
            days = (datetime.now(timezone.utc) - d).days
            if days <= 90:
                score += 5
                signals["recent_review"] = days
        except Exception:
            pass

    return {"score": score, "signals": signals}


def verdict(score: int, impressions: int, clicks: int, noindex: bool) -> str:
    # PROMOTE: trafico real (impressions>=10 o clicks>0) AND noindex actualmente
    if (impressions >= 10 or clicks > 0) and noindex:
        return "PROMOTE"
    # KEEP: trafico real Y ya esta indexado
    if (impressions >= 10 or clicks > 0) and not noindex:
        return "KEEP"
    # IMPROVE: sin trafico pero score alto (60+) → vale apostar
    if score >= 60 and not noindex:
        return "IMPROVE"
    # IMPROVE_HIDDEN: score alto pero noindex → quitar noindex + mejorar
    if score >= 60 and noindex:
        return "UNINDEX"
    # KILL: sin trafico Y score bajo
    if impressions == 0 and score < 40:
        return "KILL_410"
    # REVIEW manual
    return "REVIEW"


# ---- GSC ----------------------------------------------------------------

def pull_gsc_data() -> dict[str, dict]:
    """Pull GSC last 30d, return dict[path] -> {clicks, impressions, position}."""
    try:
        from google.oauth2 import service_account
        from googleapiclient.discovery import build
    except ImportError:
        print("pip install google-auth google-api-python-client", file=sys.stderr)
        return {}

    creds_path = os.path.expanduser(
        os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json")
    )
    if not os.path.exists(creds_path):
        return {}

    creds = service_account.Credentials.from_service_account_file(
        creds_path, scopes=["https://www.googleapis.com/auth/webmasters.readonly"]
    )
    s = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    today = datetime.now(timezone.utc).date()
    end = (today - timedelta(days=3)).isoformat()
    start = (today - timedelta(days=30)).isoformat()

    all_rows = []
    start_row = 0
    while True:
        resp = s.searchanalytics().query(
            siteUrl="sc-domain:hacecuentas.com",
            body={
                "startDate": start, "endDate": end,
                "dimensions": ["page"],
                "rowLimit": 25000, "startRow": start_row, "dataState": "all",
            },
        ).execute()
        rows = resp.get("rows", [])
        if not rows: break
        all_rows.extend(rows)
        if len(rows) < 25000: break
        start_row += 25000

    out = {}
    for row in all_rows:
        page = row["keys"][0].replace("https://hacecuentas.com", "").replace("https://www.hacecuentas.com", "")
        out[page] = {
            "clicks": int(row.get("clicks", 0)),
            "impressions": int(row.get("impressions", 0)),
            "position": float(row.get("position", 0)),
        }
    return out


# ---- Main ---------------------------------------------------------------

def main() -> int:
    print("Pulling GSC data (30d)...", file=sys.stderr)
    gsc = pull_gsc_data()
    print(f"  {len(gsc)} URLs con data GSC\n", file=sys.stderr)

    results = []
    for locale in ("en", "pt"):
        dir_path = ROOT / "src" / "content" / f"calcs-{locale}"
        for f in sorted(dir_path.glob("*.json")):
            try:
                calc = json.loads(f.read_text(encoding="utf-8"))
            except Exception:
                continue
            slug = calc.get("slug") or f.stem
            path = f"/{locale}/{slug}"
            stats = gsc.get(path, {"clicks": 0, "impressions": 0, "position": 0})
            q = score_calc(calc, locale)
            v = verdict(
                q["score"],
                stats["impressions"],
                stats["clicks"],
                bool(calc.get("noindex")),
            )
            results.append({
                "locale": locale,
                "slug": slug,
                "path": path,
                "noindex": bool(calc.get("noindex")),
                "audience": calc.get("audience"),
                "explanation_chars": len(calc.get("explanation") or ""),
                "faq_count": len(calc.get("faq") or []),
                "sources_count": len(calc.get("sources") or []),
                "howto_count": len(calc.get("howToSteps") or []),
                "data_frequency": (calc.get("dataUpdate") or {}).get("frequency"),
                "last_reviewed": calc.get("lastReviewed"),
                "score": q["score"],
                "signals": q["signals"],
                **stats,
                "verdict": v,
            })

    # Sort
    results.sort(key=lambda x: (-x["impressions"], -x["score"]))

    # Stats
    by_locale = {"en": [], "pt": []}
    for r in results:
        by_locale[r["locale"]].append(r)

    date = datetime.now(timezone.utc).date().isoformat()
    md_path = DOCS_DIR / f"audit-en-pt-{date}.md"
    json_path = SCRIPTS_DIR / f"audit-en-pt-{date}.json"

    lines = [
        f"# Audit calcs-en y calcs-pt — {date}",
        "",
        "Strategy: score 0-100 por quality + GSC traffic 30d → verdict.",
        "",
    ]

    for locale in ("en", "pt"):
        rows = by_locale[locale]
        if not rows: continue
        verdict_counts = Counter(r["verdict"] for r in rows)
        total_impr = sum(r["impressions"] for r in rows)
        total_clicks = sum(r["clicks"] for r in rows)
        avg_score = sum(r["score"] for r in rows) / len(rows)
        noindex_count = sum(1 for r in rows if r["noindex"])
        local_aud = sum(1 for r in rows if r.get("audience", "").upper() in VALID_AUDIENCE_BY_LOCALE[locale])

        lines.extend([
            f"## {locale.upper()} ({len(rows)} calcs)",
            "",
            f"- noindex: **{noindex_count}** ({100*noindex_count/len(rows):.0f}%)",
            f"- audience local ({'/'.join(VALID_AUDIENCE_BY_LOCALE[locale])}): **{local_aud}** ({100*local_aud/len(rows):.0f}%)",
            f"- Total impressions/30d: **{total_impr}**",
            f"- Total clicks/30d: **{total_clicks}**",
            f"- Score quality promedio: **{avg_score:.1f}/100**",
            "",
            f"**Verdict breakdown:**",
            f"- 🟢 KEEP (tiene trafico + indexed): {verdict_counts['KEEP']}",
            f"- 🟢 PROMOTE (tiene trafico + noindex → des-noindex): {verdict_counts['PROMOTE']}",
            f"- 🟡 IMPROVE (score>=60 sin trafico): {verdict_counts['IMPROVE']}",
            f"- 🟡 UNINDEX (score>=60 + noindex → unindex): {verdict_counts['UNINDEX']}",
            f"- 🟡 REVIEW (caso ambiguo): {verdict_counts['REVIEW']}",
            f"- 🔴 KILL_410 (sin trafico + score<40): {verdict_counts['KILL_410']}",
            "",
        ])

        for v in ("KEEP", "PROMOTE", "IMPROVE", "UNINDEX"):
            v_rows = [r for r in rows if r["verdict"] == v]
            if not v_rows: continue
            v_rows.sort(key=lambda x: (-x["impressions"], -x["score"]))
            lines.extend([
                f"### {locale.upper()} → {v} ({len(v_rows)})",
                "",
                "| Score | Path | Audience | Impr | Clicks | Pos | NoIdx | FAQ | Explan |",
                "|------:|------|----------|-----:|-------:|----:|:-----:|----:|------:|",
            ])
            for r in v_rows[:50]:
                lines.append(
                    f"| {r['score']} | `{r['path']}` | {r['audience'] or '—'} | "
                    f"{r['impressions']} | {r['clicks']} | {r['position']:.1f} | "
                    f"{'✗' if r['noindex'] else '✓'} | {r['faq_count']} | {r['explanation_chars']} |"
                )
            if len(v_rows) > 50:
                lines.append(f"| ... | _{len(v_rows) - 50} mas_ | | | | | | | |")
            lines.append("")

        # KILL list (summary, no tabla — son muchos)
        kill_rows = [r for r in rows if r["verdict"] == "KILL_410"]
        if kill_rows:
            lines.extend([
                f"### {locale.upper()} → KILL_410 ({len(kill_rows)})",
                "",
                f"URLs con score <40 + 0 impressions. Agregar a `src/lib/gone-410.ts` para 410 Gone.",
                "",
                "Score distribution:",
            ])
            score_buckets = Counter()
            for r in kill_rows:
                bucket = (r["score"] // 10) * 10
                score_buckets[bucket] += 1
            for b in sorted(score_buckets):
                lines.append(f"- {b}-{b+9}: {score_buckets[b]} calcs")
            lines.append("")
            lines.append("Sample (top 20 by score, mas salvables del grupo):")
            for r in sorted(kill_rows, key=lambda x: -x["score"])[:20]:
                lines.append(f"- score {r['score']:3} | `{r['path']}` | {r['audience'] or '—'} | FAQ:{r['faq_count']} Explan:{r['explanation_chars']}c")
            lines.append("")

    # Plan de accion
    en = by_locale["en"]
    pt = by_locale["pt"]
    lines.extend([
        "## Plan de accion sugerido",
        "",
        "### Para salvar (sin penalty)",
        "",
        "Las URLs categorizadas como **KEEP / PROMOTE / IMPROVE / UNINDEX** son salvables, pero Google las premiara solo si:",
        "",
        "1. **Audience especifico** (NO `global`). Para EN cambiar a `US` o `UK` segun mercado real.",
        "   Para PT cambiar `br` lowercase → `BR` uppercase + agregar `audience: BR` donde falte.",
        "2. **Contenido local diferenciado** (NO traduccion literal del AR):",
        "   - Ejemplos con monedas locales (USD/GBP para EN, BRL para PT)",
        "   - Datos fiscales/legales locales (IRS si es US, ANVISA si es BR)",
        "   - Casos de uso especificos del mercado (no \"Argentina\" genericos)",
        "3. **Sources locales** (.gov.br, .org.br para PT; .gov, .edu para US/EN):",
        "   - Sin sources locales, Google la trata como translation farm",
        "4. **lastReviewed reciente** (< 90 dias) + reviewer profesional",
        "   - YMYL (salud, impuestos, legal) exige author/reviewer real, no \"Equipo Hace Cuentas\"",
        "5. **Internal links** desde la version AR (`<a href=\"/en/X\">English version</a>`)",
        "   - Senial de authority transfer",
        "",
        "### Para matar (410 Gone)",
        "",
        f"**KILL_410: {sum(1 for r in en if r['verdict'] == 'KILL_410')} URLs EN + {sum(1 for r in pt if r['verdict'] == 'KILL_410')} URLs PT** = "
        f"**{sum(1 for r in en + pt if r['verdict'] == 'KILL_410')} total** a agregar a `src/lib/gone-410.ts`.",
        "",
        "Criterio: 0 impressions/30d + quality score <40 (audience global, contenido corto, sin sources locales).",
        "Estas son thin content puras post-HCU. Conservarlas:",
        "- Consume crawl budget que podria ir al AR (donde si hay trafico)",
        "- Mantiene la senal de 'translation farm' que potencia HCU penalty",
        "- Cero downside de matarlas (no traen trafico)",
        "",
        "### Como aplicar",
        "",
        "1. Re-correr este script con `--apply` (futuro feature) o manualmente:",
        "   - PROMOTE: editar JSON, quitar `\"noindex\": true`",
        "   - UNINDEX: igual + mejorar contenido (audience local + sources)",
        "   - IMPROVE: agregar audience local + sources locales + reviewer real",
        "   - KILL_410: agregar path a `src/lib/gone-410.ts` (set)",
        "2. `npm run build` + `wrangler deploy` + CF purge",
        "3. Re-correr audit en 30d para medir si Google empezo a indexar las salvadas",
        "",
    ])

    md_path.parent.mkdir(exist_ok=True)
    md_path.write_text("\n".join(lines), encoding="utf-8")
    json_path.write_text(json.dumps({
        "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
        "total": len(results),
        "results": results,
    }, indent=2), encoding="utf-8")

    # Stats stdout
    print(f"\nResultados totales:", file=sys.stderr)
    for locale in ("en", "pt"):
        rows = by_locale[locale]
        if not rows: continue
        vc = Counter(r["verdict"] for r in rows)
        print(f"\n{locale.upper()} ({len(rows)} calcs):", file=sys.stderr)
        for v in ("KEEP", "PROMOTE", "IMPROVE", "UNINDEX", "REVIEW", "KILL_410"):
            print(f"  {v:<10} {vc.get(v, 0):>4}", file=sys.stderr)

    print(f"\nReporte: {md_path}", file=sys.stderr)
    print(f"Data:    {json_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
