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


# Matches por token que verifiqué a mano como ENGAÑOSOS (concepto distinto):
# se fuerzan a unlink aunque el recall sea alto.
CONFIRMED_BAD = {
    "/baby-vaccination-schedule", "/cost-of-car-ownership", "/surface-area",
    "/capital-gains-tax-calculator", "/pounds-to-ounces-converter",
    "/renters-insurance-cost-calculator", "/cylinder-volume-surface-area",
    "/cone-volume-surface-area", "/cube-volume-surface-area", "/probabilidade",
}


def resolve(target: str, sc: str, anchor: str = "", expected_coll: str | None = None) -> tuple | None:
    """Devuelve (new_path, conf, method) o None si no hay match confiable.

    expected_coll: si se pasa (refs de lookup), el resultado DEBE pertenecer a
    esa colección — relatedSlugs sólo resuelven dentro de su propio locale.
    """
    p = norm(target)
    if p in CONFIRMED_BAD:
        return None
    bare = re.sub(r"^/(?:%s)/" % "|".join(LOCALE_PREFIXES), "/", p).lstrip("/")

    if expected_coll:
        order = [expected_coll]
    else:
        order = [sc] if sc in CALC_COLLECTIONS else []
        if "calcs" not in order: order.append("calcs")
        for c in CALC_COLLECTIONS:
            if c not in order: order.append(c)

    # 1. PRECISE: transform exacto (agregar/quitar prefijo, calculadora-)
    cands = [bare, "calculadora-" + bare, re.sub(r"^calculadora-", "", bare)]
    for coll in order:
        if coll in CALC_COLLECTIONS:
            for cand in cands:
                if cand in slugs_by_coll[coll]:
                    return (make_url(coll, cand), "PRECISE", "transform")
    if expected_coll in (None, "guias") and bare in guia_slugs:
        return ("/guia/" + bare, "PRECISE", "transform")
    if expected_coll in (None, "blog"):
        for cand in (bare, re.sub(r"^calculadora-", "", bare)):
            if cand in blog_slugs:
                return ("/blog/" + cand, "PRECISE", "transform")

    # 2. PRECISE: redirect 301 (sólo inline; un lookup necesita un slug real)
    if not expected_coll:
        for tp in [make_url(sc if sc in CALC_COLLECTIONS else "calcs", bare),
                   "/" + bare, "/calculadora-" + bare,
                   make_url(sc if sc in CALC_COLLECTIONS else "calcs", "calculadora-" + bare)]:
            if norm(tp) in redir:
                return (redir[norm(tp)], "PRECISE", "redirect301")

    # 3. CONFIDENT: sólo si el target contiene TODOS los tokens (recall == 1.0).
    #    Casos peligrosos (cubo→esfera, bebé→perro) tienen recall < 1 → se rechazan.
    qt = toks(bare)
    at = toks(anchor)
    if not qt:
        return None
    if expected_coll and expected_coll not in CALC_COLLECTIONS:
        return None  # blog/guia lookup sin transform exacto → no inventar
    token_colls = order if expected_coll else (
        ([sc] if sc in CALC_COLLECTIONS else ["calcs"]) + (["calcs"] if sc != "calcs" else []))
    cands_scored = []
    for coll in token_colls:
        for s in slugs_by_coll.get(coll, ()):
            ct = toks(s)
            if not ct:
                continue
            inter = len(qt & ct)
            if not inter:
                continue
            recall = inter / len(qt)
            extra = len(ct - qt)
            a_ov = len(at & ct)
            # ranking: recall ↑, solapamiento con ancla ↑, menos tokens extra ↑, slug corto
            cands_scored.append((recall, a_ov, -extra, -len(s), coll, s))
    if not cands_scored:
        return None
    cands_scored.sort(reverse=True)
    top = cands_scored[0]
    n_full = sum(1 for c in cands_scored if c[0] == 1.0)
    accept = (top[0] == 1.0) and (len(qt) >= 3 or n_full == 1)
    if accept:
        return (make_url(top[4], top[5]), "CONFIDENT", "tokens")
    return None


# --- re-extraer referencias CON anchor + raw (para arreglo dirigido) -------
MD_LINK = re.compile(r"\[([^\]\n]*)\]\((/[^)\s]+)\)")
HREF = re.compile(r"""href\s*=\s*["'](/[^"'\s]+)["']""")

plan = {"precise": [], "confident": [], "unlink": [], "remove": [], "manual": []}


LOOKUP_KINDS = {"relatedSlugs", "sections.calcs", "relatedCalcs", "relatedPosts"}


def slug_from_path(path, expected_coll):
    """Extrae el slug que va en un array de lookup desde el path resuelto."""
    p = norm(path)
    if expected_coll == "blog":
        return p[len("/blog/"):] if p.startswith("/blog/") else None
    pref = CALC_COLLECTIONS.get(expected_coll, "/")
    if pref == "/":
        seg = p.lstrip("/")
        return seg if "/" not in seg else None
    if p.startswith(pref) or p.startswith(pref.rstrip("/") + "/"):
        seg = p[len(pref):] if p.startswith(pref) else p[len(pref):]
        return seg if "/" not in seg else None
    return None  # resolvió a otra colección → inválido como lookup


def classify(target, sc, anchor, source, kind, field=None, raw=None, expected_coll=None):
    p = norm(target)
    is_broken = (p in gone) or (p not in valid and p not in redir)
    if not is_broken:
        return
    r = resolve(target, sc, anchor, expected_coll=expected_coll)
    rec = {"source": source, "kind": kind, "old": p, "anchor": anchor,
           "field": field, "raw": raw}
    if r:
        new, conf, method = r
        ok = norm(new) != p
        if ok and kind in LOOKUP_KINDS:
            ns = slug_from_path(new, expected_coll)
            if ns and ns != raw:
                rec["new"] = norm(new); rec["new_slug"] = ns; rec["method"] = method
                plan["precise" if conf == "PRECISE" else "confident"].append(rec)
                return
        elif ok:
            rec["new"] = norm(new); rec["method"] = method
            plan["precise" if conf == "PRECISE" else "confident"].append(rec)
            return
    # sin match confiable
    if kind == "href_astro":
        plan["manual"].append(rec)          # hardcoded en template: revisar
    elif kind in ("md", "href_html"):
        plan["unlink"].append(rec)
    else:
        plan["remove"].append(rec)          # lookup sin destino → quitar entrada


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
