#!/usr/bin/env python3
"""Probe empírico de plataformas de publicación anónima (sin login).

Para cada candidata: intenta publicar, abre la URL resultante y verifica que el link a
hacecuentas quede como <a href> REAL (no texto plano) + dofollow/nofollow + no-noindex.
Solo las que pasan sirven como backlink. Reusable: correr cuando se quieran buscar más.

  python3 probe_platforms.py
"""
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from webreq import request, get_json

TARGET = 'https://hacecuentas.com/calculadora-aguinaldo'
ANCHOR = 'Hacé Cuentas'
BODY_TXT = f'Calculá el aguinaldo (SAC) fácil. Mas info en {TARGET} — herramienta gratuita.'
BODY_MD = f'# Aguinaldo 2026\n\nCalculá el aguinaldo (SAC) en [{ANCHOR}]({TARGET}) gratis.\n'
BODY_HTML = f'<p>Calculá el aguinaldo en <a href="{TARGET}">{ANCHOR}</a> gratis.</p>'


def inspect(url):
    """Abre la URL publicada y devuelve dict con el veredicto del backlink."""
    if not url or not url.startswith('http'):
        return {'live': False, 'reason': 'sin URL'}
    s, b, h = request(url, timeout=20)
    if not s or s >= 400 or not b:
        return {'live': False, 'reason': f'status {s}'}
    m = re.search(r'<a\b[^>]*hacecuentas\.com[^>]*>', b, re.I)
    xrobots = (h.get('X-Robots-Tag') or '').lower()
    metarobots = ' '.join(re.findall(r'<meta[^>]*robots[^>]*>', b, re.I)).lower()
    noindex = 'noindex' in xrobots or 'noindex' in metarobots
    if not m:
        plain = 'hacecuentas.com' in b
        return {'live': True, 'is_link': False, 'noindex': noindex,
                'reason': 'link en TEXTO PLANO (no <a>)' if plain else 'link ausente'}
    tag = m.group(0)
    nofollow = bool(re.search(r'rel\s*=\s*["\'][^"\']*nofollow', tag, re.I))
    return {'live': True, 'is_link': True, 'dofollow': not nofollow,
            'noindex': noindex, 'tag': tag[:90]}


# --- handlers por mecánica (devuelven url|None) ---
def try_writeas(base):
    s, d = get_json(f'{base}/api/posts', method='POST',
                    json_body={'title': 'Aguinaldo 2026', 'body': BODY_MD})
    if d and d.get('data', {}).get('id'):
        return f"{base}/{d['data']['id']}"
    return None


def try_telegraph(base):
    s, d = get_json(f'{base}/createAccount', method='POST',
                    form={'short_name': 'hc', 'author_name': 'Hacé Cuentas'})
    if not (d and d.get('ok')):
        return None
    tok = d['result']['access_token']
    content = f'[{{"tag":"p","children":["Calculá el aguinaldo en ",' \
              f'{{"tag":"a","attrs":{{"href":"{TARGET}"}},"children":["{ANCHOR}"]}}," gratis."]}}]'
    s, d = get_json(f'{base}/createPage', method='POST',
                    form={'access_token': tok, 'title': 'Aguinaldo 2026',
                          'author_name': 'HC', 'content': content})
    return d['result']['url'] if (d and d.get('ok')) else None


def try_rentry(base):
    s, b, h = request(base, method='GET')
    m = re.search(r'csrftoken=([^;]+)', h.get('Set-Cookie', ''))
    if not m:
        return None
    csrf = m.group(1)
    s, b, h = request(f'{base}/api/new', method='POST',
                      headers={'Referer': base, 'Cookie': f'csrftoken={csrf}'},
                      form={'csrfmiddlewaretoken': csrf, 'text': BODY_MD})
    import json
    try:
        d = json.loads(b)
        if d.get('url'):
            return d['url'] if d['url'].startswith('http') else base + d['url']
    except Exception:
        pass
    return None


def try_form(url, fields, base_for_url=None):
    """POST genérico de formulario; intenta deducir la URL del Location o del body."""
    s, b, h = request(url, method='POST', form=fields, timeout=20)
    loc = h.get('Location')
    if loc:
        return loc if loc.startswith('http') else (base_for_url or '') + loc
    m = re.search(r'https?://[^\s"\'<>]+', b)
    return m.group(0) if m else None


