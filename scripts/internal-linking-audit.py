#!/usr/bin/env python3
"""Internal linking audit — solo REPORTE, NO modifica calcs.

Genera docs/internal-linking/orphans-YYYY-MM-DD.md con:
  - Calcs orphan (0 backlinks vía relatedSlugs)
  - Calcs under-linked (<3 backlinks)
  - Sugerencias de links candidatos por cluster (categoría + audiencia + keyword overlap)

Martin decide qué batches aplicar manualmente. NO automatiza commits.

Uso:
  python3 scripts/internal-linking-audit.py
  python3 scripts/internal-linking-audit.py --category finanzas    # solo una cat
  python3 scripts/internal-linking-audit.py --top 50               # solo top 50 orphans
"""
from __future__ import annotations
import argparse
import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / "src" / "content" / "calcs"
OUT_DIR = ROOT / "docs" / "internal-linking"
OUT_DIR.mkdir(parents=True, exist_ok=True)


def load_calcs() -> list[dict]:
    out = []
    for f in CALCS_DIR.glob("*.json"):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            data["__file"] = f.name
            out.append(data)
        except Exception as e:
            print(f"⚠️  skip {f.name}: {e}")
    return out


def keyword_set(calc: dict) -> set[str]:
    """Tokens normalizados de h1 + seoKeywords + slug — para matching."""
    text = " ".join([
        calc.get("h1", ""),
        calc.get("title", ""),
        calc.get("slug", "").replace("-", " "),
        " ".join(calc.get("seoKeywords", []) or []),
    ]).lower()
    tokens = re.findall(r"[a-záéíóúñü]{4,}", text)  # palabras 4+ chars
    # Stopwords mínimas español
    STOP = {"para", "como", "cuanto", "calcular", "calculadora", "argentina",
            "online", "gratis", "este", "esta", "donde", "cuando", "porque",
            "cual", "puede", "hasta", "desde", "vista", "ahora", "tiene",
            "entre", "sobre", "luego", "antes", "todos", "todas"}
    return set(t for t in tokens if t not in STOP)


