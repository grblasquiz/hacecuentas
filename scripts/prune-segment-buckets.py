#!/usr/bin/env python3
"""
Camino C: segmentar las 2.299 URLs zero-impr en 3 buckets accionables.

  Bucket 1 — MUERTAS DURO: 410 Gone seguro (no hay query real)
  Bucket 2 — ESTACIONALES/LONG-TAIL: revisar antes de matar
  Bucket 3 — CLUSTERS DUPLICADOS: consolidar (mantener 1, 301 las demás)

Output: docs/prune-buckets-2026-05-27.md con conteos + muestras + listas full.
"""
import json
import re
from collections import defaultdict
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

from google.oauth2 import service_account
from googleapiclient.discovery import build
from datetime import timedelta

# Guard compartido: locales jóvenes/secundarios (/es,/mx,/co,/cl) y calcs nuevas
# (<6m) NO pueden caer en bucket_1 (muertas duro → 410). "0 impresiones" no
# implica zombie si la URL no tuvo tiempo de indexarse. Ver scripts/prune_guard.py.
import sys
sys.path.insert(0, str(Path(__file__).resolve().parent))
from prune_guard import PruneGuard

ROOT = Path('/Users/marrod/hacecuentas')
SA = '/Users/marrod/.config/gcp/hacecuentas-indexing.json'
SITE = 'sc-domain:hacecuentas.com'
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'

# ─── pull GSC + universo (igual que antes) ────────────────────────────────
creds = service_account.Credentials.from_service_account_file(
    SA, scopes=['https://www.googleapis.com/auth/webmasters.readonly']
)
sc = build('searchconsole', 'v1', credentials=creds)

end = date.today() - timedelta(days=2)
start = end - timedelta(days=89)

sitemap_urls = set()
for sm in (ROOT / 'public').glob('sitemap-*.xml'):
    try:
        for loc in ET.parse(sm).getroot().iter(f'{NS}loc'):
            if loc.text:
                sitemap_urls.add(loc.text.strip().replace('https://hacecuentas.com', ''))
    except: pass

gsc_with_impr = set()
start_row = 0
while True:
    r = sc.searchanalytics().query(siteUrl=SITE, body={
        'startDate': str(start), 'endDate': str(end), 'dimensions': ['page'],
        'rowLimit': 25000, 'startRow': start_row
    }).execute()
    rows = r.get('rows', [])
    if not rows: break
    for row in rows:
        if int(row['impressions']) > 0:
            gsc_with_impr.add(row['keys'][0].replace('https://hacecuentas.com', ''))
    if len(rows) < 25000: break
    start_row += 25000

noindex_slugs = set()
for jp in (ROOT / 'src/content/calcs').glob('*.json'):
    try:
        d = json.loads(jp.read_text())
        if d.get('noindex'):
            noindex_slugs.add('/' + d.get('slug', ''))
    except: pass

pruned = set()
for line in (ROOT / 'public' / '_redirects').read_text().splitlines():
    line = line.strip()
    if line and not line.startswith('#'):
        parts = line.split()
        if len(parts) >= 2 and parts[0].startswith('/'):
            pruned.add(parts[0])

gone = set()
gone_path = ROOT / 'src' / 'lib' / 'gone-410.ts'
if gone_path.exists():
    for m in re.finditer(r'"(/[^"]+)"', gone_path.read_text()):
        gone.add(m.group(1))

related = json.loads((ROOT / 'src' / 'lib' / 'related-auto.json').read_text())
linked_urls = set()
for slug, rels in related.items():
    for r in (rels if isinstance(rels, list) else []):
        if isinstance(r, str):
            linked_urls.add('/' + r)
        elif isinstance(r, dict) and 'slug' in r:
            linked_urls.add('/' + r['slug'])

# Universo zero_value
def is_skip(u):
    if u.startswith('/categoria/') or u.startswith('/guia/') or u.startswith('/glosario/'): return True
    if u.startswith('/tabla/') or u.startswith('/argentina/'): return True
    if u in ('/', '/buscar', '/guias', '/sobre-nosotros', '/contacto',
             '/politica-editorial', '/metodologia', '/terminos', '/admin'):
        return True
    return False

zero_impr_urls = [
    u for u in sitemap_urls
    if u not in gsc_with_impr
    and u not in noindex_slugs
    and u not in pruned
    and u not in gone
    and not is_skip(u)
]
print(f'Universo zero-impr a clasificar: {len(zero_impr_urls):,}')

