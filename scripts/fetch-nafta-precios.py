#!/usr/bin/env python3
"""
Pipeline de precios de combustibles (nafta/gasoil) → fuente única estática.

Fetchea el CSV oficial de "Precios vigentes en surtidor" (Secretaría de Energía,
datos.energia.gob.ar, Res. 314/2016) y lo agrega a promedios por producto ×
provincia + nacional + por bandera. Escribe src/lib/data/nafta-precios.ts.

No es tiempo-real (el dataset se declara por estación, se actualiza seguido pero
no al segundo) → snapshot estático que se refresca corriendo este script.

  python3 scripts/fetch-nafta-precios.py
  python3 scripts/fetch-nafta-precios.py --csv /ruta/al/archivo-oficial.csv
"""
import argparse
import csv
import io
import json
import math
import re
import time
import urllib.request
from collections import defaultdict
from datetime import date, timedelta
from http.client import HTTPException
from pathlib import Path

CSV_URL = ('http://datos.energia.gob.ar/dataset/1c181390-5045-475e-94dc-410429be4b17/'
           'resource/80ac25de-a44a-4445-9215-090cf55cfda5/download/precios-en-surtidor-resolucin-3142016.csv')
OUTPUT = Path('src/lib/data/nafta-precios.ts')
BUCKETS = ['Nafta Súper', 'Nafta Premium', 'Gasoil', 'Gasoil Premium']
REQUIRED_FIELDS = {'idempresa', 'tipohorario', 'producto', 'precio', 'provincia',
                   'empresabandera', 'fecha_vigencia'}

# Normalización de producto → 4 buckets
def bucket(prod: str):
    p = (prod or '').lower()
    if 'nafta' in p and ('premium' in p or 'más de 95' in p or 'mas de 95' in p): return 'Nafta Premium'
    if 'nafta' in p: return 'Nafta Súper'
    if 'gas oil' in p and ('grado 3' in p or 'premium' in p): return 'Gasoil Premium'
    if 'gas oil' in p: return 'Gasoil'
    return None

BANDERAS = {'YPF', 'SHELL', 'AXION', 'PUMA'}


