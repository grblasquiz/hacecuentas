#!/usr/bin/env python3
"""Track C — quita de las explanations el boilerplate que el TEMPLATE ya renderiza
(footer editorial, disclaimer/actualización, "## Calculadoras relacionadas").
Esto de-fingerprintea el corpus sin perder nada (el template lo sigue mostrando:
última-revisión badge, disclaimer YMYL auto-inyectado, relatedSlugs).

Dry-run por defecto. `--apply` escribe. `--bump` actualiza lastReviewed de los tocados.
"""
import json, re, sys
from pathlib import Path

ROOT = Path('/Users/marrod/hacecuentas/src/content')
DIRS = ['calcs','calcs-en','calcs-pt','calcs-mx','calcs-co','calcs-cl','calcs-es','calcs-pe','calcs-ec']
APPLY = '--apply' in sys.argv
BUMP  = '--bump' in sys.argv
TODAY = '2026-06-19'

def strip(expl, related_nonempty):
    t = expl; tags = []
    # A) "## Revisión editorial" (heading) hasta el final
    m = re.search(r'\n#{1,4}\s*Revisi[oó]n editorial\b.*\Z', t, re.S | re.I)
    if m:
        t = t[:m.start()]; tags.append('editorial-heading')
    else:
        # B) párrafo suelto "**Revisado por el equipo editorial...**" hasta el final
        m2 = re.search(r'\n\s*\*\*Revisad[oa] por el equipo editorial.*\Z', t, re.S | re.I)
        if m2:
            t = t[:m2.start()]; tags.append('editorial-para')
    # C) bloque "## Calculadoras relacionadas" (solo si relatedSlugs ya cubre los links)
    if related_nonempty:
        m3 = re.search(r'\n#{1,4}\s*Calculadoras relacionadas\b.*?(?=\n#{1,4}\s|\Z)', t, re.S | re.I)
        if m3:
            t = t[:m3.start()] + t[m3.end():]; tags.append('related-section')
    return t.rstrip() + '\n', tags

from collections import Counter
tag_counts = Counter(); chars_removed = 0; touched = []; samples = []
foot_before = foot_after = 0

for d in DIRS:
    for fp in sorted((ROOT / d).glob('*.json')):
        try: j = json.load(open(fp))
        except Exception: continue
        expl = j.get('explanation', '')
        if not expl: continue
        if re.search(r'revisado por el equipo editorial', expl, re.I): foot_before += 1
        related_nonempty = bool(j.get('relatedSlugs'))
        new, tags = strip(expl, related_nonempty)
        if not tags:  # nada de boilerplate → no tocar (evita churn cosmético del sitemap)
            if re.search(r'revisado por el equipo editorial', expl, re.I): foot_after += 1
            continue
        if re.search(r'revisado por el equipo editorial', new, re.I): foot_after += 1
        if new != expl:
            for t in tags: tag_counts[t] += 1
            chars_removed += len(expl) - len(new)
            touched.append((fp, j, new))
            if len(samples) < 2:
                samples.append((j['slug'], expl[-300:], new[-180:]))

print(f"calcs que cambian: {len(touched)} | chars removidos: {chars_removed:,}")
print(f"por patrón: {dict(tag_counts)}")
print(f"footer editorial: antes {foot_before} calcs → después {foot_after}")
print(f"\nMODO: {'APPLY' if APPLY else 'DRY-RUN'}{' +bump lastReviewed' if BUMP else ''}")
for slug, before, after in samples:
    print(f"\n— {slug}\n  ANTES …{before[-160:]!r}\n  DESPUÉS …{after[-120:]!r}")

if APPLY:
    for fp, j, new in touched:
        j['explanation'] = new
        if BUMP: j['lastReviewed'] = TODAY
        fp.write_text(json.dumps(j, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f"\n✅ escritas {len(touched)} calcs")
