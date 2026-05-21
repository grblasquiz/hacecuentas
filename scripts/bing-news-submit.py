#!/usr/bin/env python3
"""
Bing News-style submission: pushea las URLs editorial-fresh (blog posts +
calcs con datos vivos refrescados <48h) al Bing Webmaster Submit URL API.

Bing News no tiene API dedicado publico, pero la Submit URL API tiene
quota dedicada para contenido fresh (10k/dia). Esta es la entrada "noticia"
para hacecuentas: blog posts del informe financiero mensual + calcs con
dataUpdate.frequency='daily' refrescadas.

Cero impacto cliente — corre server-side via cron diario.

Uso:
  python3 scripts/bing-news-submit.py
"""
import os, json, sys, glob, ssl
from datetime import datetime, timezone, timedelta
from pathlib import Path

try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except ImportError:
    SSL_CTX = ssl.create_default_context()

ROOT = Path(__file__).resolve().parent.parent
HOST = 'hacecuentas.com'
FORTY_EIGHT_H = timedelta(hours=48)

def _load_env(p):
    if not p.exists(): return
    for line in p.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line: continue
        k, v = line.split("=", 1)
        os.environ.setdefault(k.strip(), v.strip().strip('"').strip("'"))
_load_env(ROOT / ".env")

API_KEY = os.environ.get('BING_WEBMASTER_API_KEY')
if not API_KEY:
    print('⚠️  BING_WEBMASTER_API_KEY no configurado — skip')
    sys.exit(0)

now = datetime.now(timezone.utc)
threshold = now - FORTY_EIGHT_H

# Blog posts fresh
urls = []
for f in glob.glob(str(ROOT / 'src/content/blog/*.json')):
    try:
        p = json.load(open(f))
        date_str = p.get('updatedDate') or p.get('date')
        if not date_str or not isinstance(date_str, str): continue
        try:
            d = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            if d.tzinfo is None: d = d.replace(tzinfo=timezone.utc)
        except Exception:
            continue
        if d >= threshold:
            urls.append(f'https://{HOST}/blog/{p.get("slug","").strip("/")}')
    except: pass

# Calcs con dataUpdate fresh (refrescos live BCRA/INDEC/Dolar)
for f in glob.glob(str(ROOT / 'src/content/calcs/*.json')):
    try:
        c = json.load(open(f))
        if c.get('noindex'): continue
        du = c.get('dataUpdate') or {}
        if du.get('frequency') not in ('daily', 'weekly'): continue
        last = du.get('lastUpdated')
        if not last or not isinstance(last, str): continue
        try:
            d = datetime.strptime(last[:10], '%Y-%m-%d').replace(tzinfo=timezone.utc)
        except: continue
        if d >= threshold:
            urls.append(f'https://{HOST}/{c.get("slug","").strip("/")}')
    except: pass

if not urls:
    print('Bing News submit: 0 URLs fresh — skip')
    sys.exit(0)

urls = sorted(set(urls))[:100]  # cap razonable: news no es alta volumen
print(f'Bing News submit: {len(urls)} URLs fresh (<48h)')

# Bing Webmaster Submit URL Batch API
import urllib.request
endpoint = f'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlbatch?apikey={API_KEY}'
payload = {'siteUrl': f'https://{HOST}/', 'urlList': urls}

req = urllib.request.Request(
    endpoint, method='POST',
    data=json.dumps(payload).encode(),
    headers={'Content-Type': 'application/json; charset=utf-8'},
)
try:
    r = urllib.request.urlopen(req, context=SSL_CTX, timeout=30)
    body = r.read().decode('utf-8', errors='replace')[:200]
    print(f'  HTTP {r.status}: {body}')
except Exception as e:
    print(f'  Error: {e}', file=sys.stderr)
    sys.exit(0)  # non-blocking
