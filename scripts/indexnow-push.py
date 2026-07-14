#!/usr/bin/env python3
"""
Push URLs al IndexNow API (Bing, Yandex).

Google NO soporta IndexNow oficialmente, pero Bing sí, y Google a veces
levanta señales de Bing al crawlearlo. Además genera tráfico directo de Bing.

Modo de envío: STREAMING (solo lo que cambia). Bing desaconseja el "batch mode"
(re-enviar el sitio entero) y su presupuesto de submissions para hacecuentas es
~1700 URLs/mes — pushear las ~3100 del sitemap en cada deploy no acelera nada:
compite contra las URLs que sí cambiaron. `--all` queda sólo para eventos
sitewide (migración de slugs), a mano.

Uso:
  python3 scripts/indexnow-push.py                      # sitemap-priority.xml (drip manual)
  python3 scripts/indexnow-push.py --git-changed A B    # solo URLs tocadas entre 2 commits ← CI
  python3 scripts/indexnow-push.py --changed            # change-set de indexnow-manifest.mjs
  python3 scripts/indexnow-push.py --all                # TODO el sitemap (sitewide, manual)
  python3 scripts/indexnow-push.py /url1 /url2          # URLs específicas
  ... --dry-run                                         # imprime sin enviar
"""
import json
import os
import ssl
import subprocess
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

# dir de contenido → prefijo de ruta. Tiene que cubrir TODOS los verticales:
# `ls -d src/content/calcs*`. Si agregás un vertical nuevo y no lo agregás acá,
# sus URLs dejan de avisarse a Bing en silencio.
LOCALE_PREFIX = {
    'calcs': '', 'calcs-mx': '/mx', 'calcs-co': '/co', 'calcs-cl': '/cl',
    'calcs-pe': '/pe', 'calcs-ec': '/ec', 'calcs-ve': '/ve', 'calcs-py': '/py',
    'calcs-uy': '/uy', 'calcs-do': '/do', 'calcs-es': '/es', 'calcs-en': '/en',
    'calcs-pt': '/pt', 'calcs-pt-pt': '/pt-pt',
    'guias': '/guia', 'comparaciones': '/comparar',
}

def all_sitemap_urls() -> set:
    """Conjunto autoritativo de URLs indexables (lo que generate-sitemap.ts dejó pasar).

    El sitemap ya aplica content-policy (noindex/draft/restricted/YMYL sin revisor)
    Y el filtro de `_redirects`. Es la única fuente que ve las dos cosas, así que
    filtrar contra él evita gastar presupuesto de submission en 301s y noindex.
    """
    urls = set()
    for f in PUBLIC.glob('sitemap-*.xml'):
        for u in urls_from_sitemap(f.name):
            urls.add(u.rstrip('/'))
    return urls


def urls_from_git_diff(before: str, after: str) -> list:
    """URLs indexables cuyo JSON de contenido cambió entre 2 commits.

    Sólo A/M/R (altas, ediciones, renames): las bajas se cubren con un 301 y Bing
    las levanta en el recrawl natural (CLAUDE.md §1). Lo que cambió pero no está
    en el sitemap se descarta y se LOGUEA (nunca en silencio): o es un 301/noindex
    correcto, o el sitemap quedó viejo → `npm run audit:sitemap`.
    """
    try:
        out = subprocess.run(
            ['git', 'diff', '--name-only', '--diff-filter=AMR', f'{before}..{after}', '--',
             *(f'src/content/{d}/*.json' for d in LOCALE_PREFIX)],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout
    except subprocess.CalledProcessError as e:
        print(f'❌ git diff falló ({before}..{after}): {e.stderr.strip()[:200]}')
        return []

    candidates = []
    for rel in (ln.strip() for ln in out.splitlines() if ln.strip()):
        parts = rel.split('/')
        if len(parts) < 4:
            continue
        prefix = LOCALE_PREFIX.get(parts[2])
        if prefix is None:
            continue
        path = ROOT / rel
        if not path.exists():
            continue
        try:
            slug = json.loads(path.read_text(encoding='utf-8')).get('slug') or Path(rel).stem
        except Exception:
            continue
        candidates.append(f'https://{HOST}{prefix}/{slug}')

    candidates = list(dict.fromkeys(candidates))
    indexable = all_sitemap_urls()
    urls = [u for u in candidates if u.rstrip('/') in indexable]
    dropped = [u for u in candidates if u.rstrip('/') not in indexable]

    print(f'[git-changed] {before[:8]}..{after[:8]} → {len(candidates)} calcs tocadas, '
          f'{len(urls)} indexables a enviar, {len(dropped)} fuera del sitemap (301/noindex)')
    for u in dropped[:15]:
        print(f'  ↩ fuera del sitemap, no se envía: {u}')
    if len(dropped) > 15:
        print(f'  ↩ … y {len(dropped) - 15} más')
    return urls


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
    dry_run = '--dry-run' in args
    args = [a for a in args if a != '--dry-run']
    batch = 10000
    if args and args[0] == '--git-changed':
        # Modo STREAMING (CI): sólo las URLs tocadas en este push. Cubre los 14
        # verticales vía LOCALE_PREFIX. Lotes de 500.
        if len(args) < 3:
            print('Uso: indexnow-push.py --git-changed <BEFORE_SHA> <AFTER_SHA>')
            return 1
        urls = urls_from_git_diff(args[1], args[2])
        batch = 500
        if not urls:
            print('Sin cambios de contenido indexable en este push — nada que enviar.')
            return 0
    elif args and args[0] == '--changed':
        # Modo por CAMBIOS (§27): lee el change-set producido por
        # scripts/bing-growth/indexnow-manifest.mjs (solo CREATED/UPDATED/DELETED).
        # No envía el sitio entero. Lotes de 500.
        from pathlib import Path as _P
        changed_file = _P(__file__).resolve().parent.parent / 'reports' / 'bing-growth' / 'indexnow-urls.txt'
        if not changed_file.exists():
            print('No existe reports/bing-growth/indexnow-urls.txt — corré indexnow-manifest.mjs primero')
            return 1
        urls = [ln.strip() for ln in changed_file.read_text().splitlines() if ln.strip()]
        batch = 500
    elif args and args[0] == '--all':
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
        return 0 if (args and args[0] == '--changed') else 1

    # IndexNow: lotes (500 en los modos por cambios, 10000 en el resto)
    BATCH = batch
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        if dry_run:
            print(f'[dry-run] {len(chunk)} URLs (no se envía nada):')
            for u in chunk:
                print(f'  {u}')
            continue
        print(f'Pusheando {len(chunk)} URLs...')
        push(chunk)
    return 0


if __name__ == '__main__':
    sys.exit(main())
