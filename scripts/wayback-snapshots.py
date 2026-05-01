#!/usr/bin/env python3
"""
Wayback Machine snapshot submission — ofrece backlinks naturales desde
archive.org (DA 91) y crea historical record permanente.

Uso:
  python3 scripts/wayback-snapshots.py            # top 100 URLs del sitemap-priority
  python3 scripts/wayback-snapshots.py --all      # todas las URLs (respeta quota)
  python3 scripts/wayback-snapshots.py --limit 50

Cómo funciona:
  POST a https://web.archive.org/save/{url}
  Sin auth pero rate-limited a ~10 req/min para anonymous.
  Con S3 keys (account) → 100 req/min.

State file: scripts/.wayback-state.json (slug → last_snapshot_date)
  Re-snapshot cada 30 días por slug (mantiene historical pattern).
"""
from __future__ import annotations

import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.parse
from datetime import datetime, timedelta
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / 'public'
STATE_FILE = ROOT / 'scripts' / '.wayback-state.json'
SITE = 'https://hacecuentas.com'

# Re-snapshot cada 30 días (no spammear a archive.org)
RESNAPSHOT_DAYS = 30

# Anonymous rate limit (sin S3 keys): ~10/min seguros
RATE_LIMIT_DELAY = 8  # segundos entre snapshots


def load_state() -> dict:
    if STATE_FILE.exists():
        try:
            return json.loads(STATE_FILE.read_text())
        except Exception:
            pass
    return {'snapshots': {}, 'last_run': None}


def save_state(st: dict) -> None:
    STATE_FILE.write_text(json.dumps(st, indent=2, default=str))


def urls_from_sitemap_priority() -> list[str]:
    """Top URLs del sitemap-priority.xml — la lista curada de top calcs."""
    p = PUBLIC / 'sitemap-priority.xml'
    if not p.exists():
        return []
    NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    return [el.text for el in ET.parse(p).getroot().iter(f'{NS}loc')]


def urls_from_all_sitemaps() -> list[str]:
    idx = PUBLIC / 'sitemap.xml'
    if not idx.exists():
        return []
    NS = '{http://www.sitemaps.org/schemas/sitemap/0.9}'
    sub_sitemaps = [el.text for el in ET.parse(idx).getroot().iter(f'{NS}loc')]
    urls = []
    for sm_url in sub_sitemaps:
        name = sm_url.rsplit('/', 1)[-1]
        local = PUBLIC / name
        if not local.exists():
            continue
        try:
            tree = ET.parse(local)
            urls.extend(el.text for el in tree.getroot().iter(f'{NS}loc'))
        except Exception:
            pass
    return urls


def submit_to_wayback(url: str, timeout: int = 60) -> tuple[bool, str]:
    """POST a https://web.archive.org/save/{url}. Devuelve (ok, msg).

    Usa subprocess + curl para evitar SSL cert issues con urllib en macOS local.
    """
    import subprocess
    save_url = f'https://web.archive.org/save/{url}'
    try:
        result = subprocess.run(
            [
                'curl', '-s', '-o', '/dev/null',
                '-w', '%{http_code}',
                '-X', 'POST',
                '-H', 'User-Agent: hacecuentas-wayback/1.0 (+https://hacecuentas.com)',
                '-H', 'Accept: text/html,application/xhtml+xml',
                '--max-time', str(timeout),
                save_url,
            ],
            capture_output=True, text=True, timeout=timeout + 10,
        )
        status_str = result.stdout.strip()
        try:
            status = int(status_str)
        except ValueError:
            return False, f'invalid response: {status_str[:50]}'

        if status == 200:
            return True, f'queued (status {status})'
        elif status == 429:
            return False, 'rate-limited (429)'
        elif status >= 500:
            return False, f'server error {status}'
        elif status == 0:
            return False, 'no response (connection failed)'
        else:
            return True, f'status {status}'
    except subprocess.TimeoutExpired:
        return False, f'timeout after {timeout}s'
    except FileNotFoundError:
        return False, 'curl not found in PATH'
    except Exception as e:
        return False, f'error: {type(e).__name__}: {str(e)[:100]}'


def should_snapshot(state: dict, url: str) -> bool:
    """¿Re-snapshotear esta URL? (no si fue snapshoted en últimos RESNAPSHOT_DAYS)."""
    last = state['snapshots'].get(url)
    if not last:
        return True
    try:
        last_dt = datetime.fromisoformat(last)
        age = datetime.now() - last_dt
        return age.days >= RESNAPSHOT_DAYS
    except Exception:
        return True


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--all', action='store_true', help='Submit todas las URLs (no solo priority)')
    p.add_argument('--limit', type=int, default=50, help='Max URLs por corrida (default: 50)')
    p.add_argument('--dry-run', action='store_true', help='No submitea, solo lista')
    args = p.parse_args()

    state = load_state()

    candidates = urls_from_all_sitemaps() if args.all else urls_from_sitemap_priority()
    if not candidates:
        sys.stderr.write('❌ No se encontraron URLs en sitemap\n')
        sys.exit(1)

    # Filtrar las que necesitan re-snapshot
    todo = [u for u in candidates if should_snapshot(state, u)]
    todo = todo[:args.limit]

    print(f'📚 Wayback Machine snapshots')
    print(f'   Candidatos totales: {len(candidates)}')
    print(f'   A snapshotear (>= {RESNAPSHOT_DAYS}d desde último): {len(todo)}')
    print(f'   Limit: {args.limit}')
    print()

    if args.dry_run:
        print('--dry-run mode, no submissions')
        for u in todo[:20]:
            print(f'  • {u}')
        if len(todo) > 20:
            print(f'  ... y {len(todo) - 20} más')
        return

    ok = 0
    fail = 0
    for i, url in enumerate(todo):
        success, msg = submit_to_wayback(url)
        if success:
            state['snapshots'][url] = datetime.now().isoformat()
            ok += 1
            print(f'  ✓ [{i+1}/{len(todo)}] {url}')
        else:
            fail += 1
            print(f'  ✗ [{i+1}/{len(todo)}] {url} — {msg}')
            if 'rate-limited' in msg:
                print('  ⏸  Rate limited, pausando 60s...')
                time.sleep(60)
                continue

        # Save state every 10 to be resilient to interruption
        if (i + 1) % 10 == 0:
            save_state(state)

        # Anonymous rate limit
        time.sleep(RATE_LIMIT_DELAY)

    state['last_run'] = datetime.now().isoformat()
    save_state(state)
    print()
    print(f'Total: {ok} ok, {fail} fallaron. State guardado en {STATE_FILE.name}')


if __name__ == '__main__':
    main()
