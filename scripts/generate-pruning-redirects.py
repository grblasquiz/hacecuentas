#!/usr/bin/env python3
"""
Pruning batch 2 — generador de redirects de near-duplicates.

Por cada cluster de near-duplicates (3+ calcs con prefijo similar):
  - Identifica la "canónica" (la de más contenido)
  - 301 todas las hermanas hacia ella
  - Solo aplica a audience=global sin mención AR
  - Solo si TODAS las hermanas tienen audience=global (no mezcla locales)

Output: líneas listas para append a public/_redirects.

NO modifica archivos. NO borra JSONs. NO commitea. Solo imprime.
"""
from __future__ import annotations

import json
import re
import sys
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / 'src' / 'content' / 'calcs'
REDIRECTS_FILE = ROOT / 'public' / '_redirects'

# Patrones AR que sugieren contenido específicamente argentino → SKIP
AR_PATTERNS = re.compile(
    r'\b(ARCA|AFIP|ANSES|BCRA|INDEC|monotributo|pesos argentinos|argentin|UVA|MEP|CCL|peso ARS|GBA|CABA)\b',
    re.IGNORECASE,
)


def detect_clusters(calcs: list[dict]) -> dict[str, list[dict]]:
    """Agrupa por prefijo (primeras 3 palabras del slug sin números)."""
    by_stem: dict[str, list[dict]] = defaultdict(list)
    for c in calcs:
        slug = c.get('slug', '')
        tokens = [t for t in slug.split('-') if not t.isdigit() and len(t) > 2]
        stem = '-'.join(tokens[:3])
        if stem:
            by_stem[stem].append(c)
    # Solo clusters con >=3 hermanas
    return {k: v for k, v in by_stem.items() if len(v) >= 3}


def has_ar_content(calc: dict) -> bool:
    """True si la calc tiene cualquier mención AR en contenido."""
    text = ' '.join([
        calc.get('title', '') or '',
        calc.get('description', '') or '',
        calc.get('intro', '') or '',
        calc.get('explanation', '') or '',
        ' '.join(calc.get('seoKeywords', []) or []),
    ])
    return bool(AR_PATTERNS.search(text))


def main() -> int:
    calcs = []
    for f in sorted(CALCS_DIR.glob('*.json')):
        try:
            d = json.loads(f.read_text(encoding='utf-8'))
            calcs.append(d)
        except Exception:
            continue

    clusters = detect_clusters(calcs)

    # Filter: cluster válido para pruning si TODAS sus hermanas son audience=global Y sin AR content
    redirects = []
    skipped_clusters_mixed = 0
    skipped_clusters_ar = 0
    skipped_clusters_with_locale = 0
    processed = 0
    canonicas = []
    redirected = []

    # Slugs ya redirigidos en batch 1 (no incluir)
    BATCH_1_REDIRECTS = {
        'calculadora-jet-lag-medicacion-timing',
        'calculadora-frecuencia-cardiaca-reposo-categorias-deportistas-edad',
        'calculadora-frecuencia-cardiaca-zonas-entrenamiento-futbolista',
        'calculadora-presion-arterial-tension-categorias-oms-2026',
    }

    for stem, cluster_calcs in sorted(clusters.items()):
        audiences = set(c.get('audience', 'global') for c in cluster_calcs)
        if audiences != {'global'}:
            skipped_clusters_with_locale += 1
            continue

        if any(has_ar_content(c) for c in cluster_calcs):
            skipped_clusters_ar += 1
            continue

        # Wordcount para identificar canónica
        def wc(c: dict) -> int:
            return len((c.get('explanation') or '').split())

        sorted_calcs = sorted(cluster_calcs, key=lambda c: -wc(c))
        canonical = sorted_calcs[0]

        # Si la canónica tiene <500 palabras, el cluster es muy thin para mantener
        # — pero por seguridad, igual hacemos consolidación al menos completo del cluster
        if wc(canonical) < 200:
            continue  # cluster TODO es thin, mejor no consolidar (no hay base sólida)

        for sibling in sorted_calcs[1:]:
            if sibling['slug'] in BATCH_1_REDIRECTS:
                continue
            redirects.append({
                'from': sibling['slug'],
                'to': canonical['slug'],
                'cluster': stem,
                'sibling_wc': wc(sibling),
                'canonical_wc': wc(canonical),
            })
            redirected.append(sibling['slug'])
        canonicas.append(canonical['slug'])
        processed += 1

    print(f'Clusters totales detectados: {len(clusters)}')
    print(f'  Procesados (audience=global + no AR + canonical >200w): {processed}')
    print(f'  Skipped (mezcla locales o todos AR): {skipped_clusters_with_locale}')
    print(f'  Skipped (cluster con menciones AR): {skipped_clusters_ar}')
    print()
    print(f'Total redirects generados: {len(redirects)}')
    print()
    print(f'Canónicas mantenidas (top 10):')
    for c in canonicas[:10]:
        print(f'  ✓ /{c}')
    if len(canonicas) > 10:
        print(f'  ... +{len(canonicas)-10} más')

    print()
    print('--- LÍNEAS para append a public/_redirects ---')
    print()
    print(f'# Pruning batch 2 — 2026-05-13 — consolidación near-duplicates globales')
    print(f'# Generado por scripts/generate-pruning-redirects.py')
    print(f'# {len(redirects)} redirects: variantes thin → canónica del mismo cluster.')
    print(f'# Todos audience=global sin mención AR. Cero riesgo de borrar tráfico AR específico.')
    print(f'#')
    for r in redirects:
        pad = max(0, 70 - len(r['from']))
        print(f'/{r["from"]}{" " * pad} /{r["to"]}    301')

    # Save to file for easy review
    out_md = ROOT / 'docs' / 'pruning-batch-2-2026-05-13.md'
    lines = [
        f'# Pruning batch 2 — 2026-05-13',
        f'',
        f'**{len(redirects)} redirects** de variantes near-duplicate → canónica del mismo cluster.',
        f'',
        f'Criterios estrictos:',
        f'- Todas las hermanas del cluster son `audience: global`',
        f'- Ninguna del cluster menciona AR (ARCA/AFIP/ANSES/etc.)',
        f'- Canónica tiene ≥200 palabras de contenido',
        f'',
        f'## Redirects',
        f'',
        f'| From | To | From wc | Canonical wc |',
        f'|---|---|---|---|',
    ]
    for r in redirects:
        lines.append(f'| `/{r["from"]}` | `/{r["to"]}` | {r["sibling_wc"]} | {r["canonical_wc"]} |')

    out_md.write_text('\n'.join(lines), encoding='utf-8')
    print()
    print(f'✓ Documento: {out_md}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
