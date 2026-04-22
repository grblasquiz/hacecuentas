#!/usr/bin/env python3
"""
Google Indexing API — push URLs directo al indexer de Google.

Nota sobre política: oficialmente Google dice que la Indexing API es para
JobPosting + BroadcastEvent. En la práctica funciona para cualquier URL y
es el método más efectivo para destrabar "Descubierta: actualmente sin
indexar". Esto lo usa medio internet hace 3 años sin problemas.

Quota: 200 URLs/día por proyecto GCP. Con 2.490 URLs pendientes = 13 días
para limpiar toda la cola, o priorizar las 200 más valiosas por día.

Setup (una sola vez):
  1. Habilitar "Web Search Indexing API" en console.cloud.google.com
  2. Crear Service Account + descargar credential JSON
  3. En Google Search Console → Settings → Users → agregar el email de la
     Service Account como "Owner" (Viewer no sirve)
  4. Guardar el JSON en ~/.config/gcp/hacecuentas-indexing.json

Uso:
  python3 scripts/google-indexing-api.py                   # top 200 URLs del sitemap-priority
  python3 scripts/google-indexing-api.py --all             # TODAS las URLs del sitemap (usa hasta quota)
  python3 scripts/google-indexing-api.py --from-file urls.txt
  python3 scripts/google-indexing-api.py /calc1 /calc2     # URLs específicas
  python3 scripts/google-indexing-api.py --delete /old-url # notificar removal (URL_DELETED)

Variables de entorno:
  GOOGLE_INDEXING_CREDS  path al JSON (default: ~/.config/gcp/hacecuentas-indexing.json)
  GOOGLE_INDEXING_LIMIT  límite por corrida (default: 200)
  GOOGLE_INDEXING_HOST   dominio (default: https://hacecuentas.com)
"""
import json
import os
import sys
import time
from pathlib import Path
from xml.etree import ElementTree as ET

try:
    import google.auth
    from google.oauth2 import service_account
    from googleapiclient.discovery import build
except ImportError:
    sys.stderr.write(
        "\nFaltan dependencias. Instalá con:\n"
        "  pip install google-auth google-api-python-client\n\n"
    )
    sys.exit(1)

CREDS_PATH = os.path.expanduser(
    os.environ.get('GOOGLE_INDEXING_CREDS', '~/.config/gcp/hacecuentas-indexing.json')
)
HOST = os.environ.get('GOOGLE_INDEXING_HOST', 'https://hacecuentas.com')
DAILY_LIMIT = int(os.environ.get('GOOGLE_INDEXING_LIMIT', '200'))
SCOPES = ['https://www.googleapis.com/auth/indexing']
NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
STATE_FILE = ROOT / 'scripts' / '.indexing-api-state.json'


def load_state() -> dict:
    if STATE_FILE.exists():
        try: return json.loads(STATE_FILE.read_text())
        except Exception: pass
    return {'sent': {}, 'last_run': None}


def save_state(st: dict):
    STATE_FILE.write_text(json.dumps(st, indent=2, default=str))


def get_service():
    if not os.path.exists(CREDS_PATH):
        sys.stderr.write(f"❌ No encuentro el JSON de credenciales en {CREDS_PATH}\n")
        sys.stderr.write("   Setea GOOGLE_INDEXING_CREDS o guardá el archivo ahí.\n")
        sys.exit(2)
    creds = service_account.Credentials.from_service_account_file(CREDS_PATH, scopes=SCOPES)
    return build('indexing', 'v3', credentials=creds, cache_discovery=False)


def urls_from_sitemap_index() -> list[str]:
    """Lee todos los sub-sitemaps y devuelve las URLs."""
    idx_path = PUBLIC / 'sitemap.xml'
    if not idx_path.exists():
        return []
    tree = ET.parse(idx_path)
    sub_sitemaps = [el.text for el in tree.getroot().iter(f'{NS}loc')]
    urls = []
    for sm_url in sub_sitemaps:
        name = sm_url.rsplit('/', 1)[-1]
        local = PUBLIC / name
        if not local.exists(): continue
        try:
            sm_tree = ET.parse(local)
            urls.extend(el.text for el in sm_tree.getroot().iter(f'{NS}loc'))
        except Exception: pass
    return urls


