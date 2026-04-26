#!/usr/bin/env python3
"""Fix thin content en calcs JSON usando Claude API con prompt caching + paralelismo."""
import os, json, sys, asyncio, re
from pathlib import Path
from anthropic import AsyncAnthropic

# Load API key from .env
env_file = Path(__file__).parent.parent / ".env"
for line in env_file.read_text().splitlines():
    if line.startswith("ANTHROPIC_API_KEY="):
        os.environ["ANTHROPIC_API_KEY"] = line.split("=", 1)[1].strip()
        break

BASE = Path(__file__).parent.parent / "src/content"
LANG_MAP = {
    "calcs": ("español argentino", "AFIP, ANSES, BCRA, INDEC, Ministerio de Trabajo, OMS, ACSM, NIST, IRAM, INTI, INTA, Wikipedia ES"),
    "calcs-en": ("US English", "IRS, CDC, NIH, USDA, NOAA, Department of Labor, BLS, NIST, Wikipedia EN"),
    "calcs-pt": ("português brasileiro", "Receita Federal, INSS, IBGE, BCB, MS, SUS, INMETRO, Wikipedia PT"),
    "calcs-mx": ("español mexicano", "SAT, IMSS, INEGI, CONDUSEF, SSA, Wikipedia ES"),
    "calcs-es": ("español ibérico", "AEAT, SEPE, INE, Banco de España, Wikipedia ES"),
}

SYSTEM_PROMPT = """Sos un experto generador de contenido técnico para hacecuentas.com (calculadoras online).

Tu trabajo: dada una calculadora con contenido "thin" (vacío o genérico), generás contenido REAL, específico, con fórmulas, tablas de referencia y datos verificables.

REGLAS INVIOLABLES:
1. intro ≥250 chars: explica qué mide, fórmula clave, cuándo se usa. NO frases genéricas.
2. keyTakeaway ≥80 chars: fórmula/regla en **negrita** con valores reales.
3. useCases ≥4 items: situaciones REALES específicas al tema, NO genéricas ("resolver una duda").
4. explanation ≥1200 chars markdown con secciones obligatorias:
   - `## Cómo se calcula` con FÓRMULA REAL en code block
   - `## Tabla de referencia` con tabla markdown con DATOS REALES
   - `## Casos típicos` (2-3 ejemplos con números concretos)
   - `## Errores comunes` (4+ errores con por qué)
   - `## Calculadoras relacionadas` con links internos tipo `[texto](/calculadora-slug)`
5. faq ≥7 preguntas sustanciales: cada respuesta 2-4 líneas con DATOS (números, leyes, %).
6. sources ≥1: URL real verificable de organismo oficial (NO inventar URLs).

PROHIBIDO:
- "aplica la fórmula estándar del dominio"
- "relación exacta depende del problema"
- "Resultado = f(Input1, Input2)"
- FAQ con respuestas <20 chars
- Sources inventadas
- Tocar campos: slug, title, h1, description, category, icon, formulaId, audience, fields, outputs, dataUpdate, relatedSlugs, howToSteps, seoKeywords

Devolvés SOLO los 6 campos: intro, keyTakeaway, useCases (array), explanation (markdown), faq (array de {q,a}), sources (array de {name,url})."""

TOOL_SCHEMA = {
    "name": "generate_calc_content",
    "description": "Genera contenido sustancial para una calculadora de hacecuentas.com",
    "input_schema": {
        "type": "object",
        "properties": {
            "intro": {"type": "string", "description": "≥250 chars, específico al tema"},
            "keyTakeaway": {"type": "string", "description": "≥80 chars, fórmula en **negrita**"},
            "useCases": {"type": "array", "items": {"type": "string"}, "minItems": 4},
            "explanation": {"type": "string", "description": "≥1200 chars markdown con 5 secciones obligatorias"},
            "faq": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"q": {"type": "string"}, "a": {"type": "string"}},
                    "required": ["q", "a"]
                },
                "minItems": 7,
            },
            "sources": {
                "type": "array",
                "items": {
                    "type": "object",
                    "properties": {"name": {"type": "string"}, "url": {"type": "string"}},
                    "required": ["name", "url"]
                },
                "minItems": 1,
            },
            "example": {
                "type": "object",
                "description": "Ejemplo numérico concreto",
                "properties": {
                    "title": {"type": "string"},
                    "steps": {"type": "array", "items": {"type": "string"}},
                    "result": {"type": "string"}
                },
                "required": ["title", "steps", "result"]
            },
            "seoKeywords": {
                "type": "array",
                "items": {"type": "string"},
                "description": "≥5 keywords relevantes al tema",
                "minItems": 5,
            },
        },
        "required": ["intro", "keyTakeaway", "useCases", "explanation", "faq", "sources", "example", "seoKeywords"],
    },
}

def is_thin(d):
    return (len((d.get("explanation") or "")) < 800
            or len(d.get("faq") or []) < 7
            or len(d.get("sources") or []) < 1
            or len((d.get("intro") or "")) < 200
            or not d.get("example")
            or len((d.get("keyTakeaway") or "")) < 50
            or len(d.get("useCases") or []) < 3
            or len(d.get("seoKeywords") or []) < 3)

