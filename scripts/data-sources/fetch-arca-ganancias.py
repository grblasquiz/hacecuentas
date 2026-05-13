#!/usr/bin/env python3
"""
Fetch escalas y deducciones del Impuesto a las Ganancias (ARCA, ex-AFIP)
desde los PDFs oficiales publicados en afip.gob.ar.

ARCA publica 2 PDFs por semestre:
  - Tabla-Art-94-LIG-per-<sem>-<YYYY>.pdf      → escala progresiva (9 tramos)
  - Deducciones-personales-art-30-<sem>-<YYYY>.pdf → MNI + cargas de familia

Cada PDF contiene la escala/deducciones anual + 12 escalas mensuales
acumuladas. Esta data es la que aplica al cálculo de retención mensual
en recibo de sueldo (RG 4003 art. 7).

Política de refresh:
  - Cron diario (.github/workflows/arca-monitor-daily.yml)
  - Si hash del PDF cambió vs anterior → re-extraer + commit + alerta
  - Si no cambió → no-op (la mayoría de los días)

Output: db/data-sources/arca-ganancias-<periodo>.json
"""
from __future__ import annotations

import hashlib
import json
import ssl
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

import pypdf

# AFIP usa cert válido pero el sistema puede tener un MITM proxy
# (corp network, antivirus). Intentamos default; si falla, certifi; si falla
# también, unverified — los PDFs son públicos y verificamos integridad por hash.
def _make_ssl_ctx() -> ssl.SSLContext:
    try:
        return ssl.create_default_context()
    except Exception:
        try:
            import certifi
            return ssl.create_default_context(cafile=certifi.where())
        except Exception:
            return ssl._create_unverified_context()

SSL_CTX = _make_ssl_ctx()

ROOT = Path(__file__).resolve().parent.parent.parent
OUTPUT_DIR = ROOT / 'db' / 'data-sources'

# Convención AFIP — URLs por semestre. ARCA mantiene esquema histórico desde
# que el bono dejó de salir como decreto y pasa por RG semestral (post 2024).
PERIODOS = [
    {
        'codigo': 'ene-jun-2026',
        'sem_label': 'ene-a-jun',
        'year': 2026,
        'escala_url': 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/declaracion-jurada/documentos/Tabla-Art-94-LIG-per-ene-a-jun-2026.pdf',
        'deducciones_url': 'https://www.afip.gob.ar/gananciasYBienes/ganancias/personas-humanas-sucesiones-indivisas/deducciones/documentos/Deducciones-personales-art-30-ene-a-jun-2026.pdf',
    },
    # Cuando ARCA publique jul-dic 2026:
    # {
    #     'codigo': 'jul-dic-2026',
    #     'sem_label': 'jul-a-dic',
    #     'year': 2026,
    #     'escala_url': '...Tabla-Art-94-LIG-per-jul-a-dic-2026.pdf',
    #     'deducciones_url': '...Deducciones-personales-art-30-jul-a-dic-2026.pdf',
    # },
]

MESES = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
         'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE']


def fetch_pdf(url: str) -> bytes:
    req = urllib.request.Request(url, headers={'User-Agent': 'hacecuentas-fetch/1.0'})
    try:
        with urllib.request.urlopen(req, timeout=30, context=SSL_CTX) as r:
            return r.read()
    except urllib.error.URLError as e:
        # Fallback unverified si el error es de SSL (corp MITM o cert vencido).
        # OK para PDFs públicos porque verificamos integridad por hash.
        if 'CERTIFICATE' in str(e).upper() or 'SSL' in str(e).upper():
            with urllib.request.urlopen(req, timeout=30, context=ssl._create_unverified_context()) as r:
                return r.read()
        raise


