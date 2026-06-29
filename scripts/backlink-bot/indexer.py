"""Descubrimiento de las páginas publicadas (para que se crawleen e indexen).

⚠️ Los endpoints de ping de Google/Bing están MUERTOS (410/404 desde 2024). Ya no sirven.
Lo que SÍ funciona para que crawleen páginas externas (telegra.ph/write.as/...):

1. **Estructura en capas** (tier2 → tier1): ya le da rutas de descubrimiento a los tier1.
2. **Hub crawlable**: una página Telegraph que enlaza TODAS las páginas del bot. Telegraph se
   crawlea muy seguido → los bots la visitan y siguen los links a todo lo nuevo. Se reconstruye
   cada corrida. Esta es la palanca real de indexación, gratis y autónoma.
"""
import json

from webreq import get_json
import db
from publishers import telegraph as tg

HUB_TITLE = 'Calculadoras y finanzas — índice de notas'


def _hub_content(urls):
    nodes = [{'tag': 'p', 'children': ['Recopilación de notas sobre cálculos de finanzas, '
                                       'sueldos, impuestos y datos útiles.']}]
    items = []
    for u in urls:
        items.append({'tag': 'li', 'children': [
            {'tag': 'a', 'attrs': {'href': u}, 'children': [u]}]})
    nodes.append({'tag': 'ul', 'children': items})
    return json.dumps(nodes, ensure_ascii=False)


def rebuild_hub(c=None, limit=200):
    """(Re)construye el hub Telegraph que linkea las páginas publicadas. Devuelve url|None."""
    c = c or db.conn()
    rows = c.execute(
        "SELECT published_url FROM links WHERE published_url IS NOT NULL "
        "AND status IN ('published','verified_live') ORDER BY created_at DESC LIMIT ?",
        (limit,)).fetchall()
    urls = [r['published_url'] for r in rows]
    if not urls:
        return None
    token = tg._get_token()
    if not token:
        return None
    content = _hub_content(urls)
    hub_path = db.kv_get(c, 'hub_path')
    if hub_path:
        status, data = get_json(f'{tg.API}/editPage/{hub_path}', method='POST', form={
            'access_token': token, 'title': HUB_TITLE, 'content': content,
            'author_name': 'Hacé Cuentas', 'return_content': 'false'})
    else:
        status, data = get_json(f'{tg.API}/createPage', method='POST', form={
            'access_token': token, 'title': HUB_TITLE, 'content': content,
            'author_name': 'Hacé Cuentas', 'return_content': 'false'})
    if data and data.get('ok'):
        res = data['result']
        db.kv_set(c, 'hub_path', res['path'])
        return res.get('url')
    return None


def index_new(published_urls, c=None):
    """Llamado tras publicar: reconstruye el hub para que se descubra lo nuevo."""
    hub = rebuild_hub(c)
    if hub:
        print(f'indexer: hub reconstruido → {hub} ({len(published_urls)} nuevas enlazadas)')
    else:
        print('indexer: no se pudo reconstruir el hub')
    return hub
