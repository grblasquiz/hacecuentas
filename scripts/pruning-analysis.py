#!/usr/bin/env python3
"""
Pruning LLM analysis — identifica calcs candidatas a 301-redirect.

Estrategia post Core Update Abril 2026:
  - El factor HCU dominante es "crecimiento masivo de LLM content".
  - hacecuentas tiene 2.847 calcs, de las cuales >80% son LLM generated
    (audience='global').
  - Recommended action: pruning quirúrgico de 500-700 calcs LLM duplicadas
    o thin, mantener las que tienen tráfico o ángulo único.
  - NO delete — 301 a categoría madre. Preserva link equity.

Criterio de scoring para cada calc:
  - audience='global' (penaliza vs AR/ES/MX que tienen angle local) → +30
  - dataUpdate.frequency == 'none' / 'never' → +20
  - Bajo IG (sin dato vivo) → +10
  - Categoría con muchos hermanos similares → +15
  - lastReviewed > 90 días → +10
  - Title genérico (no localizado, no específico) → +10
  - Content corto (< 500 palabras en explanation) → +15

Score >= 50 → candidata a pruning
Score >= 70 → candidata fuerte
Score >= 90 → casi seguro pruning

Output: docs/pruning-candidates-<YYYY-MM-DD>.md con tabla ordenada por score
+ JSON con la data cruda.

Importante: este script SOLO ANALIZA. No modifica ni borra nada. La decisión
de cuáles redirectar es manual de Martin con la tabla.
"""
from __future__ import annotations

import json
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / 'src' / 'content' / 'calcs'
OUT_DIR = ROOT / 'docs'

# Pesos de scoring (ajustables)
WEIGHTS = {
    'audience_global': 30,
    'no_data_update': 20,
    'low_ig': 10,
    'cluster_size_excess': 15,
    'stale_review': 10,
    'short_content': 15,
}


def score_calc(calc: dict, cluster_sizes: dict[str, int]) -> tuple[int, list[str]]:
    """Devuelve (score, lista_razones). Score más alto = más candidata a pruning."""
    score = 0
    reasons = []

    audience = calc.get('audience', 'global')
    if audience == 'global':
        score += WEIGHTS['audience_global']
        reasons.append('audience:global (sin ángulo local)')

    du = calc.get('dataUpdate') or {}
    freq = du.get('frequency') or 'none'
    if freq in ('none', 'never'):
        score += WEIGHTS['no_data_update']
        reasons.append('sin dataUpdate (fórmula estática)')
    elif freq == 'yearly':
        score += WEIGHTS['low_ig']
        reasons.append('IG bajo (yearly only)')

    # cluster: cuántos calcs comparten la misma categoría?
    cat = calc.get('category', '')
    cluster_size = cluster_sizes.get(cat, 0)
    if cluster_size > 200:
        score += WEIGHTS['cluster_size_excess']
        reasons.append(f'categoría "{cat}" con {cluster_size} hermanos')

    # stale review
    last_reviewed = calc.get('lastReviewed', '')
    if last_reviewed:
        try:
            dt = datetime.strptime(last_reviewed, '%Y-%m-%d')
            days = (datetime.now() - dt).days
            if days > 90:
                score += WEIGHTS['stale_review']
                reasons.append(f'lastReviewed hace {days}d')
        except ValueError:
            pass

    # content length
    explanation = calc.get('explanation') or ''
    word_count = len(explanation.split()) if explanation else 0
    if word_count < 500:
        score += WEIGHTS['short_content']
        reasons.append(f'content corto ({word_count} palabras)')

    return score, reasons


def detect_near_duplicates(calcs: list[dict]) -> dict[str, list[str]]:
    """Detecta calcs con títulos/slugs muy similares (heurística simple).

    Una calc puede tener 5 hermanos con casi el mismo título variando solo
    en una palabra (ej. ranking-1, ranking-2, ranking-3 ...). Esas son
    candidatas fuertes a consolidación.
    """
    by_stem: dict[str, list[str]] = defaultdict(list)
    for c in calcs:
        slug = c.get('slug', '')
        # Stem: primeras 3 palabras del slug, sin números
        tokens = [t for t in slug.split('-') if not t.isdigit() and len(t) > 2]
        stem = '-'.join(tokens[:3])
        if stem:
            by_stem[stem].append(slug)
    # Filter to clusters with 3+ very similar siblings
    return {k: sorted(v) for k, v in by_stem.items() if len(v) >= 3}


