#!/usr/bin/env python3
"""
Traduce 500 calcs universales ES → EN (stubs con campos clave).

Estrategia:
- Reutiliza formulaId del ES (matemática es igual). Los IDs de fields también
  son iguales (peso, altura, edad, etc) — solo traducimos labels.
- Genera slug EN normalizado desde keywords comunes.
- Title + description + FAQs base generados con templates.
- Schema markup preservado. Explanation: traducida via patrones comunes o
  placeholder (se enriquece en commits posteriores).
- Evita duplicados: si ya existe en /calcs-en/ skip.

Selección de 500:
  1. Categorías universales (excluye AR-específicos)
  2. Prioriza: salud, matemática, finanzas básicas, cocina, conversiones,
     tiempo, mascotas, construcción, ciencia
  3. Dentro de cada categoría, ordenar por richness (length de explanation)
     como proxy de "calc más trabajada" → mejor base para SEO EN
"""
import json
import re
from pathlib import Path

CALCS_ES = Path('src/content/calcs')
CALCS_EN = Path('src/content/calcs-en')

# Categorías universales
UNIVERSAL_CATEGORIES = {
    'salud', 'deportes', 'matematica', 'ciencia', 'cocina',
    'mascotas', 'familia', 'construccion', 'tecnologia',
    'educacion', 'jardineria', 'automotor', 'medio-ambiente',
    'idiomas', 'entretenimiento', 'electronica', 'finanzas',
}

# Skip si slug contiene estas (específicas AR)
SKIP_SLUG_KEYWORDS = [
    'argentina', 'afip', 'arca', 'anses', 'monotributo', 'uva-',
    'caba', 'buenos-aires', 'provincial', 'iibb', 'vtv', 'bcra',
    'mep', 'ccl', 'ripte', 'sube', 'galicia', 'santander', 'icl',
    '2026-argentina', 'arg-', 'pesos-argentinos', 'mexico', 'españa',
    'chile', 'colombia', 'peru', 'uruguay',
]

# Target por categoría (para completar 500)
TARGETS = {
    'salud': 120,
    'matematica': 80,
    'finanzas': 60,
    'cocina': 50,
    'deportes': 50,
    'mascotas': 40,
    'ciencia': 30,
    'construccion': 30,
    'educacion': 20,
    'tecnologia': 20,
}

# Traducciones de common labels
LABEL_TRANSLATIONS = {
    'peso': 'Weight', 'altura': 'Height', 'edad': 'Age',
    'sexo': 'Sex', 'sexo biológico': 'Biological sex', 'género': 'Gender',
    'hombre': 'Male', 'mujer': 'Female', 'varón': 'Male',
    'meses': 'Months', 'años': 'Years', 'días': 'Days', 'horas': 'Hours', 'minutos': 'Minutes', 'segundos': 'Seconds',
    'peso (kg)': 'Weight (kg)', 'altura (cm)': 'Height (cm)',
    'altura (m)': 'Height (m)', 'edad (años)': 'Age (years)',
    'capital': 'Principal', 'monto': 'Amount', 'monto inicial': 'Initial amount',
    'tasa': 'Rate', 'tasa anual': 'Annual rate', 'tasa anual (%)': 'Annual rate (%)',
    'plazo': 'Term', 'plazo (años)': 'Term (years)', 'plazo (meses)': 'Term (months)',
    'plazo en años': 'Term in years', 'plazo en meses': 'Term in months',
    'aporte mensual': 'Monthly contribution', 'aporte': 'Contribution',
    'distancia': 'Distance', 'velocidad': 'Speed', 'tiempo': 'Time',
    'tiempo (minutos)': 'Time (minutes)', 'tiempo (horas)': 'Time (hours)',
    'frecuencia cardíaca': 'Heart rate', 'frecuencia': 'Frequency',
    'calorías': 'Calories', 'proteína': 'Protein', 'grasa': 'Fat', 'carbohidratos': 'Carbs',
    'actividad física': 'Physical activity', 'nivel de actividad': 'Activity level',
    'sedentario': 'Sedentary', 'ligero': 'Light', 'moderado': 'Moderate', 'intenso': 'Intense', 'muy intenso': 'Very intense',
    'objetivo': 'Goal', 'bajar de peso': 'Lose weight', 'mantener': 'Maintain', 'subir de peso': 'Gain weight',
    'temperatura': 'Temperature', 'presión': 'Pressure', 'volumen': 'Volume', 'área': 'Area',
    'largo': 'Length', 'ancho': 'Width', 'profundidad': 'Depth', 'diámetro': 'Diameter', 'radio': 'Radius',
    'raza': 'Breed', 'tipo': 'Type',
    'fecha': 'Date', 'fecha de nacimiento': 'Date of birth', 'fecha inicio': 'Start date', 'fecha fin': 'End date',
    'cantidad': 'Quantity', 'número': 'Number', 'total': 'Total',
    'porcentaje': 'Percentage', 'porcentaje (%)': 'Percentage (%)',
    'año': 'Year', 'mes': 'Month', 'día': 'Day', 'semana': 'Week',
    'litros': 'Liters', 'gramos': 'Grams', 'kilogramos': 'Kilograms',
    'metros': 'Meters', 'centímetros': 'Centimeters', 'kilómetros': 'Kilometers',
    'ingreso': 'Income', 'gasto': 'Expense', 'ahorro': 'Savings',
}

