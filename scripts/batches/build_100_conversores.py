#!/usr/bin/env python3
"""Genera los 100 conversores: JSON ricos + fórmulas TS + registración.

Uso: python3 scripts/batches/build_100_conversores.py
"""
import json
import sys
from pathlib import Path
from datetime import date

ROOT = Path(__file__).parent.parent.parent
CALCS_DIR = ROOT / "src" / "content" / "calcs"
FORMULAS_DIR = ROOT / "src" / "lib" / "formulas"
INDEX_FILE = ROOT / "src" / "lib" / "formulas" / "index.ts"
PENDING_FILE = ROOT / "scripts" / "pending-registrations.json"

# Importar specs
sys.path.insert(0, str(Path(__file__).parent))
from batch_100_conversores_part1 import LINEAR
from batch_100_conversores_part2 import LINEAR_P2
from batch_100_conversores_part3 import LINEAR_P3
from batch_100_conversores_part4 import LINEAR_P4

ALL_SPECS = LINEAR + LINEAR_P2 + LINEAR_P3 + LINEAR_P4


def camel(slug):
    p = slug.split('-')
    return p[0] + ''.join(x[:1].upper() + x[1:] for x in p[1:])


def build_intro(spec):
    """Build a rich intro paragraph."""
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]
    hook = spec["intro_hook"]

    origin = spec["factor_origin"]
    # Add 2-3 sentences of body
    body = (
        f" {origin} La conversión es inmediata con los factores actualizados y vale para todos los casos prácticos en Argentina y Latinoamérica. "
        f"Usar este conversor te asegura precisión al instante sin tener que memorizar fórmulas ni hacer cuentas manuales."
    )
    return hook + body


def build_key_takeaway(spec):
    """Build the 'resumen rápido' box."""
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]
    factor = spec["factor"]
    factor_str = spec["factor_str"]

    if spec.get("is_temp"):
        return f"**{u1_abbr} → {u2_abbr}**: `{spec['temp_formula']}`. **{u2_abbr} → {u1_abbr}**: `{spec['temp_inverse']}`."
    if spec.get("is_lookup"):
        return f"**{u1_sing} ↔ {u2_sing}** usa tabla de equivalencias. Factor: {factor_str}. Ver tabla completa abajo."

    inverse = 1.0 / factor if factor else 1.0
    return f"**1 {u1_sing} = {factor_str} {u2_plu}**. **1 {u2_sing} = {inverse:.6g} {u1_plu}**. Factor exacto y estable: la conversión es idéntica en cualquier parte del mundo."


def build_fields(spec):
    """Build input fields."""
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]

    fields = [
        {
            "id": "valor",
            "label": "Valor a convertir",
            "type": "number",
            "placeholder": "10",
            "min": -1000000,
            "step": 0.001,
            "required": True
        },
        {
            "id": "direccion",
            "label": "Dirección de conversión",
            "type": "select",
            "default": "ida",
            "required": True,
            "options": [
                {"value": "ida", "label": f"{u1_plu.capitalize()} → {u2_plu.capitalize()}"},
                {"value": "vuelta", "label": f"{u2_plu.capitalize()} → {u1_plu.capitalize()}"}
            ]
        }
    ]

    # Para cocina gramos-a-tazas, agregar select de ingrediente
    if spec["slug"] == "conversor-gramos-a-tazas-cocina":
        fields.append({
            "id": "ingrediente",
            "label": "Ingrediente",
            "type": "select",
            "default": "harina",
            "required": True,
            "options": [
                {"value": "harina", "label": "Harina 0000 (125 g/cup)"},
                {"value": "azucar", "label": "Azúcar blanca (200 g/cup)"},
                {"value": "azucar-morena", "label": "Azúcar morena (220 g/cup)"},
                {"value": "manteca", "label": "Manteca (227 g/cup)"},
                {"value": "arroz", "label": "Arroz crudo (185 g/cup)"},
                {"value": "cacao", "label": "Cacao en polvo (85 g/cup)"},
                {"value": "agua", "label": "Agua/leche (240 g/cup)"}
            ]
        })

    return fields


def build_outputs(spec):
    """Build output fields."""
    return [
        {"id": "resultado", "label": "Resultado", "format": "text", "primary": True},
        {"id": "resumen", "label": "Resumen", "format": "text"}
    ]


