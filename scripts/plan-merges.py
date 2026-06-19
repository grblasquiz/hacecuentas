#!/usr/bin/env python3
"""Construye el mapa de unificación (dry-run) desde /tmp/similar_calcs.json.
Aplica SKIP de falsos positivos (clusters que NO se unifican), elige ganador
por (sessions, score), valida conflictos y chequea fórmulas compartidas.
Salida: /tmp/merge_map.json + resumen."""
import json
from pathlib import Path
from collections import defaultdict

ROOT = Path('/Users/marrod/hacecuentas/src/content')
FORMULAS = Path('/Users/marrod/hacecuentas/src/lib/formulas')
d = json.load(open('/tmp/similar_calcs.json'))

# Clusters que NO se unifican (falsos positivos). Si un cluster contiene un
# slug que matchea alguna de estas subcadenas, se deja intacto.
SKIP = [
    # direccionales (convertidor X->Y vs Y->X = sistema deliberado)
    'celsius-a-fahrenheit', 'conversor-acres-a-metros', 'conversor-kilometros-a-millas',
    'conversor-pies-cuadrados-a-metros-cuadrados', 'conversor-celsius-a-kelvin',
    'conversor-pulgadas-a-centimetros', 'conversor-libras-a-kilogramos', 'conversor-ms-a-kmh',
    'conversor-pies-a-metros', 'conversor-yardas-a-metros', 'pies-cubicos-a-metros-cubicos',
    'hourly-to-annual-salary', 'conception-date-from-due-date',
    # entidad/tema distinto
    'comida-gato-diaria', 'horas-sueno-necesarias-edad-adulto', 'factura-gas-estimada',
    'pension-viudez-imss-90', 'prestaciones-empleada-domestica-colombia',
    'peso-ideal-ragdoll', 'vacunas-perro-calendario', 'podcasts-aprender-idioma',
    'consumo-bicicleta-vs-auto-anual', 'costo-mensual-mascota-perro-gato',
    'llm-token-cost-calculator', 'auto-loan-payment-french', 'lean-body-mass-calculator',
    'pies-tabla',  # board-feet vs cubic-feet (#45 winner)
    # geografía / jurisdicción / hemisferio / ciudad
    'presupuesto-viaje-paris', 'retraso-vuelo-compensacion-eu', 'planting-calendar-northern',
    # distancias/regímenes distintos
    'plan-entrenamiento-5k-semanas', '5k-training-plan-weeks',
    'aposentadoria-inss-transicao-pedagio-50', 'decimo-terceiro-primeira-parcela',
    'simples-nacional-anexo-iii-servicos', 'anticipo-impuesto-renta-ecuador',
    'rimpe-emprendedor-ecuador',
    # Navidad (regla Martin: no tocar)
    'Navidad',
]

def skipped(cluster):
    for m in cluster['members']:
        for s in SKIP:
            if s in m['slug']:
                return s
    return None

# Recolectar todos los calcs vivos (para chequeo de fórmula compartida)
all_formula_use = defaultdict(set)  # formulaId -> set(slug)
for sub in ['calcs','calcs-en','calcs-pt','calcs-mx','calcs-co','calcs-cl','calcs-es','calcs-pe','calcs-ec']:
    for fp in (ROOT/sub).glob('*.json'):
        try:
            j = json.load(open(fp))
        except Exception:
            continue
        fid = j.get('formulaId')
        if fid:
            all_formula_use[fid].add(j.get('slug') or fp.stem)

merges = []          # {winner, loser, locale, dir, loser_file, loser_formula, ...}
skip_clusters = []
auto = d['B1_auto_one_traffic'] + d['B0_auto_zero_traffic']
for c in auto:
    why = skipped(c)
    if why:
        skip_clusters.append({**c, 'skip_reason': why})
        continue
    ms = sorted(c['members'], key=lambda m: (-m['sessions'], -m['score']))
    winner = ms[0]
    for loser in ms[1:]:
        merges.append({
            'locale': c['locale'], 'dir': loser['dir'],
            'winner': winner['slug'], 'winner_sess': winner['sessions'],
            'loser': loser['slug'], 'loser_sess': loser['sessions'],
            'loser_file': loser['file'], 'loser_formula': loser['formulaId'],
            'winner_h1': winner['h1'], 'loser_h1': loser['h1'],
        })

# Validación: ningún loser puede ser winner de otro merge, ni loser duplicado
winners = {m['winner'] for m in merges}
losers = defaultdict(list)
for m in merges:
    losers[m['loser']].append(m)
conflicts = []
clean = []
seen_losers = set()
for m in merges:
    if m['loser'] in winners:
        conflicts.append(('loser-is-winner', m['loser'], m['winner'])); continue
    if m['loser'] in seen_losers:
        conflicts.append(('dup-loser', m['loser'])); continue
    seen_losers.add(m['loser'])
    # fórmula compartida? sobreviven otros calcs que la usan (excluyendo losers a borrar)
    fid = m['loser_formula']
    users = all_formula_use.get(fid, set())
    survivors = users - seen_losers - {m['loser']}
    # survivors que NO sean losers de este batch
    all_losers = {x['loser'] for x in merges}
    survivors = users - all_losers
    m['formula_shared'] = bool(survivors)
    m['formula_deletable'] = fid and not survivors
    clean.append(m)

json.dump({'merges': clean, 'skipped': skip_clusters, 'conflicts': conflicts},
          open('/tmp/merge_map.json','w'), ensure_ascii=False, indent=1)

uniq_winners = len({m['winner'] for m in clean})
del_formulas = sum(1 for m in clean if m['formula_deletable'])
print(f"AUTO-MERGE: {len(clean)} calcs a unificar -> {uniq_winners} ganadores")
print(f"  fórmulas .ts borrables: {del_formulas} | compartidas (solo redirect+json): {len(clean)-del_formulas}")
print(f"clusters SKIP (falsos positivos, intactos): {len(skip_clusters)}")
print(f"conflictos: {len(conflicts)}  {conflicts if conflicts else ''}")
print(f"-> /tmp/merge_map.json")
from collections import Counter
print("merges por locale:", dict(Counter(m['locale'] for m in clean)))
