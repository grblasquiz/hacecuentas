#!/usr/bin/env python3
"""Detector de enlaces internos rotos (404/410) + índice del espacio de URLs.

Expone build_index() -> dict con:
  valid            set[str]  paths alcanzables (200)
  redir            dict      source 301 -> destino
  gone             set[str]  paths que devuelven 410
  slugs_by_coll    dict      colección -> set de slugs
  calc_collections dict      colección -> prefijo de URL
  guia_slugs, blog_slugs

Como script imprime el reporte de links rotos. Uso:
  python3 scripts/find-broken-links.py [--json out.json]
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

CALC_COLLECTIONS = {
    "calcs": "/", "calcs-en": "/en/", "calcs-pt": "/pt/", "calcs-mx": "/mx/",
    "calcs-es": "/es/", "calcs-co": "/co/", "calcs-cl": "/cl/",
    "calcs-ec": "/ec/", "calcs-pe": "/pe/",
    # verticales país servidas por src/pages/<pais>/[...slug].astro
    "calcs-ve": "/ve/", "calcs-py": "/py/", "calcs-uy": "/uy/",
    "calcs-do": "/do/", "calcs-pt-pt": "/pt-pt/",
}
CATEGORY_LABELS = {
    "finanzas", "impuestos", "familia", "negocios", "negocio", "salud",
    "marketing", "deportes", "viajes", "vida", "mascotas", "matematica",
    "construccion", "cocina", "educacion", "automotor", "tecnologia",
    "medio-ambiente", "electronica",
}
SKIP_EXT = re.compile(
    r"\.(png|jpg|jpeg|svg|webp|gif|ico|css|js|woff2?|txt|pdf|xml|csv|"
    r"webmanifest|yaml|yml|json)$"
)


def norm(p: str) -> str:
    p = p.split("#", 1)[0].split("?", 1)[0].strip()
    return p.rstrip("/") if len(p) > 1 else p


def _load(coll: str) -> list[dict]:
    out = []
    d = CONTENT / coll
    if not d.exists():
        return out
    for f in sorted(d.glob("*.json")):
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
            if not isinstance(data, dict):
                continue
            data["__file"] = str(f.relative_to(ROOT))
            data["__coll"] = coll
            out.append(data)
        except Exception as e:
            print(f"⚠️  skip {f}: {e}", file=sys.stderr)
    return out


def _static_routes() -> set[str]:
    out: set[str] = set()
    for f in PAGES.rglob("*"):
        if not f.is_file():
            continue
        rel = f.relative_to(PAGES)
        if any("[" in p for p in rel.parts):
            continue
        name = f.name
        if name.endswith(".ts"):
            out.add(norm("/" + str(rel).replace(".ts", "")))
            continue
        if not name.endswith(".astro"):
            continue
        stem = rel.with_suffix("")
        if stem.name == "index":
            stem = stem.parent
            out.add("/" + str(stem) if str(stem) != "." else "/")
        else:
            out.add(norm("/" + str(stem)))
    return out


def _public_routes() -> set[str]:
    out: set[str] = set()
    if not PUBLIC.exists():
        return out
    for f in PUBLIC.rglob("*"):
        if f.is_file():
            out.add(norm("/" + str(f.relative_to(PUBLIC))))
    return out


def _dynamic_routes() -> set[str]:
    """URLs generadas por getStaticPaths de rutas [param] que _static_routes()
    saltea (tiene '[' en el path). Enumeramos los params desde su fuente para no
    marcar como rotos links hardcodeados válidos (datos/, plazo-fijo-*, etc.)."""
    out: set[str] = set()

    def _read(rel: str) -> str:
        p = ROOT / rel
        return p.read_text(encoding="utf-8") if p.exists() else ""

    # /datos/<slug>.json|.csv ← keys de EXPORTS en src/lib/datos-export.ts
    dx = _read("src/lib/datos-export.ts")
    dx = dx[dx.find("export const EXPORTS"):] if "export const EXPORTS" in dx else dx
    for k in re.findall(r"""^\s*['"]([a-z0-9-]+)['"]\s*:""", dx, re.M):
        out.add(f"/datos/{k}.json")
        out.add(f"/datos/{k}.csv")

    # /plazo-fijo-<banco>
    pf = _read("src/pages/plazo-fijo-[banco].astro")
    for b in re.findall(r"""banco:\s*['"]([a-z0-9-]+)['"]""", pf):
        out.add(f"/plazo-fijo-{b}")

    # /cuando-juega-<equipo>-mundial-2026
    cj = _read("src/pages/cuando-juega-[equipo]-mundial-2026.astro")
    for e in re.findall(r"""slug:\s*['"]([a-z0-9-]+)['"]""", cj):
        out.add(f"/cuando-juega-{e}-mundial-2026")

    # /decidir/<slug> ← "slug" de nivel superior (4 espacios) en DECISION_MANIFEST
    dm = _read("src/lib/decisions/manifest.ts")
    for s in re.findall(r"""^    ["']slug["']\s*:\s*["']([a-z0-9-]+)["']""", dm, re.M):
        out.add(f"/decidir/{s}")

    # /mi/<producto> ← slugs de nivel producto (4 espacios) en PRODUCTS
    mp = _read("src/lib/products/manifest.ts")
    mp = mp[mp.find("export const PRODUCTS"):] if "export const PRODUCTS" in mp else mp
    for s in re.findall(r"""^    slug:\s*['"]([a-z0-9-]+)['"]""", mp, re.M):
        out.add(f"/mi/{s}")

    return out