# Traducciones de nombres de categorías (para category display)
CATEGORY_EN = {
    'salud': 'health', 'deportes': 'sports', 'matematica': 'math',
    'ciencia': 'science', 'cocina': 'cooking', 'mascotas': 'pets',
    'familia': 'family', 'construccion': 'construction', 'tecnologia': 'technology',
    'educacion': 'education', 'jardineria': 'gardening', 'automotor': 'automotive',
    'medio-ambiente': 'environment', 'idiomas': 'languages', 'entretenimiento': 'entertainment',
    'electronica': 'electronics', 'finanzas': 'finance',
}


def tr_label(text):
    """Traduce un label usando el mapping o fallback."""
    if not text:
        return text
    low = text.lower().strip()
    if low in LABEL_TRANSLATIONS:
        return LABEL_TRANSLATIONS[low]
    # Fallback: partial match (first word)
    for k, v in LABEL_TRANSLATIONS.items():
        if low.startswith(k + ' '):
            rest = text[len(k):].strip()
            return f'{v} {rest}'
    # Return as-is, capitalized
    return text[0].upper() + text[1:] if text else text


# Diccionario común ES→EN para title/description
COMMON_TERMS = [
    (r'\bcalculadora de\b', 'calculator'),
    (r'\bcalculadora\b', 'calculator'),
    (r'\bconversor de\b', 'converter'),
    (r'\bconversor\b', 'converter'),
    (r'\bcalcular\b', 'calculate'),
    (r'\bcálculo de\b', 'calculation of'),
    (r'\bcálculo\b', 'calculation'),
    (r'\bsaludable\b', 'healthy'),
    (r'\bfácil\b', 'easy'),
    (r'\brápido\b', 'quick'),
    (r'\bexacto\b', 'exact'),
    (r'\bideal\b', 'ideal'),
    (r'\bgratis\b', 'free'),
    (r'\bonline\b', 'online'),
    (r'\bpor\b', 'by'),
    (r'\bsegún\b', 'based on'),
    (r'\bentre\b', 'between'),
    (r'\bpara\b', 'for'),
]


def simple_translate_title(title):
    """Quick-and-dirty traducción de title ES → EN."""
    t = title
    # Remove ' | Hacé Cuentas' sufijo
    t = re.sub(r'\s*\|\s*Hac[ée] Cuentas\s*$', '', t).strip()
    # Remove '2026 —' part if present
    t = re.sub(r'\s*[—–-]\s*Gratis\s*$', '', t).strip()
    low = t.lower()
    # Common term translations
    for pat, repl in COMMON_TERMS:
        low = re.sub(pat, repl, low, flags=re.IGNORECASE)
    # Capitalize
    out = low[0].upper() + low[1:] if low else low
    return out


