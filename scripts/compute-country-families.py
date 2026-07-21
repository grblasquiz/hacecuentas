#!/usr/bin/env python3
"""Genera src/lib/country-families.json: para cada calc que pertenece a una
"familia país" (misma calculadora publicada para ≥2 países de habla hispana),
la lista de sus hermanas en otros países.

Lo consume CountryVariants.astro para renderizar el bloque "Esta calculadora en
otros países" — enlaces internos cross-locale que related-auto (por-locale) no
puede generar. Bidireccional por construcción.

Familia = calcs cuyo "signature" (slug sin país/año/stopwords) es casi idéntico
(Jaccard ≥ 0.6, ≥2 tokens compartidos) y que abarcan ≥2 locales `es*` distintos.

Uso: python3 scripts/compute-country-families.py   (o `npm run families`)
"""
import json, os, re
from collections import defaultdict

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
OUT  = os.path.join(ROOT, 'src/lib/country-families.json')

# locale -> (país, bandera). Solo español: mismo idioma, distinto país → bloque coherente.
COUNTRY = {
    'es':   ('Argentina', '🇦🇷'), 'es-AR': ('Argentina', '🇦🇷'),
    'es-MX': ('México', '🇲🇽'), 'es-CO': ('Colombia', '🇨🇴'), 'es-CL': ('Chile', '🇨🇱'),
    'es-PE': ('Perú', '🇵🇪'), 'es-EC': ('Ecuador', '🇪🇨'), 'es-VE': ('Venezuela', '🇻🇪'),
    'es-PY': ('Paraguay', '🇵🇾'), 'es-UY': ('Uruguay', '🇺🇾'), 'es-DO': ('R. Dominicana', '🇩🇴'),
    'es-ES': ('España', '🇪🇸'), 'es-BO': ('Bolivia', '🇧🇴'), 'es-GT': ('Guatemala', '🇬🇹'),
    'es-CR': ('Costa Rica', '🇨🇷'), 'es-PA': ('Panamá', '🇵🇦'),
}
COUNTRY_WORDS = set('argentina colombia mexico méxico chile peru perú uruguay paraguay venezuela '
                    'ecuador dominicana republica república bolivia espana españa brasil brazil '
                    'guatemala panama panamá'.split())
STOP = set('calculadora calcula calcular conversor simulador de del la el los las en por para y a con '
           'un una tu mi su cuanto cuantos cuanta como 2026 2025 2024 online gratis calculo cuenta hace '
           'paso vs pais país nueva nuevo'.split()) | COUNTRY_WORDS
LOCS_IN_SLUG = set('co mx cl pe uy py ve ec do es pt en pt-pt pt-br bo gt cr pa'.split())

def norm(u):
    p = u.split('hacecuentas.com', 1)[-1].split('?')[0]
    return (p.rstrip('/') or '/')

def sig(path):
    parts = [p for p in path.strip('/').split('/') if p not in LOCS_IN_SLUG]
    s = re.sub(r'[^a-záéíóúñü0-9]+', ' ', ' '.join(parts))
    return frozenset(t for t in s.split() if t not in STOP and len(t) > 2)

def topic_label(title):
    """De un h1/title saca un tema corto y limpio para el anchor.
    'Calculadora y contador de antigüedad laboral' -> 'Antigüedad laboral'.
    Se calcula UNA vez por familia (del miembro base) → labels uniformes."""
    t = title or ''
    # sacar prefijo 'Calculadora [y contador/conversor] de la/del/para …'
    t = re.sub(r'^\s*(calculadora|conversor|simulador)(\s+y\s+(contador|conversor|simulador))?'
               r'(\s+(de\s+la\s+|de\s+las\s+|de\s+los\s+|del\s+|de\s+|para\s+))?', '', t, flags=re.I)
    # cortar en país / paréntesis / subclausula / dos puntos / guion largo
    t = re.split(r'[—:(]', t, maxsplit=1)[0]
    # quitar años y palabras-país en cualquier posición
    t = re.sub(r'\b20\d\d\b', ' ', t)
    t = re.sub(r'\b(' + '|'.join(COUNTRY_WORDS) + r')\b', ' ', t, flags=re.I)
    t = re.sub(r'\s+', ' ', t).strip(' -–—.,·|')
    if len(t) < 3:
        return None
    # truncar prolijo a ~46 chars en borde de palabra
    if len(t) > 46:
        t = t[:46].rsplit(' ', 1)[0].rstrip(' -–—.,') + '…'
    return t[0].upper() + t[1:]

