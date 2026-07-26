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

from __future__ import annotations

import json
from pathlib import Path
from collections import OrderedDict

ROOT = Path(__file__).parent.parent
CALCS_DIR = ROOT / "src/content/calcs"
OUTPUT = ROOT / "public/llms-full.txt"
SITE = "https://hacecuentas.com"
MAX_BYTES = 2_000_000  # 2 MB cap

# Calcs de colecciones país que merecen entrar aunque no sean audience AR
# (campaña estacional agosto 2026, 14 mercados — todas con answerSnippet).
EXTRA_CALC_FILES = [
    "src/content/calcs-cl/calculadora-presupuesto-asado-18-fiestas-patrias-chile.json",
    "src/content/calcs-co/calculadora-fecha-declaracion-renta-2026-colombia-cedula.json",
    "src/content/calcs-do/calculadora-presupuesto-utiles-escolares-republica-dominicana.json",
    "src/content/calcs-en/back-to-school-budget-calculator.json",
    "src/content/calcs-en/sales-tax-holiday-2026-savings-calculator.json",
    "src/content/calcs-es/calculadora-coste-vuelta-al-cole-2026.json",
    "src/content/calcs-es/calculadora-devolucion-renta-2025-cuanto-tarda.json",
    "src/content/calcs-mx/calculadora-gasto-regreso-clases-2026-mexico.json",
    "src/content/calcs-pt-pt/calculadora-orcamento-regresso-as-aulas-2026.json",
    "src/content/calcs-pt-pt/calculadora-reembolso-irs-2026-quando-recebo.json",
    "src/content/calcs-pt/calculadora-orcamento-presente-dia-dos-pais.json",
    "src/content/calcs-pt/calculadora-restituicao-imposto-renda-2026-lotes.json",
]

# Páginas .astro estáticas de eventos/actualidad (no viven en src/content/calcs,
# así que se listan acá con su respuesta directa). Mantener las respuestas en
# sync con el contenido de src/pages/*.astro.
STATIC_PAGES = [
    ("¿Quién ganó el Mundial 2026?", "campeon-mundial-2026",
     "España fue el campeón del Mundial 2026: le ganó la final 1-0 a Argentina en el alargue, el 19 de julio de 2026 en el MetLife Stadium (Nueva York/Nueva Jersey). Argentina fue subcampeona defendiendo el título de Qatar 2022."),
    ("Fixture y resultados del Mundial 2026", "fixture-mundial-2026",
     "Los 104 partidos del Mundial 2026 (11 de junio al 19 de julio, USA-México-Canadá, 48 selecciones) con todos los resultados finales, en hora local del usuario."),
    ("Tabla de posiciones del Mundial 2026", "posiciones-mundial-2026",
     "Posiciones finales de los 12 grupos del Mundial 2026. Clasificaron a eliminación directa los 2 primeros de cada grupo más los 8 mejores terceros."),
    ("Goleadores del Mundial 2026", "goleadores-mundial-2026",
     "Tabla final de goleadores del Mundial 2026 (Bota de Oro), con detalle de penales y los máximos goleadores históricos de los Mundiales."),
    ("Llave del Mundial 2026", "llave-mundial-2026",
     "Cuadro completo de la fase eliminatoria del Mundial 2026: 32avos, octavos, cuartos, semifinales y la final que España le ganó 1-0 a Argentina."),
    ("Balón de Oro del Mundial 2026", "balon-de-oro-mundial-2026",
     "Mejor jugador (Balón de Oro) y máximo goleador (Bota de Oro) del Mundial 2026, más los ganadores históricos del Balón de Oro 1986-2026."),
    ("¿Cuándo juega Argentina en el Mundial 2026?", "cuando-juega-argentina-mundial-2026",
     "Calendario completo de la Selección Argentina en el Mundial 2026 con todos sus resultados, hasta la final del 19 de julio que perdió 1-0 con España."),
    ("Dónde ver el Mundial 2026 por país", "donde-ver-mundial-2026",
     "Canales de TV abierta, TV paga y streaming con derechos del Mundial 2026 en Argentina, México, Colombia, Chile, Perú, Ecuador, España y Estados Unidos."),
    ("Partidos de hoy del Mundial 2026", "partidos-hoy-mundial-2026",
     "Los partidos del Mundial 2026 del día, con horarios convertidos a la zona del usuario y resultados."),
    ("Mundial 2026 — hub de calculadoras", "mundial-2026",
     "Todas las calculadoras y páginas del Mundial 2026: campeón, fixture, posiciones, goleadores, llave, horarios por huso y más."),
    ("Calendario de pagos ANSES agosto 2026", "calendario-pagos-anses-agosto-2026",
     "ANSES paga en agosto 2026 con aumento del 1,89% (movilidad IPC junio). Jubilados hasta la mínima: del 10 al 24 de agosto; superan la mínima: del 25 al 31; AUH y SUAF: del 10 al 21; PNC: del 10 al 14, según terminación del DNI. El feriado del lunes 17 (San Martín) corre parte del cronograma."),
    ("¿Cuándo es el Día del Niño 2026?", "dia-del-nino-2026-cuando-es",
     "El Día del Niño (Día de las Infancias) 2026 en Argentina es el domingo 16 de agosto — tercer domingo de agosto según el decreto 562/2025 — y cae en el fin de semana largo del 15 al 17 de agosto."),
]