# Slug EN: remove 'calculadora-' prefix, keep rest
def make_en_slug(es_slug, fallback_id):
    s = es_slug.lower()
    s = re.sub(r'^calculadora-', '', s)
    # Ya está en inglés algunos? Mantener como está
    return s + '-calculator'


def translate_calc(d):
    """Genera JSON EN a partir de un calc ES."""
    es_slug = d['slug']
    formula_id = d.get('formulaId', es_slug.replace('calculadora-', ''))
    category = d.get('category', 'otros')

    # Slug EN: si ya tiene palabras inglesas, intentar aprovechar; sino generate
    en_slug = make_en_slug(es_slug, formula_id)

    # Title
    en_title = simple_translate_title(d.get('title', d.get('h1', '')))
    if len(en_title) > 55:
        en_title = en_title[:55].rstrip() + '...'
    en_title = f'{en_title} 2026 | Hacé Cuentas'

    # H1
    en_h1 = simple_translate_title(d.get('h1', ''))

    # Description (brief translation; if too long, truncate)
    es_desc = d.get('description', '') or d.get('intro', '')
    en_desc_base = simple_translate_title(es_desc)[:155]
    en_desc = f'Free {CATEGORY_EN.get(category, category)} calculator — {en_desc_base}. Instant results, no signup, based on standard formulas.'
    en_desc = en_desc[:160]

    # Fields: same ids, translated labels + help
    en_fields = []
    for fld in d.get('fields', []):
        nf = {**fld}
        if 'label' in nf:
            nf['label'] = tr_label(nf['label'])
        if 'help' in nf and nf['help']:
            # Keep the help in ES initially — will enrich later. Or simple translate.
            nf['help'] = nf['help']  # placeholder
        # Options translations
        if 'options' in nf:
            nf['options'] = [
                {**o, 'label': tr_label(o.get('label', ''))}
                for o in nf['options']
            ]
        en_fields.append(nf)

    # Outputs: same ids, translated labels
    en_outputs = []
    for out in d.get('outputs', []):
        no = {**out}
        if 'label' in no:
            no['label'] = tr_label(no['label'])
        en_outputs.append(no)

    # SEO keywords: keep ES ones + add EN translations for top ones
    es_kws = d.get('seoKeywords', [])
    en_kws = []
    base_keyword = en_h1.lower().replace('calculator', '').strip()
    en_kws.append(en_h1.lower())
    en_kws.append(f'{base_keyword} calculator')
    en_kws.append(f'free {base_keyword} calculator')
    en_kws.append(f'{base_keyword} calculator online')
    en_kws.append(f'calculate {base_keyword}')
    en_kws = list(dict.fromkeys(en_kws))[:12]

    new = {
        'slug': en_slug,
        'esSlug': es_slug,
        'title': en_title,
        'h1': en_h1,
        'description': en_desc,
        'category': category,
        'icon': d.get('icon', '🧮'),
        'formulaId': formula_id,  # reutilizamos fórmula existente
        'audience': 'global',
        'seoKeywords': en_kws,
        'intro': f'Free **{en_h1.lower()}** — enter your values and get instant results. Based on standard formulas used worldwide.',
        'keyTakeaway': f'Use this calculator to quickly calculate {base_keyword}. Results are instant and accurate.',
        'useCases': [
            f'You need to calculate {base_keyword} quickly.',
            f'You want to compare different scenarios for {base_keyword}.',
            f'You need an accurate estimate without manual math.',
        ],
        'fields': en_fields,
        'dataUpdate': d.get('dataUpdate', {
            'frequency': 'never',
            'lastUpdated': '2026-04-21',
            'source': None,
            'sourceUrl': None,
            'updateType': 'manual',
            'notes': 'Standard formula, no data updates needed.',
        }),
        'outputs': en_outputs,
        'example': {
            'title': f'Example calculation',
            'steps': [f'Enter your values in the fields above.', f'Click Calculate to see results.'],
            'result': 'Results appear instantly below the form.',
        },
        'explanation': f'## About {en_h1.lower()}\n\nThis calculator helps you determine {base_keyword} quickly and accurately using standard formulas.\n\n## How it works\n\nFill in the required fields and click Calculate. The result updates instantly.\n\n## When to use this calculator\n\n- Quick estimation\n- Comparison of scenarios\n- Planning and decision-making\n\nFor more detailed analysis, consult with a professional in the relevant field.',
        'faq': [
            {'q': f'Is this {base_keyword} calculator free?', 'a': 'Yes, 100% free. No signup required. Results are instant.'},
            {'q': 'How accurate is it?', 'a': 'It uses standard formulas accepted in the field. Results are accurate for typical use cases. For critical decisions, consult a professional.'},
            {'q': 'Do I need to create an account?', 'a': 'No. Just enter your values and calculate.'},
            {'q': 'Can I use this on mobile?', 'a': 'Yes. The calculator works on any device — phone, tablet, desktop.'},
            {'q': 'Does it save my data?', 'a': 'No. All calculations happen in your browser. Your inputs are not sent to our servers unless you explicitly share the result.'},
        ],
        'sources': d.get('sources', []),  # preservamos sources que suelen estar en inglés o ser universales
        'relatedSlugs': [],  # se llenará después con cross-links EN
    }

    return new


