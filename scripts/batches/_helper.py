"""Helper para generar calcs en formato ultra-compacto.

Cada calc se define con una tupla compacta en spec().
El helper expande a JSON completo + TS formula.
"""


def spec(slug, cat, icon, h1, desc, formula_expr, fields_raw, outputs_raw,
         example_steps, example_result, faq_pairs_short, ts_body,
         explanation_md=None, use_cases_raw=None, sources_raw=None, related_slugs=None):
    """Build a single calc spec (dict) for batch-generator.py.

    fields_raw: list of tuples (id, label, type, default_or_placeholder) or full dict
    outputs_raw: list of tuples (id, label, [suffix]) or full dict
    faq_pairs_short: list of (q, a) tuples
    """
    # Normalizar fields
    fields = []
    for f in fields_raw:
        if isinstance(f, dict):
            fields.append(f)
        else:
            fid, label, ftype, val = f[0], f[1], f[2], f[3] if len(f) > 3 else None
            d = {"id": fid, "label": label, "type": ftype, "required": True}
            if ftype == "number":
                d["placeholder"] = str(val) if val is not None else "0"
                if val is not None:
                    try:
                        d["default"] = float(val)
                    except (ValueError, TypeError):
                        pass
                d["step"] = 0.01
            elif ftype == "select" and isinstance(val, list):
                d["options"] = [{"value": v, "label": v} if isinstance(v, str) else {"value": v[0], "label": v[1]} for v in val]
                d["default"] = val[0] if isinstance(val[0], str) else val[0][0]
            fields.append(d)

    # Normalizar outputs
    outputs = []
    for idx, o in enumerate(outputs_raw):
        if isinstance(o, dict):
            outputs.append(o)
        else:
            oid, label = o[0], o[1]
            d = {"id": oid, "label": label}
            if idx == 0:
                d["primary"] = True
            if len(o) > 2 and o[2]:
                d["suffix"] = o[2]
            outputs.append(d)

    # Defaults para sections
    use_cases = use_cases_raw or [
        f"Cálculos técnicos relacionados con {h1.lower()}",
        "Estudiantes y profesionales del área",
        "Validar resultados teóricos antes de aplicarlos",
        "Enseñanza y aprendizaje del concepto",
        "Referencia rápida en proyectos"
    ]
    sources = sources_raw or [
        {"name": "NIST — National Institute of Standards and Technology", "url": "https://www.nist.gov"},
        {"name": "Khan Academy", "url": "https://es.khanacademy.org"},
        {"name": "Wolfram MathWorld", "url": "https://mathworld.wolfram.com"}
    ]
    related = related_slugs or []
    expl = explanation_md or f"## Fórmula\n\n```\n{formula_expr}\n```\n\n## Aplicación\n\n{desc}\n\n## Cuándo NO aplica\n\nSituaciones fuera del rango típico del fenómeno estudiado o cuando las simplificaciones del modelo no son válidas.\n\n## Recomendaciones\n\n- Verificá unidades antes de aplicar la fórmula\n- Usá valores dentro del rango físico/técnico razonable\n- Cruza-verificá con una fuente confiable para casos críticos"

    faq = [{"q": q, "a": a} for q, a in faq_pairs_short]
    keyTakeaway = f"Fórmula: **{formula_expr}**. Aplicación directa con los valores de entrada. {desc[:150]}"

    json_data = {
        "slug": f"calculadora-{slug}",
        "title": f"Calculadora {h1[:40]} 2026 | Hacé Cuentas",
        "h1": h1,
        "description": desc,
        "category": cat,
        "audience": "global",
        "icon": icon,
        "formulaId": slug,
        "intro": f"{h1}: {desc} Esta calculadora aplica la fórmula estándar del dominio.",
        "keyTakeaway": keyTakeaway,
        "useCases": use_cases,
        "fields": fields,
        "outputs": outputs,
        "example": {
            "title": "Ejemplo de cálculo",
            "steps": example_steps,
            "result": example_result
        },
        "explanation": expl,
        "faq": faq,
        "sources": sources,
        "relatedSlugs": related,
    }

    return {
        "slug": slug,
        "json": json_data,
        "formula": ts_body,
    }
