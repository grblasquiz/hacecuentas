"""Telegraph (telegra.ph) — API HTTP oficial, sin login ni CAPTCHA.

createAccount -> access_token (cacheado en .telegraph_token)
createPage(content=[Node]) -> {path, url}  donde Node = str | {tag, attrs, children}
"""
import json
from pathlib import Path

from webreq import request, get_json  # noqa: F401

API = 'https://api.telegra.ph'
TOKEN_FILE = Path(__file__).resolve().parent.parent / '.telegraph_token'
PLATFORM = 'telegraph'


def _api_base():
    return API


def _token_path():
    return TOKEN_FILE


def _get_token(short_name='hacecuentas'):
    tp = _token_path()
    if tp.exists():
        return tp.read_text().strip()
    status, data = get_json(
        f'{_api_base()}/createAccount',
        method='POST',
        form={'short_name': short_name, 'author_name': 'Hacé Cuentas',
              'author_url': 'https://hacecuentas.com'},
    )
    if data and data.get('ok'):
        tok = data['result']['access_token']
        tp.write_text(tok)
        return tok
    return None


def _nodes(article):
    """Convierte paragraphs (con {LINK}) en Nodes de Telegraph."""
    out = []
    link_node = {'tag': 'a', 'attrs': {'href': article['target_url']},
                 'children': [article['anchor']]}
    for p in article['paragraphs']:
        if '{LINK}' in p:
            before, after = p.split('{LINK}', 1)
            children = []
            if before:
                children.append(before)
            children.append(link_node)
            if after:
                children.append(after)
            out.append({'tag': 'p', 'children': children})
        else:
            out.append({'tag': 'p', 'children': [p]})
    return out


def publish(article, cfg, _base=None):
    token = _get_token()
    if not token:
        return None
    base = _base or _api_base()
    content = json.dumps(_nodes(article), ensure_ascii=False)
    status, data = get_json(
        f'{base}/createPage',
        method='POST',
        form={
            'access_token': token,
            'title': article['title'][:256],
            'author_name': cfg.get('brand', 'Hacé Cuentas'),
            'author_url': cfg.get('site', 'https://hacecuentas.com'),
            'content': content,
            'return_content': 'false',
        },
    )
    if data and data.get('ok'):
        return data['result'].get('url')
    return None