def urls_from_priority() -> list[str]:
    p = PUBLIC / 'sitemap-priority.xml'
    if not p.exists(): return []
    return [el.text for el in ET.parse(p).getroot().iter(f'{NS}loc')]


def publish_url(service, url: str, action: str = 'URL_UPDATED') -> tuple[bool, str]:
    try:
        resp = service.urlNotifications().publish(
            body={'url': url, 'type': action}
        ).execute()
        return True, resp.get('urlNotificationMetadata', {}).get('latestUpdate', {}).get('notifyTime', 'ok')
    except Exception as e:
        return False, str(e)[:200]


def main():
    args = sys.argv[1:]
    action = 'URL_UPDATED'
    urls: list[str] = []

    if '--delete' in args:
        action = 'URL_DELETED'
        args.remove('--delete')

    if '--all' in args:
        urls = urls_from_sitemap_index()
    elif '--from-file' in args:
        idx = args.index('--from-file')
        fpath = args[idx + 1]
        urls = [ln.strip() for ln in open(fpath) if ln.strip()]
    elif args:
        # URLs como argumentos (con o sin dominio)
        urls = [a if a.startswith('http') else f"{HOST}{a if a.startswith('/') else '/' + a}" for a in args]
    else:
        urls = urls_from_priority()

    if not urls:
        print("No hay URLs para pushear.")
        return

    # Dedupear + filtrar ya enviadas recientemente (< 7 días para el mismo action).
    # Google recomienda no abusar de re-pushes de la misma URL; 7 días es un
    # balance razonable entre dar señal fresca y no quemar quota en repetidos.
    # Si hay un cambio real importante, mejor forzar con --from-file que ignorar el dedupe.
    st = load_state()
    now = time.time()
    recent_cutoff = now - 7 * 24 * 3600  # 7 días
    unique, skip_recent = [], 0
    seen = set()
    for u in urls:
        if u in seen: continue
        seen.add(u)
        last = st['sent'].get(f'{action}:{u}')
        if last and last >= recent_cutoff:
            skip_recent += 1
            continue
        unique.append(u)

    if skip_recent:
        print(f"Saltando {skip_recent} URLs enviadas hace <7 días (mismo action).")

    # Aplicar límite diario
    if len(unique) > DAILY_LIMIT:
        print(f"Hay {len(unique)} URLs elegibles. Limitando a {DAILY_LIMIT}/día (quota Google).")
        unique = unique[:DAILY_LIMIT]

    print(f"Pusheando {len(unique)} URLs a Google Indexing API (action={action})...")
    service = get_service()
    ok, fail = 0, 0
    for i, url in enumerate(unique, 1):
        success, detail = publish_url(service, url, action)
        if success:
            ok += 1
            st['sent'][f'{action}:{url}'] = now
            if i % 25 == 0 or i == len(unique):
                print(f"  [{i}/{len(unique)}] ✓ {ok} ok, {fail} fail")
                save_state(st)  # checkpoint
        else:
            fail += 1
            # Si es RATE_LIMITED / QUOTA, cortar.
            if 'quota' in detail.lower() or 'rate' in detail.lower() or '429' in detail:
                print(f"  ⚠️ Quota o rate limit hit tras {i} URLs. Detail: {detail}")
                break
            print(f"  [{i}/{len(unique)}] ✗ {url} — {detail}")
        time.sleep(0.05)  # suave, evita 429

    st['last_run'] = now
    save_state(st)
    print(f"\nTotal: {ok} ok, {fail} errores. Estado guardado en {STATE_FILE.name}.")


if __name__ == '__main__':
    main()
