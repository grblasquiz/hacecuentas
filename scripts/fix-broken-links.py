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
# "pt-pt" primero: en la alternación regex debe intentarse antes que "pt".
LOCALE_PREFIXES = ("pt-pt", "en", "pt", "mx", "es", "co", "cl", "ec", "pe",
                   "ve", "py", "uy", "do")

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


def resolve(target: str, sc: str, anchor: str = "", expected_colls=None) -> tuple | None:
    """Devuelve (new_path, conf, method) o None si no hay match confiable.

    expected_colls: lista de colecciones donde DEBE caer el resultado (refs de
    lookup). Si se pasa, SÓLO se aceptan transforms exactos (sin token-match ni
    redirects) — política conservadora: los lookup no son 404s visibles y la
    resolución cross-locale en runtime es delicada.
    """
    p = norm(target)
    if p in CONFIRMED_BAD:
        return None
    bare = re.sub(r"^/(?:%s)/" % "|".join(LOCALE_PREFIXES), "/", p).lstrip("/")

    is_lookup = expected_colls is not None
    if is_lookup:
        order = list(expected_colls)
    else:
        order = [sc] if sc in CALC_COLLECTIONS else []
        if "calcs" not in order: order.append("calcs")
        for c in CALC_COLLECTIONS:
            if c not in order: order.append(c)

    # 1. PRECISE: transform exacto (agregar/quitar prefijo, calculadora-).
    #    Nunca devolver un path que esté en 410 (seguiría roto).
    cands = [bare, "calculadora-" + bare, re.sub(r"^calculadora-", "", bare)]
    for coll in order:
        if coll in CALC_COLLECTIONS:
            for cand in cands:
                if cand in slugs_by_coll[coll]:
                    res = make_url(coll, cand)
                    if res not in gone:
                        return (res, "PRECISE", "transform")
        elif coll == "blog":
            for cand in (bare, re.sub(r"^calculadora-", "", bare)):
                if cand in blog_slugs and ("/blog/" + cand) not in gone:
                    return ("/blog/" + cand, "PRECISE", "transform")
        elif coll == "guias" and bare in guia_slugs:
            return ("/guia/" + bare, "PRECISE", "transform")
    if not is_lookup and bare in guia_slugs:
        return ("/guia/" + bare, "PRECISE", "transform")

    if is_lookup:
        # repunta al ganador de un 301 SÓLO si ese ganador es una calc/post de la
        # colección esperada (consolidaciones: el card debe ir al slug canónico vivo).
        for k in ("/" + bare, "/calculadora-" + bare):
            dest = redir.get(k)
            if not dest:
                continue
            db = re.sub(r"^/(?:%s)/" % "|".join(LOCALE_PREFIXES), "/", dest).lstrip("/")
            for coll in order:
                if coll in CALC_COLLECTIONS and db in slugs_by_coll[coll] and make_url(coll, db) not in gone:
                    return (make_url(coll, db), "PRECISE", "redirect301-lookup")
                if coll == "blog" and db in blog_slugs and ("/blog/" + db) not in gone:
                    return ("/blog/" + db, "PRECISE", "redirect301-lookup")
        return None  # sin transform ni ganador-calc → dejar como está

    # 2. PRECISE: redirect 301 (sólo inline) — el destino no puede estar en 410
    for tp in [make_url(sc if sc in CALC_COLLECTIONS else "calcs", bare),
               "/" + bare, "/calculadora-" + bare,
               make_url(sc if sc in CALC_COLLECTIONS else "calcs", "calculadora-" + bare)]:
        dest = redir.get(norm(tp))
        if dest and dest not in gone:
            return (dest, "PRECISE", "redirect301")

    # 3. CONFIDENT: sólo si el target contiene TODOS los tokens (recall == 1.0).
    #    Casos peligrosos (cubo→esfera, bebé→perro) tienen recall < 1 → se rechazan.
    qt = toks(bare)
    at = toks(anchor)
    if not qt:
        return None
    token_colls = ([sc] if sc in CALC_COLLECTIONS else ["calcs"]) + (["calcs"] if sc != "calcs" else [])
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
    extra_top = -top[2]
    accept = False
    if top[0] == 1.0:  # target contiene TODOS los tokens de la query
        if len(qt) >= 3:
            accept = True
        elif len(qt) == 2 and n_full == 1 and extra_top <= 2:
            # 2 tokens: sólo si es candidato único y sin demasiado ruido extra
            accept = True
    if accept:
        return (make_url(top[4], top[5]), "CONFIDENT", "tokens")
    return None


