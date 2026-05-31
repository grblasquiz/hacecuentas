#!/usr/bin/env python3
"""
Audit completo de prune candidates para hacecuentas.com.

Cruza:
  - Todas las URLs del sitio (sitemap)
  - GSC impr + clicks últimos 90d
  - Estado actual: noindex / pruned (301 a categoría) / 410 / vivo
  - Top performers (>50 impr) que merecen reinversión

Output: docs/prune-audit-2026-05-27.md con buckets ejecutables.
"""
import json
import os
import re
import sys
from collections import defaultdict
from datetime import date, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

from google.oauth2 import service_account
from googleapiclient.discovery import build

# Guard compartido: excluye locales jóvenes/secundarios (/es,/mx,/co,/cl) y
# calcs nuevas (<6m) del bucket de candidatas a 410. "0 impresiones" no implica
# zombie si la URL todavía no tuvo tiempo de indexarse. Ver scripts/prune_guard.py.
sys.path.insert(0, str(Path(__file__).resolve().parent))
from prune_guard import PruneGuard

ROOT = Path('/Users/marrod/hacecuentas')
SA = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
SITE = 'sc-domain:hacecuentas.com'
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'

creds = service_account.Credentials.from_service_account_file(
    SA, scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
sc = build('searchconsole', 'v1', credentials=creds)

# ─── 1) Cargar todas las URLs del sitemap ──────────────────────────────────
print('[1/4] Cargando sitemap…')
sitemap_urls = set()
for sm_path in (ROOT / 'public').glob('sitemap-*.xml'):
    try:
        tree = ET.parse(sm_path)
        for loc in tree.getroot().iter(f'{NS}loc'):
            if loc.text:
                sitemap_urls.add(loc.text.strip().replace('https://hacecuentas.com', ''))
    except Exception as e:
        print(f'  warn {sm_path.name}: {e}')
print(f'  Total URLs sitemap: {len(sitemap_urls):,}')

# ─── 2) Estado de cada URL (noindex / 301 / 410) ───────────────────────────
print('[2/4] Inspeccionando estado JSONs…')
noindex_slugs = set()
for json_path in (ROOT / 'src/content/calcs').glob('*.json'):
    try:
        d = json.loads(json_path.read_text())
        if d.get('noindex') is True:
            slug = d.get('slug', '')
            if slug:
                noindex_slugs.add('/' + slug)
    except Exception:
        pass

# Redirects (pruning 301 a /categoria/*)
pruned_slugs = set()
redirect_path = ROOT / 'public' / '_redirects'
if redirect_path.exists():
    for line in redirect_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith('#'): continue
        parts = line.split()
        if len(parts) >= 2 and parts[0].startswith('/') and ('301' in parts or len(parts) == 2):
            pruned_slugs.add(parts[0])

# 410 Gone
gone_slugs = set()
gone_path = ROOT / 'src' / 'lib' / 'gone-410.ts'
if gone_path.exists():
    for m in re.finditer(r'"(/[^"]+)"', gone_path.read_text()):
        gone_slugs.add(m.group(1))

print(f'  noindex en JSON: {len(noindex_slugs):,}')
print(f'  redirect 301 en _redirects: {len(pruned_slugs):,}')
print(f'  410 Gone en gone-410.ts: {len(gone_slugs):,}')

# ─── 3) Pull GSC 90d a nivel URL ───────────────────────────────────────────
print('[3/4] Pull GSC 90d…')
end = date.today() - timedelta(days=2)
start = end - timedelta(days=89)

all_rows = []
start_row = 0
while True:
    r = sc.searchanalytics().query(
        siteUrl=SITE,
        body={
            'startDate': str(start), 'endDate': str(end),
            'dimensions': ['page'], 'rowLimit': 25000, 'startRow': start_row,
        },
    ).execute()
    rows = r.get('rows', [])
    if not rows:
        break
    all_rows.extend(rows)
    if len(rows) < 25000:
        break
    start_row += 25000

print(f'  GSC pages con datos 90d: {len(all_rows):,}')

# Mapear URL → métricas
gsc_metrics = {}
for row in all_rows:
    url = row['keys'][0].replace('https://hacecuentas.com', '')
    gsc_metrics[url] = {
        'impr': int(row['impressions']),
        'clicks': int(row['clicks']),
        'pos': row['position'],
        'ctr': row['ctr'],
    }

# ─── 4) Clasificar URLs en buckets ─────────────────────────────────────────
print('[4/4] Clasificando…')

# Universo a auditar: URLs sitemap + URLs con datos GSC (puede haber URLs indexadas no en sitemap)
universe = sitemap_urls | set(gsc_metrics.keys())

buckets = {
    'top_performers': [],       # >=200 impr 90d, calc viva: REINVERTIR
    'mid_performers': [],       # 50-199 impr 90d: optimizar
    'low_value': [],            # 10-49 impr 90d: revisar
    'zero_value': [],           # 0-9 impr 90d, calc viva: candidata 410 Gone
    'protected_young': [],      # locale joven/calc <6m: NUNCA 410 (guard)
    'noindex_with_traffic': [],  # noindex pero recibiendo impr: zombies a desprune
    'noindex_no_traffic': [],    # noindex y 0 impr: dejar así, confirmado prune
    'pruned_with_traffic': [],   # 301 pero aún recibe impr: revisar restaurar
    'pruned_no_traffic': [],     # 301 y 0 impr: confirmado
}

guard = PruneGuard()
print(f'  guard 410: locales bloqueados={sorted(guard.block_locales)} | edad min={guard.min_age_days}d')

for url in universe:
    m = gsc_metrics.get(url, {'impr': 0, 'clicks': 0, 'pos': 0, 'ctr': 0})
    impr = m['impr']
    is_noindex = url in noindex_slugs
    is_pruned = url in pruned_slugs or url in gone_slugs

    entry = {'url': url, **m}

    if is_noindex:
        (buckets['noindex_with_traffic'] if impr > 0 else buckets['noindex_no_traffic']).append(entry)
    elif is_pruned:
        (buckets['pruned_with_traffic'] if impr > 0 else buckets['pruned_no_traffic']).append(entry)
    else:
        if impr >= 200:
            buckets['top_performers'].append(entry)
        elif impr >= 50:
            buckets['mid_performers'].append(entry)
        elif impr >= 10:
            buckets['low_value'].append(entry)
        else:
            # zero_value = candidata 410. Guard: si es locale joven/secundario
            # o calc nueva (<6m), va a protected_young — NO se 410'ea.
            prot, reason = guard.is_protected(url)
            if prot:
                entry['guard_reason'] = reason
                buckets['protected_young'].append(entry)
            else:
                buckets['zero_value'].append(entry)

# Sort
for k in buckets:
    buckets[k].sort(key=lambda x: -x['impr'])

# ─── 5) Reporte ────────────────────────────────────────────────────────────
out = []
out.append(f'# Audit Prune full site — {date.today()}\n')
out.append(f'Período GSC: {start} → {end} (90 días)\n')
out.append(f'\n## Resumen\n')
out.append(f'\n| Bucket | URLs | Impr suma | Clicks suma |')
out.append(f'|---|---:|---:|---:|')
for k, lst in buckets.items():
    imps = sum(x['impr'] for x in lst)
    clks = sum(x['clicks'] for x in lst)
    out.append(f'| **{k}** | {len(lst):,} | {imps:,} | {clks:,} |')
out.append('')

def section(title, key, action, n=None):
    out.append(f'\n## {title}\n')
    out.append(f'**Acción sugerida:** {action}\n')
    out.append(f'\nTotal: {len(buckets[key]):,} URLs · {sum(x["impr"] for x in buckets[key]):,} impr · {sum(x["clicks"] for x in buckets[key]):,} clicks\n')
    if not buckets[key]:
        return
    out.append(f'\n| URL | Impr | Clicks | Pos |')
    out.append(f'|---|---:|---:|---:|')
    items = buckets[key][:n] if n else buckets[key]
    for x in items:
        out.append(f'| `{x["url"][:80]}` | {x["impr"]:,} | {x["clicks"]:,} | {x["pos"]:.1f} |')
    if n and len(buckets[key]) > n:
        out.append(f'| ... +{len(buckets[key]) - n} más | | | |')

section(
    '🟢 Top performers (≥200 impr) — REINVERTIR',
    'top_performers',
    'Sumar Information Gain extra: tablas comparativas, datos cruzados, schema profundo, FAQs extra. Estas son las que mueven aguja — proteger y amplificar.',
    n=30,
)

section(
    '🟡 Mid performers (50-199 impr) — OPTIMIZAR',
    'mid_performers',
    'Quick wins SEO-safe: presets, FAQs largas, internal links desde top performers. Bajo costo, alto retorno potencial.',
    n=30,
)

section(
    '🟠 Low value (10-49 impr) — REVISAR',
    'low_value',
    'Decidir caso por caso: si hay query con potencial, optimizar. Si es thin, considerar consolidar con otra calc del cluster.',
    n=30,
)

section(
    '🔴 Zero value (<10 impr) — CANDIDATAS A 410 GONE',
    'zero_value',
    'Lista larga. Estas son las que diluyen calidad agregada del sitio y disparan SERP suppression sobre TODAS las URLs. Mover a 410 Gone en batch reduce footprint y libera "credibility budget" para que Google muestre más las top performers. (Las de locales jóvenes /es,/mx,/co,/cl y calcs <6m YA fueron excluidas → ver sección Protegidas.)',
    n=100,
)

section(
    '🛡️ Protegidas del 410 (locale joven / calc <6m) — NO MATAR',
    'protected_young',
    'URLs con <10 impr que NO son candidatas a 410: pertenecen a un locale joven/secundario (/es,/mx,/co,/cl) o son calcs publicadas hace <6m. "0 impresiones" no implica zombie si la URL todavía no tuvo tiempo de indexarse en un mercado con autoridad. Falso positivo del 2026-05-27 (60 calcs-es). Optimizar/esperar indexación, JAMÁS 410. Override: scripts/prune_guard.py.',
    n=50,
)

section(
    '⚠️ Noindex pero CON tráfico — Zombies a desprune',
    'noindex_with_traffic',
    'Patrón ya validado el 20/5 y 27/5: pages noindex que aún reciben impr son zombies — desprune (sacar noindex + bump lastReviewed) las recupera. Alto ROI, bajo riesgo.',
)

section(
    '✅ Noindex sin tráfico — confirmar prune',
    'noindex_no_traffic',
    'Estos ya cumplen el rol: noindex + 0 impr = bien pruneadas. Sin acción.',
    n=10,
)

section(
    '⚠️ 301-pruned pero CON impresiones residuales',
    'pruned_with_traffic',
    'Estas se borraron a /categoria/* pero Google aún las pidió. Si la query era valiosa, considerar restaurar el contenido específico en vez de redirect.',
    n=30,
)

# Guardar
out_path = ROOT / 'docs' / f'prune-audit-{date.today()}.md'
out_path.parent.mkdir(exist_ok=True)
out_path.write_text('\n'.join(out))
print(f'\n✅ Reporte guardado en: {out_path}')
print(f'   Total URLs analizadas: {len(universe):,}')
print(f'   Candidatas 410 Gone (zero_value): {len(buckets["zero_value"]):,}')
print(f'   Protegidas del 410 (locale joven/calc <6m): {len(buckets["protected_young"]):,}')
print(f'   Top performers a reinvertir: {len(buckets["top_performers"]):,}')
print(f'   Zombies a desprune: {len(buckets["noindex_with_traffic"]):,}')