def build_example(spec):
    """Build the example section."""
    return {
        "title": spec["example_real"]["scenario"],
        "steps": spec["example_real"]["steps"],
        "result": spec["example_real"]["result"]
    }


def build_explanation(spec):
    """Build the rich explanation markdown."""
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]
    factor = spec["factor"]
    factor_str = spec["factor_str"]
    origin = spec["factor_origin"]
    table_values = spec.get("table_values", [1, 5, 10, 100, 1000])

    md = []
    md.append(f"## Factor de conversión\n")
    if spec.get("is_temp"):
        md.append(f"**{u1_abbr} → {u2_abbr}**: `{spec['temp_formula']}`\n\n**{u2_abbr} → {u1_abbr}**: `{spec['temp_inverse']}`\n")
        md.append(f"\n{origin}\n")
    elif spec.get("is_lookup"):
        md.append(f"La conversión **{u1_sing} ↔ {u2_sing}** no es lineal: requiere tabla de equivalencias.\n")
        md.append(f"\n{origin}\n")
    else:
        inverse = 1.0 / factor if factor else 1.0
        md.append(f"- **1 {u1_sing} = {factor_str} {u2_plu}**")
        md.append(f"- **1 {u2_sing} = {inverse:.6g} {u1_plu}**")
        md.append(f"\n{origin}\n")

    md.append(f"\n## Tabla de conversión\n")
    md.append(f"| {u1_plu.capitalize()} ({u1_abbr}) | {u2_plu.capitalize()} ({u2_abbr}) |")
    md.append(f"|---|---|")

    if spec.get("is_temp"):
        # Usar tabla con fórmula afín
        slope = spec["factor"]
        offset = spec["offset"]
        for v in table_values:
            result = v * slope + offset
            md.append(f"| {v} | {result:.2f} |")
    elif spec.get("is_lookup"):
        # Para lookups mostrar valores de ejemplo
        for v in table_values:
            md.append(f"| {v} | (ver tabla específica por marca) |")
    else:
        for v in table_values:
            result = v * factor
            md.append(f"| {v} | {result:.6g} |")

    md.append(f"\n## Aplicaciones reales\n")
    md.append("Este conversor es útil en múltiples situaciones:\n")
    for uc in spec["use_cases"]:
        md.append(f"- {uc}")

    md.append(f"\n## Errores comunes al convertir\n")
    md.append(f"- **Mezclar unidades del mismo nombre**: por ejemplo la onza (peso, 28.35 g) con la onza líquida (volumen, 29.57 mL). Siempre verificar si hablamos de peso, volumen o área.")
    md.append(f"- **Aplicar factor lineal a conversión no lineal**: temperaturas no son proporcionales (hay que usar la fórmula afín). Área y volumen usan el cuadrado/cubo del factor lineal.")
    md.append(f"- **Redondeos prematuros**: siempre convertir con los dígitos completos y redondear solo el resultado final. Redondear a mitad de cálculo introduce errores acumulativos.")
    md.append(f"- **Confundir sistemas regionales**: galón US vs UK, milla terrestre vs náutica, stone vs stone troy. Verificar origen del dato.")

    md.append(f"\n## Calculadoras relacionadas\n")
    md.append(f"- [Todos los conversores](/conversor-unidades) — longitud, peso, temperatura, volumen.")
    md.append(f"- [Regla de tres simple](/calculadora-regla-de-tres-simple) — para proporciones.")
    md.append(f"- [Calculadora de porcentajes](/calculadora-porcentajes) — diferencias porcentuales.")

    return "\n".join(md)


