#!/usr/bin/env python3
"""
Submit URLs a Bing Webmaster API (SubmitUrlBatch).

Cuotas Bing (2026):
  - Individual SubmitUrl: 15 URLs/dia
  - SubmitUrlBatch: hasta ~10k URLs/dia segun sitio
  - Monthly: ~1.915/mes individual, mucho mas para batch

Uso:
  python3 scripts/bing-submit-urls.py                              # 85 URLs prioritarias por defecto
  python3 scripts/bing-submit-urls.py --from-file urls.txt          # archivo con 1 URL por linea
  python3 scripts/bing-submit-urls.py /calc1 /calc2 /calc3          # URLs especificas
  python3 scripts/bing-submit-urls.py --quota                       # solo chequear cuota

Env vars:
  BING_WEBMASTER_API_KEY (en .env del proyecto)
"""
import os
import sys
import json
import glob
import subprocess
import tempfile
import argparse
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
HOST = 'https://hacecuentas.com'


def load_key() -> str:
    env = ROOT / '.env'
    if not env.exists():
        sys.exit('❌ no existe .env')
    for line in env.read_text().splitlines():
        if line.startswith('BING_WEBMASTER_API_KEY='):
            return line.split('=', 1)[1].strip()
    sys.exit('❌ falta BING_WEBMASTER_API_KEY en .env')


def call_bing(endpoint: str, body: dict | None = None) -> str:
    if body is None:
        r = subprocess.run(['curl', '-s', endpoint], capture_output=True, text=True, timeout=60)
    else:
        with tempfile.NamedTemporaryFile(suffix='.json', delete=False) as tf:
            tf.write(json.dumps(body).encode())
            tf_path = tf.name
        try:
            r = subprocess.run([
                'curl', '-s', '-w', '\nHTTP:%{http_code}\n',
                '-X', 'POST', endpoint,
                '-H', 'Content-Type: application/json; charset=utf-8',
                '--data-binary', f'@{tf_path}',
            ], capture_output=True, text=True, timeout=120)
        finally:
            os.unlink(tf_path)
    return r.stdout


def get_quota(key: str):
    url = f'https://ssl.bing.com/webmaster/api.svc/json/GetUrlSubmissionQuota?siteUrl={HOST}&apikey={key}'
    return call_bing(url)


def submit_batch(key: str, urls: list[str]):
    endpoint = f'https://ssl.bing.com/webmaster/api.svc/json/SubmitUrlBatch?apikey={key}'
    return call_bing(endpoint, {'siteUrl': HOST, 'urlList': urls})


def default_priority_urls() -> list[str]:
    urls = [f'{HOST}/mundial-2026']

    # Calcs Mundial 2026 (todas)
    for f in sorted(glob.glob(str(ROOT / 'src/content/calcs/calculadora-mundial-2026-*.json'))):
        slug = Path(f).stem
        u = f'{HOST}/{slug}'
        if u not in urls:
            urls.append(u)

    # Top 50 priority
    pq = ROOT / 'scripts/indexing-priority-queue.txt'
    if pq.exists():
        for line in pq.read_text().splitlines()[:50]:
            line = line.strip()
            if line and line not in urls:
                urls.append(line)

    # AI / API endpoints
    urls += [
        f'{HOST}/ai.txt',
        f'{HOST}/.well-known/ai-plugin.json',
        f'{HOST}/.well-known/llms-allowed.txt',
        f'{HOST}/api/calcs-index.json',
    ]
    seen = set()
    return [u for u in urls if not (u in seen or seen.add(u))]


def main():
    p = argparse.ArgumentParser()
    p.add_argument('urls', nargs='*', help='URLs específicas')
    p.add_argument('--from-file', help='archivo con 1 URL por línea')
    p.add_argument('--quota', action='store_true', help='solo chequear cuota')
    args = p.parse_args()

    key = load_key()

    if args.quota:
        print(get_quota(key))
        return

    if args.from_file:
        with open(args.from_file) as f:
            raw_urls = [l.strip() for l in f if l.strip() and not l.startswith('#')]
    elif args.urls:
        raw_urls = args.urls
    else:
        raw_urls = default_priority_urls()

    # Normalizar TODAS las inputs a URL absoluta. Si llega "/calc" o "calc",
    # prefijar con HOST. Bing rechaza paths relativos con un genérico
    # "AuthorizationFailed" (clasificación incorrecta del lado server) — hay
    # que mandar siempre URL completa.
    def to_absolute(u: str) -> str:
        if u.startswith('http://') or u.startswith('https://'):
            return u
        return f'{HOST}/{u.lstrip("/")}'

    urls = [to_absolute(u) for u in raw_urls]

    print(f'📡 {len(urls)} URLs → Bing Webmaster API')
    print(submit_batch(key, urls))
    print('Cuota actual:')
    print(get_quota(key))


if __name__ == '__main__':
    main()
