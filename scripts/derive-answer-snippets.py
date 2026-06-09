#!/usr/bin/env python3
"""Deriva answerSnippet (AEO/Copilot) para calcs que no lo tienen, a partir de
contenido YA REVISADO del propio JSON (intro → keyTakeaway → description).
NO inventa datos: extrae/condensa texto existente. Inserción dirigida (mínimo diff).

Uso:
  python3 scripts/derive-answer-snippets.py            # dry-run (muestra + cuenta)
  python3 scripts/derive-answer-snippets.py --apply    # escribe los JSON
  python3 scripts/derive-answer-snippets.py --apply --colls calcs,calcs-en
"""
from __future__ import annotations
import json, re, sys, glob
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_COLLS = ["calcs"]
MIN_W, MAX_W, HARD_MAX = 22, 55, 70


def strip_md(s: str) -> str:
    s = re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)      # links → texto
    s = re.sub(r"[*_`#>]+", "", s)                       # bold/italic/headers
    s = re.sub(r"\s+", " ", s).strip()
    return s


# Frases-boilerplate (filler genérico) que NO deben encabezar/ensuciar un answerSnippet.
# Match por substring en minúsculas; se descartan dondequiera que aparezcan.
BOILERPLATE = [
    "la vida cotidiana está llena de números",
    "en finanzas personales las decisiones se mejoran",
    "la nutrición y el fitness se basan en principios",
    "las fórmulas validadas te dan puntos de partida",
    "los valores están actualizados a 2026 y se revisan",
    "se revisan periódicamente para mantenerte al día",
    "el cálculo corre en tu navegador",
    "no guardamos tus datos",
    "no requiere registro y es gratis",
    "los números que conviene tener claros",
]


def first_sentences(text: str, max_w: int = MAX_W) -> str:
    """Toma oraciones completas hasta ~max_w palabras, descartando boilerplate."""
    text = strip_md(text)
    if not text:
        return ""
    # cortar markdown table / headings: nos quedamos con prosa antes del primer salto a tabla
    text = text.split("\n|")[0].split("\n##")[0].strip()
    sents = [s for s in re.split(r"(?<=[.?!])\s+", text)
             if not any(b in s.lower() for b in BOILERPLATE)]
    out, wc = [], 0
    for s in sents:
        sw = len(s.split())
        if not out:                       # siempre incluir la primera
            out.append(s); wc += sw
            if wc >= max_w:
                break
            continue
        if wc + sw > max_w:
            break
        out.append(s); wc += sw
    res = " ".join(out).strip()
    # si la 1ª oración sola es enorme, recortar a HARD_MAX palabras en límite de palabra
    if len(res.split()) > HARD_MAX:
        res = " ".join(res.split()[:HARD_MAX]).rstrip(",;: ") + "…"
    return res


def derive(d: dict) -> tuple[str, str] | None:
    """Devuelve (snippet, fuente) o None si no se puede derivar con calidad."""
    # 1) intro: la mejor fuente (resumen en prosa, revisado)
    intro = d.get("intro") or ""
    cand = first_sentences(intro)
    if MIN_W <= len(cand.split()) <= HARD_MAX:
        return cand, "intro"
    # 2) keyTakeaway: conciso + con números (limpiar bold)
    kt = strip_md(d.get("keyTakeaway") or "")
    if MIN_W <= len(kt.split()) <= HARD_MAX:
        return kt, "keyTakeaway"
    # 3) description (marketing, pero grounded) si es suficientemente sustancial
    desc = strip_md(d.get("description") or "")
    desc = first_sentences(desc, MAX_W)
    if MIN_W <= len(desc.split()) <= HARD_MAX:
        return desc, "description"
    # 4) intro aunque sea cortito (≥12) como último recurso
    if intro:
        c2 = first_sentences(intro, HARD_MAX)
        if len(c2.split()) >= 12:
            return c2, "intro-short"
    return None


def insert_after_slug(raw: str, value: str) -> str | None:
    """Inserta "answerSnippet": "<value>", justo después de la línea de slug,
    preservando indentación. Devuelve None si no encuentra anchor o ya existe."""
    if '"answerSnippet"' in raw:
        return None
    m = re.search(r'(^[ \t]*)"slug"\s*:\s*"[^"]*"\s*,?\s*$', raw, flags=re.M)
    if not m:
        return None
    indent = m.group(1)
    line_end = raw.index("\n", m.end()) if "\n" in raw[m.end():] else len(raw)
    enc = json.dumps(value, ensure_ascii=False)
    new_line = f'\n{indent}"answerSnippet": {enc},'
    return raw[:line_end] + new_line + raw[line_end:]


def main():
    apply = "--apply" in sys.argv
    colls = DEFAULT_COLLS
    if "--colls" in sys.argv:
        colls = sys.argv[sys.argv.index("--colls") + 1].split(",")

    stats = {"total": 0, "had": 0, "derived": 0, "skipped": 0, "written": 0}
    by_src = {}
    samples = []
    for coll in colls:
        for f in sorted(glob.glob(str(ROOT / f"src/content/{coll}/*.json"))):
            try:
                raw = Path(f).read_text(encoding="utf-8")
                d = json.loads(raw)
            except Exception:
                continue
            if not isinstance(d, dict) or not d.get("slug"):
                continue
            stats["total"] += 1
            if d.get("answerSnippet"):
                stats["had"] += 1
                continue
            res = derive(d)
            if not res:
                stats["skipped"] += 1
                continue
            snippet, src = res
            stats["derived"] += 1
            by_src[src] = by_src.get(src, 0) + 1
            if len(samples) < 18:
                samples.append((d["slug"], src, len(snippet.split()), snippet))
            if apply:
                new = insert_after_slug(raw, snippet)
                if new:
                    json.loads(new)  # validar JSON antes de escribir
                    Path(f).write_text(new, encoding="utf-8")
                    stats["written"] += 1

    print("=" * 64)
    print(f"colecciones: {colls}")
    print(f"total calcs:        {stats['total']}")
    print(f"  ya tenían:        {stats['had']}")
    print(f"  derivables:       {stats['derived']}  (fuente: {by_src})")
    print(f"  NO derivables:    {stats['skipped']}  (quedan para mano)")
    if apply:
        print(f"  ESCRITAS:         {stats['written']}")
    print("=" * 64)
    print("\n— Muestra (slug · fuente · palabras) —")
    for slug, src, w, sn in samples:
        print(f"\n[{src} · {w}w] {slug}\n  {sn}")


if __name__ == "__main__":
    main()