calcs = json.load(open(os.path.join(ROOT, 'public/api/calcs-index.json')))['calculators']
items = []
for c in calcs:
    loc = c.get('locale') or 'es'
    if not loc.startswith('es'):          # solo español (evita cruce de idioma EN/PT)
        continue
    if loc not in COUNTRY:                # locale español desconocido → lo dejamos afuera
        continue
    items.append({'path': norm(c['url']), 'sig': sig(norm(c['url'])), 'loc': loc,
                  'title': c.get('h1') or c.get('title') or ''})

# candidatos por índice invertido (evita O(n²) y tokens ultra-genéricos)
tok2idx = defaultdict(list)
for i, it in enumerate(items):
    for t in it['sig']:
        tok2idx[t].append(i)
GENERIC = {t for t, l in tok2idx.items() if len(l) > 250}

par = list(range(len(items)))
def find(x):
    while par[x] != x:
        par[x] = par[par[x]]; x = par[x]
    return x
def uni(a, b):
    ra, rb = find(a), find(b)
    if ra != rb: par[ra] = rb

seen = set()
for t, idxs in tok2idx.items():
    if t in GENERIC or len(idxs) < 2:
        continue
    for a in range(len(idxs)):
        for b in range(a + 1, len(idxs)):
            ia, ib = idxs[a], idxs[b]
            key = (ia, ib) if ia < ib else (ib, ia)
            if key in seen:
                continue
            seen.add(key)
            sa, sb = items[ia]['sig'], items[ib]['sig']
            sh = sa & sb
            if len(sh) >= 2 and len(sh) / len(sa | sb) >= 0.6:
                uni(ia, ib)

groups = defaultdict(list)
for i in range(len(items)):
    groups[find(i)].append(i)

out = {}          # path -> [ {url, country, flag, label} ... ]  (hermanas, sin la actual)
fam_count = 0
for members in groups.values():
    # dedupe por país (prioriza vertical /xx/ sobre root 'es' si colisiona país)
    by_country = {}
    for m in members:
        loc = items[m]['loc']
        country = COUNTRY[loc][0]
        prev = by_country.get(country)
        if prev is None or (items[prev]['loc'] == 'es' and loc != 'es'):
            by_country[country] = m
    picked = list(by_country.values())
    if len(picked) < 2:
        continue
    fam_count += 1
    # tema canónico ÚNICO por familia: del miembro base (AR root si existe, si no el
    # de título más corto) → labels uniformes "Tema en País" sin redundar el país.
    base = next((m for m in picked if items[m]['loc'] == 'es'),
                min(picked, key=lambda m: len(items[m]['title'])))
    topic = topic_label(items[base]['title'])
    for m in picked:
        sibs = []
        for n in picked:
            if n == m:
                continue
            loc = items[n]['loc']; country, flag = COUNTRY[loc]
            label = f'{topic} en {country}' if topic else f'Versión de {country}'
            sibs.append({'url': items[n]['path'], 'country': country, 'flag': flag, 'label': label})
        sibs.sort(key=lambda s: s['country'])
        out[items[m]['path']] = {'topic': topic or '', 'siblings': sibs}

json.dump(out, open(OUT, 'w'), ensure_ascii=False, indent=0)
print(f'familias país: {fam_count}  ·  calcs con bloque: {len(out)}  →  {os.path.relpath(OUT, ROOT)}')
