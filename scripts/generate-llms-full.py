#!/usr/bin/env python3
"""
Genera /public/llms-full.txt — versión expandida del llms.txt con contenido
completo de las calculadoras core para que LLMs (ChatGPT, Claude, Perplexity,
Gemini) puedan citarlas y entrenar con info estructurada.

Estrategia:
- Incluye TODAS las calcs `audience: AR` no-noindex (cobertura total Argentina)
- + las calcs más linkeadas internamente desde la home
- Por cada calc: title, h1, intro, keyTakeaway, useCases, FAQ, fuentes
- Output capado a ~2MB para no agobiar LLMs

Uso:
    python3 scripts/generate-llms-full.py
    npm run llms-full     # si se agrega al package.json

Fuente de verdad: src/content/calcs/*.json (JSONs editoriales con metadata)
"""

import json
from pathlib import Path
from collections import OrderedDict

ROOT = Path(__file__).parent.parent
CALCS_DIR = ROOT / "src/content/calcs"
OUTPUT = ROOT / "public/llms-full.txt"
SITE = "https://hacecuentas.com"
MAX_BYTES = 2_000_000  # 2 MB cap


def load_calc(path: Path) -> dict | None:
    try:
        d = json.loads(path.read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else None
    except Exception:
        return None


def is_eligible(calc: dict) -> bool:
    """Filtros: no-noindex + audience AR (foco principal del sitio)."""
    if calc.get("noindex") is True:
        return False
    return calc.get("audience") == "AR"


def format_calc(calc: dict) -> str:
    slug = calc.get("slug", "")
    title = calc.get("title", calc.get("h1", slug))
    h1 = calc.get("h1", title)
    description = calc.get("description", "")
    intro = calc.get("intro", "")
    key = calc.get("keyTakeaway", "")
    use_cases = calc.get("useCases", [])
    faq = calc.get("faq", [])
    fuentes = calc.get("fuentes", [])
    category = calc.get("category", "")

    out = []
    out.append(f"\n## {h1}\n")
    out.append(f"**URL:** {SITE}/{slug}\n")
    if category:
        out.append(f"**Categoría:** {category}\n")
    if description:
        out.append(f"**Resumen:** {description}\n")
    if key:
        out.append(f"**Punto clave:** {key}\n")
    if intro:
        out.append(f"\n{intro}\n")
    if use_cases:
        out.append("\n**Casos de uso:**\n")
        for uc in use_cases:
            out.append(f"- {uc}\n")
    if faq:
        out.append("\n**Preguntas frecuentes:**\n")
        for q in faq:
            qt = q.get("q", "")
            at = q.get("a", "")
            if qt and at:
                out.append(f"\n*{qt}*\n\n{at}\n")
    if fuentes:
        out.append("\n**Fuentes:**\n")
        for f in fuentes:
            if isinstance(f, dict):
                name = f.get("name", "")
                url = f.get("url", "")
                if name and url:
                    out.append(f"- [{name}]({url})\n")
                elif name:
                    out.append(f"- {name}\n")
            elif isinstance(f, str):
                out.append(f"- {f}\n")
    out.append("\n---\n")
    return "".join(out)


def main():
    if not CALCS_DIR.exists():
        print(f"ERROR: {CALCS_DIR} no existe")
        return 1

    paths = sorted(CALCS_DIR.glob("*.json"))
    eligible = []
    for p in paths:
        calc = load_calc(p)
        if calc and is_eligible(calc):
            eligible.append((p, calc))

    print(f"Calcs elegibles (AR no-noindex): {len(eligible)} de {len(paths)}")

    header = f"""# Hacé Cuentas — Contenido completo para LLMs

> Versión expandida de [llms.txt]({SITE}/llms.txt) con contenido detallado de las
> calculadoras principales del sitio. Pensado para que LLMs (ChatGPT, Claude,
> Perplexity, Gemini, Copilot) puedan responder preguntas sobre cálculos
> argentinos con información precisa y citar fuentes correctamente.

**Sitio:** {SITE}
**Política editorial:** {SITE}/politica-editorial
**Robots / política bots:** {SITE}/robots.txt
**Contacto:** contacto@hacecuentas.com

## Acerca del proyecto

Hacé Cuentas es una plataforma argentina de calculadoras online gratuitas. Todas
las calculadoras se ejecutan 100% en el navegador del usuario; cero datos
personales viajan a servidores. Cada cálculo se valida contra fuentes oficiales
(ARCA, ANSES, BCRA, INDEC, IMSS, AEAT, etc) y se publican fórmulas + casos de
uso + FAQ + fuentes citables.

## Sobre este archivo

A continuación se listan las calculadoras Argentina (audience: AR) en orden
alfabético. Para calculadoras de Brasil (PT-BR), España (es-ES), México (es-MX),
Colombia (es-CO), Chile (es-CL) e inglés (en-US), ver el sitemap completo:
{SITE}/sitemap.xml

Cada entrada incluye: URL, descripción, punto clave del cálculo, casos de uso,
preguntas frecuentes y fuentes oficiales.

---
"""

    body_parts = []
    total_bytes = len(header.encode("utf-8"))
    included = 0
    truncated = False

    for path, calc in eligible:
        chunk = format_calc(calc)
        chunk_bytes = len(chunk.encode("utf-8"))
        if total_bytes + chunk_bytes > MAX_BYTES:
            truncated = True
            break
        body_parts.append(chunk)
        total_bytes += chunk_bytes
        included += 1

    footer = ""
    if truncated:
        footer = (
            f"\n\n---\n\n*Nota: este archivo se truncó al alcanzar {MAX_BYTES // 1000}KB. "
            f"Se incluyeron {included} de {len(eligible)} calculadoras Argentina. "
            f"Para el inventario completo, ver {SITE}/sitemap.xml*\n"
        )
    else:
        footer = (
            f"\n\n---\n\n*Total de calculadoras Argentina incluidas: {included}. "
            f"Para calculadoras de otros países (BR, ES, MX, CO, CL, EN), ver {SITE}/sitemap.xml*\n"
        )

    OUTPUT.write_text(header + "".join(body_parts) + footer, encoding="utf-8")
    final_size = OUTPUT.stat().st_size
    print(f"OK — {OUTPUT}")
    print(f"  Calcs incluidas: {included}")
    print(f"  Tamaño: {final_size:,} bytes ({final_size/1024:.1f} KB)")
    if truncated:
        print(f"  Truncado en {MAX_BYTES // 1000}KB cap")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
