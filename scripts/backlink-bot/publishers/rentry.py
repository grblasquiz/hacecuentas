"""rentry.co — API con CSRF. GET /api/new -> cookie+csrf; POST con edit_code.
Inactivo por default en config (markdown en textarea puede dropear acentos / valor bajo).
"""
import re

from webreq import request

NEW = 'https://rentry.co/api/new'
BASE = 'https://rentry.co'
PLATFORM = 'rentry'


def _markdown(article):
    parts = [f"# {article['title']}", ""]
    link_md = f"[{article['anchor']}]({article['target_url']})"
    for p in article['paragraphs']:
        parts.append(p.replace('{LINK}', link_md))
        parts.append("")
    return "\n".join(parts)


def publish(article, cfg):
    # 1) GET para cookie + csrftoken
    status, body, headers = request(BASE, method='GET')
    set_cookie = headers.get('Set-Cookie', '')
    m = re.search(r'csrftoken=([^;]+)', set_cookie)
    if not m:
        return None
    csrf = m.group(1)
    # 2) POST
    status, body, _ = request(
        NEW,
        method='POST',
        headers={'Referer': BASE, 'Cookie': f'csrftoken={csrf}'},
        form={'csrfmiddlewaretoken': csrf, 'text': _markdown(article)},
    )
    try:
        import json
        data = json.loads(body)
        if data.get('status') == '200' and data.get('url'):
            return f"{BASE}{data['url']}" if data['url'].startswith('/') else data['url']
    except Exception:
        pass
    return None