# ─── CLASIFICACIÓN en 3 buckets ──────────────────────────────────────────

# Bucket 2 — estacional/long-tail
SEASONAL_KEYWORDS = [
    'navidad', 'reyes', 'cumple', 'cumpleanos', 'aniversario', 'casamiento', 'boda',
    'padre', 'madre', 'amigo', 'enamorados', 'san-valentin', 'halloween', 'pascua',
    'pascuas', 'mundial', 'olimpiad', 'eleccion', 'eleccione', 'paritaria',
    'temporada', 'verano', 'invierno', 'otono', 'primavera',
    'black-friday', 'cyber', 'hot-sale', 'navideno', 'navideña',
    'fin-de-ano', 'ano-nuevo', 'baby-shower', 'maraton', 'carnaval',
    'dia-de', 'jubileo', 'graduacion', 'comunion', 'bautismo', 'bar-mitz',
]

def is_seasonal(url):
    s = url.lower()
    return any(k in s for k in SEASONAL_KEYWORDS)

# Bucket 3 — clusters duplicados
# Stem = primer "topic concept" del slug. Agrupar por stem.
# /calculadora-X-* → X. /conversor-X-* → X. Pero hay que ir más lejos.
def stem(url):
    # Quitar prefijo locale
    s = url.lstrip('/')
    for pfx in ('en/', 'co/', 'es/', 'cl/', 'mx/', 'pt/'):
        if s.startswith(pfx):
            s = s[len(pfx):]
            break
    # Quitar prefijos genéricos
    for pfx in ('calculadora-', 'conversor-', 'simulador-', 'calc-'):
        if s.startswith(pfx):
            s = s[len(pfx):]
            break
    # Tomar primeros 2-3 tokens como stem
    parts = s.split('-')
    if len(parts) >= 3:
        return '-'.join(parts[:3])
    return s

stems = defaultdict(list)
for u in zero_impr_urls:
    stems[stem(u)].append(u)

cluster_urls = set()
clusters = {k: v for k, v in stems.items() if len(v) >= 3}
for urls in clusters.values():
    cluster_urls.update(urls)

# Bucket 1 — el resto (no estacional + no cluster + 0 impr)
bucket_1 = []  # muertas duro
bucket_2 = []  # estacional/long-tail
bucket_3 = []  # clusters duplicados (todas las del cluster)
bucket_safe = []  # tiene internal link → protegida, revisión humana
bucket_protected_young = []  # locale joven/calc <6m → NUNCA 410 (guard)

guard = PruneGuard()
print(f'Guard 410: locales bloqueados={sorted(guard.block_locales)} | edad min={guard.min_age_days}d')

for u in zero_impr_urls:
    # Guard primero: una calc de locale joven/secundario o nueva (<6m) jamás va
    # a "muertas duro", aunque tenga 0 impr y 0 internal links. Falso positivo
    # del 2026-05-27 (60 calcs-es marcadas como zombies sin haberse indexado).
    if guard.is_protected(u)[0]:
        bucket_protected_young.append(u)
    elif u in linked_urls:
        bucket_safe.append(u)
    elif is_seasonal(u):
        bucket_2.append(u)
    elif u in cluster_urls:
        bucket_3.append(u)
    else:
        bucket_1.append(u)

# ─── Reporte ─────────────────────────────────────────────────────────────
out = []
out.append(f'# Prune Buckets — segmentación zero-impr — {date.today()}\n')
out.append(f'Universo: {len(zero_impr_urls):,} URLs con 0 impresiones GSC 90d\n')
out.append(f'\n## Resumen\n')
out.append(f'| Bucket | URLs | Acción sugerida | Riesgo |')
out.append(f'|---|---:|---|---|')
out.append(f'| 🟢 **1 — Muertas duro** | {len(bucket_1):,} | **410 Gone** — sin internal links + no estacionales + sin cluster grande | Bajo |')
out.append(f'| 🟡 **2 — Estacionales/long-tail** | {len(bucket_2):,} | Revisar antes de matar — pueden tener picos Oct-Dic | Medio |')
out.append(f'| 🟠 **3 — Clusters duplicados (≥3 URLs misma temática)** | {len(bucket_3):,} | Consolidar: mantener 1 por cluster, 301 el resto | Medio |')
out.append(f'| 🔵 **Protegidas (internal link)** | {len(bucket_safe):,} | Revisión humana, NO matar | Alto |')
out.append(f'| 🛡️ **Protegidas (locale joven /es,/mx,/co,/cl o calc <6m)** | {len(bucket_protected_young):,} | NO matar — todavía no tuvieron tiempo de indexarse (guard) | Alto |')