def download_csv():
    req = urllib.request.Request(CSV_URL, headers={'User-Agent': 'Mozilla/5.0 hacecuentas'})
    for attempt in range(1, 4):
        print(f'Descargando CSV oficial (intento {attempt}/3)…', flush=True)
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.read()
        except (OSError, HTTPException) as error:
            if attempt == 3:
                raise
            print(f'  Descarga fallida: {error}', flush=True)
            time.sleep(2 * attempt)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', type=Path, help='CSV completo ya descargado de la fuente oficial')
    args = parser.parse_args()
    data = args.csv.read_bytes() if args.csv else download_csv()
    rows = csv.DictReader(io.StringIO(data.decode('utf-8-sig')), strict=True)
    if not REQUIRED_FIELDS.issubset(rows.fieldnames or []):
        raise SystemExit('El CSV oficial no contiene todas las columnas esperadas.')

    nac = defaultdict(list)              # bucket -> [precios]
    prov = defaultdict(lambda: defaultdict(list))   # provincia -> bucket -> [precios]
    band = defaultdict(lambda: defaultdict(list))   # bandera -> bucket -> [precios]
    station_dates = {}
    today = date.today()
    # Conservamos las declaraciones diurnas del padrón, incluso las antiguas.
    # La página indica qué parte de las estaciones tiene declaraciones recientes.
    for row in rows:
        if (row['tipohorario'] or '').strip().lower() != 'diurno':
            continue
        b = bucket(row['producto'])
        station = (row['idempresa'] or '').strip()
        if not b or not station:
            continue
        try:
            precio = float(row['precio'] or 0)
            declared = date.fromisoformat((row['fecha_vigencia'] or '').strip()[:10])
        except ValueError:
            continue
        if not math.isfinite(precio) or precio <= 0 or declared > today:
            continue
        pv = (row['provincia'] or '').strip().title()
        bn = (row['empresabandera'] or '').strip().upper()
        nac[b].append(precio)
        station_dates[station] = max(declared, station_dates.get(station, declared))
        if pv: prov[pv][b].append(precio)
        if bn in BANDERAS: band[bn][b].append(precio)

    if len(prov) != 24 or not all(nac[b] for b in BUCKETS):
        raise SystemExit('El CSV no cubre las 24 jurisdicciones y los cuatro combustibles. Se conserva el relevamiento anterior.')

    latest = max(station_dates.values())
    if OUTPUT.exists():
        previous = OUTPUT.read_text(encoding='utf-8')
        previous_date = re.search(r"actualizado: '([0-9-]+)'", previous)
        previous_stations = re.search(r'estaciones: (\d+)', previous)
        if previous_date and latest < date.fromisoformat(previous_date[1]):
            raise SystemExit('El CSV trae una fecha anterior al relevamiento publicado.')
        if previous_stations and len(station_dates) * 5 < int(previous_stations[1]) * 4:
            raise SystemExit('El CSV perdió más del 20% de las estaciones frente al relevamiento publicado.')

    last_mes = latest.strftime('%Y-%m')
    recent_since = latest - timedelta(days=29)
    recent_stations = sum(declared >= recent_since for declared in station_dates.values())
    def avg(xs): return round(sum(xs) / len(xs)) if xs else None
    nacional = {b: avg(nac[b]) for b in BUCKETS}
    por_prov = {pv: {b: avg(d[b]) for b in BUCKETS} for pv, d in sorted(prov.items()) if any(d[b] for b in BUCKETS)}
    por_band = {bn: {b: avg(d[b]) for b in BUCKETS} for bn, d in sorted(band.items())}

    ts = []
    ts.append('// Precios de combustibles (nafta/gasoil) — FUENTE ÚNICA (snapshot oficial).')
    ts.append('// Secretaría de Energía, datos.energia.gob.ar. Promedios de las declaraciones diurnas disponibles.')
    ts.append('// Refrescar: python3 scripts/fetch-nafta-precios.py')
    ts.append(f'// Declaración más reciente: {latest} · {sum(map(len, nac.values()))} precios incluidos.')
    ts.append('export interface NaftaPrecios { "Nafta Súper": number|null; "Nafta Premium": number|null; "Gasoil": number|null; "Gasoil Premium": number|null }')
    ts.append(f'export const NAFTA_NACIONAL = {to_js(nacional)} as NaftaPrecios;')
    ts.append(f'export const NAFTA_POR_PROVINCIA: Record<string, NaftaPrecios> = {to_js(por_prov)};')
    ts.append(f'export const NAFTA_POR_BANDERA: Record<string, NaftaPrecios> = {to_js(por_band)};')
    ts.append("export const NAFTA_META = {")
    ts.append(f"  mes: '{last_mes}',")
    ts.append(f"  fuente: 'Secretaría de Energía (datos.energia.gob.ar) — Res. 314/2016',")
    ts.append(f"  fuenteUrl: 'http://datos.energia.gob.ar/dataset/precios-en-surtidor',")
    ts.append(f"  actualizado: '{latest}',")
    ts.append(f"  estaciones: {len(station_dates)},")
    ts.append(f"  estacionesUltimos30Dias: {recent_stations},")
    ts.append("};")

    OUTPUT.write_text('\n'.join(ts) + '\n', encoding='utf-8')
    print(f'✅ src/lib/data/nafta-precios.ts (mes {last_mes})')
    print(f'   Nacional: Súper ${nacional["Nafta Súper"]} · Premium ${nacional["Nafta Premium"]} · Gasoil ${nacional["Gasoil"]} · {len(por_prov)} provincias')


def to_js(obj):
    return json.dumps(obj, ensure_ascii=False)


if __name__ == '__main__':
    main()