def main() -> int:
    calcs = []
    for f in sorted(CALCS_DIR.glob('*.json')):
        try:
            d = json.loads(f.read_text(encoding='utf-8'))
            d['_path'] = str(f.relative_to(ROOT))
            calcs.append(d)
        except Exception:
            continue

    print(f'Analizando {len(calcs)} calcs...')

    # Pre-compute cluster sizes
    cluster_sizes = Counter(c.get('category', 'unknown') for c in calcs)

    # Score each calc
    scored = []
    for c in calcs:
        sc, reasons = score_calc(c, cluster_sizes)
        scored.append({
            'slug': c.get('slug', ''),
            'audience': c.get('audience', 'global'),
            'category': c.get('category', ''),
            'lastReviewed': c.get('lastReviewed', ''),
            'frequency': (c.get('dataUpdate') or {}).get('frequency', 'none'),
            'wordCount': len((c.get('explanation') or '').split()),
            'score': sc,
            'reasons': reasons,
        })

    scored.sort(key=lambda x: -x['score'])

    # Buckets
    very_strong = [s for s in scored if s['score'] >= 90]
    strong = [s for s in scored if 70 <= s['score'] < 90]
    candidate = [s for s in scored if 50 <= s['score'] < 70]
    keep = [s for s in scored if s['score'] < 50]

    # Near-duplicates
    near_dups = detect_near_duplicates(calcs)

    today = datetime.now().strftime('%Y-%m-%d')
    out_md = OUT_DIR / f'pruning-candidates-{today}.md'
    out_json = OUT_DIR / f'pruning-candidates-{today}.json'

    md = [f'# Pruning candidates — {today}']
    md.append(f'\nTotal analizado: **{len(calcs)} calcs**\n')
    md.append('## Resumen\n')
    md.append(f'| Bucket | Count | % | Acción sugerida |')
    md.append('|---|---|---|---|')
    md.append(f'| 🔴 Muy fuerte (score ≥90) | {len(very_strong)} | {len(very_strong)/len(calcs)*100:.1f}% | 301 a categoría madre |')
    md.append(f'| 🟠 Fuerte (70-89) | {len(strong)} | {len(strong)/len(calcs)*100:.1f}% | Revisar tráfico, probablemente 301 |')
    md.append(f'| 🟡 Candidata (50-69) | {len(candidate)} | {len(candidate)/len(calcs)*100:.1f}% | Decisión caso por caso |')
    md.append(f'| 🟢 Mantener (<50) | {len(keep)} | {len(keep)/len(calcs)*100:.1f}% | Sin acción |')

    md.append('\n## Distribución por audience\n')
    aud_dist = Counter((s['audience'], s['score'] >= 70) for s in scored)
    md.append('| Audience | Prune fuerte | Mantener |')
    md.append('|---|---|---|')
    audiences = sorted(set(a for a, _ in aud_dist.keys()))
    for aud in audiences:
        prune = aud_dist.get((aud, True), 0)
        keep_c = aud_dist.get((aud, False), 0)
        md.append(f'| {aud} | {prune} | {keep_c} |')

    md.append('\n## Top 50 candidatas muy fuertes (score ≥90)\n')
    md.append('| Slug | Score | Audience | Cat | Razones |')
    md.append('|---|---|---|---|---|')
    for s in very_strong[:50]:
        reasons_str = ' · '.join(s['reasons'])
        md.append(f'| `{s["slug"]}` | {s["score"]} | {s["audience"]} | {s["category"]} | {reasons_str} |')
    if len(very_strong) > 50:
        md.append(f'\n... +{len(very_strong)-50} más en JSON')

    md.append(f'\n## Clusters de near-duplicates ({len(near_dups)} grupos)\n')
    md.append('Calcs con prefijos casi idénticos. Candidatos a consolidación (3-5 → 1 calc principal con 301 desde las demás).\n')
    md.append('| Stem | Count | Slugs |')
    md.append('|---|---|---|')
    for stem, slugs in sorted(near_dups.items(), key=lambda x: -len(x[1]))[:30]:
        slugs_str = ', '.join(slugs[:6])
        if len(slugs) > 6:
            slugs_str += f', +{len(slugs)-6}'
        md.append(f'| {stem} | {len(slugs)} | {slugs_str} |')

    md.append('\n## Cómo usar este reporte\n')
    md.append('1. **Empezar por la sección "muy fuertes"** (score ≥90) — son los riesgos más obvios.')
    md.append('2. **Revisar GA4 / GSC** para cada candidata: si tiene >5 sesiones/mes o impresiones >100/mes, NO prunear (mantener).')
    md.append('3. **Decidir target del 301** por calc: la categoría madre (`/categoria/<cat>`) o una calc similar más fuerte.')
    md.append('4. **Aplicar en lotes de 50-100** para no inflar el sitemap de cambios. Esperar 7 días entre lotes.')
    md.append('5. **Trackear**: si después de 4 semanas el sitio mejora, continuar. Si no, parar y re-evaluar.')

    md.append('\n## Lo que NO se hace\n')
    md.append('- **No borrar archivos.** Solo agregar redirect en `public/_redirects`.')
    md.append('- **No prunear calcs con tráfico orgánico real** (GSC clicks o GA4 sessions >5/semana).')
    md.append('- **No prunear más de ~700 en total** — el plan recomienda 500-700, no más.')

    out_md.write_text('\n'.join(md), encoding='utf-8')

    out_json.write_text(json.dumps({
        'date': today,
        'total': len(calcs),
        'buckets': {
            'very_strong': len(very_strong),
            'strong': len(strong),
            'candidate': len(candidate),
            'keep': len(keep),
        },
        'weights': WEIGHTS,
        'top_candidates': scored[:200],
        'near_dup_clusters': near_dups,
    }, indent=2, ensure_ascii=False), encoding='utf-8')

    print(f'\n✓ Reporte: {out_md}')
    print(f'✓ JSON:    {out_json}')
    print(f'\nResumen:')
    print(f'  🔴 Muy fuerte (≥90):  {len(very_strong)}')
    print(f'  🟠 Fuerte (70-89):    {len(strong)}')
    print(f'  🟡 Candidata (50-69): {len(candidate)}')
    print(f'  🟢 Mantener (<50):    {len(keep)}')
    print(f'\n  Total potencial pruning (fuerte+candidata): {len(very_strong)+len(strong)+len(candidate)}')

    return 0


if __name__ == '__main__':
    sys.exit(main())