# --- re-extraer referencias CON anchor + raw (para arreglo dirigido) -------
MD_LINK = re.compile(r"\[([^\]\n]*)\]\((/[^)\s]+)\)")
HREF = re.compile(r"""href\s*=\s*["'](/[^"'\s]+)["']""")
# href dentro de HTML embebido en un string JSON: las comillas van escapadas
# (href=\"/x\"). Sin esto no podemos REPARAR links en blog.content / faq html.
ESC_HREF = re.compile(r'href\s*=\s*\\"(/[^"\\\s]+)\\"')

plan = {"precise": [], "confident": [], "unlink": [], "remove": [], "manual": []}


LOOKUP_KINDS = {"relatedSlugs", "sections.calcs", "relatedCalcs", "relatedPosts"}


def slug_from_path(path):
    """Slug bare desde un path resuelto (saca prefijo de locale)."""
    p = norm(path)
    seg = re.sub(r"^/(?:%s)/" % "|".join(LOCALE_PREFIXES), "/", p)
    seg = re.sub(r"^/(?:blog|guia)/", "/", seg).lstrip("/")
    return seg if "/" not in seg and seg else None


def classify_inline(target, sc, anchor, source, kind, raw=None):
    p = norm(target)
    is_broken = (p in gone) or (p not in valid and p not in redir)
    if not is_broken:
        return
    rec = {"source": source, "kind": kind, "old": p, "anchor": anchor, "raw": raw}
    r = resolve(target, sc, anchor)
    if r and norm(r[0]) != p:
        rec["new"] = norm(r[0]); rec["method"] = r[2]
        plan["precise" if r[1] == "PRECISE" else "confident"].append(rec)
        return
    if kind == "href_astro":
        plan["manual"].append(rec)          # hardcoded en template: revisar
    else:
        plan["unlink"].append(rec)          # md / href_html → des-linkear


def classify_lookup(raw_slug, sc, source, kind, field, expected_colls):
    """Repunta la ref de lookup vía transform exacto; si no hay match, la ELIMINA
    (el slug no existe en su locale → RelatedCalcs la descarta en runtime y la
    reemplaza por auto-fill; dejarla es peso muerto en la curación)."""
    rec = {"source": source, "kind": kind, "old": "/" + raw_slug, "anchor": "",
           "field": field, "raw": raw_slug}
    r = resolve("/" + raw_slug, sc, expected_colls=expected_colls)
    if r and r[1] == "PRECISE":
        ns = slug_from_path(r[0])
        if ns and ns != raw_slug:
            rec["new"] = norm(r[0]); rec["new_slug"] = ns; rec["method"] = r[2]
            plan["precise"].append(rec)
            return
    plan["remove"].append(rec)


# sets de validez para refs de lookup (según cómo resuelve cada ruta en runtime)
SECTIONS_VALID = slugs_by_coll["calcs"] | slugs_by_coll["calcs-pe"] | slugs_by_coll["calcs-ec"]
SECTIONS_COLLS = ["calcs", "calcs-pe", "calcs-ec"]


def relatedslugs_valid_and_colls(coll):
    # RelatedCalcs resuelve manualSlugs contra la colección del MISMO locale
    # (bySlug = calcModules[lang], sin fallback a AR — ver RelatedCalcs.astro).
    # Un relatedSlug ausente de su propia colección no renderiza card → same-locale.
    return slugs_by_coll[coll], [coll]


# 3a. inline en JSONs (md + href html)
def scan_json(coll_name, files):
    for f in files:
        txt = f.read_text(encoding="utf-8")
        src = str(f.relative_to(ROOT))
        for m in MD_LINK.finditer(txt):
            classify_inline(m.group(2), coll_name, m.group(1), src, "md", raw=m.group(0))
        for m in HREF.finditer(txt):
            classify_inline(m.group(1), coll_name, "", src, "href_html", raw=m.group(0))
        for m in ESC_HREF.finditer(txt):
            classify_inline(m.group(1), coll_name, "", src, "href_esc", raw=m.group(0))


for coll, files in calc_jsons.items():
    scan_json(coll, files)
scan_json("guias", sorted((CONTENT / "guias").glob("*.json")))
scan_json("blog", sorted((CONTENT / "blog").glob("*.json")))
for extra in ("glosario", "comparaciones", "tablas"):
    scan_json(extra, sorted((CONTENT / extra).glob("*.json")))

# 3b. lookup refs (sólo repoint vía transform exacto)
for coll, files in calc_jsons.items():
    rs_valid, rs_colls = relatedslugs_valid_and_colls(coll)
    for f in files:
        try: d = json.loads(f.read_text())
        except Exception: continue
        src = str(f.relative_to(ROOT))
        for rs in d.get("relatedSlugs") or []:
            if rs not in rs_valid:
                classify_lookup(rs, coll, src, "relatedSlugs", "relatedSlugs", rs_colls)
