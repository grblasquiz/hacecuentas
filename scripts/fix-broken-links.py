#!/usr/bin/env python3
"""Resuelve y arregla enlaces internos rotos.

Política (nunca inventa un destino equivocado):
  1. PRECISE  — resolución inequívoca: agregar prefijo de país, agregar/quitar
                'calculadora-', o destino de un redirect 301 existente.
  2. CONFIDENT— match dominante por tokens del slug + texto del ancla (margen claro).
  3. UNLINK   — inline (markdown/href) sin match confiable → se quita el link,
                se conserva el texto.
  4. REMOVE   — entrada de relatedSlugs/relatedCalcs/sections.calcs/relatedPosts
                sin match confiable → se elimina la entrada.

Por defecto hace DRY-RUN y escribe el plan en /tmp/fix-plan.json.
Con --apply edita los archivos (reemplazo de texto dirigido, mínimo diff).
"""
from __future__ import annotations
import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CONTENT = ROOT / "src" / "content"
PAGES = ROOT / "src" / "pages"
COMPONENTS = ROOT / "src" / "components"
LIB = ROOT / "src" / "lib"
PUBLIC = ROOT / "public"

# Reusar el índice del detector (única fuente de verdad del espacio de URLs)
import importlib.util as _ilu
_spec = _ilu.spec_from_file_location("_fbl", ROOT / "scripts" / "find-broken-links.py")
_fbl = _ilu.module_from_spec(_spec)
_spec.loader.exec_module(_fbl)
_IDX = _fbl.build_index()

CALC_COLLECTIONS = _IDX["calc_collections"]
LOCALE_PREFIXES = ("en", "pt", "mx", "es", "co", "cl", "ec", "pe")

STOP = set("de la el los las un una y o en para por con del al a the of to and "
           "calculadora calculator calc com vs por su tu mi how cuanto cuánto "
           "que qué con sin más mas".split())


def norm(p: str) -> str:
    p = p.split("#", 1)[0].split("?", 1)[0].strip()
    return p.rstrip("/") if len(p) > 1 else p


def toks(s: str) -> set[str]:
    parts = re.split(r"[-\s_/]+", s.lower())
    return {t for t in parts if t and t not in STOP and not t.isdigit()}


# --- catálogos (del índice del detector) -----------------------------------
slugs_by_coll: dict[str, set[str]] = _IDX["slugs_by_coll"]
guia_slugs: set[str] = _IDX["guia_slugs"]
blog_slugs: set[str] = _IDX["blog_slugs"]
redir: dict[str, str] = _IDX["redir"]
gone: set[str] = _IDX["gone"]
valid: set[str] = _IDX["valid"]

calc_jsons: dict[str, list[Path]] = {}
for coll in CALC_COLLECTIONS:
    d = CONTENT / coll
    calc_jsons[coll] = sorted(d.glob("*.json")) if d.exists() else []


def coll_for_source(src: str) -> str:
    m = re.search(r"src/content/(calcs[a-z-]*)/", src)
    if m: return m.group(1)
    if "src/content/guias" in src: return "guias"
    if "src/content/blog" in src: return "blog"
    return "astro"


def make_url(coll: str, slug: str) -> str:
    pref = CALC_COLLECTIONS[coll]
    return ("/" + slug) if pref == "/" else norm(pref + slug)


