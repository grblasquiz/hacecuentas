#!/usr/bin/env python3
"""
Chequeo de integridad de los hubs de decisión. Correlo ANTES de cada deploy.

Detecta las tres clases de error que ya nos mordieron en esta migración y que
el build NO reporta (compila igual y la rotura aparece en producción):

  1. Hub sin página .astro
     El registry lo levanta por el glob, así que aparece listado en el índice
     de su silo — con un link a un 404.

  2. `slug` / `siloHref` / `lastReviewed` que no son literales de comilla simple
     al principio de línea
     `scripts/generate-sitemap.ts` los parsea con regex de línea. Con un
     template literal el hub desaparece del sitemap en silencio.

  3. Dos hubs reclamando la misma URL vieja en `replaces`
     El 301 queda indefinido según el orden del glob.

  4. `replaces` que no apunta a ninguna calc real
     Redirige a un 404 y se pierde el link equity. El caso típico: olvidarse el
     prefijo de mercado (`/bmi-calculator` en vez de `/en/bmi-calculator`).

Ojo con el punto 4: los `replaces` de un hub pueden apuntar legítimamente a
calcs YA PODADAS (que por eso no están en src/content), así que sólo se avisa,
no se falla.

Uso:  python3 scripts/check-hubs.py
Sale con código 1 si hay algún error bloqueante (1, 2 o 3).
"""
import json
import os
import re
import sys
from collections import defaultdict
from glob import glob

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(RAIZ)


def campo(cuerpo, clave):
    """Lee un campo del objeto hub tal como lo ve el regex del sitemap."""
    m = re.search(rf"^\s*{clave}:\s*'([^']+)'", cuerpo, re.M)
    return m.group(1) if m else None


def main():
    hubs = {}          # slug -> archivo
    sin_literal = []   # (archivo, campo)
    reclama = defaultdict(list)  # url vieja -> [archivos]

    for f in sorted(glob('src/lib/hubs/**/*.ts', recursive=True)):
        if os.path.basename(f) in ('types.ts', 'registry.ts'):
            continue
        src = open(f).read()
        i = src.find('export const hub')
        if i < 0:
            continue
        cuerpo = src[i:]

        for clave in ('slug', 'siloHref', 'lastReviewed'):
            if campo(cuerpo, clave) is None:
                sin_literal.append((f, clave))

        slug = campo(cuerpo, 'slug')
        if slug:
            hubs[slug] = f

        # `replaces` se corta en el primer `]` a nivel de indentación del campo.
        m = re.search(r'replaces:\s*\[(.*?)\n  \]', cuerpo, re.S)
        if m:
            for url in re.findall(r"'(/[^']+)'", m.group(1)):
                reclama[url].append(f)

    sin_pagina = [s for s in hubs if not os.path.exists(f'src/pages/{s}.astro')]
    colisiones = {u: fs for u, fs in reclama.items() if len(set(fs)) > 1}

    # Slugs de todas las calcs vivas, por si un `replaces` apunta a la nada.
    vivas = set()
    for p in glob('src/content/calcs*/*.json'):
        try:
            slug = json.load(open(p)).get('slug')
        except (json.JSONDecodeError, OSError):
            continue
        if slug:
            vivas.add('/' + slug.lstrip('/'))
    podadas = sorted(u for u in reclama if u not in vivas and u.lstrip('/') not in hubs)

    print(f'{len(hubs)} hubs · {len(reclama)} URLs reclamadas en replaces\n')

    error = False

    if sin_pagina:
        error = True
        print(f'❌ {len(sin_pagina)} hub(s) SIN página .astro '
              f'(el índice de su silo los linkea a un 404):')
        for s in sorted(sin_pagina):
            print(f'     {s}   <- {hubs[s]}')
        print()

    if sin_literal:
        error = True
        print(f'❌ {len(sin_literal)} campo(s) que el sitemap NO parsea '
              f'(tienen que ser literales de comilla simple):')
        for f, k in sin_literal:
            print(f'     {f}  →  {k}')
        print()

    if colisiones:
        error = True
        print(f'❌ {len(colisiones)} URL(s) reclamadas por más de un hub '
              f'(el 301 queda indefinido):')
        for u, fs in sorted(colisiones.items()):
            print(f'     {u}')
            for f in sorted(set(fs)):
                print(f'        {f}')
        print()

    if podadas:
        print(f'⚠️  {len(podadas)} replaces sin calc viva detrás. Es esperable si '
              f'ya se podaron;\n    revisá que no sea un prefijo de mercado olvidado '
              f'(/bmi-calculator vs /en/bmi-calculator):')
        for u in podadas[:20]:
            print(f'     {u}')
        if len(podadas) > 20:
            print(f'     … y {len(podadas) - 20} más')
        print()

    if error:
        print('FALLA: arreglá lo de arriba antes de deployar.')
        return 1

    print('✅ Sin errores bloqueantes.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
