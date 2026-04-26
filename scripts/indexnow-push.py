#!/usr/bin/env python3
"""
Push URLs al IndexNow API (Bing, Yandex).

Google NO soporta IndexNow oficialmente, pero Bing sí, y Google a veces
levanta señales de Bing al crawlearlo. Además genera tráfico directo de Bing.

Uso:
  python3 scripts/indexnow-push.py              # pushea las 56 URLs prioritarias
  python3 scripts/indexnow-push.py --all        # pushea todas (max 10000/submission)
  python3 scripts/indexnow-push.py /url1 /url2  # pushea URLs específicas
"""
import json
import os
import ssl
import sys
import urllib.request
from pathlib import Path
from xml.etree import ElementTree as ET

# Contexto SSL que cae a certifi si existe (macOS local sin cert chain puede fallar)
try:
    import certifi
    _ssl_ctx = ssl.create_default_context(cafile=certifi.where())
except Exception:
    _ssl_ctx = ssl.create_default_context()
    if os.environ.get('INDEXNOW_INSECURE_SSL') == '1':
        _ssl_ctx.check_hostname = False
        _ssl_ctx.verify_mode = ssl.CERT_NONE

KEY = '00e48c587b06495db41032c4797d9d39'
KEY_LOCATION = f'https://hacecuentas.com/{KEY}.txt'
HOST = 'hacecuentas.com'
ENDPOINT = 'https://api.indexnow.org/IndexNow'
NAMESPACE = '{http://www.sitemaps.org/schemas/sitemap/0.9}'

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'


def urls_from_sitemap(name: str) -> list:
    path = PUBLIC / name
    if not path.exists():
        return []
    tree = ET.parse(path)
    return [el.text for el in tree.getroot().iter(f'{NAMESPACE}loc')]


def push(urls: list) -> bool:
    payload = {
        'host': HOST,
        'key': KEY,
        'keyLocation': KEY_LOCATION,
        'urlList': urls,
    }
    req = urllib.request.Request(
        ENDPOINT,
        data=json.dumps(payload).encode('utf-8'),
        headers={'Content-Type': 'application/json; charset=utf-8'},
        method='POST',
    )
    try:
        with urllib.request.urlopen(req, timeout=20, context=_ssl_ctx) as resp:
            status = resp.status
            body = resp.read().decode('utf-8', errors='ignore')
    except Exception as e:
        print(f'❌ Error: {e}')
        return False
    # 200 = OK, 202 = Accepted (en cola), 422 = URLs inválidas, 429 = rate limited
    ok = status in (200, 202)
    print(f'{"✅" if ok else "⚠️"} IndexNow status={status} urls={len(urls)} body={body[:200]}')
    return ok


def main():
    args = sys.argv[1:]
    if args and args[0] == '--all':
        urls = []
        for f in PUBLIC.glob('sitemap-*.xml'):
            urls.extend(urls_from_sitemap(f.name))
        urls = list(dict.fromkeys(urls))  # dedupe preservando orden
    elif args and args[0].startswith('/') or args and args[0].startswith('http'):
        urls = [u if u.startswith('http') else f'https://{HOST}{u}' for u in args]
    else:
        urls = urls_from_sitemap('sitemap-priority.xml')

    if not urls:
        print('No hay URLs para pushear')
        return 1

    # IndexNow: max 10000 URLs por submission
    BATCH = 10000
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        print(f'Pusheando {len(chunk)} URLs...')
        push(chunk)
    return 0


if __name__ == '__main__':
    sys.exit(main())