def build_user_prompt(data, lang_info):
    lang, sources_hint = lang_info
    fields = data.get("fields", [])
    outputs = data.get("outputs", [])
    example = data.get("example", {})
    related = data.get("relatedSlugs", [])[:6]
    related_str = ", ".join(related) if related else "ninguno"
    fields_str = "; ".join([f"{f.get('id')}: {f.get('label','')}" for f in fields[:6]])
    outputs_str = "; ".join([f"{o.get('id')}: {o.get('label','')}" for o in outputs[:4]])
    ex = f"Inputs {example.get('steps', [])} → {example.get('result','')}" if example else "sin ejemplo"
    return f"""Idioma: {lang}
Fuentes oficiales del país/tema (usá solo reales de estas): {sources_hint}

Calculadora:
- slug: {data.get('slug')}
- title: {data.get('title')}
- h1: {data.get('h1')}
- category: {data.get('category')}
- formulaId: {data.get('formulaId')}
- fields: {fields_str}
- outputs: {outputs_str}
- example: {ex}
- relatedSlugs (para linking interno): {related_str}

Generá los 6 campos con contenido real, fórmulas, tablas y datos concretos. El idioma del output debe ser {lang}."""

async def process_calc(client, rel_path, sem, stats):
    async with sem:
        fp = BASE / rel_path
        try:
            data = json.loads(fp.read_text())
        except Exception as e:
            stats["errors"].append(f"{rel_path}: parse {e}")
            return
        if not is_thin(data):
            stats["already_ok"] += 1
            return
        lang_dir = rel_path.split("/")[0]
        lang_info = LANG_MAP.get(lang_dir, LANG_MAP["calcs"])
        user_prompt = build_user_prompt(data, lang_info)
        out = None
        for attempt in range(3):
            extra = ""
            if attempt == 1:
                extra = "\n\n⚠️ RETRY: tu output anterior fue RECHAZADO por estar bajo los mínimos. Esta vez: explanation MÍNIMO 1400 chars (sé detallado, agregá tablas grandes, más casos típicos, más errores comunes). FAQ MÍNIMO 8 preguntas con respuestas 3-5 líneas cada una. NO repitas el error anterior."
            elif attempt == 2:
                extra = "\n\n⚠️ RETRY FINAL: Generá explanation de 1800+ chars. FAQ de 9+ preguntas. Sé EXHAUSTIVO. Agregá múltiples tablas, subsecciones, más ejemplos. Cada FAQ answer mínimo 60 palabras."
            try:
                resp = await client.messages.create(
                    model="claude-sonnet-4-6",
                    max_tokens=8192,
                    system=[{"type": "text", "text": SYSTEM_PROMPT, "cache_control": {"type": "ephemeral"}}],
                    tools=[TOOL_SCHEMA],
                    tool_choice={"type": "tool", "name": "generate_calc_content"},
                    messages=[{"role": "user", "content": user_prompt + extra}],
                )
            except Exception as e:
                stats["errors"].append(f"{rel_path}: api {e}")
                return
            tool_block = next((b for b in resp.content if b.type == "tool_use"), None)
            if not tool_block:
                continue
            candidate = tool_block.input
            stats["in_tokens"] += resp.usage.input_tokens
            stats["out_tokens"] += resp.usage.output_tokens
            stats["cache_read"] += getattr(resp.usage, "cache_read_input_tokens", 0) or 0
            if (len(candidate.get("explanation", "")) >= 800
                    and len(candidate.get("faq", [])) >= 7
                    and len(candidate.get("sources", [])) >= 1
                    and len(candidate.get("intro", "")) >= 200
                    and len(candidate.get("useCases", [])) >= 4
                    and len(candidate.get("keyTakeaway", "")) >= 50
                    and candidate.get("example")
                    and len(candidate.get("seoKeywords", [])) >= 3):
                out = candidate
                break
        if not out:
            stats["errors"].append(f"{rel_path}: output below minimums after 3 attempts")
            return
        # Merge: only overwrite the 6 fields, preserve everything else
        for k in ("intro", "keyTakeaway", "useCases", "explanation", "faq", "sources", "example", "seoKeywords"):
            if k in out:
                data[k] = out[k]
        fp.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")
        stats["modified"] += 1
        if stats["modified"] % 25 == 0:
            print(f"  progress: {stats['modified']} modified, {len(stats['errors'])} errors")

async def main():
    queue_file = sys.argv[1] if len(sys.argv) > 1 else "/tmp/all_thin.json"
    queue = json.load(open(queue_file))
    print(f"Processing {len(queue)} files with 8 parallel workers...")
    client = AsyncAnthropic()
    sem = asyncio.Semaphore(8)
    stats = {"modified": 0, "errors": [], "already_ok": 0, "in_tokens": 0, "out_tokens": 0, "cache_read": 0}
    await asyncio.gather(*[process_calc(client, r, sem, stats) for r in queue])
    print("\n=== DONE ===")
    print(f"Modified: {stats['modified']}")
    print(f"Already OK: {stats['already_ok']}")
    print(f"Errors: {len(stats['errors'])}")
    for e in stats["errors"][:10]:
        print(f"  {e}")
    cost = stats["in_tokens"] * 3 / 1_000_000 + stats["out_tokens"] * 15 / 1_000_000 + stats["cache_read"] * 0.3 / 1_000_000
    print(f"\nTokens input: {stats['in_tokens']}, output: {stats['out_tokens']}, cache_read: {stats['cache_read']}")
    print(f"Estimated cost: US${cost:.2f}")

if __name__ == "__main__":
    asyncio.run(main())