def build_index() -> dict:
    valid: set[str] = set()
    valid.update(["/", "/en", "/es", "/pt", "/mx", "/cl", "/co", "/ec", "/pe",
                  "/global"])

    slugs_by_coll: dict[str, set[str]] = {}
    all_calcs: dict[str, list[dict]] = {}
    for coll, prefix in CALC_COLLECTIONS.items():
        items = _load(coll)
        all_calcs[coll] = items
        slugs = {c["slug"] for c in items if c.get("slug")}
        slugs_by_coll[coll] = slugs
        for s in slugs:
            valid.add(("/" + s) if prefix == "/" else norm(prefix + s))

    guias = _load("guias")
    guia_slugs = {g["slug"] for g in guias if g.get("slug")}
    valid.add("/guias")
    valid.update("/guia/" + s for s in guia_slugs)

    blog = _load("blog")
    blog_slugs = {b["slug"] for b in blog if b.get("slug")}
    valid.add("/blog")
    valid.update("/blog/" + s for s in blog_slugs)

    glos = _load("glosario")
    valid.add("/glosario")
    valid.update("/glosario/" + g["slug"] for g in glos if g.get("slug"))

    for c in _load("comparaciones"):
        if c.get("slug"):
            valid.add("/comparar/" + c["slug"])
    for t in _load("tablas"):
        if t.get("slug"):
            valid.add("/tabla/" + t["slug"])
    for a in _load("argentina"):
        prov = a.get("provincia") or a.get("province")
        if prov and a.get("slug"):
            valid.add(f"/argentina/{prov}/{a['slug']}")
    valid.add("/iibb")

    cats = set(CATEGORY_LABELS)
    for c in all_calcs["calcs"]:
        if c.get("category"):
            cats.add(c["category"])
    valid.update("/categoria/" + c for c in cats)

    valid.update(_static_routes())
    valid.update(_dynamic_routes())
    valid.update(_public_routes())
    valid.update(["/feed.json", "/search-index.json", "/rss.xml",
                  "/oembed.json", "/embed.js", "/sitemap.xml",
                  "/sitemap-index.xml"])

    # redirects 301
    redir: dict[str, str] = {}
    rf = PUBLIC / "_redirects"
    if rf.exists():
        for line in rf.read_text(encoding="utf-8").splitlines():
            line = line.strip()
            if line and not line.startswith("#"):
                parts = line.split()
                if len(parts) >= 2 and parts[0].startswith("/"):
                    redir[norm(parts[0])] = norm(parts[1])
    pr = LIB / "pruning-redirects.ts"
    if pr.exists():
        txt = pr.read_text(encoding="utf-8")
        for m in re.finditer(r"""['"](/[^'"]+)['"]\s*:\s*['"]([^'"]+)['"]""", txt):
            redir[norm(m.group(1))] = norm(m.group(2))

    gone: set[str] = set()
    g410 = LIB / "gone-410.ts"
    if g410.exists():
        for m in re.finditer(r"""['"](/[^'"]+)['"]""", g410.read_text(encoding="utf-8")):
            gone.add(norm(m.group(1)))

    return {
        "valid": valid, "redir": redir, "gone": gone,
        "slugs_by_coll": slugs_by_coll, "all_calcs": all_calcs,
        "calc_collections": CALC_COLLECTIONS,
        "guia_slugs": guia_slugs, "blog_slugs": blog_slugs,
        "guias": guias, "blog": blog,
    }


# ---------------------------------------------------------------------------
MD_LINK = re.compile(r"\[([^\]\n]*)\]\((/[^)\s]+)\)")
HREF = re.compile(r"""href\s*=\s*["'](/[^"'\s]+)["']""")