def resolve(target: str, sc: str, anchor: str = "") -> tuple | None:
    """Devuelve (new_path, conf, method) o None si no hay match confiable."""
    p = norm(target)
    bare = re.sub(r"^/(?:%s)/" % "|".join(LOCALE_PREFIXES), "/", p).lstrip("/")
    # orden de búsqueda por colección
    order = [sc] if sc in CALC_COLLECTIONS else []
    if "calcs" not in order: order.append("calcs")
    for c in CALC_COLLECTIONS:
        if c not in order: order.append(c)

    # 1. PRECISE: transform exacto
    cands = [bare, "calculadora-" + bare, re.sub(r"^calculadora-", "", bare)]
    for coll in order:
        for cand in cands:
            if cand in slugs_by_coll[coll]:
                return (make_url(coll, cand), "PRECISE", "transform")
    # guia / blog exact
    if bare in guia_slugs: return ("/guia/" + bare, "PRECISE", "transform")
    if bare in blog_slugs: return ("/blog/" + bare, "PRECISE", "transform")

    # 2. PRECISE: redirect 301
    for tp in [make_url(sc if sc in CALC_COLLECTIONS else "calcs", bare),
               "/" + bare, "/calculadora-" + bare,
               make_url(sc if sc in CALC_COLLECTIONS else "calcs", "calculadora-" + bare)]:
        if norm(tp) in redir:
            return (redir[norm(tp)], "PRECISE", "redirect301")

    # 3. CONFIDENT: match por tokens (slug + ancla), con margen
    qt = toks(bare) | toks(anchor)
    if not qt:
        return None
    search_colls = [sc] if sc in CALC_COLLECTIONS else ["calcs"]
    if "calcs" not in search_colls: search_colls.append("calcs")
    scored = []
    for coll in search_colls:
        for s in slugs_by_coll[coll]:
            ct = toks(s)
            if not ct: continue
            inter = len(qt & ct)
            if inter == 0: continue
            recall = inter / len(qt)
            prec = inter / len(ct)
            score = recall + 0.3 * prec
            scored.append((score, recall, coll, s))
    if not scored:
        return None
    scored.sort(reverse=True)
    best = scored[0]
    second = scored[1] if len(scored) > 1 else (0,)
    # confiar si recall alto y margen claro sobre el 2º
    if best[1] >= 0.6 and (best[0] - second[0]) >= 0.25:
        return (make_url(best[2], best[3]), "CONFIDENT", "tokens")
    return None


# --- cargar referencias rotas del detector --------------------------------
detector = json.loads((Path("/tmp/broken-links.json")).read_text())
# re-extraer CON anchor y raw, porque el detector no guardó anchor.
MD_LINK = re.compile(r"\[([^\]\n]*)\]\((/[^)\s]+)\)")
HREF = re.compile(r"""href\s*=\s*["'](/[^"'\s]+)["']""")

plan = {"precise": [], "confident": [], "unlink": [], "remove": [], "manual": []}


def classify(target, sc, anchor, source, kind, field=None, raw=None):
    p = norm(target)
    is_broken = (p in gone) or (p not in valid and p not in redir)
    if not is_broken:
        return
    r = resolve(target, sc, anchor)
    rec = {"source": source, "kind": kind, "old": p, "anchor": anchor,
           "field": field, "raw": raw}
    if r:
        new, conf, method = r
        if norm(new) == p:   # se resolvería a sí mismo → no sirve
            r = None
        else:
            rec["new"] = norm(new); rec["method"] = method
            plan["precise" if conf == "PRECISE" else "confident"].append(rec)
            return
    # sin match confiable
    if kind in ("md", "href_html", "href_astro"):
        if kind == "href_astro":
            plan["manual"].append(rec)      # hardcoded en template: revisar
        else:
            plan["unlink"].append(rec)
    else:
        plan["remove"].append(rec)


# 3a. inline en JSONs (md + href html)
def scan_json(coll_name, files):
    sc = coll_name
    for f in files:
        txt = f.read_text(encoding="utf-8")
        src = str(f.relative_to(ROOT))
        for m in MD_LINK.finditer(txt):
            classify(m.group(2), sc, m.group(1), src, "md", raw=m.group(0))
        for m in HREF.finditer(txt):
            classify(m.group(1), sc, "", src, "href_html", raw=m.group(0))


for coll, files in calc_jsons.items():
    scan_json(coll, files)
