#!/usr/bin/env python3
"""
Submit RSS feed a aggregators y WebSub hubs.

Estrategia:
  1. **WebSub hubs** (PubSubHubbub) — protocol abierto. Cuando publicamos
     `mode=publish` al hub, todos los subscribers (Feedly, Inoreader, etc.)
     reciben notificación instantánea de "feed updated, re-fetch".
  2. **Discovery URLs** — algunos aggregators tienen URL pública para
     "search/add feed" que indexa el feed cuando un usuario lo abre.
  3. **RSS directories** — sitios que listan feeds por categoría.

Ejecuta automáticamente lo que se puede sin auth, lista lo que requiere
acción de Martin.

Uso:
  python3 scripts/submit-rss-aggregators.py
  python3 scripts/submit-rss-aggregators.py --dry-run
"""
from __future__ import annotations

import argparse
import subprocess
import sys
from datetime import datetime
from urllib.parse import quote

SITE = 'https://hacecuentas.com'
RSS_URL = f'{SITE}/rss.xml'
SITEMAP_URL = f'{SITE}/sitemap.xml'

# WebSub hubs públicos — gratis, sin auth
# Cuando hacemos POST con mode=publish, los subscribers reciben notificación
WEBSUB_HUBS = [
    'https://pubsubhubbub.superfeedr.com/',
    'https://pubsubhubbub.appspot.com/',  # Google's legacy hub
]

# RSS aggregators con discovery público (no requieren auth, indexan al
# abrir la URL desde un user → eventualmente aparecemos en su catálogo)
DISCOVERY_URLS = [
    {
        'name': 'Feedly Discovery',
        'url': f'https://feedly.com/i/discover/sources/search/feed/{quote(RSS_URL)}',
        'method': 'GET',
        'note': 'Feedly indexa cuando users abren la URL. Tu primer suscriber acelera.',
    },
    {
        'name': 'Inoreader Discovery',
        'url': f'https://www.inoreader.com/search/feeds/{quote(RSS_URL)}',
        'method': 'GET',
        'note': 'Inoreader indexa por discovery URL.',
    },
    {
        'name': 'NewsBlur Discovery',
        'url': f'https://newsblur.com/social/find_friends?feed_search={quote(RSS_URL)}',
        'method': 'GET',
        'note': 'NewsBlur public discovery.',
    },
    {
        'name': 'The Old Reader',
        'url': f'https://theoldreader.com/feeds/find?q={quote(RSS_URL)}',
        'method': 'GET',
        'note': 'The Old Reader public search.',
    },
]


