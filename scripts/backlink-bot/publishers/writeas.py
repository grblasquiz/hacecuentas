"""write.as — API de publicación anónima. POST /api/posts {title, body(markdown)} -> {id}.
URL pública: https://write.as/<id>. Markdown soporta [anchor](url).
"""
from webreq import get_json

API = 'https://write.as/api/posts'
PLATFORM = 'writeas'


def _markdown(article):
    parts = [f"# {article['title']}", ""]
    link_md = f"[{article['anchor']}]({article['target_url']})"
    for p in article['paragraphs']:
        parts.append(p.replace('{LINK}', link_md))
        parts.append("")
    return "\n".join(parts)


def publish(article, cfg):
    status, data = get_json(
        API,
        method='POST',
        json_body={'title': article['title'], 'body': _markdown(article)},
    )
    if data and data.get('data', {}).get('id'):
        return f"https://write.as/{data['data']['id']}"
    return None