def build_faqs(spec):
    """Build 7 FAQs: 4 base automatic + 3 extras from spec."""
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]
    factor = spec["factor"]
    factor_str = spec["factor_str"]

    faqs = []

    # FAQ 1: cuanto es 1 u1 en u2
    if spec.get("is_temp"):
        ref_val = 0
        result = ref_val * spec["factor"] + spec["offset"]
        faqs.append({
            "q": f"¿Cuánto es 0 {u1_abbr} en {u2_abbr}?",
            "a": f"**0 {u1_abbr} = {result:.2f} {u2_abbr}**. La conversión de temperatura no es lineal: usa la fórmula `{spec['temp_formula']}`."
        })
    elif spec.get("is_lookup"):
        faqs.append({
            "q": f"¿Cómo convierto entre {u1_sing} y {u2_sing}?",
            "a": f"Para {u1_plu} ↔ {u2_plu} usá la tabla de equivalencias: varían por marca y fabricante. Siempre verificá la tabla del sitio donde comprás antes de elegir."
        })
    else:
        faqs.append({
            "q": f"¿Cuánto es 1 {u1_sing} en {u2_plu}?",
            "a": f"**1 {u1_sing} = {factor_str} {u2_plu}**. {spec['factor_origin']}"
        })

    # FAQ 2: cuanto es 1 u2 en u1 (inverso)
    if spec.get("is_temp"):
        faqs.append({
            "q": f"¿Cuál es la fórmula inversa de {u2_abbr} a {u1_abbr}?",
            "a": f"**{u1_abbr} = {spec['temp_inverse']}**. Es la fórmula que usás cuando tenés un valor en {u2_plu} y querés saberlo en {u1_plu}."
        })
    elif spec.get("is_lookup"):
        faqs.append({
            "q": f"¿Hay una regla universal para equivaler talles?",
            "a": f"No hay regla única. Los talles varían por país, género y marca. La guía general son las tablas oficiales del fabricante; siempre medí tu cuerpo y comparalo con la tabla específica."
        })
    else:
        inverse = 1.0 / factor if factor else 1.0
        faqs.append({
            "q": f"¿Y cuánto es 1 {u2_sing} en {u1_plu}?",
            "a": f"**1 {u2_sing} = {inverse:.6g} {u1_plu}** (es el inverso exacto del factor de ida). Si tenés un valor en {u2_plu}, dividilo por {factor_str} para pasarlo a {u1_plu}."
        })

    # FAQ 3: ejemplo con valor habitual
    if spec.get("is_temp"):
        val = 100
        result = val * spec["factor"] + spec["offset"]
        faqs.append({
            "q": f"¿Cuánto es 100 {u1_abbr} en {u2_abbr}?",
            "a": f"**100 {u1_abbr} = {result:.2f} {u2_abbr}**. Aplicando la fórmula `{spec['temp_formula']}` paso a paso."
        })
    elif spec.get("is_lookup"):
        faqs.append({
            "q": f"¿Qué marca es más confiable para talles internacionales?",
            "a": f"Las marcas globales grandes (Levi's, Nike, Adidas, Zara, H&M) mantienen tablas estables. Las fast fashion (Shein, Boohoo) pueden variar incluso entre temporadas — siempre verificar medidas actuales."
        })
    else:
        val = 10
        result = val * factor
        faqs.append({
            "q": f"¿Cuánto es {val} {u1_plu} en {u2_plu}?",
            "a": f"**{val} {u1_plu} = {result:.4g} {u2_plu}** (aplicando directamente el factor {factor_str})."
        })

    # FAQ 4: cómo convertir mentalmente (para unidades linales)
    if not spec.get("is_temp") and not spec.get("is_lookup"):
        if factor > 1:
            faqs.append({
                "q": f"¿Se puede convertir {u1_sing} a {u2_sing} mentalmente?",
                "a": f"Podés aproximarlo multiplicando por {round(factor)} (aproximación rápida). Para precisión total, usá el factor exacto {factor_str}. El error con el redondeo es típicamente menor al 5%."
            })
        else:
            faqs.append({
                "q": f"¿Hay un truco mental para convertir?",
                "a": f"Dividir por {round(1.0/factor) if factor else 1} funciona como aproximación rápida. Para precisión exacta usá el factor {factor_str}. El error con el redondeo es típicamente menor al 5%."
            })
    elif spec.get("is_temp"):
        faqs.append({
            "q": f"¿Hay un truco mental para convertir temperaturas?",
            "a": f"Para F→C: restá 30 y dividí por 2 (aproximación). Para C→F: multiplicá por 2 y sumá 30. Error ~2 °C, útil para estimaciones del clima."
        })
    else:
        faqs.append({
            "q": f"¿Cómo medir con precisión para elegir el talle?",
            "a": f"Siempre medir con cinta métrica: pecho, cintura, cadera, entrepierna. Anotá en cm y compará con la tabla del producto que querés comprar. Nunca confíes solo en el talle 'que siempre usás'."
        })

    # Agregar las 3 FAQs extras custom
    for q, a in spec["faqs_extra"]:
        faqs.append({"q": q, "a": a})

    return faqs


