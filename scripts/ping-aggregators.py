#!/usr/bin/env python3
"""
Ping agregadores y servicios de RSS/sitemap discovery.

Estos servicios aceptan pings públicos sin auth — los notificamos cuando
hay contenido nuevo para que actualicen sus indexes.

Servicios pingeados:
  - Pingomatic (multi-ping a 30+ servicios de blog tracking)
  - Google Indexing API ping (sitemap)
  - Bing Webmaster sitemap ping
  - Yandex sitemap ping
  - WeblogUpdates ping (classic protocol)

Uso:
  python3 scripts/ping-aggregators.py
"""
from __future__ import annotations

import json
import subprocess
import sys
from datetime import datetime
from urllib.parse import quote

SITE = 'https://hacecuentas.com'
RSS = f'{SITE}/rss.xml'
SITEMAP = f'{SITE}/sitemap.xml'

# Lista de servicios a pingear
PINGS = [
    # Sitemap pings (legacy pero todavía funcionan en Bing/Yandex)
    {
        'name': 'Bing sitemap ping',
        'url': f'https://www.bing.com/ping?sitemap={quote(SITEMAP)}',
        'method': 'GET',
    },
    {
        'name': 'Yandex sitemap ping',
        'url': f'https://blogs.yandex.com/pings/?status=success&url={quote(SITEMAP)}',
        'method': 'GET',
    },
    # Pingomatic — multi-pings 30+ services en 1 call
    {
        'name': 'Pingomatic (multi-ping 30+ services)',
        'url': f'https://pingomatic.com/ping/?title=Hac%C3%A9+Cuentas&blogurl={quote(SITE)}&rssurl={quote(RSS)}&chk_blogs=on&chk_feedburner=on&chk_newsgator=on&chk_feedster=on&chk_myyahoo=on&chk_pubsubcom=on&chk_blogdigger=on&chk_blogrolling=on&chk_blogstreet=on&chk_moreover=on&chk_weblogalot=on&chk_icerocket=on&chk_newsisfree=on&chk_topicexchange=on&chk_skygrid=on&chk_collecta=on&chk_superfeedr=on&chk_audioweblogs=on&chk_rubhub=on&chk_a2b=on&chk_blogshares=on&chk_postrank=on',
        'method': 'GET',
    },
    # WeblogUpdates classic (XML-RPC)
    # Skipped — XML-RPC requires more complex setup, low value
]


def http_get(url: str, timeout: int = 30) -> tuple[bool, int, str]:
    """GET via curl, returns (ok, status_code, snippet)."""
    try:
        result = subprocess.run(
            [
                'curl', '-s', '-L',
                '-w', '\\n---STATUS:%{http_code}',
                '-A', 'Mozilla/5.0 (compatible; hacecuentas-pinger/1.0)',
                '--max-time', str(timeout),
                url,
            ],
            capture_output=True, text=True, timeout=timeout + 10,
        )
        body = result.stdout
        if '---STATUS:' in body:
            parts = body.rsplit('---STATUS:', 1)
            content = parts[0]
            try:
                status = int(parts[1].strip())
            except ValueError:
                status = 0
        else:
            content = body
            status = 0

        ok = 200 <= status < 400
        return ok, status, content[:200]
    except subprocess.TimeoutExpired:
        return False, 0, 'timeout'
    except Exception as e:
        return False, 0, f'error: {e}'


def main():
    print(f'📡 Pinging aggregators — {datetime.now().isoformat()}')
    print(f'   Site: {SITE}')
    print()

    ok_count = 0
    fail_count = 0

    for ping in PINGS:
        name = ping['name']
        url = ping['url']
        print(f'  → {name}')
        ok, status, snippet = http_get(url)
        if ok:
            print(f'    ✓ {status} OK')
            ok_count += 1
        else:
            print(f'    ✗ {status} — {snippet[:100]}')
            fail_count += 1

    print()
    print(f'Total: {ok_count} ok, {fail_count} fallaron')


if __name__ == '__main__':
    main()
