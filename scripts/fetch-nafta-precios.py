#!/usr/bin/env python3
"""
Pipeline de precios de combustibles (nafta/gasoil) → fuente única estática.

Fetchea el CSV oficial de "Precios vigentes en surtidor" (Secretaría de Energía,
datos.energia.gob.ar, Res. 314/2016) y lo agrega a promedios por producto ×
provincia + nacional + por bandera. Escribe src/lib/data/nafta-precios.ts.

No es tiempo-real (el dataset se declara por estación, se actualiza seguido pero
no al segundo) → snapshot estático que se refresca corriendo este script.

  python3 scripts/fetch-nafta-precios.py
"""
import csv, io, ssl, sys, urllib.request
from collections import defaultdict
from datetime import datetime
from pathlib import Path

ctx = ssl.create_default_context()
try:
    import certifi; ctx = ssl.create_default_context(cafile=certifi.where())
except Exception:
    pass

CSV_URL = ('http://datos.energia.gob.ar/dataset/1c181390-5045-475e-94dc-410429be4b17/'
           'resource/80ac25de-a44a-4445-9215-090cf55cfda5/download/precios-en-surtidor-resolucin-3142016.csv')

# Normalización de producto → 4 buckets
def bucket(prod: str):
    p = (prod or '').lower()
    if 'nafta' in p and ('premium' in p or 'más de 95' in p or 'mas de 95' in p): return 'Nafta Premium'
    if 'nafta' in p: return 'Nafta Súper'
    if 'gas oil' in p and ('grado 3' in p or 'premium' in p): return 'Gasoil Premium'
    if 'gas oil' in p: return 'Gasoil'
    return None

BANDERAS = {'YPF', 'SHELL', 'AXION', 'PUMA'}


def main():
    print('Descargando CSV oficial…', flush=True)
    req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'Mozilla/5.0 hacecuentas'})
    data = urllib.request.urlopen(req, timeout=90, context=ctx).read().decode('utf-8-sig', 'ignore')
    rdr = csv.DictReader(io.StringIO(data))
    rows = list(rdr)
    print(f'  {len(rows)} filas', flush=True)

    # Mes más reciente (indice_tiempo 'YYYY-MM')
    meses = sorted({(r.get('indice_tiempo') or '').strip() for r in rows if r.get('indice_tiempo')})
    last_mes = meses[-1] if meses else ''

    # Acumuladores: solo Diurno (dedupe) + mes más reciente
    nac = defaultdict(list)              # bucket -> [precios]
    prov = defaultdict(lambda: defaultdict(list))   # provincia -> bucket -> [precios]
    band = defaultdict(lambda: defaultdict(list))   # bandera -> bucket -> [precios]
    # "Precios vigentes" = precio actual de cada estación (fechado al declararse).
    # Promediamos TODAS las filas vigentes (no filtramos por mes: filtrar deja un
    # subset sesgado de las estaciones que redeclararon último). Solo Diurno (dedupe).
    for r in rows:
        if (r.get('tipohorario') or '').strip().lower() != 'diurno': continue
        b = bucket(r.get('producto'))
        if not b: continue
        try: precio = float(r.get('precio') or 0)
        except ValueError: continue
        if precio <= 0: continue
        pv = (r.get('provincia') or '').strip().title()
        bn = (r.get('empresabandera') or '').strip().upper()
        nac[b].append(precio)
        if pv: prov[pv][b].append(precio)
        if bn in BANDERAS: band[bn][b].append(precio)

    def avg(xs): return round(sum(xs) / len(xs)) if xs else None
    BUCKETS = ['Nafta Súper', 'Nafta Premium', 'Gasoil', 'Gasoil Premium']
    nacional = {b: avg(nac[b]) for b in BUCKETS}
    por_prov = {pv: {b: avg(d[b]) for b in BUCKETS} for pv, d in sorted(prov.items()) if any(d[b] for b in BUCKETS)}
    por_band = {bn: {b: avg(d[b]) for b in BUCKETS} for bn, d in sorted(band.items())}

    ts = []
    ts.append('// Precios de combustibles (nafta/gasoil) — FUENTE ÚNICA (snapshot oficial).')
    ts.append('// Secretaría de Energía, datos.energia.gob.ar (Res. 314/2016). Promedios Diurno del mes vigente.')
    ts.append('// Refrescar: python3 scripts/fetch-nafta-precios.py')
    ts.append(f'// Snapshot: mes {last_mes} · {len(rows)} declaraciones procesadas.')
    ts.append('export interface NaftaPrecios { "Nafta Súper": number|null; "Nafta Premium": number|null; "Gasoil": number|null; "Gasoil Premium": number|null }')
    ts.append(f'export const NAFTA_NACIONAL = {to_js(nacional)} as NaftaPrecios;')
    ts.append(f'export const NAFTA_POR_PROVINCIA: Record<string, NaftaPrecios> = {to_js(por_prov)};')
    ts.append(f'export const NAFTA_POR_BANDERA: Record<string, NaftaPrecios> = {to_js(por_band)};')
    ts.append("export const NAFTA_META = {")
    ts.append(f"  mes: '{last_mes}',")
    ts.append(f"  fuente: 'Secretaría de Energía (datos.energia.gob.ar) — Res. 314/2016',")
    ts.append(f"  fuenteUrl: 'http://datos.energia.gob.ar/dataset/precios-en-surtidor',")
    ts.append(f"  actualizado: '{datetime.now().strftime('%Y-%m-%d')}',")
    ts.append(f"  estaciones: {len({(r.get('idempresa')) for r in rows})},")
    ts.append("};")

    Path('src/lib/data/nafta-precios.ts').write_text('\n'.join(ts) + '\n')
    print(f'✅ src/lib/data/nafta-precios.ts (mes {last_mes})')
    print(f'   Nacional: Súper ${nacional["Nafta Súper"]} · Premium ${nacional["Nafta Premium"]} · Gasoil ${nacional["Gasoil"]} · {len(por_prov)} provincias')


def to_js(obj):
    import json
    return json.dumps(obj, ensure_ascii=False)


if __name__ == '__main__':
    main()