def build_sources(spec):
    """Default sources."""
    return [
        {
            "title": "BIPM — Sistema Internacional de Unidades",
            "url": "https://www.bipm.org/en/measurement-units/",
            "publisher": "Bureau International des Poids et Mesures"
        },
        {
            "title": "NIST — Unit Conversion",
            "url": "https://www.nist.gov/pml/owm",
            "publisher": "National Institute of Standards and Technology"
        },
        {
            "title": "Wikipedia — Conversiones de unidades",
            "url": "https://es.wikipedia.org/wiki/Conversi%C3%B3n_de_unidades",
            "publisher": "Wikipedia"
        }
    ]


def build_howto(spec):
    """How-to steps."""
    return [
        {"name": "Ingresá el valor", "text": "Escribí el valor numérico que querés convertir en el campo 'Valor a convertir'."},
        {"name": "Elegí dirección", "text": "Seleccioná si querés convertir de ida o de vuelta entre las unidades."},
        {"name": "Hacé click en Calcular", "text": "Presioná el botón Calcular para obtener el resultado inmediato con el factor de conversión exacto."},
        {"name": "Revisá el resultado", "text": "El resultado aparece debajo con los decimales necesarios para precisión y un resumen interpretativo."}
    ]


def build_json(spec):
    """Assemble the full JSON calc."""
    slug = spec["slug"]
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]

    title = f"Conversor de {u1_plu} a {u2_plu} 2026 | Hacé Cuentas"
    h1 = f"Conversor de {u1_plu} a {u2_plu}"
    # Description short
    description = f"Convertí {u1_plu} a {u2_plu} al instante. {spec['intro_hook'][:120]}"[:160]

    return {
        "slug": f"calculadora-{slug}",
        "title": title[:65],  # Max 65 chars title
        "h1": h1,
        "description": description,
        "category": spec["cat"],
        "audience": "global",
        "icon": spec["icon"],
        "formulaId": slug,
        "intro": build_intro(spec),
        "keyTakeaway": build_key_takeaway(spec),
        "useCases": spec["use_cases"],
        "fields": build_fields(spec),
        "dataUpdate": {
            "frequency": "never",
            "lastUpdated": str(date.today()),
            "source": None,
            "sourceUrl": None,
            "updateType": "manual",
            "notes": "Factor de conversión fijo, no requiere actualización."
        },
        "outputs": build_outputs(spec),
        "example": build_example(spec),
        "explanation": build_explanation(spec),
        "faq": build_faqs(spec),
        "sources": build_sources(spec),
        "relatedSlugs": [],
        "howToSteps": build_howto(spec)
    }