out.append(f'\n## 🟢 Bucket 1 — Muertas duro (CANDIDATAS 410 GONE)\n')
out.append(f'**Acción:** Agregar a `src/lib/gone-410.ts` en batch. Total: {len(bucket_1):,}\n')
out.append(f'\n<details><summary>Ver primeras 100 (de {len(bucket_1):,})</summary>\n')
for u in bucket_1[:100]:
    out.append(f'- `{u}`')
out.append(f'\n</details>\n')

out.append(f'\n## 🟡 Bucket 2 — Estacionales/Long-tail\n')
out.append(f'**Acción:** Antes de matar, revisar si históricamente capturaron tráfico en su temporada. Total: {len(bucket_2):,}\n')
out.append(f'\n<details><summary>Ver primeras 100 (de {len(bucket_2):,})</summary>\n')
for u in bucket_2[:100]:
    out.append(f'- `{u}`')
out.append(f'\n</details>\n')

out.append(f'\n## 🟠 Bucket 3 — Clusters duplicados\n')
out.append(f'**Acción:** Por cluster: identificar la URL "ganadora" (mejor copy + mejor backlink potencial), 301 las demás → ganadora. Total: {len(bucket_3):,} URLs en {len(clusters):,} clusters.\n')
out.append(f'\nTop 30 clusters por tamaño:\n')
sorted_clusters = sorted(clusters.items(), key=lambda x: -len(x[1]))[:30]
for stem_name, urls in sorted_clusters:
    out.append(f'\n**Cluster `{stem_name}` ({len(urls)} URLs):**\n')
    for u in urls[:8]:
        out.append(f'  - `{u}`')
    if len(urls) > 8:
        out.append(f'  - ... +{len(urls) - 8} más')

out.append(f'\n## 🔵 Protegidas — tienen internal link\n')
out.append(f'**Acción:** revisión humana. Si linkean a una "muerta", romper el link y matarla. Si la URL es relevante, optimizarla. Total: {len(bucket_safe):,}\n')
out.append(f'\n<details><summary>Ver primeras 50 (de {len(bucket_safe):,})</summary>\n')
for u in bucket_safe[:50]:
    out.append(f'- `{u}`')
out.append(f'\n</details>\n')

out.append(f'\n## 🛡️ Protegidas — locale joven/secundario o calc <6m\n')
out.append(f'**Acción:** NO matar. Locales jóvenes (/es, /mx, /co, /cl) o calcs publicadas hace <6m: "0 impresiones" no implica zombie, todavía no tuvieron tiempo de indexarse en un mercado con autoridad. Excluidas de bucket_1 por scripts/prune_guard.py. Falso positivo del 2026-05-27 (60 calcs-es). Total: {len(bucket_protected_young):,}\n')
out.append(f'\n<details><summary>Ver primeras 80 (de {len(bucket_protected_young):,})</summary>\n')
for u in bucket_protected_young[:80]:
    out.append(f'- `{u}`')
out.append(f'\n</details>\n')

# Guardar bucket 1 como lista plana para próximo paso de ejecución
Path('/tmp/bucket1-410.json').write_text(json.dumps(bucket_1, ensure_ascii=False))
Path('/tmp/bucket3-clusters.json').write_text(json.dumps(clusters, ensure_ascii=False))

out_path = ROOT / 'docs' / f'prune-buckets-{date.today()}.md'
out_path.write_text('\n'.join(out))

print(f'\n✅ Reporte: {out_path}')
print(f'   Bucket 1 (matar): {len(bucket_1):,}')
print(f'   Bucket 2 (estacional): {len(bucket_2):,}')
print(f'   Bucket 3 (consolidar): {len(bucket_3):,} en {len(clusters):,} clusters')
print(f'   Bucket protegidas (internal link): {len(bucket_safe):,}')
print(f'   Bucket protegidas (locale joven/calc <6m): {len(bucket_protected_young):,}')