def load_calc(path: Path) -> dict | None:
    try:
        d = json.loads(path.read_text(encoding="utf-8"))
        return d if isinstance(d, dict) else None
    except Exception:
        return None


def _has_valid_reviewer(calc: dict) -> bool:
    r = calc.get("professionalReviewer")
    if not isinstance(r, dict):
        return False
    return all(r.get(k) for k in ("name", "profession", "credential", "profileUrl", "reviewedAt"))


def is_restricted(calc: dict) -> bool:
    """Espeja src/lib/content-policy.ts isRestrictedCalc: restringida si
    distribution=='restricted' o (ymylRisk=='high' sin revisor profesional válido)."""
    if calc.get("distribution") == "restricted":
        return True
    if calc.get("ymylRisk") == "high" and not _has_valid_reviewer(calc):
        return True
    return False


def is_eligible(calc: dict) -> bool:
    """Filtros: no-noindex + no-restringida (YMYL) + audience AR."""
    if calc.get("noindex") is True or is_restricted(calc):
        return False
    return calc.get("audience") == "AR"


def format_calc(calc: dict, url_prefix: str = "") -> str:
    slug = url_prefix + calc.get("slug", "")
    title = calc.get("title", calc.get("h1", slug))
    h1 = calc.get("h1", title)
    description = calc.get("description", "")
    answer = calc.get("answerSnippet", "")
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
    if answer:
        out.append(f"**Respuesta:** {answer}\n")
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
**API para agentes (entrada recomendada):** {SITE}/api/calcs-top.json (top 200 calculadoras, ~44 KB; el catálogo completo {SITE}/api/calcs-index.json pesa 3.6 MB)
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

    # Sección 1: páginas estáticas de eventos/actualidad (.astro) — no viven en
    # src/content/calcs, se listan curadas con su respuesta directa.
    static_section = ["\n# Páginas de eventos y actualidad\n"]
    for name, slug, answer in STATIC_PAGES:
        static_section.append(f"\n## {name}\n**URL:** {SITE}/{slug}\n**Respuesta:** {answer}\n")
    static_section.append("\n---\n")
    chunk = "".join(static_section)
    body_parts.append(chunk)
    total_bytes += len(chunk.encode("utf-8"))

    # Sección 2: calcs destacadas de otros países (campañas estacionales).
    extra_parts = []
    for rel in EXTRA_CALC_FILES:
        p = ROOT / rel
        calc = load_calc(p) if p.exists() else None
        if calc and calc.get("noindex") is not True and not is_restricted(calc):
            # calcs-mx → /mx/<slug>, calcs-pt-pt → /pt-pt/<slug>, etc.
            locale = p.parent.name.removeprefix("calcs-")
            extra_parts.append(format_calc(calc, url_prefix=f"{locale}/"))
        elif not p.exists():
            print(f"  AVISO: extra calc no encontrada: {rel}")
    if extra_parts:
        chunk = "\n# Calculadoras destacadas de otros países\n" + "".join(extra_parts)
        body_parts.append(chunk)
        total_bytes += len(chunk.encode("utf-8"))

    body_parts.append("\n# Calculadoras Argentina\n")
    total_bytes += len(body_parts[-1].encode("utf-8"))

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
