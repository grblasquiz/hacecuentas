"""Blogger (blogspot) — API v3 con OAuth refresh token. Blog PROPIO de Martin.

Links dofollow + indexables. Dominio blogspot de baja autoridad, pero es backlink real y
es nuestro blog (no comunidad moderada) → puede postear contenido del spinner directo a
hacecuentas. Premium/baja-frecuencia igual (un blogspot spameado lo devalúa Google).

Token: .blogger_token (refresh_token + client). blogId en config.json.
"""
import json
from pathlib import Path

from webreq import request

TOKEN_FILE = Path(__file__).resolve().parent.parent / '.blogger_token'
PLATFORM = 'blogger'
POSTS_API = 'https://www.googleapis.com/blogger/v3/blogs/{blog}/posts'


def _access_token():
    if not TOKEN_FILE.exists():
        return None
    t = json.loads(TOKEN_FILE.read_text())
    s, b, h = request(t['token_uri'], method='POST', form={
        'grant_type': 'refresh_token', 'client_id': t['client_id'],
        'client_secret': t['client_secret'], 'refresh_token': t['refresh_token']})
    try:
        return json.loads(b).get('access_token')
    except Exception:
        return None


def _html(article):
    link = f'<a href="{article["target_url"]}">{article["anchor"]}</a>'
    paras = []
    for p in article['paragraphs']:
        paras.append('<p>' + p.replace('{LINK}', link) + '</p>')
    return '\n'.join(paras)


def publish(article, cfg):
    token = _access_token()
    if not token:
        print('  blogger: sin access token (¿corriste oauth_blogger_setup.py?)')
        return None
    blog_id = cfg.get('blogger_blog_id')
    if not blog_id:
        print('  blogger: falta blogger_blog_id en config.json')
        return None
    payload = {'kind': 'blogger#post', 'title': article['title'],
               'content': _html(article)}
    s, b, h = request(POSTS_API.format(blog=blog_id), method='POST',
                      json_body=payload, headers={'Authorization': 'Bearer ' + token})
    try:
        d = json.loads(b)
        if s in (200, 201) and d.get('url'):
            return d['url']
    except Exception:
        pass
    print(f'  blogger API status={s} body={b[:140]}')
    return None
