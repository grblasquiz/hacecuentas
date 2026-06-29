"""GitHub Pages — commitea un post HTML vía Contents API. Repo PROPIO (grblasquiz).

Dominio github.io = DR96, links dofollow + indexable. Es nuestro repo (no comunidad), así que
postea contenido del spinner directo a hacecuentas. Premium/baja-frecuencia (un github.io
spameado igual lo devalúa Google). Token: .github_token. Repo/owner en config.json.
"""
import base64
import hashlib
import json
import re
from pathlib import Path

from webreq import request

TOKEN_FILE = Path(__file__).resolve().parent.parent / '.github_token'
PLATFORM = 'github'


def _slug(s):
    s = re.sub(r'[^a-z0-9]+', '-', s.lower()).strip('-')
    return s[:60] or 'post'


def _html(article):
    link = f'<a href="{article["target_url"]}">{article["anchor"]}</a>'
    body = '\n'.join('<p>' + p.replace('{LINK}', link) + '</p>' for p in article['paragraphs'])
    return (f'<!doctype html><html lang="es"><head><meta charset="utf-8">'
            f'<meta name="viewport" content="width=device-width,initial-scale=1">'
            f'<title>{article["title"]}</title></head><body>'
            f'<article><h1>{article["title"]}</h1>{body}</article></body></html>')


def publish(article, cfg):
    if not TOKEN_FILE.exists():
        print('  github: falta .github_token')
        return None
    tok = TOKEN_FILE.read_text().strip()
    owner = cfg.get('github_owner')
    repo = cfg.get('github_repo')
    base = cfg.get('github_pages_base')
    if not (owner and repo and base):
        print('  github: faltan github_owner/github_repo/github_pages_base en config.json')
        return None
    html = _html(article)
    suffix = hashlib.sha1(html.encode()).hexdigest()[:6]
    path = f'posts/{_slug(article["title"])}-{suffix}.html'
    s, b, h = request(
        f'https://api.github.com/repos/{owner}/{repo}/contents/{path}',
        method='PUT',
        json_body={'message': f'post: {article["title"][:60]}',
                   'content': base64.b64encode(html.encode()).decode()},
        headers={'Authorization': 'Bearer ' + tok, 'Accept': 'application/vnd.github+json',
                 'User-Agent': 'hacecuentas-bot'})
    if s in (200, 201):
        return base.rstrip('/') + '/' + path
    try:
        print(f'  github API status={s} msg={json.loads(b).get("message")}')
    except Exception:
        print(f'  github API status={s}')
    return None
