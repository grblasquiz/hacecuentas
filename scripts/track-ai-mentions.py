#!/usr/bin/env python3
"""
AI Mentions Tracker — detecta si hacecuentas.com es citado por motores de
busqueda con IA (Claude, ChatGPT Search, Perplexity) para queries clave.

Strategy: para cada query del archivo `ai-mentions-queries.txt`, llamamos a
cada engine habilitado y registramos:
  - Si hacecuentas.com aparece en las citations (URLs citadas)
  - Posicion en la lista de citations (1-based)
  - Si aparece textualmente en la respuesta narrativa
  - Snippet del texto que menciona

Output:
  - docs/ai-mentions-<YYYY-MM-DD>.md    : reporte legible
  - scripts/ai-mentions-<YYYY-MM-DD>.json : data cruda
  - scripts/ai-mentions-history.json     : timeseries (append por corrida)

Engines soportados (cada uno opcional segun env vars):
  - claude       (ANTHROPIC_API_KEY) — web_search tool nativo
  - openai       (OPENAI_API_KEY)    — gpt-4o-search-preview
  - perplexity   (PERPLEXITY_API_KEY) — sonar model con web search

Ejemplo:
  python3 scripts/track-ai-mentions.py
  python3 scripts/track-ai-mentions.py --engines claude --queries-file custom.txt
  python3 scripts/track-ai-mentions.py --no-history  # skip el append a history
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DOCS_DIR = ROOT / "docs"
SCRIPTS_DIR = ROOT / "scripts"
DEFAULT_QUERIES = SCRIPTS_DIR / "ai-mentions-queries.txt"
HISTORY_FILE = SCRIPTS_DIR / "ai-mentions-history.json"
DOMAIN = "hacecuentas.com"

# Cargar .env si existe (mismo pattern que cf-purge-cache.sh)
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


# ---- Engines ------------------------------------------------------------

def _domain_in_url(url: str, domain: str = DOMAIN) -> bool:
    try:
        return domain in url.lower()
    except Exception:
        return False


def _find_mention(text: str, citations: list[str]) -> dict:
    """Detecta si hacecuentas.com aparece en text o citations."""
    text_lower = (text or "").lower()
    in_text = DOMAIN in text_lower
    mentioned_urls = [u for u in citations if _domain_in_url(u)]
    in_citations = len(mentioned_urls) > 0
    rank = None
    if in_citations:
        rank = next(
            (i + 1 for i, u in enumerate(citations) if _domain_in_url(u)),
            None,
        )
    # snippet: primeras 200 chars alrededor del primer match
    snippet = ""
    if in_text:
        i = text_lower.find(DOMAIN)
        start = max(0, i - 80)
        end = min(len(text), i + 120)
        snippet = text[start:end].replace("\n", " ").strip()
    return {
        "mentioned": in_text or in_citations,
        "in_text": in_text,
        "in_citations": in_citations,
        "mentioned_urls": mentioned_urls,
        "rank": rank,
        "snippet": snippet,
    }


def query_claude(query: str) -> dict:
    """Claude con web_search tool nativo. Devuelve text + citations."""
    import anthropic
    client = anthropic.Anthropic()
    try:
        resp = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=1024,
            tools=[{
                "type": "web_search_20250305",
                "name": "web_search",
                "max_uses": 3,
            }],
            messages=[{"role": "user", "content": query}],
        )
    except Exception as e:
        return {"error": str(e), "text": "", "citations": []}

    text_parts: list[str] = []
    citations: list[str] = []
    for block in resp.content:
        btype = getattr(block, "type", None)
        if btype == "text":
            text_parts.append(getattr(block, "text", ""))
        elif btype == "web_search_tool_result":
            content = getattr(block, "content", None)
            if isinstance(content, list):
                for item in content:
                    url = getattr(item, "url", None)
                    if url and url not in citations:
                        citations.append(url)
    return {
        "text": "\n".join(text_parts),
        "citations": citations,
        "model": "claude-sonnet-4-5",
    }


def query_openai(query: str) -> dict:
    """OpenAI con web search nativo (gpt-4o-search-preview)."""
    try:
        from openai import OpenAI
    except ImportError:
        return {"error": "pip install openai", "text": "", "citations": []}
    client = OpenAI()
    try:
        resp = client.chat.completions.create(
            model="gpt-4o-search-preview",
            web_search_options={"search_context_size": "medium"},
            messages=[{"role": "user", "content": query}],
        )
    except Exception as e:
        return {"error": str(e), "text": "", "citations": []}

    text = resp.choices[0].message.content or ""
    citations: list[str] = []
    # OpenAI devuelve citations en message.annotations[].url_citation.url
    annotations = getattr(resp.choices[0].message, "annotations", None) or []
    for ann in annotations:
        url_cit = getattr(ann, "url_citation", None) or ann.get("url_citation") if isinstance(ann, dict) else None
        if url_cit:
            url = getattr(url_cit, "url", None) or (url_cit.get("url") if isinstance(url_cit, dict) else None)
            if url and url not in citations:
                citations.append(url)
    return {"text": text, "citations": citations, "model": "gpt-4o-search-preview"}


def query_perplexity(query: str) -> dict:
    """Perplexity sonar model con web search built-in."""
    api_key = os.environ.get("PERPLEXITY_API_KEY")
    if not api_key:
        return {"error": "PERPLEXITY_API_KEY missing", "text": "", "citations": []}
    try:
        import urllib.request
        req = urllib.request.Request(
            "https://api.perplexity.ai/chat/completions",
            method="POST",
            headers={
                "Authorization": f"Bearer {api_key}",
                "Content-Type": "application/json",
            },
            data=json.dumps({
                "model": "sonar",
                "messages": [{"role": "user", "content": query}],
                "max_tokens": 800,
                "return_citations": True,
            }).encode("utf-8"),
        )
        with urllib.request.urlopen(req, timeout=60) as r:
            body = json.loads(r.read().decode("utf-8"))
    except Exception as e:
        return {"error": str(e), "text": "", "citations": []}

    text = body.get("choices", [{}])[0].get("message", {}).get("content", "")
    citations = body.get("citations") or []
    if not isinstance(citations, list):
        citations = []
    return {"text": text, "citations": citations, "model": "sonar"}


ENGINES = {
    "claude":     {"fn": query_claude,     "env": "ANTHROPIC_API_KEY"},
    "openai":     {"fn": query_openai,     "env": "OPENAI_API_KEY"},
    "perplexity": {"fn": query_perplexity, "env": "PERPLEXITY_API_KEY"},
}


# ---- IO -----------------------------------------------------------------

def load_queries(path: Path) -> list[str]:
    if not path.exists():
        sys.exit(f"No existe {path}")
    out: list[str] = []
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.split("#", 1)[0].strip()
        if line:
            out.append(line)
    return out


def write_markdown(items: list[dict], out: Path, date: str, engines: list[str]) -> None:
    lines = [
        f"# AI Mentions Tracker — {date}",
        "",
        f"Engines: **{', '.join(engines)}** · Domain: **{DOMAIN}** · Queries: **{len({i['query'] for i in items})}**",
        "",
        "## Resumen por engine",
        "",
        "| Engine | Queries | Mencionado | % | Rank promedio |",
        "|--------|--------:|-----------:|--:|--------------:|",
    ]
    for e in engines:
        rows = [i for i in items if i["engine"] == e and "error" not in i]
        total = len(rows)
        mentioned = sum(1 for r in rows if r["mentioned"])
        pct = (mentioned / total * 100) if total else 0
        ranks = [r["rank"] for r in rows if r.get("rank")]
        avg_rank = (sum(ranks) / len(ranks)) if ranks else None
        avg_str = f"{avg_rank:.1f}" if avg_rank else "—"
        lines.append(f"| {e} | {total} | {mentioned} | {pct:.0f}% | {avg_str} |")

    lines.extend(["", "## Detalle por query", ""])
    by_query: dict[str, list[dict]] = {}
    for it in items:
        by_query.setdefault(it["query"], []).append(it)
    for q, rows in by_query.items():
        any_mention = any(r["mentioned"] for r in rows)
        marker = "✓" if any_mention else "✗"
        lines.append(f"### {marker} `{q}`")
        for r in rows:
            if "error" in r:
                lines.append(f"- **{r['engine']}**: error — `{r['error'][:120]}`")
                continue
            if r["mentioned"]:
                bits = []
                if r["in_citations"]:
                    bits.append(f"citado #{r['rank']}" if r["rank"] else "citado")
                if r["in_text"]:
                    bits.append("mencionado en texto")
                lines.append(f"- **{r['engine']}**: ✓ {', '.join(bits)}")
                for u in r["mentioned_urls"][:3]:
                    lines.append(f"  - {u}")
                if r["snippet"]:
                    lines.append(f"  - _\"...{r['snippet']}...\"_")
            else:
                cited_count = len(r.get("citations_all", []))
                lines.append(f"- **{r['engine']}**: ✗ no mencionado ({cited_count} URLs citadas)")
        lines.append("")

    lines.extend([
        "## Como aplicar",
        "",
        "1. Para queries donde NO aparece hacecuentas en ningun engine: verificar si tenes",
        "   calc dedicada con title alineado a la query. Si no, considerar crear.",
        "2. Para queries donde aparece en posicion 5+: el contenido existe pero rankea bajo",
        "   en el contexto del LLM. Mejorar `keyTakeaway` + `intro` + agregar fuentes.",
        "3. Para queries con mention en texto pero NO en citations: el LLM conoce la",
        "   marca pero no extrae URLs. Mejorar structured data (SoftwareApplication name).",
        "",
        "Re-correr semanal y trackear `scripts/ai-mentions-history.json` para detectar",
        "trends. Foco en mover el % de menciones arriba en cada engine.",
        "",
    ])
    out.write_text("\n".join(lines), encoding="utf-8")


def append_history(items: list[dict], history_path: Path, date: str, engines: list[str]) -> None:
    """Append snapshot a history JSON (timeseries)."""
    history = []
    if history_path.exists():
        try:
            history = json.loads(history_path.read_text(encoding="utf-8"))
        except Exception:
            history = []

    # Summary por engine (no item-level para mantener archivo chico)
    summary = {"date": date, "engines": {}}
    for e in engines:
        rows = [i for i in items if i["engine"] == e and "error" not in i]
        total = len(rows)
        mentioned = sum(1 for r in rows if r["mentioned"])
        in_text_only = sum(1 for r in rows if r["in_text"] and not r["in_citations"])
        in_citations = sum(1 for r in rows if r["in_citations"])
        ranks = [r["rank"] for r in rows if r.get("rank")]
        summary["engines"][e] = {
            "queries": total,
            "mentioned": mentioned,
            "pct_mentioned": round((mentioned / total * 100) if total else 0, 1),
            "in_text_only": in_text_only,
            "in_citations": in_citations,
            "avg_rank": round(sum(ranks) / len(ranks), 2) if ranks else None,
        }

    # No duplicar si ya hay una entry de hoy
    history = [h for h in history if h.get("date") != date]
    history.append(summary)
    history_path.write_text(json.dumps(history, indent=2), encoding="utf-8")


# ---- main ---------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--queries-file", type=Path, default=DEFAULT_QUERIES, help="Archivo con queries (una por linea)")
    ap.add_argument("--engines", default="claude", help="Engines comma-separated: claude,openai,perplexity")
    ap.add_argument("--no-history", action="store_true", help="No actualizar ai-mentions-history.json")
    args = ap.parse_args()

    queries = load_queries(args.queries_file)
    if not queries:
        sys.exit("No hay queries en el archivo.")

    engines = [e.strip() for e in args.engines.split(",") if e.strip()]
    active = []
    for e in engines:
        if e not in ENGINES:
            print(f"⚠️  Engine desconocido: {e}", file=sys.stderr)
            continue
        env_var = ENGINES[e]["env"]
        if not os.environ.get(env_var):
            print(f"⚠️  Skipping {e}: falta {env_var}", file=sys.stderr)
            continue
        active.append(e)
    if not active:
        sys.exit("No hay engines activos. Set ANTHROPIC_API_KEY / OPENAI_API_KEY / PERPLEXITY_API_KEY en .env")

    print(f"Engines activos: {', '.join(active)}", file=sys.stderr)
    print(f"Queries: {len(queries)}", file=sys.stderr)
    print(f"Total calls: {len(queries) * len(active)}\n", file=sys.stderr)

    items: list[dict] = []
    total = len(queries) * len(active)
    done = 0
    for q in queries:
        for e in active:
            done += 1
            print(f"  [{done}/{total}] {e}: {q[:60]}", file=sys.stderr)
            r = ENGINES[e]["fn"](q)
            mention = _find_mention(r.get("text", ""), r.get("citations", []))
            items.append({
                "query": q,
                "engine": e,
                "model": r.get("model"),
                "error": r.get("error"),
                "citations_all": r.get("citations", []),
                **mention,
            })

    date = datetime.now(timezone.utc).date().isoformat()
    DOCS_DIR.mkdir(exist_ok=True)
    md_path = DOCS_DIR / f"ai-mentions-{date}.md"
    json_path = SCRIPTS_DIR / f"ai-mentions-{date}.json"

    write_markdown(items, md_path, date, active)
    json_path.write_text(
        json.dumps({
            "generated_at": datetime.now(timezone.utc).isoformat() + "Z",
            "domain": DOMAIN,
            "engines": active,
            "queries_count": len(queries),
            "items": items,
        }, indent=2),
        encoding="utf-8",
    )

    if not args.no_history:
        append_history(items, HISTORY_FILE, date, active)

    # Resumen stderr
    print(f"\nReporte:  {md_path}", file=sys.stderr)
    print(f"Data:     {json_path}", file=sys.stderr)
    print(f"History:  {HISTORY_FILE}\n", file=sys.stderr)
    for e in active:
        rows = [i for i in items if i["engine"] == e and not i.get("error")]
        m = sum(1 for r in rows if r["mentioned"])
        print(f"  {e}: {m}/{len(rows)} queries mencionadas", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
