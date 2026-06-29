"""HTTP helper compartido. Stdlib pura + contexto SSL que cae a certifi (macOS local)."""
import json
import os
import ssl
import urllib.parse
import urllib.request

try:
    import certifi
    SSL_CTX = ssl.create_default_context(cafile=certifi.where())
except Exception:
    SSL_CTX = ssl.create_default_context()
    if os.environ.get('BOT_INSECURE_SSL') == '1':
        SSL_CTX.check_hostname = False
        SSL_CTX.verify_mode = ssl.CERT_NONE

UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' \
     '(KHTML, like Gecko) Chrome/124.0 Safari/537.36'


def _iri_to_uri(url):
    """Codifica caracteres no-ASCII en path/query (urllib no traga acentos crudos)."""
    try:
        sp = urllib.parse.urlsplit(url)
        path = urllib.parse.quote(sp.path, safe="/%:@!$&'()*+,;=~-._")
        query = urllib.parse.quote(sp.query, safe="=&%:@!$'()*+,;~-._")
        netloc = sp.netloc.encode('idna').decode('ascii') if any(
            ord(ch) > 127 for ch in sp.netloc) else sp.netloc
        return urllib.parse.urlunsplit((sp.scheme, netloc, path, query, sp.fragment))
    except Exception:
        return url


def request(url, *, method='GET', data=None, headers=None, json_body=None,
            form=None, timeout=25):
    """Devuelve (status, body_str, resp_headers_dict). Nunca lanza por status != 200."""
    url = _iri_to_uri(url)
    h = {'User-Agent': UA}
    if headers:
        h.update(headers)
    body = None
    if json_body is not None:
        body = json.dumps(json_body).encode('utf-8')
        h.setdefault('Content-Type', 'application/json; charset=utf-8')
    elif form is not None:
        body = urllib.parse.urlencode(form).encode('utf-8')
        h.setdefault('Content-Type', 'application/x-www-form-urlencoded')
    elif data is not None:
        body = data if isinstance(data, bytes) else str(data).encode('utf-8')
    req = urllib.request.Request(url, data=body, headers=h, method=method)
    try:
        with urllib.request.urlopen(req, timeout=timeout, context=SSL_CTX) as r:
            return r.status, r.read().decode('utf-8', errors='ignore'), dict(r.headers)
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8', errors='ignore'), dict(e.headers or {})
    except Exception as e:
        return 0, f'__error__ {e}', {}


def get_json(url, **kw):
    status, body, _ = request(url, **kw)
    try:
        return status, json.loads(body)
    except Exception:
        return status, None
