#!/usr/bin/env python3
"""
Rompe el duplicate content en las 30 calcs peso-ideal-{raza}:

1. Remueve la tabla 'Comparativa con otras razas' (idéntica en las 30).
2. Agrega sección 'Crecimiento mes a mes' con proyección específica por raza
   (derivada del peso adulto de la raza, interpolado).
3. Agrega sección 'Ejercicio y energía' específica por tamaño.

Esto diferencia el contenido suficientemente para que Google no marque
duplicate/near-duplicate y re-priorice indexación.
"""
import json
import re
from pathlib import Path

CALCS = Path('src/content/calcs')
FILES = sorted(CALCS.glob('calculadora-peso-ideal-*.json'))

# Datos específicos por raza (peso adulto macho promedio kg, tamaño clase)
# key = slug suffix
BREED_DATA = {
    'beagle': {'adult_kg': 13, 'class': 'mediano', 'activity': 'alta', 'cachorros_meses': 12},
    'boxer': {'adult_kg': 29, 'class': 'grande', 'activity': 'alta', 'cachorros_meses': 14},
    'bulldog-frances': {'adult_kg': 12, 'class': 'pequeño', 'activity': 'baja', 'cachorros_meses': 12},
    'bulldog-ingles': {'adult_kg': 24, 'class': 'mediano', 'activity': 'baja', 'cachorros_meses': 14},
    'caniche-poodle': {'adult_kg': 25, 'class': 'mediano', 'activity': 'media', 'cachorros_meses': 12},
    'chihuahua': {'adult_kg': 2.5, 'class': 'toy', 'activity': 'media', 'cachorros_meses': 9},
    'dachshund-salchicha': {'adult_kg': 10, 'class': 'pequeño', 'activity': 'media', 'cachorros_meses': 11},
    'golden-retriever': {'adult_kg': 31, 'class': 'grande', 'activity': 'alta', 'cachorros_meses': 15},
    'husky-siberiano': {'adult_kg': 23, 'class': 'mediano', 'activity': 'muy alta', 'cachorros_meses': 14},
    'labrador-retriever': {'adult_kg': 32, 'class': 'grande', 'activity': 'muy alta', 'cachorros_meses': 15},
    'pastor-aleman': {'adult_kg': 35, 'class': 'grande', 'activity': 'muy alta', 'cachorros_meses': 18},
    'pitbull': {'adult_kg': 23, 'class': 'mediano', 'activity': 'alta', 'cachorros_meses': 14},
    'rottweiler': {'adult_kg': 55, 'class': 'gigante', 'activity': 'alta', 'cachorros_meses': 18},
    'shih-tzu': {'adult_kg': 6, 'class': 'pequeño', 'activity': 'baja', 'cachorros_meses': 10},
    'yorkshire-yorkie': {'adult_kg': 2.5, 'class': 'toy', 'activity': 'media', 'cachorros_meses': 10},
    'pug': {'adult_kg': 7, 'class': 'pequeño', 'activity': 'baja', 'cachorros_meses': 12},
    'cocker-spaniel': {'adult_kg': 13, 'class': 'mediano', 'activity': 'alta', 'cachorros_meses': 12},
    'schnauzer-miniatura': {'adult_kg': 7, 'class': 'pequeño', 'activity': 'media', 'cachorros_meses': 11},
    'border-collie': {'adult_kg': 20, 'class': 'mediano', 'activity': 'muy alta', 'cachorros_meses': 14},
    'san-bernardo': {'adult_kg': 80, 'class': 'gigante', 'activity': 'media', 'cachorros_meses': 24},
    'gran-danes': {'adult_kg': 75, 'class': 'gigante', 'activity': 'media', 'cachorros_meses': 24},
    'doberman': {'adult_kg': 40, 'class': 'grande', 'activity': 'muy alta', 'cachorros_meses': 18},
    'dalmata': {'adult_kg': 27, 'class': 'mediano', 'activity': 'muy alta', 'cachorros_meses': 14},
    # Gatos
    'gato-britanico': {'adult_kg': 5, 'class': 'mediano', 'activity': 'baja', 'cachorros_meses': 36},
    'gato-persa': {'adult_kg': 4.5, 'class': 'mediano', 'activity': 'baja', 'cachorros_meses': 12},
    'gato-raza': {'adult_kg': 4, 'class': 'mediano', 'activity': 'media', 'cachorros_meses': 12},
    'gato-siames': {'adult_kg': 4, 'class': 'mediano', 'activity': 'alta', 'cachorros_meses': 12},
    'maine-coon': {'adult_kg': 7, 'class': 'grande', 'activity': 'media', 'cachorros_meses': 48},
    'ragdoll': {'adult_kg': 6.5, 'class': 'grande', 'activity': 'baja', 'cachorros_meses': 48},
}


