"""WordPress.com — REST API v1.1 con OAuth (token NO expira). Blog PROPIO de Martin.

Links dofollow + indexable. Es nuestro blog → postea contenido del spinner directo a hacecuentas.
Premium/baja-frecuencia. Token + blog_id en .wpcom_token.
"""
import json
from pathlib import Path

from webreq import request

TOKEN_FILE = Path(__file__).resolve().parent.parent / '.wpcom_token'
PLATFORM = 'wpcom'
API = 'https://public-api.wordpress.com/rest/v1.1/sites/{blog}/posts/new'


def _html(article):
    link = f'<a href="{article["target_url"]}">{article["anchor"]}</a>'
    return '\n'.join('<p>' + p.replace('{LINK}', link) + '</p>' for p in article['paragraphs'])


def publish(article, cfg):
    if not TOKEN_FILE.exists():
        print('  wpcom: falta .wpcom_token')
        return None
    t = json.loads(TOKEN_FILE.read_text())
    blog = t.get('blog_id')
    if not blog:
        print('  wpcom: falta blog_id en .wpcom_token')
        return None
    s, b, h = request(API.format(blog=blog), method='POST',
                      json_body={'title': article['title'], 'content': _html(article),
                                 'status': 'publish'},
                      headers={'Authorization': 'Bearer ' + t['access_token']})
    try:
        d = json.loads(b)
        if s in (200, 201) and d.get('URL'):
            return d['URL']
    except Exception:
        pass
    print(f'  wpcom API status={s} body={b[:140]}')
    return None
