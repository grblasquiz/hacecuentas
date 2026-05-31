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

# Guard compartido: excluye locales jóvenes/secundarios y calcs nuevas (<6m)
# del barrido 410. Evita el falso positivo del 2026-05-27 (60 calcs-es marcadas
# como zombies cuando todavía no se habían indexado). Ver scripts/prune_guard.py.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from prune_guard import PruneGuard

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
# Estados de verdict:
#   * GONE_410        → URL zombie con 0 trafico real, target tampoco trafica.
#                       Aplica 410 (Mueller-style fast desindex).
#   * PROTECTED_YOUNG → seria GONE_410 pero el guard la salva: locale joven
#                       (/es,/mx,/co,/cl,...) o calc publicada hace <6m. "0
#                       impresiones" no implica zombie si no tuvo tiempo de
#                       indexarse. NO se emite a gone-410.ts.
#   * DESPRUNE        → URL tiene impressions o ranking real, vale recuperarla.
#   * REVIEW          → caso ambiguo, decision manual.
#   * KEEP            → target absorbio el trafico bien, no tocar.
#   * SKIP_LOW        → bajo threshold, no analizar.

def verdict(zombie_stats: dict, target_stats: dict, threshold_impr: int) -> str:
    z_impr = zombie_stats.get("impressions", 0)
    z_clicks = zombie_stats.get("clicks", 0)
    t_clicks = target_stats.get("clicks", 0)
    t_impr = target_stats.get("impressions", 0)

    # 410 Gone: cero actividad real en zombie Y target tampoco trafica
    # → URL es ruido puro post-HCU, sin riesgo de perder link equity.
    if z_impr == 0 and z_clicks == 0 and t_clicks == 0 and t_impr <= 5:
        return "GONE_410"

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
    gone = [i for i in items if i["verdict"] == "GONE_410"]
    protected = [i for i in items if i["verdict"] == "PROTECTED_YOUNG"]
    desprune = [i for i in items if i["verdict"] == "DESPRUNE"]
    review = [i for i in items if i["verdict"] == "REVIEW"]
    keep = [i for i in items if i["verdict"] == "KEEP"]

    desprune.sort(key=lambda x: x["zombie_stats"]["impressions"], reverse=True)
    review.sort(key=lambda x: x["zombie_stats"]["impressions"], reverse=True)
    gone.sort(key=lambda x: x["from"])

    total_recovered_impr = sum(i["zombie_stats"]["impressions"] for i in desprune)

    lines = [
        f"# Pruning audit vs GSC — {datetime.now(datetime_tz.utc).date().isoformat()}",
        "",
        f"Periodo: **{start} → {end}** ({(datetime.fromisoformat(end) - datetime.fromisoformat(start)).days + 1} dias).",
        f"Threshold impressions: **{threshold}/periodo**.",
        "",
        f"- **GONE_410**: {len(gone)} URLs (0 impr + 0 clicks, candidatas a 410 Gone para fast desindex)",
        f"- **PROTECTED_YOUNG**: {len(protected)} URLs excluidas del 410 (locale joven /es,/mx,/co,/cl o calc <6m — NO se emiten a gone-410.ts)",
        f"- **DESPRUNE recomendado**: {len(desprune)} URLs (≈ **{total_recovered_impr} impressions/periodo recuperables**)",
        f"- **REVIEW manual**: {len(review)} URLs",
        f"- **KEEP** (target funciona): {len(keep)} URLs",
        "",
        "## GONE_410 — devolver 410 (acelera desindex vs 301)",
        "",
        "URLs con verdadero 0-trafico. Al pasar a `src/lib/gone-410.ts` y deployar,",
        "el middleware devuelve **HTTP 410 Gone**, lo que le dice a Google: ",
        "*'esta URL fue eliminada permanentemente, sacala del index ya'*.",
        "Mas rapido que 301 (que mantiene la URL en queue de re-crawl).",
        "",
        f"Total: {len(gone)} URLs. Para aplicar: corre `--emit-gone-410`.",
        "",
        "## PROTECTED_YOUNG — excluidas del 410 por el guard",
        "",
        "URLs que tendrian 0 impr/0 clicks pero NO se 410'ean: pertenecen a un",
        "locale joven/secundario (/es, /mx, /co, /cl, ...) o a una calc publicada",
        "hace menos de 6 meses. \"0 impresiones\" no implica zombie si la URL no",
        "tuvo tiempo de indexarse en un mercado con autoridad. Falso positivo del",
        "2026-05-27 (60 calcs-es). Override con `--no-guard` (peligroso).",
        "",
        f"Total: {len(protected)} URLs.",
        "",
    ]
    if protected:
        lines.append("| URL | Motivo guard |")
        lines.append("|-----|--------------|")
        for i in sorted(protected, key=lambda x: x["from"]):
            lines.append(f"| `{i['from']}` | {i.get('guard_reason', '')} |")
    lines.extend([
        "",
        "## DESPRUNE — orden por impressions desc",
        "",
        "| Zombie | Target | Z.Impr | Z.Clicks | Z.CTR | Z.Pos | T.Impr | T.Clicks | Verdict |",
        "|--------|--------|-------:|---------:|------:|------:|-------:|---------:|---------|",
    ])
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
        "## Como aplicar el GONE_410",
        "",
        "1. Re-correr el audit con `--emit-gone-410` para actualizar `src/lib/gone-410.ts`.",
        "2. Build local: `npm run build`.",
        "3. Deploy: `wrangler deploy` o git push.",
        "4. CF purge x2 si hay assets HTML cacheados de esas URLs.",
        "5. Verificar con curl que devuelven 410.",
        "",
    ])

    out.write_text("\n".join(lines), encoding="utf-8")


