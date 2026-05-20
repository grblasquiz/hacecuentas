#!/usr/bin/env python3
"""
Aplica regla: "Navidad" SIEMPRE con N mayúscula en todo contenido textual.

Reemplaza `navidad` (lowercase) por `Navidad` en strings dentro de fields
de contenido humano. NO toca slugs/URLs (irían roto el routing) ni paths.

Campos textuales tocados (en JSONs de calcs y blog):
  title, h1, description, intro, keyTakeaway, explanation, useCases (array),
  faq[].q, faq[].a, sources[].name, example.title, example.steps, example.result,
  seoKeywords (array), howToSteps[].name, howToSteps[].text, dataUpdate.notes

NO tocados:
  slug, formulaId, dataUpdate.source, dataUpdate.sourceUrl, sources[].url,
  audience, category, icon, lastReviewed, fields (en general — son nombres
  técnicos), outputs.

Tambien NO toca: src/lib/pruning-redirects.ts (URLs en redirect map).
"""
from __future__ import annotations
import json
import re
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent.parent

# Regex: word "navidad" with N lowercase but NOT inside URL or slug-like
# context. Matches when preceded by word boundary, NOT followed by - + letter
# (i.e., not in slug like "navidad-2026"). Or matched within text strings.
# Approach simpler: replace ALL occurrences in target fields only.
NAV_RE = re.compile(r'\bnavidad\b')

# Campos textuales a fixear
TEXT_FIELDS_DIRECT = {"title", "h1", "description", "intro", "keyTakeaway", "explanation"}
TEXT_FIELDS_ARRAY_OF_STRING = {"seoKeywords", "useCases"}


def fix_string(s: str) -> tuple[str, int]:
    """Replace standalone 'navidad' with 'Navidad'. Returns (new_str, count)."""
    if not isinstance(s, str):
        return s, 0
    new = NAV_RE.sub("Navidad", s)
    return new, len(NAV_RE.findall(s))


def fix_obj(obj: Any, in_text: bool = False) -> tuple[Any, int]:
    total = 0
    if isinstance(obj, dict):
        new = {}
        for k, v in obj.items():
            if k in TEXT_FIELDS_DIRECT:
                if isinstance(v, str):
                    new_v, c = fix_string(v)
                    new[k] = new_v
                    total += c
                else:
                    new[k] = v
            elif k in TEXT_FIELDS_ARRAY_OF_STRING:
                if isinstance(v, list):
                    new_list = []
                    for item in v:
                        if isinstance(item, str):
                            new_item, c = fix_string(item)
                            new_list.append(new_item)
                            total += c
                        else:
                            new_list.append(item)
                    new[k] = new_list
                else:
                    new[k] = v
            elif k == "faq" and isinstance(v, list):
                new_faq = []
                for item in v:
                    if isinstance(item, dict):
                        new_item = {**item}
                        for fk in ("q", "a"):
                            if fk in new_item and isinstance(new_item[fk], str):
                                new_val, c = fix_string(new_item[fk])
                                new_item[fk] = new_val
                                total += c
                        new_faq.append(new_item)
                    else:
                        new_faq.append(item)
                new[k] = new_faq
            elif k == "example" and isinstance(v, dict):
                new_ex = {**v}
                for ek in ("title", "result"):
                    if ek in new_ex and isinstance(new_ex[ek], str):
                        new_val, c = fix_string(new_ex[ek])
                        new_ex[ek] = new_val
                        total += c
                if "steps" in new_ex and isinstance(new_ex["steps"], list):
                    new_steps = []
                    for step in new_ex["steps"]:
                        if isinstance(step, str):
                            ns, c = fix_string(step)
                            new_steps.append(ns)
                            total += c
                        else:
                            new_steps.append(step)
                    new_ex["steps"] = new_steps
                new[k] = new_ex
            elif k == "howToSteps" and isinstance(v, list):
                new_ht = []
                for step in v:
                    if isinstance(step, dict):
                        new_step = {**step}
                        for sk in ("name", "text"):
                            if sk in new_step and isinstance(new_step[sk], str):
                                ns, c = fix_string(new_step[sk])
                                new_step[sk] = ns
                                total += c
                        new_ht.append(new_step)
                    else:
                        new_ht.append(step)
                new[k] = new_ht
            elif k == "sources" and isinstance(v, list):
                new_src = []
                for src in v:
                    if isinstance(src, dict):
                        new_s = {**src}
                        if "name" in new_s and isinstance(new_s["name"], str):
                            ns, c = fix_string(new_s["name"])
                            new_s["name"] = ns
                            total += c
                        new_src.append(new_s)
                    else:
                        new_src.append(src)
                new[k] = new_src
            elif k == "dataUpdate" and isinstance(v, dict):
                new_du = {**v}
                if "notes" in new_du and isinstance(new_du["notes"], str):
                    nn, c = fix_string(new_du["notes"])
                    new_du["notes"] = nn
                    total += c
                new[k] = new_du
            else:
                # Preservar campos no textuales (slug, formulaId, audience, fields, etc.)
                new[k] = v
        return new, total
    return obj, total


def main():
    targets = list((ROOT / "src" / "content").glob("**/*.json"))
    total_files_changed = 0
    total_replacements = 0
    for f in targets:
        try:
            data = json.loads(f.read_text(encoding="utf-8"))
        except Exception:
            continue
        new_data, count = fix_obj(data)
        if count > 0:
            f.write_text(json.dumps(new_data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
            total_files_changed += 1
            total_replacements += count
            print(f"  {count:>3} replacements  {f.relative_to(ROOT)}")
    print(f"\nFiles changed: {total_files_changed}")
    print(f"Total replacements: {total_replacements}")


if __name__ == "__main__":
    main()
