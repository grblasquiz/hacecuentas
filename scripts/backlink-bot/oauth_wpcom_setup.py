#!/usr/bin/env python3
"""Flujo OAuth de UNA vez para WordPress.com. El access_token NO expira (no hace falta refresh).
Levanta server local, captura el code, lo intercambia y guarda token + blog_id en .wpcom_token.
Escribe la URL de autorización en .wpcom_auth_url.txt.
"""
import json
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from webreq import request as web_request

CLIENT = json.loads((HERE / '.wpcom_client.json').read_text())
PORT = 8765
REDIRECT = f'http://localhost:{PORT}'

AUTH_URL = 'https://public-api.wordpress.com/oauth2/authorize?' + urllib.parse.urlencode({
    'client_id': CLIENT['client_id'],
    'redirect_uri': REDIRECT,
    'response_type': 'code',
    'scope': 'global',
})

_code = {}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        params = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        if 'code' in params:
            _code['code'] = params['code'][0]
            self.wfile.write('<h1>Listo. Ya podes cerrar esta pestaña.</h1>'.encode())
        else:
            self.wfile.write(f'<h1>Error: {self.path}</h1>'.encode())

    def log_message(self, *a):
        pass


def main():
    (HERE / '.wpcom_auth_url.txt').write_text(AUTH_URL)
    print('AUTH_URL escrita. Esperando autorización...')
    server = HTTPServer(('localhost', PORT), Handler)
    while 'code' not in _code:
        server.handle_request()
    status, body, _ = web_request('https://public-api.wordpress.com/oauth2/token', method='POST',
        form={'client_id': CLIENT['client_id'], 'client_secret': CLIENT['client_secret'],
              'redirect_uri': REDIRECT, 'grant_type': 'authorization_code', 'code': _code['code']})
    tok = json.loads(body)
    if 'access_token' in tok:
        (HERE / '.wpcom_token').write_text(json.dumps({
            'access_token': tok['access_token'],
            'blog_id': tok.get('blog_id'),
            'blog_url': tok.get('blog_url'),
        }, indent=2))
        print(f"✓ token guardado. blog_id={tok.get('blog_id')} url={tok.get('blog_url')}")
    else:
        print('✗ no vino access_token:', json.dumps(tok)[:200])


if __name__ == '__main__':
    main()
