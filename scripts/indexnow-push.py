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
  ... --max N                                           # tope de URLs por corrida
  ... --backlog <file>                                  # cola persistente: drena primero,
                                                        # y lo recortado por --max se guarda ahí
"""
import json
import os
import re
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
    # `git log` (no `git diff`) para que los archivos salgan en orden de RECENCIA
    # (commit más nuevo primero). Mismo set que `git diff A..B --diff-filter=AMR`,
    # pero ordenado: así un `--max` posterior conserva lo último que tocó Martin y
    # descarta el bulk viejo. El dedupe preserva ese orden (dict.fromkeys).
    try:
        out = subprocess.run(
            ['git', 'log', '--name-only', '--diff-filter=AMR', '--pretty=format:',
             f'{before}..{after}', '--',
             *(f'src/content/{d}/*.json' for d in LOCALE_PREFIX),
             # Hubs de decisión: viven en src/lib/hubs/ (no en src/content/) y
             # eran INVISIBLES para este detector — los 478 hubs de la migración
             # 7-27 jamás se avisaron a Bing (forense 8-07). El slug real está
             # DENTRO del .ts (`slug: 'trabajo/aguinaldo'`), nunca el filename.
             'src/lib/hubs/*.ts', 'src/lib/hubs/*/*.ts'],
            cwd=ROOT, capture_output=True, text=True, check=True,
        ).stdout
    except subprocess.CalledProcessError as e:
        print(f'❌ git log falló ({before}..{after}): {e.stderr.strip()[:200]}')
        return []

    candidates = []
    for rel in (ln.strip() for ln in out.splitlines() if ln.strip()):
        parts = rel.split('/')
        path = ROOT / rel
        if not path.exists():
            continue
        if rel.startswith('src/lib/hubs/') and rel.endswith('.ts'):
            # src/lib/hubs/<slug>.ts (AR/global) o src/lib/hubs/<locale>/<slug>.ts.
            # El slug con categoría está dentro del archivo: slug: 'trabajo/aguinaldo'.
            prefix = f'/{parts[3]}' if len(parts) == 5 else ''
            m = re.search(r"slug:\s*['\"]([^'\"]+)['\"]", path.read_text(encoding='utf-8'))
            if not m:
                continue
            candidates.append(f'https://{HOST}{prefix}/{m.group(1)}')
            continue
        if len(parts) < 4:
            continue
        prefix = LOCALE_PREFIX.get(parts[2])
        if prefix is None:
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
    # --max N: tope de URLs por corrida (protección de quota Bing ~1700/mes). Los
    # días de campaña masiva (activar ads en 183 calcs, etc.) pueden generar 200+
    # URLs de una y desalojar meses de presupuesto. Con las URLs ordenadas por
    # recencia, el tope conserva lo más nuevo y LOGUEA lo descartado (Bing igual
    # lo recrawlea). Sólo aplica al drip local; el CI sin --max manda todo.
    max_urls = None
    if '--max' in args:
        i = args.index('--max')
        try:
            max_urls = int(args[i + 1])
            del args[i:i + 2]
        except (IndexError, ValueError):
            print('Uso: --max <N> (entero)')
            return 1
    # --backlog FILE: cola persistente de URLs que quedaron afuera por --max en
    # corridas anteriores. Se drena PRIMERO (son las más viejas sin avisar) y lo
    # que esta corrida recorte se persiste ahí — antes se perdía para siempre
    # (reporte Bing 7-24: 32 URLs nunca enviadas).
    backlog_file = None
    if '--backlog' in args:
        i = args.index('--backlog')
        try:
            backlog_file = Path(args[i + 1])
            del args[i:i + 2]
        except IndexError:
            print('Uso: --backlog <archivo>')
            return 1
    # Parseo ESTRICTO: cualquier flag desconocido aborta con usage. Antes un arg
    # tipo `--help` caía en el modo drip default y pusheaba 254 URLs (quema quota).
    KNOWN_MODES = ('--git-changed', '--changed', '--all')
    unknown = [a for a in args if a.startswith('-') and a not in KNOWN_MODES]
    if unknown or (args and args[0].startswith('-') and args[0] not in KNOWN_MODES):
        print(f'❌ flag desconocido: {" ".join(unknown) or args[0]}')
        print(__doc__.split('Uso:')[1] if 'Uso:' in (__doc__ or '') else
              'Uso: indexnow-push.py [--git-changed A B | --changed | --all | /url ...] '
              '[--max N] [--backlog FILE] [--dry-run]')
        return 2
    batch = 10000
    if args and args[0] == '--git-changed':
        # Modo STREAMING (CI): sólo las URLs tocadas en este push. Cubre los 14
        # verticales vía LOCALE_PREFIX. Lotes de 500.
        if len(args) < 3:
            print('Uso: indexnow-push.py --git-changed <BEFORE_SHA> <AFTER_SHA>')
            return 1
        urls = urls_from_git_diff(args[1], args[2])
        batch = 500
        if not urls and backlog_file is None:
            print('Sin cambios de contenido indexable en este push — nada que enviar.')
            return 0
        # con --backlog NO se corta acá: puede haber URLs pendientes que drenar
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

    # Drenar backlog PRIMERO (URLs recortadas en corridas previas, aún sin avisar).
    # Se filtran contra el sitemap por si alguna se podó/301eó desde que se encoló.
    backlog_urls = []
    if backlog_file is not None and backlog_file.exists():
        raw = [ln.strip() for ln in backlog_file.read_text(encoding='utf-8').splitlines() if ln.strip()]
        if raw:
            indexable = all_sitemap_urls()
            backlog_urls = [u for u in dict.fromkeys(raw) if u.rstrip('/') in indexable]
            stale = len(raw) - len(backlog_urls)
            print(f'[backlog] {len(backlog_urls)} URLs pendientes de corridas previas'
                  + (f' ({stale} descartadas: ya no están en el sitemap)' if stale else ''))
    urls = list(dict.fromkeys(backlog_urls + urls))

    if not urls:
        print('No hay URLs para pushear')
        return 0 if (args and args[0] in ('--changed', '--git-changed')) else 1

    dropped = []
    if max_urls is not None and len(urls) > max_urls:
        dropped = urls[max_urls:]
        urls = urls[:max_urls]
        dest = f'quedan en backlog ({backlog_file})' if backlog_file else 'descartadas (Bing las recrawlea)'
        print(f'⚠️ --max {max_urls}: {len(urls)} URLs se envían, {len(dropped)} {dest}:')
        for u in dropped[:20]:
            print(f'  ↩ tope: {u}')
        if len(dropped) > 20:
            print(f'  ↩ … y {len(dropped) - 20} más')

    # IndexNow: lotes (500 en los modos por cambios, 10000 en el resto)
    BATCH = batch
    all_ok = True
    for i in range(0, len(urls), BATCH):
        chunk = urls[i:i + BATCH]
        if dry_run:
            print(f'[dry-run] {len(chunk)} URLs (no se envía nada):')
            for u in chunk:
                print(f'  {u}')
            continue
        print(f'Pusheando {len(chunk)} URLs...')
        if not push(chunk):
            all_ok = False

    # Persistir backlog: si el push falló, se re-encola TODO (enviadas + recortadas)
    # para no perder nada; si salió bien, queda solo lo recortado.
    if backlog_file is not None and not dry_run:
        pending = dropped if all_ok else list(dict.fromkeys(urls + dropped))
        backlog_file.parent.mkdir(parents=True, exist_ok=True)
        backlog_file.write_text('\n'.join(pending) + ('\n' if pending else ''), encoding='utf-8')
        if pending:
            print(f'[backlog] {len(pending)} URLs encoladas en {backlog_file}')
    return 0 if all_ok else 1


if __name__ == '__main__':
    sys.exit(main())