# --- lista de candidatas (mecánica, args) ---
CANDIDATES = [
    ('telegra.ph',        try_telegraph, 'https://api.telegra.ph'),
    ('graph.org',         try_telegraph, 'https://api.graph.org'),
    ('write.as',          try_writeas,   'https://write.as'),
    ('writefreely.social',try_writeas,   'https://writefreely.social'),
    ('pad.write.as',      try_writeas,   'https://pencil.writefree.io'),
    ('rentry.co',         try_rentry,    'https://rentry.co'),
    ('rentry.org',        try_rentry,    'https://rentry.org'),
    ('paste.rs',          lambda b: try_form(b, {'': BODY_TXT}), 'https://paste.rs'),
    ('hastebin',          lambda b: try_form(f'{b}/documents', {'data': BODY_TXT}, b),
                          'https://hastebin.com'),
    ('paste.gg',          lambda b: try_form(f'{b}/api/v1/pastes', {'files': BODY_TXT}, b),
                          'https://api.paste.gg'),
    ('controlc.com',      lambda b: try_form(f'{b}/index.php?act=submit',
                          {'subject': 'Aguinaldo', 'paste': BODY_HTML, 'expiry': '0',
                           'syntax': '0', 'name': 'hc'}, b), 'https://controlc.com'),
    ('justpaste.it',      lambda b: try_form(f'{b}/api/v1/new',
                          {'content': BODY_HTML}, b), 'https://justpaste.it'),
    ('txt.fyi',           lambda b: try_form(f'{b}/--/api/post',
                          {'content': BODY_HTML, 'title': 'Aguinaldo'}, b), 'https://txt.fyi'),
    ('notes.io',          lambda b: try_form(f'{b}/api/note', {'note': BODY_TXT}, b),
                          'https://notes.io'),
    ('paste.ee',          lambda b: try_form(b, {'paste': BODY_TXT}, b), 'https://paste.ee'),
    # --- tanda 2 (ampliación) ---
    ('txt.fyi',           lambda b: try_form(f'{b}/edit.php',
                          {'content': BODY_MD, 'title': 'Aguinaldo'}, b), 'https://txt.fyi'),
    ('katb.in',           lambda b: try_form(f'{b}/', {'content': BODY_MD,
                          'extension': 'md'}, b), 'https://katb.in'),
    ('sprunge.us',        lambda b: try_form(b, {'sprunge': BODY_HTML}, b), 'http://sprunge.us'),
    ('ix.io',             lambda b: try_form(b, {'f:1': BODY_HTML}, b), 'http://ix.io'),
    ('clbin.com',         lambda b: try_form(b, {'clbin': BODY_HTML}, b), 'https://clbin.com'),
    ('vpaste.net',        lambda b: try_form(b, {'text': BODY_HTML, 'lexer': 'text'}, b),
                          'http://vpaste.net'),
    ('paste.c-net.org',   lambda b: try_form(b, {'': BODY_HTML}, b), 'https://paste.c-net.org'),
    ('dpaste.org2',       lambda b: try_form(f'{b}/api/', {'content': BODY_HTML,
                          'lexer': 'text', 'format': 'url'}, b), 'https://dpaste.org'),
    ('bpa.st',            lambda b: try_form(f'{b}/curl', {'raw': BODY_HTML}, b),
                          'https://bpa.st'),
    ('paste.mozilla',     lambda b: try_form(f'{b}/api/', {'content': BODY_HTML}, b),
                          'https://paste.mozilla.org'),
    ('snippet.host',      lambda b: try_form(f'{b}/', {'content': BODY_MD}, b),
                          'https://snippet.host'),
    ('pad.land',          try_writeas,   'https://pad.land'),
]


def main():
    print(f'{"plataforma":22} {"publica":8} {"backlink":10} {"veredicto"}')
    print('-' * 70)
    winners = []
    for name, handler, arg in CANDIDATES:
        try:
            url = handler(arg)
        except Exception as e:
            print(f'{name:22} ERROR     -          {e}')
            continue
        if not url:
            print(f'{name:22} no        -          no publicó / no devolvió URL')
            continue
        v = inspect(url)
        if v.get('is_link'):
            verdict = f'✅ {"dofollow" if v["dofollow"] else "nofollow"}' \
                      f'{" +NOINDEX" if v["noindex"] else ""}'
            if not v['noindex']:
                winners.append((name, v['dofollow'], url))
        elif v.get('live'):
            verdict = f'❌ {v["reason"]}'
        else:
            verdict = f'❌ {v["reason"]}'
        print(f'{name:22} sí        {"link" if v.get("is_link") else "no":10} {verdict}')
    print('-' * 70)
    print(f'SIRVEN ({len(winners)}):')
    for n, df, u in winners:
        print(f'  {n}  ({"dofollow" if df else "nofollow"})  ej: {u}')


if __name__ == '__main__':
    main()