# ============================================================
# Main
# ============================================================

# Calcs ya existentes en EN (skip)
existing_en_es_slugs = set()
for f in CALCS_EN.glob('*.json'):
    try:
        d = json.loads(f.read_text())
        if d.get('esSlug'):
            existing_en_es_slugs.add(d['esSlug'])
    except Exception:
        pass

# Score + seleccionar 500 calcs
candidates = []
for f in CALCS_ES.glob('*.json'):
    try:
        d = json.loads(f.read_text())
    except Exception:
        continue
    if d.get('audience') == 'AR':
        continue
    slug = d.get('slug', '')
    if any(k in slug.lower() for k in SKIP_SLUG_KEYWORDS):
        continue
    cat = d.get('category', '')
    if cat not in UNIVERSAL_CATEGORIES:
        continue
    if slug in existing_en_es_slugs:
        continue  # ya tiene version EN
    # Score = longitud de explanation (richness proxy)
    expl_len = len(d.get('explanation', ''))
    candidates.append((expl_len, cat, f, d))

# Ordenar por categoría + richness
candidates.sort(key=lambda x: (-x[0]))

# Seleccionar distribuido por categoría
selected = []
per_cat = {}
for score, cat, f, d in candidates:
    tgt = TARGETS.get(cat, 10)
    per_cat.setdefault(cat, 0)
    if per_cat[cat] >= tgt:
        continue
    selected.append((cat, f, d))
    per_cat[cat] += 1
    if len(selected) >= 500:
        break

print(f'Selected {len(selected)} calcs por categoría:')
for c, n in sorted(per_cat.items(), key=lambda x: -x[1]):
    print(f'  {c}: {n}')

# Generar JSONs EN
created = 0
for cat, f, d in selected:
    try:
        new = translate_calc(d)
        # Verificar slug EN único
        en_slug = new['slug']
        out_file = CALCS_EN / f'{en_slug.replace("-calculator", "")}.json'
        counter = 2
        while out_file.exists():
            out_file = CALCS_EN / f'{en_slug.replace("-calculator", "")}-{counter}.json'
            counter += 1
        out_file.write_text(json.dumps(new, ensure_ascii=False, indent=2))
        created += 1
    except Exception as e:
        print(f'  Error on {d.get("slug", "?")}: {e}')

print(f'\n✓ Created {created} EN calc stubs')
