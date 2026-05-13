#!/usr/bin/env python3
"""
Auditoría de Information Gain en todas las calcs.

Clasifica cada calc por nivel de IG:
- daily: dato vivo, refresh diario (BCRA, dólar, IPC en vivo)
- weekly: refresh semanal
- monthly: refresh mensual (escalas que cambian poco)
- yearly: refresh anual (fórmulas estables)
- none: sin dataUpdate (fórmula pura, baseline LLM o legacy)

Output: reporte markdown + JSON con stats agregadas.
"""
from __future__ import annotations

import json
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / 'src' / 'content' / 'calcs'

def classify(calc: dict) -> tuple[str, str]:
    """Devuelve (frequency, source). Si no hay dataUpdate → ('none', '')."""
    du = calc.get('dataUpdate') or {}
    freq = du.get('frequency') or 'none'
    source = du.get('source') or ''
    last = du.get('lastUpdated') or ''
    return freq, source, last


def main() -> None:
    by_freq = Counter()
    by_audience = defaultdict(Counter)
    samples = defaultdict(list)
    stale = []
    total = 0

    today = datetime.now().strftime('%Y-%m-%d')

    for f in sorted(CALCS_DIR.glob('*.json')):
        try:
            calc = json.loads(f.read_text(encoding='utf-8'))
        except Exception:
            continue
        total += 1
        slug = f.stem
        audience = calc.get('audience', 'global')
        freq, source, last = classify(calc)
        by_freq[freq] += 1
        by_audience[audience][freq] += 1
        if len(samples[freq]) < 5:
            samples[freq].append((slug, last, source[:60]))

        # Stale check: daily/weekly con lastUpdated >30 días atrás
        if freq in ('daily', 'weekly') and last:
            try:
                dt = datetime.strptime(last, '%Y-%m-%d')
                days_ago = (datetime.now() - dt).days
                if freq == 'daily' and days_ago > 3:
                    stale.append((slug, freq, last, days_ago))
                elif freq == 'weekly' and days_ago > 14:
                    stale.append((slug, freq, last, days_ago))
            except Exception:
                pass

    # Output markdown
    out = [f'# IG Audit — {today}\n']
    out.append(f'**Total calcs analizadas:** {total}\n')
    out.append('## Por frequency\n')
    out.append('| Frequency | Count | % | Implica |')
    out.append('|---|---|---|---|')
    interpretations = {
        'daily': 'IG real (dato vivo, diferenciador)',
        'weekly': 'IG fuerte (refresh frecuente)',
        'monthly': 'IG medio (escalas/tablas que cambian)',
        'yearly': 'IG bajo (fórmulas estables, citación oficial)',
        'none': 'Sin IG (fórmula pura o legacy LLM)',
    }
    for freq in ['daily', 'weekly', 'monthly', 'yearly', 'none']:
        n = by_freq.get(freq, 0)
        pct = round(100 * n / total, 1) if total else 0
        out.append(f'| {freq} | {n} | {pct}% | {interpretations.get(freq, "")} |')

    out.append('\n## Por audience\n')
    out.append('| Audience | daily | weekly | monthly | yearly | none | total |')
    out.append('|---|---|---|---|---|---|---|')
    for aud in sorted(by_audience.keys()):
        c = by_audience[aud]
        t = sum(c.values())
        out.append(f'| {aud} | {c.get("daily",0)} | {c.get("weekly",0)} | {c.get("monthly",0)} | {c.get("yearly",0)} | {c.get("none",0)} | {t} |')

    out.append('\n## Ejemplos por frequency\n')
    for freq in ['daily', 'weekly', 'monthly', 'yearly']:
        out.append(f'### {freq}')
        for slug, last, src in samples.get(freq, []):
            out.append(f'- `{slug}` (last: {last}) — {src}')
        out.append('')

    if stale:
        out.append(f'## Stale alerts ({len(stale)})\n')
        out.append('Calcs con frequency daily/weekly cuya lastUpdated quedó vieja.\n')
        out.append('| Slug | Freq | Last | Days ago |')
        out.append('|---|---|---|---|')
        for slug, freq, last, days in stale[:30]:
            out.append(f'| {slug} | {freq} | {last} | {days} |')
        if len(stale) > 30:
            out.append(f'\n... +{len(stale)-30} más')

    out.append('\n## Conclusión\n')
    daily_pct = round(100 * by_freq.get('daily', 0) / total, 1)
    weekly_pct = round(100 * by_freq.get('weekly', 0) / total, 1)
    high_ig = by_freq.get('daily', 0) + by_freq.get('weekly', 0)
    high_ig_pct = round(100 * high_ig / total, 1)
    out.append(f'- **IG alto (daily+weekly):** {high_ig} calcs ({high_ig_pct}%)')
    out.append(f'- **daily solo:** {by_freq.get("daily", 0)} calcs ({daily_pct}%)')
    out.append(f'- **Sin IG:** {by_freq.get("none", 0)} calcs ({round(100*by_freq.get("none",0)/total,1)}%) — candidatas a pruning si LLM/duplicadas')

    out_md = ROOT / 'docs' / f'ig-audit-{today}.md'
    out_md.write_text('\n'.join(out), encoding='utf-8')

    # JSON para procesamiento posterior
    out_json = {
        'date': today,
        'total': total,
        'by_freq': dict(by_freq),
        'by_audience': {k: dict(v) for k, v in by_audience.items()},
        'stale_count': len(stale),
        'stale_samples': [{'slug': s, 'freq': f, 'last': l, 'days_ago': d} for s, f, l, d in stale[:50]],
    }
    (ROOT / 'docs' / f'ig-audit-{today}.json').write_text(json.dumps(out_json, indent=2), encoding='utf-8')

    print(f'✅ Reporte: docs/ig-audit-{today}.md')
    print(f'✅ JSON:    docs/ig-audit-{today}.json')
    print(f'\nResumen rápido:')
    print(f'  Total: {total} calcs')
    print(f'  IG alto (daily+weekly): {high_ig} ({high_ig_pct}%)')
    print(f'  Sin IG: {by_freq.get("none", 0)} ({round(100*by_freq.get("none",0)/total,1)}%)')
    print(f'  Stale (daily/weekly vencidos): {len(stale)}')


if __name__ == '__main__':
    main()
