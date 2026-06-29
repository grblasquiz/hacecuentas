#!/usr/bin/env python3
"""Flujo OAuth de UNA vez para Reddit. Lee .reddit_client.json ({client_id,client_secret,username}),
levanta server local, captura el code y guarda refresh_token en .reddit_token.

Reddit OAuth: duration=permanent → da refresh_token. Token exchange usa HTTP Basic (client_id:secret).
Escribe la URL de autorización en .reddit_auth_url.txt para abrirla (en tu browser normal,
porque Chrome MCP bloquea reddit).
"""
import base64
import json
import sys
import urllib.parse
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from webreq import request as web_request

CLIENT = json.loads((HERE / '.reddit_client.json').read_text())
PORT = 8765
REDIRECT = f'http://localhost:{PORT}'
UA = f"web:hacecuentas-backlink-bot:1.0 (by /u/{CLIENT.get('username','user')})"

AUTH_URL = 'https://www.reddit.com/api/v1/authorize?' + urllib.parse.urlencode({
    'client_id': CLIENT['client_id'],
    'response_type': 'code',
    'state': 'hcbot',
    'redirect_uri': REDIRECT,
    'duration': 'permanent',
    'scope': 'identity submit',
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
    (HERE / '.reddit_auth_url.txt').write_text(AUTH_URL)
    print('AUTH_URL escrita. Esperando autorización...')
    server = HTTPServer(('localhost', PORT), Handler)
    while 'code' not in _code:
        server.handle_request()
    basic = base64.b64encode(f"{CLIENT['client_id']}:{CLIENT['client_secret']}".encode()).decode()
    status, body, _ = web_request('https://www.reddit.com/api/v1/access_token', method='POST',
        form={'grant_type': 'authorization_code', 'code': _code['code'], 'redirect_uri': REDIRECT},
        headers={'Authorization': 'Basic ' + basic, 'User-Agent': UA})
    tok = json.loads(body)
    if 'refresh_token' in tok:
        (HERE / '.reddit_token').write_text(json.dumps({
            'refresh_token': tok['refresh_token'],
            'client_id': CLIENT['client_id'],
            'client_secret': CLIENT['client_secret'],
        }, indent=2))
        print('✓ refresh_token guardado en .reddit_token')
    else:
        print('✗ no vino refresh_token:', json.dumps(tok)[:200])


if __name__ == '__main__':
    main()