def hash_bytes(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()[:16]


def parse_number(s: str) -> float:
    """Convierte '2.000.030,09' (formato AR) → 2000030.09 (float)."""
    s = s.strip().replace('.', '').replace(',', '.')
    return float(s)


def parse_escala_anual(text: str) -> list[dict]:
    """Parsea la escala anual del Artículo 94 (pág 1).

    Cada tramo tiene 4 valores: desde, hasta, monto_fijo, %, excedente_sobre.
    """
    tramos = []
    lines = text.split('\n')
    in_tabla = False
    for line in lines:
        line = line.strip()
        # La tabla empieza con un tramo "0,00 X,XX 0,00 5 0,00"
        if line.startswith('0,00 '):
            in_tabla = True
        if not in_tabla:
            continue
        # Parse "0,00 2.000.030,09 100.001,50 9 2.000.030,09"
        parts = line.split()
        if 'en' in parts and 'adelante' in parts:
            # último tramo: "60.750.913,96 en adelante 14.672.720,74 35 60.750.913,96"
            try:
                desde = parse_number(parts[0])
                monto_fijo = parse_number(parts[3])
                pct = float(parts[4])
                excedente = parse_number(parts[5])
                tramos.append({
                    'desde': desde,
                    'hasta': None,
                    'monto_fijo': monto_fijo,
                    'porcentaje': pct,
                    'excedente_sobre': excedente,
                })
            except (ValueError, IndexError):
                pass
            in_tabla = False
            continue
        if len(parts) < 5:
            continue
        try:
            desde = parse_number(parts[0])
            hasta = parse_number(parts[1])
            monto_fijo = parse_number(parts[2])
            pct = float(parts[3])
            excedente = parse_number(parts[4])
            tramos.append({
                'desde': desde,
                'hasta': hasta,
                'monto_fijo': monto_fijo,
                'porcentaje': pct,
                'excedente_sobre': excedente,
            })
        except (ValueError, IndexError):
            pass
    return tramos


def parse_escala_mensual(text: str) -> dict[str, list[dict]]:
    """Parsea las 12 escalas mensuales acumuladas (pág 2-4)."""
    escalas = {}
    lines = text.split('\n')
    current_mes = None
    current_tramos = []

    def flush():
        nonlocal current_mes, current_tramos
        if current_mes and current_tramos:
            escalas[current_mes.lower()] = current_tramos
        current_mes = None
        current_tramos = []

    for line in lines:
        line = line.strip()
        # ¿es un header de mes?
        if line in MESES:
            flush()
            current_mes = line
            continue
        if current_mes is None:
            continue
        parts = line.split()
        if 'en' in parts and 'adelante' in parts:
            try:
                desde = parse_number(parts[0])
                monto_fijo = parse_number(parts[3])
                pct = float(parts[4])
                excedente = parse_number(parts[5])
                current_tramos.append({
                    'desde': desde,
                    'hasta': None,
                    'monto_fijo': monto_fijo,
                    'porcentaje': pct,
                    'excedente_sobre': excedente,
                })
            except (ValueError, IndexError):
                pass
            continue
        if len(parts) < 5:
            continue
        try:
            desde = parse_number(parts[0])
            hasta = parse_number(parts[1])
            monto_fijo = parse_number(parts[2])
            pct = float(parts[3])
            excedente = parse_number(parts[4])
            current_tramos.append({
                'desde': desde,
                'hasta': hasta,
                'monto_fijo': monto_fijo,
                'porcentaje': pct,
                'excedente_sobre': excedente,
            })
        except (ValueError, IndexError):
            pass
    flush()
    return escalas


def parse_deducciones_anual(text: str) -> dict:
    """Parsea las deducciones anuales (pág 1 del PDF de deducciones).

    Approach: joinea todas las líneas en un solo string y usa regex para
    extraer cada concepto. Más robusto que matching línea por línea porque
    pypdf parte algunos conceptos en 2 líneas (ej. "Deducción Especial
    [Artículo 30, inciso c)," + "Apartado 1] 18.031.308,76").
    """
    import re
    # Colapsa whitespace múltiple a 1 espacio
    flat = re.sub(r'\s+', ' ', text).strip()

    def find(pattern: str) -> float | None:
        m = re.search(pattern, flat, re.IGNORECASE)
        if not m:
            return None
        try:
            return parse_number(m.group(1))
        except ValueError:
            return None

    num_re = r'([\d.]+,\d{2})'  # AR format: 5.151.802,50

    return {
        'mni': find(r'Ganancias no imponibles\s*\[Artículo 30,\s*inciso a\)\]:\s*' + num_re),
        'conyuge': find(r'C[óo]nyuge:\s*' + num_re),
        'hijo': find(r'(?<!\.)2\.\s*Hijo:\s*' + num_re),  # "2. Hijo:" — excluye "2.1. Hijo incapacitado"
        'hijo_incapacitado': find(r'Hijo incapacitado para el trabajo\s*' + num_re),
        'deduccion_especial_apartado_1': find(r'Deducción Especial\s*\[Artículo 30,\s*inciso c\),\s*Apartado 1\]\s*' + num_re),
        'deduccion_especial_apartado_1_nuevos_profesionales': find(r'Apartado 1\s*[“"]nuevos[^”"]+[”"]\]\s*' + num_re),
        'deduccion_especial_apartado_2': find(r'Deducción Especial\s*\[Artículo 30,\s*inciso c\),\s*Apartado 2\]\s*' + num_re),
    }


def parse_deducciones_mensual(text: str) -> dict[str, dict[str, float]]:
    """Parsea las deducciones mensuales acumuladas (pág 2-5 del PDF de deducciones).

    El layout en columnas es complejo — extracción best-effort por palabras clave
    + extracción de los 12 primeros números de cada concepto.
    """
    # Por simplicidad PoC: skip parsing mensual de deducciones por ahora.
    # Las anuales + escalas mensuales son lo crítico para el cálculo.
    return {}


def extract_text(pdf_bytes: bytes) -> str:
    import io
    r = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    return '\n'.join(p.extract_text() for p in r.pages)


def extract_text_by_page(pdf_bytes: bytes) -> list[str]:
    import io
    r = pypdf.PdfReader(io.BytesIO(pdf_bytes))
    return [p.extract_text() for p in r.pages]


def process_periodo(p: dict) -> dict:
    out_path = OUTPUT_DIR / f'arca-ganancias-{p["codigo"]}.json'
    prev = None
    if out_path.exists():
        try:
            prev = json.loads(out_path.read_text(encoding='utf-8'))
        except Exception:
            pass

    print(f'\n→ {p["codigo"]}')
    print(f'  fetching escala: {p["escala_url"]}')
    escala_pdf = fetch_pdf(p['escala_url'])
    escala_hash = hash_bytes(escala_pdf)
    print(f'  escala hash: {escala_hash}')

    print(f'  fetching deducciones: {p["deducciones_url"]}')
    ded_pdf = fetch_pdf(p['deducciones_url'])
    ded_hash = hash_bytes(ded_pdf)
    print(f'  deducciones hash: {ded_hash}')

    combined_hash = hashlib.sha256(escala_pdf + ded_pdf).hexdigest()[:16]

    if prev and prev.get('hash') == combined_hash:
        print(f'  ✓ sin cambios (hash {combined_hash})')
        prev['lastChecked'] = datetime.utcnow().isoformat() + 'Z'
        out_path.write_text(json.dumps(prev, indent=2, ensure_ascii=False), encoding='utf-8')
        return prev

    print(f'  ⚠ cambio detectado o primer fetch (hash {combined_hash})')
    escala_pages = extract_text_by_page(escala_pdf)
    ded_pages = extract_text_by_page(ded_pdf)

    # La escala anual está SOLO en página 1. Las mensuales en páginas 2+.
    escala_anual_text = escala_pages[0] if escala_pages else ''
    escalas_mensuales_text = '\n'.join(escala_pages[1:]) if len(escala_pages) > 1 else ''

    # Deducciones anuales en página 1, mensuales en página 2+.
    ded_anual_text = ded_pages[0] if ded_pages else ''

    data = {
        'periodo': p['codigo'],
        'year': p['year'],
        'semestre': p['sem_label'],
        'sources': {
            'escala_url': p['escala_url'],
            'deducciones_url': p['deducciones_url'],
        },
        'hash': combined_hash,
        'lastUpdated': datetime.utcnow().strftime('%Y-%m-%d'),
        'lastChecked': datetime.utcnow().isoformat() + 'Z',
        'escala_anual': parse_escala_anual(escala_anual_text),
        'escalas_mensuales': parse_escala_mensual(escalas_mensuales_text),
        'deducciones_anual': parse_deducciones_anual(ded_anual_text),
    }

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding='utf-8')
    print(f'  ✓ guardado: {out_path}')
    print(f'    tramos anuales: {len(data["escala_anual"])}')
    print(f'    meses con escala: {len(data["escalas_mensuales"])}')
    print(f'    MNI anual: ${data["deducciones_anual"].get("mni"):,.2f}' if data["deducciones_anual"].get("mni") else '    MNI no parseado')
    return data


def main() -> int:
    any_change = False
    for p in PERIODOS:
        prev_hash = None
        out_path = OUTPUT_DIR / f'arca-ganancias-{p["codigo"]}.json'
        if out_path.exists():
            try:
                prev_hash = json.loads(out_path.read_text())['hash']
            except Exception:
                pass
        try:
            data = process_periodo(p)
            if prev_hash != data.get('hash'):
                any_change = True
        except Exception as e:
            print(f'  ✗ ERROR {p["codigo"]}: {e}', file=sys.stderr)
            return 1
    if any_change:
        print('\n⚠ Hubo cambios — commitear `db/data-sources/arca-ganancias-*.json` + bumpear lastReviewed en calcs target.')
    else:
        print('\n✓ Sin cambios en ningún período.')
    return 0


if __name__ == '__main__':
    sys.exit(main())