def build_formula_ts(spec):
    """Generate the TS formula file."""
    slug = spec["slug"]
    fn = camel(slug)
    u1_sing, u1_plu, u1_abbr = spec["u1"]
    u2_sing, u2_plu, u2_abbr = spec["u2"]

    # Escape single quotes in abbreviations for TS string literals
    u1_abbr_esc = u1_abbr.replace("'", "\\'").replace('"', '\\"')
    u2_abbr_esc = u2_abbr.replace("'", "\\'").replace('"', '\\"')
    u1_plu_esc = u1_plu.replace("'", "\\'").replace('"', '\\"')
    u2_plu_esc = u2_plu.replace("'", "\\'").replace('"', '\\"')

    if spec.get("is_temp"):
        slope = spec["factor"]
        offset = spec["offset"]
        # For C->F: slope=1.8, offset=32 => y = 1.8x + 32
        # Inverse (F->C) for "vuelta": x = (y - 32) / 1.8
        body = f"""  const v = Number(i.valor);
  if (isNaN(v)) return {{ resultado: '—', resumen: 'Ingresá un valor numérico.' }};
  const d = String(i.direccion || 'ida');
  const slope = {slope};
  const offset = {offset};
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {{
    r = v * slope + offset;
    fromLabel = '{u1_abbr_esc}'; toLabel = '{u2_abbr_esc}';
  }} else {{
    r = (v - offset) / slope;
    fromLabel = '{u2_abbr_esc}'; toLabel = '{u1_abbr_esc}';
  }}
  return {{
    resultado: r.toFixed(4) + ' ' + toLabel,
    resumen: v.toString() + ' ' + fromLabel + ' = ' + r.toFixed(2) + ' ' + toLabel + '.'
  }};"""
    elif spec.get("is_lookup"):
        # Simple placeholder lookup; real mapping would be complex, here give approximate
        body = f"""  const v = String(i.valor || '');
  const d = String(i.direccion || 'ida');
  if (!v) return {{ resultado: '—', resumen: 'Ingresá un talle (ej: M, 42, 10).' }};
  return {{
    resultado: v + ' → consultá tabla',
    resumen: 'Los talles varían por marca. Consultá la tabla del fabricante específico para equivalencias exactas US/AR/EU.'
  }};"""
    elif spec["slug"] == "conversor-gramos-a-tazas-cocina":
        body = f"""  const v = Number(i.valor);
  if (isNaN(v) || v < 0) return {{ resultado: '—', resumen: 'Ingresá un valor válido.' }};
  const d = String(i.direccion || 'ida');
  const ing = String(i.ingrediente || 'harina');
  const densidades: Record<string, number> = {{
    harina: 125, azucar: 200, 'azucar-morena': 220, manteca: 227,
    arroz: 185, cacao: 85, agua: 240
  }};
  const g_per_cup = densidades[ing] || 125;
  let r: number;
  let unit: string;
  if (d === 'ida') {{
    r = v / g_per_cup;
    unit = 'cups';
  }} else {{
    r = v * g_per_cup;
    unit = 'g';
  }}
  return {{
    resultado: r.toFixed(3) + ' ' + unit,
    resumen: v + (d === 'ida' ? ' g' : ' cups') + ' de ' + ing + ' ≈ ' + r.toFixed(2) + ' ' + unit + '.'
  }};"""
    else:
        factor = spec["factor"]
        body = f"""  const v = Number(i.valor);
  if (isNaN(v)) return {{ resultado: '—', resumen: 'Ingresá un valor numérico.' }};
  const d = String(i.direccion || 'ida');
  const factor = {factor};
  let r: number;
  let fromLabel: string, toLabel: string;
  if (d === 'ida') {{
    r = v * factor;
    fromLabel = '{u1_plu_esc}'; toLabel = '{u2_plu_esc}';
  }} else {{
    r = v / factor;
    fromLabel = '{u2_plu_esc}'; toLabel = '{u1_plu_esc}';
  }}
  return {{
    resultado: r.toFixed(6).replace(/\\.?0+$/, '') + ' ' + '{u2_abbr_esc}'.toString(),
    resumen: v + ' ' + fromLabel + ' = ' + r.toFixed(4).replace(/\\.?0+$/, '') + ' ' + toLabel + '.'
  }};"""

    return f"""/** Conversor: {u1_sing} ↔ {u2_sing} */
export interface Inputs {{ valor: number | string; direccion?: string; ingrediente?: string; }}
export interface Outputs {{ resultado: string; resumen: string; }}

export function {fn}(i: Inputs): Outputs {{
{body}
}}
"""


def main():
    created_calcs = []
    created_formulas = []
    pending_registrations = []

    for spec in ALL_SPECS:
        slug = spec["slug"]
        json_path = CALCS_DIR / f"{slug}.json"
        formula_path = FORMULAS_DIR / f"{slug}.ts"

        # JSON
        data = build_json(spec)
        json_path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        created_calcs.append(slug)

        # Formula
        ts = build_formula_ts(spec)
        formula_path.write_text(ts, encoding="utf-8")
        created_formulas.append(slug)

        pending_registrations.append([slug, camel(slug)])

    # Guardar registrations pendientes
    PENDING_FILE.write_text(
        json.dumps(pending_registrations, indent=2, ensure_ascii=False),
        encoding="utf-8"
    )

    print(f"✓ Creadas {len(created_calcs)} calcs JSON")
    print(f"✓ Creadas {len(created_formulas)} fórmulas TS")
    print(f"✓ Pendientes {len(pending_registrations)} registraciones en {PENDING_FILE}")
    print(f"\nProximo paso: python3 scripts/register-formulas.py")


if __name__ == "__main__":
    main()
