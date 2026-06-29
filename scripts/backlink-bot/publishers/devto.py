"""dev.to — API oficial (api-key). DR~90, dofollow real, indexable. Cuenta de Martin ya existe.

⚠️ NO spinnea: dev.to es comunidad dev con estándar de calidad — contenido autogenerado =
flag de spam = suspensión de la cuenta (el activo). En vez de eso postea de una COLA de drafts
YA ESCRITOS (calidad humana) en docs/backlinks/devto-post-*.md, uno por vez, con throttle
(config min_days_between). Cuando la cola se vacía, NO inventa: devuelve None y el bot avisa.
"""
import json
import re
from pathlib import Path

from webreq import request
import db

TOKEN_FILE = Path(__file__).resolve().parent.parent / '.devto_token'
DRAFTS_DIR = Path(__file__).resolve().parents[3] / 'docs' / 'backlinks'
PLATFORM = 'devto'
API = 'https://dev.to/api/articles'
USED_KEY = 'devto_used_drafts'


def _get_key():
    return TOKEN_FILE.read_text().strip() if TOKEN_FILE.exists() else None


def _parse_draft(text):
    """Front matter (title/tags/cover_image) + body markdown."""
    m = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)$', text, re.S)
    if not m:
        return None
    fm, body = m.group(1), m.group(2).strip()
    def field(k):
        mm = re.search(rf'^{k}:\s*(.+)$', fm, re.M)
        return mm.group(1).strip().strip('"').strip("'") if mm else None
    tags = [t.strip() for t in (field('tags') or '').split(',') if t.strip()][:4]
    return {'title': field('title'), 'tags': tags, 'cover': field('cover_image'), 'body': body}


def _next_draft():
    """Devuelve (path, parsed) del primer draft sin usar; None si no queda ninguno."""
    c = db.conn()
    used = set((db.kv_get(c, USED_KEY) or '').split('|')) - {''}
    for f in sorted(DRAFTS_DIR.glob('devto-post-*.md')):
        if f.name in used:
            continue
        parsed = _parse_draft(f.read_text())
        if parsed and parsed.get('title') and parsed.get('body'):
            return f, parsed
    return None, None


def publish(article, cfg):
    key = _get_key()
    if not key:
        return None
    path, draft = _next_draft()
    if not draft:
        print('  devto: COLA VACÍA — no hay drafts sin usar en docs/backlinks/devto-post-*.md. '
              'Agregá uno (calidad humana) para seguir posteando en dev.to.')
        return None
    payload = {'article': {'title': draft['title'][:120], 'body_markdown': draft['body'],
                           'published': True, 'tags': draft['tags'] or ['webdev']}}
    if draft.get('cover'):
        payload['article']['main_image'] = draft['cover']
    s, b, h = request(API, method='POST', json_body=payload, headers={'api-key': key})
    try:
        d = json.loads(b)
        if s in (200, 201) and d.get('url'):
            c = db.conn()
            used = (db.kv_get(c, USED_KEY) or '')
            db.kv_set(c, USED_KEY, (used + '|' + path.name).strip('|'))
            return d['url']
    except Exception:
        pass
    print(f'  devto API status={s} body={b[:140]}')
    return None
