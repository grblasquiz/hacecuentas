#!/usr/bin/env python3
"""
Audit src/lib/pruning-redirects.ts vs GSC Search Analytics.

Encuentra URLs pruneadas (zombies) que aun reciben impressions de Google
pero pierden el trafico porque redirigen a categorias genericas o calcs no
relacionadas. Esas son candidatas a desprunear.

Estrategia post Core Update Abril 2026:
  - El pruning fue agresivo: ~376 URLs redirigidas, 238 de ellas a /categoria/*.
  - Algunas zombies siguen indexadas y reciben impressions sin convertir.
  - Recuperarlas = recovery rapido sin esperar al algoritmo.

Output:
  - docs/pruning-audit-<YYYY-MM-DD>.md  : tabla con top candidatas a desprunear
  - scripts/pruning-audit-<YYYY-MM-DD>.json : data cruda

Ejemplo:
  python3 scripts/audit-pruning-vs-gsc.py --impressions-min 50 --top-n 30

Filter logic:
  - Zombie URL con impressions >= --impressions-min (default 50/28d) →
    Google aun la muestra.
  - Target URL del redirect: si tambien rankea bien para la query original,
    la consolidacion funciono. Si no, es perdida pura.
  - Verdict:
    * DESPRUNE   → impresiones altas, target sin trafico relevante
    * KEEP       → target captura el trafico de la consolidada
    * REVIEW     → caso ambiguo, decision manual

Auth: usa el mismo service account que gsc-opportunities.py
($GOOGLE_INDEXING_CREDS o ~/.config/gcp/hacecuentas-indexing.json).
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
from datetime import datetime, timedelta, timezone as datetime_tz
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write("pip install google-auth google-api-python-client\n")
    sys.exit(1)

ROOT = Path(__file__).resolve().parent.parent
PRUNING_FILE = ROOT / "src" / "lib" / "pruning-redirects.ts"
DOCS_DIR = ROOT / "docs"
SCRIPTS_DIR = ROOT / "scripts"

CREDS = os.path.expanduser(
    os.environ.get("GOOGLE_INDEXING_CREDS", "~/.config/gcp/hacecuentas-indexing.json")
)
SITE = "sc-domain:hacecuentas.com"
SCOPES = ["https://www.googleapis.com/auth/webmasters.readonly"]
BASE_URL = "https://hacecuentas.com"


# ---- pruning-redirects.ts parser ----------------------------------------

PRUNING_LINE_RE = re.compile(r"^\s*'(?P<from>/[^']+)':\s*'(?P<to>/[^']+)'\s*,?\s*$")


def parse_pruning_redirects(path: Path) -> dict[str, str]:
    """Parse el TS y devuelve dict {zombie_url: target_url}."""
    if not path.exists():
        sys.exit(f"No existe {path}")
    redirects: dict[str, str] = {}
    inside = False
    for raw in path.read_text(encoding="utf-8").splitlines():
        line = raw.rstrip()
        if "PRUNING_REDIRECTS" in line and "{" in line:
            inside = True
            continue
        if not inside:
            continue
        if line.strip().startswith("}"):
            break
        m = PRUNING_LINE_RE.match(line)
        if m:
            redirects[m.group("from")] = m.group("to")
    return redirects


# ---- GSC auth + query ----------------------------------------------------

def svc():
    if not os.path.exists(CREDS):
        sys.exit(f"No existen creds GSC en {CREDS}. Set $GOOGLE_INDEXING_CREDS.")
    c = service_account.Credentials.from_service_account_file(CREDS, scopes=SCOPES)
    return build("searchconsole", "v1", credentials=c, cache_discovery=False)


def query_page_stats(s, page_url: str, start: str, end: str) -> dict:
    """Stats agregadas (28d) para una page especifica."""
    body = {
        "startDate": start,
        "endDate": end,
        "dimensions": ["page"],
        "dimensionFilterGroups": [{
            "filters": [{
                "dimension": "page",
                "operator": "equals",
                "expression": page_url,
            }],
        }],
        "rowLimit": 1,
        "dataState": "all",
    }
    try:
        resp = s.searchanalytics().query(siteUrl=SITE, body=body).execute()
    except Exception as e:  # pragma: no cover
        return {"error": str(e), "clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
    rows = resp.get("rows", [])
    if not rows:
        return {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
    r = rows[0]
    return {
        "clicks": int(r.get("clicks", 0)),
        "impressions": int(r.get("impressions", 0)),
        "ctr": float(r.get("ctr", 0)),
        "position": float(r.get("position", 0)),
    }


# ---- verdict logic -------------------------------------------------------

def verdict(zombie_stats: dict, target_stats: dict, threshold_impr: int) -> str:
    z_impr = zombie_stats.get("impressions", 0)
    z_clicks = zombie_stats.get("clicks", 0)
    t_clicks = target_stats.get("clicks", 0)

    if z_impr < threshold_impr:
        return "SKIP_LOW"

    if z_clicks <= 5 and t_clicks <= 5:
        return "DESPRUNE"
    if t_clicks > z_clicks * 3:
        return "KEEP"
    if z_impr >= threshold_impr * 3 and z_clicks <= 10:
        return "DESPRUNE"
    return "REVIEW"


# ---- output formatters ---------------------------------------------------

def fmt_row(item: dict) -> str:
    z = item["zombie_stats"]
    t = item["target_stats"]
    return (
        f"| {item['from']} | {item['to']} | "
        f"{z['impressions']} | {z['clicks']} | {z['ctr']*100:.1f}% | {z['position']:.1f} | "
        f"{t['impressions']} | {t['clicks']} | {item['verdict']} |"
    )


def write_markdown(items: list[dict], out: Path, start: str, end: str, threshold: int) -> None:
    desprune = [i for i in items if i["verdict"] == "DESPRUNE"]
    review = [i for i in items if i["verdict"] == "REVIEW"]
    keep = [i for i in items if i["verdict"] == "KEEP"]

    desprune.sort(key=lambda x: x["zombie_stats"]["impressions"], reverse=True)
    review.sort(key=lambda x: x["zombie_stats"]["impressions"], reverse=True)

    total_recovered_impr = sum(i["zombie_stats"]["impressions"] for i in desprune)

    lines = [
        f"# Pruning audit vs GSC — {datetime.now(datetime_tz.utc).date().isoformat()}",
        "",
        f"Periodo: **{start} → {end}** ({(datetime.fromisoformat(end) - datetime.fromisoformat(start)).days + 1} dias).",
        f"Threshold impressions: **{threshold}/periodo**.",
        "",
        f"- **DESPRUNE recomendado**: {len(desprune)} URLs (≈ **{total_recovered_impr} impressions/periodo recuperables**)",
        f"- **REVIEW manual**: {len(review)} URLs",
        f"- **KEEP** (target funciona): {len(keep)} URLs",
        "",
        "## DESPRUNE — orden por impressions desc",
        "",
        "| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |",
        "|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|",
    ]
    lines.extend(fmt_row(i) for i in desprune)
    lines.extend(["", "## REVIEW — decision manual", ""])
    lines.append("| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |")
    lines.append("|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|")
    lines.extend(fmt_row(i) for i in review)
    lines.extend([
        "",
        "## Como aplicar el desprune",
        "",
        "1. Editar `src/lib/pruning-redirects.ts` y eliminar las entradas marcadas DESPRUNE.",
        "2. Restaurar el JSON original de la calc si fue eliminado (revisar git history).",
        "3. Si la calc nunca existio, hay que generarla (formula + JSON + assets OG).",
        "4. Build local: `npm run build` para regenerar `dist/client/*.html`.",
        "5. Deploy normal + ritual CF cache: `bash scripts/cf-purge-cache.sh` x2.",
        "6. Verificar con curl que devuelven 200 OK con title del CTR rescue.",
        "",
    ])

    out.write_text("\n".join(lines), encoding="utf-8")


# ---- main ----------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=28, help="Ventana GSC (default 28)")
    ap.add_argument("--impressions-min", type=int, default=50, help="Umbral minimo impr para considerar zombie 'viva'")
    ap.add_argument("--top-n", type=int, default=0, help="Solo procesar las top-N zombies por len (0 = todas)")
    ap.add_argument("--only-categoria", action="store_true", help="Filtrar solo zombies que redirigen a /categoria/*")
    ap.add_argument("--dry-run", action="store_true", help="No llamar GSC, mock data")
    args = ap.parse_args()

    redirects = parse_pruning_redirects(PRUNING_FILE)
    total = len(redirects)
    if args.only_categoria:
        redirects = {k: v for k, v in redirects.items() if v.startswith("/categoria/")}
    if args.top_n:
        redirects = dict(list(redirects.items())[: args.top_n])

    print(f"Pruning entries: {len(redirects)} (total en file: {total})", file=sys.stderr)
    print(f"Threshold: >= {args.impressions_min} impressions / {args.days}d", file=sys.stderr)
    print(f"Dry-run: {args.dry_run}\n", file=sys.stderr)

    today = datetime.now(datetime_tz.utc).date()
    end = (today - timedelta(days=3)).isoformat()
    start = (today - timedelta(days=3 + args.days - 1)).isoformat()

    s = None if args.dry_run else svc()

    items: list[dict] = []
    for i, (zombie, target) in enumerate(redirects.items(), 1):
        zombie_url = BASE_URL + zombie
        target_url = BASE_URL + target
        if args.dry_run:
            z_stats = {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
            t_stats = {"clicks": 0, "impressions": 0, "ctr": 0, "position": 0}
        else:
            z_stats = query_page_stats(s, zombie_url, start, end)
            t_stats = query_page_stats(s, target_url, start, end)

        v = verdict(z_stats, t_stats, args.impressions_min)
        items.append({
            "from": zombie,
            "to": target,
            "zombie_stats": z_stats,
            "target_stats": t_stats,
            "verdict": v,
        })

        if i % 25 == 0:
            print(f"  procesadas {i}/{len(redirects)}", file=sys.stderr)

    # filtrar SKIP_LOW del output
    items = [i for i in items if i["verdict"] != "SKIP_LOW"]

    DOCS_DIR.mkdir(exist_ok=True)
    date_str = datetime.now(datetime_tz.utc).date().isoformat()
    md_path = DOCS_DIR / f"pruning-audit-{date_str}.md"
    json_path = SCRIPTS_DIR / f"pruning-audit-{date_str}.json"

    write_markdown(items, md_path, start, end, args.impressions_min)
    json_path.write_text(
        json.dumps({
            "generated_at": datetime.now(datetime_tz.utc).isoformat() + "Z",
            "period": {"start": start, "end": end, "days": args.days},
            "threshold_impressions": args.impressions_min,
            "total_zombies_analyzed": len(redirects),
            "items": items,
        }, indent=2),
        encoding="utf-8",
    )

    desprune_count = sum(1 for i in items if i["verdict"] == "DESPRUNE")
    print(f"\nResultados:", file=sys.stderr)
    print(f"  DESPRUNE: {desprune_count}", file=sys.stderr)
    print(f"  REVIEW  : {sum(1 for i in items if i['verdict'] == 'REVIEW')}", file=sys.stderr)
    print(f"  KEEP    : {sum(1 for i in items if i['verdict'] == 'KEEP')}", file=sys.stderr)
    print(f"\nReporte: {md_path}", file=sys.stderr)
    print(f"Data:    {json_path}", file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