def detect(idx: dict) -> dict:
    valid, redir, gone = idx["valid"], idx["redir"], idx["gone"]
    slugs_by_coll = idx["slugs_by_coll"]
    CC = idx["calc_collections"]

    def resolves(p: str) -> bool:
        p = norm(p)
        return p in valid or p in redir

    broken_href, broken_gone, broken_lookup = [], [], []

    def check_href(path, source, raw=None):
        p = norm(path)
        if not p.startswith("/"):
            return
        if SKIP_EXT.search(p) and p not in gone:
            return
        if p in gone:
            broken_gone.append({"path": p, "source": source, "raw": raw})
        elif not resolves(p):
            broken_href.append({"path": p, "source": source, "raw": raw})

    def walk(obj):
        if isinstance(obj, str):
            yield obj
        elif isinstance(obj, dict):
            for v in obj.values():
                yield from walk(v)
        elif isinstance(obj, list):
            for v in obj:
                yield from walk(v)

    def scan_inline(items):
        for c in items:
            src = c.get("__file", "?")
            for s in walk({k: v for k, v in c.items() if not k.startswith("__")}):
                for m in MD_LINK.finditer(s):
                    check_href(m.group(2), src, m.group(0))
                for m in HREF.finditer(s):
                    check_href(m.group(1), src, m.group(0))

    for coll in CC:
        scan_inline(idx["all_calcs"][coll])
    scan_inline(idx["guias"])
    scan_inline(idx["blog"])
    for extra in ("glosario", "comparaciones", "tablas"):
        scan_inline(_load(extra))

    # relatedSlugs: RelatedCalcs resuelve manualSlugs contra la colección del MISMO
    # locale (bySlug se arma sólo con calcModules[lang], sin fallback a AR — ver
    # src/components/RelatedCalcs.astro). Un relatedSlug que no existe en su propia
    # colección no renderiza card → entrada muerta. Validación: same-locale para todos.
    for coll, prefix in CC.items():
        sset = slugs_by_coll[coll]
        for c in idx["all_calcs"][coll]:
            for rs in c.get("relatedSlugs") or []:
                if rs not in sset:
                    tgt = ("/" + rs) if prefix == "/" else norm(prefix + rs)
                    broken_lookup.append({"path": tgt, "ref": rs,
                                          "source": c["__file"], "field": "relatedSlugs"})
    # sections.calcs resuelve contra calcs ∪ calcs-pe ∪ calcs-ec
    sections_valid = (slugs_by_coll["calcs"] | slugs_by_coll["calcs-pe"]
                      | slugs_by_coll["calcs-ec"])
    for g in idx["guias"]:
        for sec in g.get("sections") or []:
            for cs in sec.get("calcs") or []:
                if cs not in sections_valid:
                    broken_lookup.append({"path": "/" + cs, "ref": cs,
                                          "source": g["__file"], "field": "sections.calcs"})
    for b in idx["blog"]:
        for cs in b.get("relatedCalcs") or []:
            # El blog admite dos contratos: slug de calc (sin '/') o ruta
            # directa a un hub/índice (con '/'). Las rutas directas ya pasan
            # por la resolución de hubs en src/pages/blog/[slug].astro.
            if isinstance(cs, str) and cs.startswith('/'):
                if not resolves(cs):
                    broken_lookup.append({"path": cs, "ref": cs,
                                          "source": b["__file"], "field": "relatedCalcs"})
            elif cs not in slugs_by_coll["calcs"]:
                broken_lookup.append({"path": "/" + cs, "ref": cs,
                                      "source": b["__file"], "field": "relatedCalcs"})
        for rp in b.get("relatedPosts") or []:
            if rp not in idx["blog_slugs"]:
                broken_lookup.append({"path": "/blog/" + rp, "ref": rp,
                                      "source": b["__file"], "field": "relatedPosts"})

    # .astro hardcoded
    for base in (PAGES, COMPONENTS):
        for f in base.rglob("*.astro"):
            txt = f.read_text(encoding="utf-8")
            for m in HREF.finditer(txt):
                href = m.group(1)
                if "${" in href or "{" in href:
                    continue
                check_href(href, str(f.relative_to(ROOT)), m.group(0))

    def dedupe(lst, key):
        seen, out = set(), []
        for x in lst:
            k = key(x)
            if k in seen:
                continue
            seen.add(k)
            out.append(x)
        return out

    return {
        "broken_href": dedupe(broken_href, lambda x: (x["path"], x["source"])),
        "broken_gone": dedupe(broken_gone, lambda x: (x["path"], x["source"])),
        "broken_lookup": dedupe(broken_lookup, lambda x: (x["path"], x["source"], x["field"])),
    }


def main():
    idx = build_index()
    res = detect(idx)
    bh, bg, bl = res["broken_href"], res["broken_gone"], res["broken_lookup"]
    print("=" * 70)
    print(f"VÁLIDOS: {len(idx['valid'])} | redirects 301: {len(idx['redir'])} | 410: {len(idx['gone'])}")
    print("=" * 70)
    print(f"[A] Links VISIBLES rotos (404):   {len(bh)}")
    print(f"[A] Links VISIBLES a 410 (gone):  {len(bg)}")
    print(f"[B] Refs lookup que NO resuelven: {len(bl)}")
    print(f"TOTAL: {len(bh) + len(bg) + len(bl)}")
    freq = defaultdict(int)
    for x in bh + bg + bl:
        freq[x["path"]] += 1
    print("\n— Top 25 targets rotos —")
    for path, n in sorted(freq.items(), key=lambda kv: -kv[1])[:25]:
        print(f"  {n:4d}  {path}")
    if "--json" in sys.argv:
        out = sys.argv[sys.argv.index("--json") + 1]
        Path(out).write_text(json.dumps(res, ensure_ascii=False, indent=2))
        print(f"\n→ {out}")


if __name__ == "__main__":
    main()