def growth_table(breed: str, data: dict) -> str:
    """Genera tabla de crecimiento mes a mes para la raza."""
    adult = data['adult_kg']
    months_to_adult = data['cachorros_meses']
    # Curva sigmoidea simplificada: 2-3 meses crecimiento lento, 3-9 meses rápido, 9+ meses plano
    stages = [
        (1, 0.08), (2, 0.15), (3, 0.25), (4, 0.38), (5, 0.50),
        (6, 0.60), (8, 0.75), (10, 0.85), (12, 0.93),
    ]
    rows = []
    for month, pct in stages:
        if month > months_to_adult:
            break
        expected = round(adult * pct, 1)
        rows.append(f"| {month} meses | {expected} kg |")
    rows.append(f"| {months_to_adult}+ meses (adulto) | {adult} kg |")
    body = "\n".join(rows)
    return f"""## Crecimiento mes a mes de {breed}

Proyección del **peso esperado** de un {breed} cachorro macho promedio. Las hembras pesan 10-15% menos en cada etapa.

| Edad | Peso esperado |
|---|---|
{body}

Si tu {breed} está por **debajo** de estos valores más del 15%, consultá al veterinario — puede indicar problemas de absorción. Si está **por encima**, revisá la ración: el sobrepeso en cachorro acelera el crecimiento óseo y puede generar displasia.
"""


def exercise_section(breed: str, data: dict) -> str:
    """Ejercicio recomendado por clase de actividad."""
    activity = data['activity']
    minutes = {
        'muy alta': '90-120',
        'alta': '60-90',
        'media': '30-60',
        'baja': '20-40',
    }.get(activity, '45-60')
    class_ = data['class']
    context = {
        'toy': 'Son activos pero tienen huesos frágiles. Caminatas cortas, juegos interior.',
        'pequeño': 'Necesitan estimulación mental más que gran intensidad física.',
        'mediano': 'Balance entre ejercicio físico y mental. Ideal para correr con el dueño.',
        'grande': 'Requieren ejercicio intenso diario. Sin ejercicio desarrollan ansiedad.',
        'gigante': 'Actividad moderada pero consistente. Cuidar articulaciones.',
    }.get(class_, 'Consultá con el veterinario para un plan específico.')
    return f"""## Ejercicio y energía del {breed}

- **Nivel de actividad**: {activity}.
- **Tiempo recomendado de ejercicio diario**: {minutes} minutos.
- **Tamaño**: {class_}. {context}

El ejercicio afecta directamente el peso ideal — un {breed} sedentario necesita **15-25% menos calorías** que uno activo para el mismo peso objetivo.
"""


COMPARATIVA_START = "## Comparativa con otras razas"
# Capture hasta el siguiente ## (pero no incluir el siguiente)
COMPARATIVA_RE = re.compile(
    r'## Comparativa con otras razas.*?(?=\n## |\Z)',
    re.DOTALL,
)


processed = 0
skipped = []

for f in FILES:
    d = json.loads(f.read_text())
    slug = d.get('slug', '')
    # Extraer key de BREED_DATA del slug
    key = slug.replace('calculadora-peso-ideal-', '')
    if key not in BREED_DATA:
        skipped.append((slug, 'sin BREED_DATA'))
        continue

    expl = d.get('explanation', '')
    breed_readable = key.replace('-', ' ').title()

    # 1. Remover tabla comparativa (boilerplate)
    new_expl, n_removed = COMPARATIVA_RE.subn('', expl)

    # 2. Agregar secciones únicas antes de "Problemas de salud" o al final
    data = BREED_DATA[key]
    unique_content = growth_table(breed_readable, data) + "\n" + exercise_section(breed_readable, data)

    # Insertar antes de la sección de problemas de salud si existe, sino al final
    if '## Problemas de salud' in new_expl:
        new_expl = new_expl.replace(
            '## Problemas de salud',
            unique_content + '\n## Problemas de salud',
            1,
        )
    else:
        new_expl += '\n' + unique_content

    d['explanation'] = new_expl.strip()
    f.write_text(json.dumps(d, ensure_ascii=False, indent=2))
    processed += 1
    print(f"✓ {slug}: removió boilerplate ({n_removed}), agregó {len(unique_content)} chars únicos")

print(f"\n{'='*60}")
print(f"Procesadas: {processed}")
if skipped:
    print(f"\nSaltadas ({len(skipped)}):")
    for slug, reason in skipped:
        print(f"  · {slug}: {reason}")