def http_post(url: str, data: dict, timeout: int = 30) -> tuple[bool, int, str]:
    """POST form-encoded data via curl."""
    data_args = []
    for k, v in data.items():
        data_args.extend(['-d', f'{k}={v}'])
    try:
        result = subprocess.run(
            [
                'curl', '-s', '-L',
                '-w', '\\n---STATUS:%{http_code}',
                '-X', 'POST',
                '-A', 'Mozilla/5.0 (compatible; hacecuentas-rss-pinger/1.0)',
                '--max-time', str(timeout),
                *data_args,
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
        return ok, status, content[:300]
    except subprocess.TimeoutExpired:
        return False, 0, 'timeout'
    except Exception as e:
        return False, 0, f'error: {e}'


def http_get(url: str, timeout: int = 30) -> tuple[bool, int, str]:
    """GET via curl."""
    try:
        result = subprocess.run(
            [
                'curl', '-s', '-L',
                '-w', '\\n---STATUS:%{http_code}',
                '-A', 'Mozilla/5.0 (compatible; hacecuentas-rss-pinger/1.0)',
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
        return ok, status, content[:300]
    except subprocess.TimeoutExpired:
        return False, 0, 'timeout'
    except Exception as e:
        return False, 0, f'error: {e}'


def publish_to_websub(hub: str, feed_url: str, dry_run: bool = False) -> tuple[bool, int, str]:
    """POST hub.mode=publish&hub.url=<feed> al hub WebSub.

    Si el hub tiene subscribers (Feedly, Inoreader, etc.), se les notifica
    inmediatamente del cambio.
    """
    if dry_run:
        return True, 0, '(dry run)'
    return http_post(hub, {
        'hub.mode': 'publish',
        'hub.url': feed_url,
    })


def main():
    p = argparse.ArgumentParser()
    p.add_argument('--dry-run', action='store_true')
    args = p.parse_args()

    print(f'📡 RSS aggregator submissions — {datetime.now().isoformat()}')
    print(f'   Feed: {RSS_URL}')
    print()

    ok = 0
    fail = 0

    # ─── WebSub hubs (más impacto) ───
    print('▶ WebSub hubs (notify subscribers)')
    for hub in WEBSUB_HUBS:
        success, status, snippet = publish_to_websub(hub, RSS_URL, args.dry_run)
        if success:
            print(f'  ✓ {status}  {hub}')
            ok += 1
        else:
            print(f'  ✗ {status}  {hub}')
            print(f'      {snippet[:120]}')
            fail += 1

    print()

    # ─── Discovery URLs ───
    print('▶ Aggregator discovery URLs (índice por visita)')
    for d in DISCOVERY_URLS:
        if args.dry_run:
            print(f'  ⏸ (dry) {d["name"]}: {d["url"]}')
            continue
        success, status, snippet = http_get(d['url'])
        if success:
            print(f'  ✓ {status}  {d["name"]}')
            ok += 1
        else:
            print(f'  ✗ {status}  {d["name"]}')
            fail += 1

    print()

    # ─── Pings genéricos ───
    print('▶ Ping protocols')
    pings = [
        ('Yandex sitemap', f'https://blogs.yandex.com/pings/?status=success&url={quote(SITEMAP_URL)}'),
        ('Pingomatic full ping', f'https://pingomatic.com/ping/?title=Hac%C3%A9+Cuentas&blogurl={quote(SITE)}&rssurl={quote(RSS_URL)}&chk_blogs=on&chk_feedburner=on&chk_newsgator=on&chk_feedster=on&chk_myyahoo=on&chk_pubsubcom=on&chk_blogdigger=on&chk_blogrolling=on&chk_blogstreet=on&chk_moreover=on&chk_weblogalot=on&chk_icerocket=on&chk_newsisfree=on&chk_topicexchange=on&chk_skygrid=on&chk_collecta=on&chk_superfeedr=on&chk_audioweblogs=on&chk_rubhub=on&chk_a2b=on&chk_blogshares=on&chk_postrank=on'),
    ]
    for name, url in pings:
        if args.dry_run:
            print(f'  ⏸ (dry) {name}')
            continue
        success, status, snippet = http_get(url)
        if success:
            print(f'  ✓ {status}  {name}')
            ok += 1
        else:
            print(f'  ✗ {status}  {name}')
            fail += 1

    print()
    print(f'Total: {ok} ok, {fail} fallaron')

    # ─── Listar acciones manuales pendientes ───
    print()
    print('━' * 60)
    print('Acciones MANUALES pendientes (requieren cuenta — 5-10 min):')
    print()
    print('  1. Feedburner Reactivation (Google deprecated pero sirve aún):')
    print('     https://feedburner.google.com/fb/a/myfeeds')
    print('     Add feed:', RSS_URL)
    print()
    print('  2. Feedspot — registry público de blogs/feeds (DA 70):')
    print('     https://www.feedspot.com/?_src=submit')
    print('     Submit your blog form.')
    print()
    print('  3. Bloglovin (DA 75):')
    print('     https://www.bloglovin.com/claim')
    print('     Claim feed con email.')
    print()
    print('  4. Alltop (curated blog directory, DA 70):')
    print('     https://alltop.com/submission')
    print()


if __name__ == '__main__':
    main()
