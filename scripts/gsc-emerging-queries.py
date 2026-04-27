#!/usr/bin/env python3
"""
Detecta queries emergentes en Google Search Console — keywords con
impressions creciendo pero posición > 20 (out-of-page-1).
Resultado: lista de oportunidades de contenido (calc nuevo o expandir uno
existente) ordenadas por potencial.

Setup:
  Misma Service Account que google-indexing-api.py (~/.config/gcp/hacecuentas-indexing.json).
  Necesita scope https://www.googleapis.com/auth/webmasters.readonly
  La SA debe estar agregada a GSC con rol Owner / Full / Restricted.

Uso:
  python3 scripts/gsc-emerging-queries.py                # last 28d vs 28d previos
  python3 scripts/gsc-emerging-queries.py --days 14      # last 14d vs 14d previos
  python3 scripts/gsc-emerging-queries.py --top 50       # cap a 50 queries
  python3 scripts/gsc-emerging-queries.py --json out.json

Output: tabla con query, impressions delta, position, sugerencia (calc existente
match parcial o "crear nuevo").
"""
import argparse
import json
import os
import sys
from datetime import datetime, timedelta
from pathlib import Path

try:
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write('pip install google-auth google-api-python-client\n')
    sys.exit(1)

CREDS_PATH = os.path.expanduser(
    os.environ.get('GOOGLE_INDEXING_CREDS', '~/.config/gcp/hacecuentas-indexing.json')
)
SITE_URL = 'sc-domain:hacecuentas.com'
SCOPES = ['https://www.googleapis.com/auth/webmasters.readonly']
ROOT = Path(__file__).resolve().parent.parent
CALCS_DIR = ROOT / 'src' / 'content' / 'calcs'


def get_service():
    creds = service_account.Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return build('searchconsole', 'v1', credentials=creds, cache_discovery=False)


def query_period(svc, start: str, end: str) -> dict:
    """Devuelve dict {query: {clicks, impressions, position}}."""
    out = {}
    start_row = 0
    while True:
        body = {
            'startDate': start, 'endDate': end,
            'dimensions': ['query'],
            'rowLimit': 25000,
            'startRow': start_row,
        }
        resp = svc.searchanalytics().query(siteUrl=SITE_URL, body=body).execute()
        rows = resp.get('rows', [])
        if not rows: break
        for r in rows:
            q = r['keys'][0]
            out[q] = {
                'clicks': r.get('clicks', 0),
                'impressions': r.get('impressions', 0),
                'position': r.get('position', 0),
            }
        if len(rows) < 25000: break
        start_row += 25000
    return out


def load_existing_keywords() -> set:
    """Junta seoKeywords + h1 + slug de todas las calcs para detectar matches."""
    kws = set()
    for f in CALCS_DIR.glob('*.json'):
        try: d = json.loads(f.read_text())
        except: continue
        for k in (d.get('seoKeywords') or []):
            kws.add(k.lower())
        if d.get('h1'): kws.add(d['h1'].lower())
        if d.get('slug'): kws.add(d['slug'].replace('-', ' ').lower())
    return kws


def best_existing_match(query: str, keywords: set) -> str | None:
    qtokens = set(query.lower().split())
    if len(qtokens) < 2: return None
    best = None; best_score = 0
    for k in keywords:
        ktokens = set(k.split())
        overlap = len(qtokens & ktokens)
        if overlap >= 2 and overlap > best_score:
            best = k; best_score = overlap
    return best


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--days', type=int, default=28)
    ap.add_argument('--top', type=int, default=30)
    ap.add_argument('--json', default=None)
    ap.add_argument('--min-impressions', type=int, default=20)
    args = ap.parse_args()

    today = datetime.utcnow().date()
    # GSC tiene latencia de ~3 días para datos
    end_recent = today - timedelta(days=3)
    start_recent = end_recent - timedelta(days=args.days - 1)
    end_prev = start_recent - timedelta(days=1)
    start_prev = end_prev - timedelta(days=args.days - 1)

    print(f'Periodo reciente : {start_recent} → {end_recent}')
    print(f'Periodo anterior : {start_prev} → {end_prev}\n')

    svc = get_service()
    recent = query_period(svc, start_recent.isoformat(), end_recent.isoformat())
    prev = query_period(svc, start_prev.isoformat(), end_prev.isoformat())

    keywords = load_existing_keywords()

    candidates = []
    for q, r in recent.items():
        if r['impressions'] < args.min_impressions: continue
        if r['position'] < 11 or r['position'] > 50: continue  # foco fuera de pos 1-10 pero alcanzable
        prev_imp = prev.get(q, {}).get('impressions', 0)
        delta = r['impressions'] - prev_imp
        if delta <= 0: continue  # solo crecimiento
        ratio = (r['impressions'] / max(prev_imp, 1))
        match = best_existing_match(q, keywords)
        candidates.append({
            'query': q,
            'impressions': r['impressions'],
            'delta': delta,
            'ratio': round(ratio, 2),
            'position': round(r['position'], 1),
            'clicks': r['clicks'],
            'existing_match': match,
            'suggestion': 'expandir SEO de calc existente' if match else 'crear calc nuevo',
        })

    candidates.sort(key=lambda x: x['delta'], reverse=True)
    candidates = candidates[:args.top]

    print(f'{"Query":<55} {"Impr":>5} {"Δ":>5} {"Pos":>5} {"Sugerencia"}')
    print('-' * 110)
    for c in candidates:
        match_str = f' (match: {c["existing_match"]})' if c['existing_match'] else ''
        print(f'{c["query"][:53]:<55} {c["impressions"]:>5} {c["delta"]:>+5} {c["position"]:>5} {c["suggestion"]}{match_str}')

    if args.json:
        Path(args.json).write_text(json.dumps(candidates, ensure_ascii=False, indent=2))
        print(f'\nGuardado en {args.json}')


if __name__ == '__main__':
    main()