def write_gone_410_ts(items: list[dict], out: Path) -> int:
    """Sobrescribe src/lib/gone-410.ts con la lista de URLs verdict==GONE_410."""
    gone_urls = sorted({i["from"] for i in items if i["verdict"] == "GONE_410"})
    today = datetime.now(datetime_tz.utc).date().isoformat()
    body = (
        "/**\n"
        " * Lista de URLs zombie con verdadero 0-trafico (0 impressions, 0 clicks)\n"
        " * que devuelven HTTP 410 Gone en el middleware.\n"
        " *\n"
        " * Estrategia post-Core Update Abril 2026:\n"
        " *   - 301 a categoria mantiene la URL en queue de re-crawl de Google.\n"
        " *   - 410 le dice \"removida permanentemente\" → Google la saca del index mas\n"
        " *     rapido (confirmado por John Mueller multiple veces).\n"
        " *   - Aplicar 410 solo cuando NO hay riesgo de perder link equity:\n"
        " *       clicks == 0 AND impressions == 0 AND target_clicks == 0 AND\n"
        " *       target_impressions <= 5.\n"
        " *\n"
        " * Esta lista se genera/actualiza con:\n"
        " *   python3 scripts/audit-pruning-vs-gsc.py --emit-gone-410\n"
        " *\n"
        " * Que escribe la salida directamente a este archivo. NO editar a mano —\n"
        " * cualquier cambio se sobreescribe en el proximo audit.\n"
        " *\n"
        f" * Generated: {today} ({len(gone_urls)} URLs)\n"
        " */\n"
        "export const GONE_410_URLS: ReadonlySet<string> = new Set<string>([\n"
    )
    for u in gone_urls:
        body += f"  {u!r},\n".replace("'", '"')
    body += "]);\n"
    out.write_text(body, encoding="utf-8")
    return len(gone_urls)


