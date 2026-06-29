#!/usr/bin/env python3
"""Flujo OAuth de UNA vez para Blogger. Levanta un server local, captura el code y
guarda el refresh_token en .blogger_token. Después el bot renueva el access_token solo.

Corre en background; escribe la URL de autorización en .blogger_auth_url.txt para abrirla.
"""
import json
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from webreq import request as web_request  # usa certifi (SSL ok en este Python)
CLIENT = json.loads((HERE / '.blogger_client.json').read_text())['installed']
PORT = 8765
REDIRECT = f'http://localhost:{PORT}'
SCOPE = 'https://www.googleapis.com/auth/blogger'

AUTH_URL = 'https://accounts.google.com/o/oauth2/auth?' + urllib.parse.urlencode({
    'client_id': CLIENT['client_id'],
    'redirect_uri': REDIRECT,
    'response_type': 'code',
    'scope': SCOPE,
    'access_type': 'offline',
    'prompt': 'consent',
})

_code = {}


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        qs = urllib.parse.urlparse(self.path).query
        params = urllib.parse.parse_qs(qs)
        self.send_response(200)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.end_headers()
        if 'code' in params:
            _code['code'] = params['code'][0]
            self.wfile.write('<h1>Listo. Ya podes cerrar esta pestaña.</h1>'.encode())
        else:
            self.wfile.write(f'<h1>Error: {qs}</h1>'.encode())

    def log_message(self, *a):
        pass


def main():
    (HERE / '.blogger_auth_url.txt').write_text(AUTH_URL)
    print('AUTH_URL escrita. Esperando autorización...')
    server = HTTPServer(('localhost', PORT), Handler)
    while 'code' not in _code:
        server.handle_request()
    # intercambiar code por tokens (webreq = SSL con certifi)
    status, body, _ = web_request(CLIENT['token_uri'], method='POST', form={
        'code': _code['code'],
        'client_id': CLIENT['client_id'],
        'client_secret': CLIENT['client_secret'],
        'redirect_uri': REDIRECT,
        'grant_type': 'authorization_code',
    })
    tok = json.loads(body)
    if 'refresh_token' in tok:
        (HERE / '.blogger_token').write_text(json.dumps({
            'refresh_token': tok['refresh_token'],
            'client_id': CLIENT['client_id'],
            'client_secret': CLIENT['client_secret'],
            'token_uri': CLIENT['token_uri'],
        }, indent=2))
        print('✓ refresh_token guardado en .blogger_token')
    else:
        print('✗ no vino refresh_token:', json.dumps(tok)[:200])


if __name__ == '__main__':
    main()