def cluster_score(a: dict, b: dict, a_kw: set[str], b_kw: set[str]) -> float:
    """Score 0..1 de qué tan similares son dos calcs para internal linking."""
    if a["slug"] == b["slug"]:
        return 0
    score = 0.0
    # Misma categoría: +0.4
    if a.get("category") and a.get("category") == b.get("category"):
        score += 0.4
    # Misma audiencia: +0.2
    if a.get("audience") == b.get("audience"):
        score += 0.2
    # Keyword overlap (jaccard): hasta +0.4
    if a_kw and b_kw:
        inter = len(a_kw & b_kw)
        union = len(a_kw | b_kw)
        score += 0.4 * (inter / union if union else 0)
    return min(1.0, score)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("--category", help="Filtrar a una categoría (finanzas, salud, etc.)")
    p.add_argument("--top", type=int, default=100, help="Máximo orphans a mostrar (default 100)")
    p.add_argument("--audience", default="AR", help="Audiencia (default AR)")
    args = p.parse_args()

    calcs = load_calcs()
    print(f"📚 {len(calcs)} calcs cargadas.")

    # Pre-computar keyword sets
    kw_cache: dict[str, set[str]] = {c["slug"]: keyword_set(c) for c in calcs if c.get("slug")}

    # Backlink count: cuántas calcs linkean a cada slug
    backlinks: dict[str, list[str]] = defaultdict(list)
    for c in calcs:
        related = c.get("relatedSlugs", []) or []
        for r in related:
            backlinks[r].append(c["slug"])

    # Filtros
    pool = [c for c in calcs if c.get("audience") == args.audience]
    if args.category:
        pool = [c for c in pool if c.get("category") == args.category]
    # Excluir calcs no-indexables si tienen ese flag
    pool = [c for c in pool if not c.get("noindex")]

    # Identificar orphans (0 backlinks) y under-linked (<3)
    enriched = []
    for c in pool:
        bl = backlinks.get(c["slug"], [])
        enriched.append({
            "slug": c["slug"],
            "h1": c.get("h1", ""),
            "category": c.get("category", ""),
            "audience": c.get("audience", ""),
            "backlinks": len(bl),
            "current_related": c.get("relatedSlugs", []) or [],
            "data": c,
        })

    orphans = sorted([e for e in enriched if e["backlinks"] == 0],
                     key=lambda e: e["h1"])[:args.top]
    under = sorted([e for e in enriched if 0 < e["backlinks"] < 3],
                   key=lambda e: e["backlinks"])[:args.top]

    # Sugerencias para orphans
    def suggest_for(calc_data: dict, n: int = 3) -> list[tuple[str, str, float]]:
        my_kw = kw_cache.get(calc_data["slug"], set())
        scored = []
        for other in pool:
            if other["slug"] == calc_data["slug"]:
                continue
            other_kw = kw_cache.get(other["slug"], set())
            s = cluster_score(calc_data, other, my_kw, other_kw)
            if s > 0.3:  # mínimo significativo
                scored.append((other["slug"], other.get("h1", ""), s))
        scored.sort(key=lambda x: x[2], reverse=True)
        return scored[:n]

    # Generar reporte markdown
    out_md = OUT_DIR / f"orphans-{date.today():%Y-%m-%d}.md"
    lines = [
        f"# Internal Linking Audit — {date.today():%Y-%m-%d}",
        "",
        f"**Pool:** {len(pool)} calcs (audience={args.audience}"
        + (f", category={args.category}" if args.category else "") + ", excluding noindex)",
        f"**Orphans (0 backlinks):** {len([e for e in enriched if e['backlinks'] == 0])}",
        f"**Under-linked (<3 backlinks):** {len([e for e in enriched if 0 < e['backlinks'] < 3])}",
        "",
        "## Cómo usar este reporte",
        "",
        "El playbook recomienda **máximo 3 links nuevos por calc, batches de 20**.",
        "No hacer cambios masivos en pocas horas (riesgo Core Update signal).",
        "Spreader cambios en 3-5 batches en una semana mínimo.",
        "",
        f"## Top {min(len(orphans), args.top)} orphans (0 backlinks) con sugerencias",
        "",
    ]

    for i, e in enumerate(orphans, 1):
        suggs = suggest_for(e["data"], 3)
        lines.append(f"### {i}. `{e['slug']}` — {e['h1']}")
        lines.append(f"_categoría: {e['category']} | audiencia: {e['audience']}_")
        lines.append("")
        if e["current_related"]:
            lines.append(f"`relatedSlugs` actual ({len(e['current_related'])}): "
                         + ", ".join(f"`{s}`" for s in e["current_related"][:5]))
        else:
            lines.append("`relatedSlugs` actual: vacío")
        lines.append("")
        if suggs:
            lines.append("Sugerencias (score 0..1):")
            for slug, h1, score in suggs:
                lines.append(f"- `{slug}` (score {score:.2f}) — {h1}")
        else:
            lines.append("Sin sugerencias claras (keyword/categoría no matchean lo suficiente).")
        lines.append("")

    if under:
        lines.append("")
        lines.append(f"## Top {min(len(under), 30)} under-linked (1-2 backlinks)")
        lines.append("")
        for e in under[:30]:
            lines.append(f"- `{e['slug']}` ({e['backlinks']} backlinks) — {e['h1']}")

    out_md.write_text("\n".join(lines), encoding="utf-8")
    print(f"💾 Reporte: {out_md}")
    print(f"   Orphans: {len([e for e in enriched if e['backlinks'] == 0])}")
    print(f"   Under-linked (<3): {len([e for e in enriched if 0 < e['backlinks'] < 3])}")
    print(f"   Bien linkeadas (3+): {len([e for e in enriched if e['backlinks'] >= 3])}")


if __name__ == "__main__":
    main()