for f in sorted((CONTENT / "guias").glob("*.json")):
    try: d = json.loads(f.read_text())
    except Exception: continue
    src = str(f.relative_to(ROOT))
    for sec in d.get("sections") or []:
        for cs in sec.get("calcs") or []:
            if cs not in SECTIONS_VALID:
                classify_lookup(cs, "calcs", src, "sections.calcs", "sections.calcs", SECTIONS_COLLS)
for f in sorted((CONTENT / "blog").glob("*.json")):
    try: d = json.loads(f.read_text())
    except Exception: continue
    src = str(f.relative_to(ROOT))
    for cs in d.get("relatedCalcs") or []:
        if cs not in slugs_by_coll["calcs"]:
            classify_lookup(cs, "calcs", src, "relatedCalcs", "relatedCalcs", ["calcs"])
    for rp in d.get("relatedPosts") or []:
        if rp not in blog_slugs:
            classify_lookup(rp, "blog", src, "relatedPosts", "relatedPosts", ["blog"])

# 3c. href hardcodeado en .astro
for base in (PAGES, COMPONENTS):
    for f in base.rglob("*.astro"):
        txt = f.read_text(encoding="utf-8")
        src = str(f.relative_to(ROOT))
        for m in HREF.finditer(txt):
            href = m.group(1)
            if "${" in href or "{" in href:
                continue
            classify_inline(href, "astro", "", src, "href_astro", raw=m.group(0))


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


# --- APLICAR ---------------------------------------------------------------
def apply_plan():
    HREF_PATH_RE = re.compile(r"""(href\s*=\s*["'])(/[^"'\s]+)(["'])""")
    # juntar todas las acciones por archivo
    by_file: dict[str, list[dict]] = defaultdict(list)
    for tier in ("precise", "confident"):
        for x in plan[tier]:
            x["_action"] = "repoint"
            by_file[x["source"]].append(x)
    for x in plan["unlink"]:
        x["_action"] = "unlink"
        by_file[x["source"]].append(x)
    for x in plan["remove"]:
        x["_action"] = "remove"
        by_file[x["source"]].append(x)

    files_changed = 0
    edits = 0
    for src, actions in by_file.items():
        path = ROOT / src
        text = path.read_text(encoding="utf-8")
        orig = text
        for x in actions:
            kind, act, raw = x["kind"], x["_action"], x.get("raw")
            if kind == "md":
                i = raw.rfind("](")
                if act == "repoint":
                    new_raw = raw[:i] + "](" + x["new"] + ")"
                else:  # unlink → dejar el texto del ancla
                    new_raw = x.get("anchor", "")
                if raw in text:
                    text = text.replace(raw, new_raw)
            elif kind in ("href_html", "href_astro"):
                if act == "repoint":
                    new_raw = HREF_PATH_RE.sub(lambda m: m.group(1) + x["new"] + m.group(3), raw)
                    if raw in text:
                        text = text.replace(raw, new_raw)
            elif kind == "href_esc":
                # raw = href=\"/old\"  (html embebido en JSON) → sólo repoint
                if act == "repoint":
                    new_raw = re.sub(r'/[^"\\\s]+', x["new"], raw, count=1)
                    if raw in text:
                        text = text.replace(raw, new_raw)
            elif kind in LOOKUP_KINDS:
                old_slug = raw
                esc = re.escape(old_slug)
                if act == "repoint":
                    text = text.replace('"%s"' % old_slug, '"%s"' % x["new_slug"])
                else:
                    # remove: sacar TODAS las apariciones del elemento del array,
                    # sin dejar coma colgante ni "" (que re-dispararía el detector).
                    # Cubre primera / media (coma detrás), última (coma delante) y
                    # elemento único ([] resultante). Anclado por comillas → exacto.
                    for pat in (r'"%s"\s*,\s*' % esc,
                                r'\s*,\s*"%s"' % esc,
                                r'"%s"' % esc):
                        text = re.sub(pat, "", text)
            edits += 1
        # Colapsar arrays que quedaron vacíos tras remover su único elemento
        # ("relatedSlugs": [\n  \n] → []) para no dejar líneas en blanco.
        text = re.sub(r"\[\s*\]", "[]", text)
        if text != orig:
            path.write_text(text, encoding="utf-8")
            files_changed += 1
    print(f"\n✅ APLICADO: {edits} ediciones en {files_changed} archivos")
    print(f"   (manual pendiente: {len(plan['manual'])} hrefs hardcodeados en .astro)")


if "--apply" in sys.argv:
    apply_plan()
