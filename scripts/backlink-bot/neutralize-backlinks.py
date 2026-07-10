#!/usr/bin/env python3
"""
neutralize-backlinks.py — Retira los backlinks del bot (política anti link-spam).

Telegraph (telegra.ph) y graph.org comparten motor y exponen editPage: sobrescribe
cada página publicada con una nota neutra SIN el enlace a hacecuentas.com → mata la
señal del backlink. También neutraliza el hub del indexer. Telegraph no tiene API de
delete; editPage a contenido sin links es la neutralización real.

Las demás plataformas (blogger/wpcom/devto/github) se listan aparte para takedown
manual/por-API (necesitan post-id que no está en la DB).

Uso:
    python3 neutralize-backlinks.py               # DRY-RUN (no toca nada)
    python3 neutralize-backlinks.py --apply       # aplica a telegraph+graphorg
    python3 neutralize-backlinks.py --apply --limit 1   # prueba con 1 por plataforma
"""
import argparse
import json
import sqlite3
import sys
import time
from pathlib import Path
from urllib.parse import urlparse

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from webreq import get_json  # noqa: E402

DB = HERE / 'backlinks.db'

PLATFORMS = {
    'telegraph': {'api': 'https://api.telegra.ph', 'token_file': HERE / '.telegraph_token'},
    'graphorg':  {'api': 'https://api.graph.org',  'token_file': HERE / '.graphorg_token'},
}

NEUTRAL_TITLE = 'Página retirada'
NEUTRAL_NODES = [
    {'tag': 'p', 'children': ['Esta nota fue retirada por su autor.']},
]


def token_for(platform):
    tf = PLATFORMS[platform]['token_file']
    return tf.read_text().strip() if tf.exists() else None


def path_from_url(url):
    """telegra.ph/Slug-06-29 -> Slug-06-29"""
    return urlparse(url).path.lstrip('/')


def edit_page(platform, path, token, title=NEUTRAL_TITLE, nodes=NEUTRAL_NODES):
    api = PLATFORMS[platform]['api']
    status, data = get_json(f'{api}/editPage/{path}', method='POST', form={
        'access_token': token,
        'title': title,
        'content': json.dumps(nodes, ensure_ascii=False),
        'author_name': 'Hacé Cuentas',
        'return_content': 'false',
    })
    ok = bool(data and data.get('ok'))
    err = None if ok else (data.get('error') if data else f'http {status}')
    return ok, err


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--apply', action='store_true', help='aplica los cambios (sin esto = dry-run)')
    ap.add_argument('--limit', type=int, default=0, help='máx por plataforma (0 = todas)')
    args = ap.parse_args()

    con = sqlite3.connect(DB)
    con.row_factory = sqlite3.Row
    c = con.cursor()

    tokens = {p: token_for(p) for p in PLATFORMS}
    for p, t in tokens.items():
        print(f'  token {p}: {"OK" if t else "FALTA"}')

    # Hub del indexer (telegraph)
    hub_path = None
    row = c.execute("SELECT v FROM kv WHERE k='hub_path'").fetchone()
    if row:
        hub_path = row['v']

    done = {'telegraph': 0, 'graphorg': 0}
    fail = 0
    for platform in PLATFORMS:
        q = ("SELECT id, published_url, status FROM links "
             "WHERE platform=? AND published_url IS NOT NULL "
             "AND status IN ('published','verified_live') ORDER BY id")
        rows = c.execute(q, (platform,)).fetchall()
        if args.limit:
            rows = rows[:args.limit]
        print(f'\n[{platform}] {len(rows)} páginas a neutralizar')
        tok = tokens[platform]
        for r in rows:
            path = path_from_url(r['published_url'])
            if not args.apply:
                print(f'  DRY  {platform}/{path}')
                continue
            ok, err = edit_page(platform, path, tok)
            if ok:
                c.execute("UPDATE links SET status='neutralized', "
                          "note=COALESCE(note,'')||' [neutralized 2026-07-10]' WHERE id=?", (r['id'],))
                con.commit()
                done[platform] += 1
                print(f'  ✓    {platform}/{path}')
            else:
                fail += 1
                print(f'  ✗    {platform}/{path} — {err}')
            time.sleep(0.4)  # rate-limit suave

    # Hub
    if hub_path and args.apply and not args.limit:
        tok = tokens['telegraph']
        ok, err = edit_page('telegraph', hub_path, tok,
                            title='Índice retirado',
                            nodes=[{'tag': 'p', 'children': ['Índice retirado.']}])
        print(f'\n[hub] {"✓ neutralizado" if ok else "✗ " + str(err)}: {hub_path}')

    print(f'\n[neutralize] telegraph={done["telegraph"]} graphorg={done["graphorg"]} fallos={fail} '
          f'{"(DRY-RUN, nada aplicado)" if not args.apply else ""}')
    con.close()


if __name__ == '__main__':
    main()