# ---- main ----------------------------------------------------------------

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--days", type=int, default=28, help="Ventana GSC (default 28)")
    ap.add_argument("--impressions-min", type=int, default=50, help="Umbral minimo impr para considerar zombie 'viva'")
    ap.add_argument("--top-n", type=int, default=0, help="Solo procesar las top-N zombies por len (0 = todas)")
    ap.add_argument("--only-categoria", action="store_true", help="Filtrar solo zombies que redirigen a /categoria/*")
    ap.add_argument("--emit-gone-410", action="store_true", help="Escribir/actualizar src/lib/gone-410.ts con URLs verdict=GONE_410")
    ap.add_argument("--dry-run", action="store_true", help="No llamar GSC, mock data")
    ap.add_argument("--min-age-days", type=int, default=180,
                    help="Calcs publicadas hace < N dias quedan protegidas del 410 (default 180 ~6 meses)")
    ap.add_argument("--include-en-pt", action="store_true",
                    help="Tambien proteger /en/ y /pt/ por locale (default: solo por edad)")
    ap.add_argument("--no-guard", action="store_true",
                    help="DESACTIVAR el guard de locales jovenes/calcs nuevas (PELIGROSO: puede re-410'ear calcs nuevas)")
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

    guard = None if args.no_guard else PruneGuard(
        today=today,
        min_age_days=args.min_age_days,
        include_en_pt=True if args.include_en_pt else None,
    )
    if guard is not None:
        print(f"Guard 410: locales bloqueados={sorted(guard.block_locales)} "
              f"| edad min={guard.min_age_days}d (publicado > {guard.cutoff} = protegido)",
              file=sys.stderr)
    excluded: list[dict] = []

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

        # Guard: una URL de locale joven/secundario o de calc nueva (<6m) NO
        # puede pasar a 410 aunque tenga 0 impresiones — todavia no tuvo tiempo
        # de indexarse en un mercado con autoridad. Falso positivo del
        # 2026-05-27 (60 calcs-es). Ver scripts/prune_guard.py.
        guard_reason = None
        if guard is not None and v == "GONE_410":
            protected, guard_reason = guard.is_protected(zombie)
            if protected:
                v = "PROTECTED_YOUNG"
                excluded.append({"from": zombie, "to": target, "reason": guard_reason})

        item = {
            "from": zombie,
            "to": target,
            "zombie_stats": z_stats,
            "target_stats": t_stats,
            "verdict": v,
        }
        if v == "PROTECTED_YOUNG":
            item["guard_reason"] = guard_reason
        items.append(item)

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
            "guard": None if guard is None else {
                "block_locales": sorted(guard.block_locales),
                "min_age_days": guard.min_age_days,
                "cutoff_date": guard.cutoff.isoformat(),
            },
            "excluded_by_guard": excluded,
            "items": items,
        }, indent=2),
        encoding="utf-8",
    )

    desprune_count = sum(1 for i in items if i["verdict"] == "DESPRUNE")
    gone_count = sum(1 for i in items if i["verdict"] == "GONE_410")
    protected_count = sum(1 for i in items if i["verdict"] == "PROTECTED_YOUNG")
    print(f"\nResultados:", file=sys.stderr)
    print(f"  GONE_410: {gone_count}", file=sys.stderr)
    print(f"  DESPRUNE: {desprune_count}", file=sys.stderr)
    print(f"  REVIEW  : {sum(1 for i in items if i['verdict'] == 'REVIEW')}", file=sys.stderr)
    print(f"  KEEP    : {sum(1 for i in items if i['verdict'] == 'KEEP')}", file=sys.stderr)
    if guard is not None:
        print(f"  PROTECTED_YOUNG (excluidas del 410 por guard): {protected_count}", file=sys.stderr)
        if excluded:
            print(f"\n  Slugs excluidos del barrido 410 (locale joven / calc nueva):", file=sys.stderr)
            for e in excluded:
                print(f"    - {e['from']}  [{e['reason']}]", file=sys.stderr)
    print(f"\nReporte: {md_path}", file=sys.stderr)
    print(f"Data:    {json_path}", file=sys.stderr)

    if args.emit_gone_410:
        gone_path = ROOT / "src" / "lib" / "gone-410.ts"
        n = write_gone_410_ts(items, gone_path)
        print(f"\nEscribi {n} URLs GONE_410 → {gone_path}", file=sys.stderr)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