scan_json("guias", sorted((CONTENT / "guias").glob("*.json")))
scan_json("blog", sorted((CONTENT / "blog").glob("*.json")))
for extra in ("glosario", "comparaciones", "tablas"):
    scan_json(extra, sorted((CONTENT / extra).glob("*.json")))

# 3b. lookup refs: relatedSlugs / relatedCalcs / sections.calcs / relatedPosts
for coll, files in calc_jsons.items():
    for f in files:
        try: d = json.loads(f.read_text())
        except Exception: continue
        src = str(f.relative_to(ROOT))
        for rs in d.get("relatedSlugs") or []:
            if rs not in slugs_by_coll[coll]:
                classify(make_url(coll, rs), coll, rs.replace("-", " "), src,
                         "relatedSlugs", field="relatedSlugs", raw=rs)
for f in sorted((CONTENT / "guias").glob("*.json")):
    try: d = json.loads(f.read_text())
    except Exception: continue
    src = str(f.relative_to(ROOT))
    for sec in d.get("sections") or []:
        for cs in sec.get("calcs") or []:
            if cs not in slugs_by_coll["calcs"]:
                classify("/" + cs, "calcs", cs.replace("-", " "), src,
                         "sections.calcs", field="sections.calcs", raw=cs)
for f in sorted((CONTENT / "blog").glob("*.json")):
    try: d = json.loads(f.read_text())
    except Exception: continue
    src = str(f.relative_to(ROOT))
    for cs in d.get("relatedCalcs") or []:
        if cs not in slugs_by_coll["calcs"]:
            classify("/" + cs, "calcs", cs.replace("-", " "), src,
                     "relatedCalcs", field="relatedCalcs", raw=cs)
    for rp in d.get("relatedPosts") or []:
        if rp not in blog_slugs:
            classify("/blog/" + rp, "blog", rp.replace("-", " "), src,
                     "relatedPosts", field="relatedPosts", raw=rp)

# 3c. href hardcodeado en .astro
for base in (PAGES, COMPONENTS):
    for f in base.rglob("*.astro"):
        txt = f.read_text(encoding="utf-8")
        src = str(f.relative_to(ROOT))
        for m in HREF.finditer(txt):
            href = m.group(1)
            if "${" in href or "{" in href:
                continue
            classify(href, "astro", "", src, "href_astro", raw=m.group(0))


# --- reporte / dry-run -----------------------------------------------------
def dedupe(lst):
    seen, out = set(), []
    for x in lst:
        k = (x["source"], x["kind"], x["old"], x.get("raw"))
        if k in seen: continue
        seen.add(k); out.append(x)
    return out


for k in plan:
    plan[k] = dedupe(plan[k])

print("PLAN DE ARREGLO")
for k in ("precise", "confident", "unlink", "remove", "manual"):
    print(f"  {k:9}: {len(plan[k])}")
tot = sum(len(v) for v in plan.values())
print(f"  TOTAL    : {tot}")

print("\n— PRECISE (muestra) —")
for x in plan["precise"][:12]:
    print(f"  [{x['method']}] {x['old']} -> {x['new']}  ({x['kind']})")
print("\n— CONFIDENT (muestra) —")
for x in plan["confident"][:18]:
    print(f"  {x['old']} -> {x['new']}  anchor={x['anchor'][:30]!r} ({x['kind']})")
print("\n— UNLINK (muestra) —")
for x in plan["unlink"][:10]:
    print(f"  {x['old']}  anchor={x['anchor'][:40]!r}  src={Path(x['source']).name}")
print("\n— REMOVE (muestra) —")
for x in plan["remove"][:10]:
    print(f"  {x['field']}={x['raw']}  src={Path(x['source']).name}")
print("\n— MANUAL (.astro hardcoded, todos) —")
for x in plan["manual"]:
    print(f"  {x['old']}  src={x['source']}")

Path("/tmp/fix-plan.json").write_text(json.dumps(plan, ensure_ascii=False, indent=2))
print("\n→ plan en /tmp/fix-plan.json")
